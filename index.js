const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('hbs').__express
const fs = require('fs')
const cookieParser = require('cookie-parser')
const sessions = require('client-sessions')
const Promise = require('bluebird')
const moment = require('moment')
const bcrypt = Promise.promisifyAll(require('bcryptjs'))
const jwt = require('jsonwebtoken')
const browserify = require('browserify-middleware')
const less = require('express-less')
const parseBearerToken = require('parse-bearer-token')

const passwordAlgo = 'bcrypt'

const checkPassword = function (password, passwordHash) {
  return bcrypt.compareAsync(String(password), String(passwordHash));
};

const generatePasswordHash = function (password) {
  return bcrypt.genSaltAsync(10)
    .then(salt => bcrypt.hashAsync(password, salt));
}

module.exports = function (config) {

  const app = express()

  const authenticate = function (username, password) {
    let userId
    return config.getUserByUsername(username)
      .then(user => {
        if (!user) {
          throw new Error('Email not found.')
        }
        userId = user.id
        return checkPassword(password, user.passwordHash)
          .then(isCorrect => {
            if (!isCorrect) {
              throw new Error('Wrong password.')
            }
            const token = generateToken(userId)
            return { jwt: token, user }
          })
      })
  }

  const generateToken = (userId) => {
    const expiresInDays = 365 * config.jwtExpireDays || 30;
    let exp = moment().add(expiresInDays, 'days').format('X');
    exp = parseInt(exp, 10);
    const payload = {
      u: userId,
      exp
    };
    const accessToken = jwt.sign(payload, config.jwtSecret);
    return {
      accessToken,
      expires: new Date(exp * 1000)
    };
  }

  function getUserByToken(token) {
    const decoded = jwt.verify(token, config.jwtSecret);
    if (!decoded.u) {
      throw new Error('Access token is not valid.');
    }
    const userId = decoded.u;
    return config.getUserById(userId)
  }

  app.set('view engine', 'html')
  app.set('views', `${__dirname}/pages`)
  app.engine('html', hbs);
  app.use(bodyParser.json())
  app.use(cookieParser())
  app.use(sessions({
    secret: config.sessionSecret,
    cookieName: 'session'
  }))

  // set req.user
  app.use((req, res, next) => {
    if (req.session.user) {
      req.user = req.session.user
      return next()
    }
    const token = req.query.accessToken
      || req.headers['x-access-token']
      || parseBearerToken(req)
    if (token) {
      return getUserByToken(token).then(user => {
        req.user = user
        return next()
      })
    }
    next()
  })

  // html pages
  const pages = [
    'login',
    'register'
  ]
  pages.forEach(page => {
    app.use('/js', browserify(`${__dirname}/pages/${page}`))
    app.use('/css', less(`${__dirname}/pages/${page}`, { cache: true }))
    app.get(`/${page}`, (req, res) => {
      res.render(`${page}/${page}`)
    })
  })

  // login
  app.post('/login', (req, res, next) => {
    authenticate(req.body.username, req.body.password)
      .then(data => {
        req.session.user = data.user
        req.session.jwt = data.jwt
        res.json(data)
      })
      .catch(err => {
        next(err)
      })
  })

  app.get('/logout', (req, res) => {
    delete req.session
    res.redirect('/')
  })

  // register
  app.post('/register', (req, res) => {
    const data = req.body
    generatePasswordHash(data.password)
      .then(passwordHash => {
        config.createUser(Object.assign({ passwordHash, passwordAlgo }, data))
          .then(user => {
            req.session.user = user
            res.json(user)
          })
      })
  })

  return app
}