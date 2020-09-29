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

  // set req.session.user
  app.use((req, res, next) => {
    if (req.session.user) {
      if (!config.userCacheTTL || !config.getUserById) {
        return next()
      }
      return config.getUserById(req.session.user.id).then(user => {
        req.session.user = user
        return next()
      })
    }
    const token = req.query.accessToken
      || req.headers['x-access-token']
      || parseBearerToken(req)
    if (token) {
      return getUserByToken(token).then(user => {
        req.session.user = user
        return next()
      })
    }
    next()
  })

  // html pages
  const pages = [
    'login',
    'register',
    'forgot-password',
    'reset-password'
  ]
  pages.forEach(page => {
    app.use('/js', browserify(`${__dirname}/pages/${page}`))
    app.use('/css', less(`${__dirname}/pages/${page}`, { cache: true }))
    app.get(`/${page}`, (req, res) => {
      if (page === 'reset-password' && req.query.success) {
        return res.redirect(config.passwordResetRedirectURL || '/')
      }
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
    req.session = {}
    res.redirect('/')
  })

  // register
  app.post('/register', (req, res, next) => {
    const data = req.body
    Promise.resolve()
      .then(() => {
        if (!data.password) return
        return generatePasswordHash(data.password)
          .then(passwordHash => {
            Object.assign(data, { passwordHash, passwordAlgo })
          })
      })
      .then(() => {  
        delete data.password
        delete data.confirmPassword
        return config.createUser(data)
          .then(user => {
            req.session.user = user
            res.json(user)
          })
      })
      .catch(err => {
        next(err)
      })
  })

  const getRandomPIN = () => Math.floor(Math.random() * 899999 + 100000)

  app.post('/send-password-reset', (req, res, next) => {
    const passwordResetToken = getRandomPIN()
    const { username } = req.body
    if (!username) throw new Error('Please enter email address.')
    const uri = `/reset-password?u=${encodeURIComponent(username)}&t=${passwordResetToken}`
    Promise.resolve()
      .then(() => config.getUserByUsername(username))
      .then(user => {
        if (!user) throw new Error('The email address you entered is not in our system.')
        Object.assign(user, { passwordResetToken })
        return config.updateUser(user)
          .then(() => config.sendPasswordReset({ user, uri, passwordResetToken }))
          .then(() => res.send({ sent: true }))
      })
      .catch(next)
  })

  app.post('/reset-password', (req, res, next) => {
    const { username, password, passwordResetToken } = req.body
    if (!username) throw new Error('Please enter email address.')
    if (!password) throw new Error('Please enter a password.')
    if (!passwordResetToken) throw new Error('Missing password reset token.')
    Promise.resolve()
      .then(() => config.getUserByUsername(username))
      .then(user => {
        if (!user) throw new Error('The email address you entered is not in our system.')
        if (user.passwordResetToken !== passwordResetToken) {
          // invalid reset token, disable the token to prevent brute force attack
          Object.assign(user, { passwordResetToken: null })
          return config.updateUser(user).then(() => {
            throw new Error('Invalid password reset token. Try resetting your password again.')
          })
        }
        // save new password hash
        return generatePasswordHash(password)
          .then(passwordHash => {
            Object.assign(user, { passwordHash, passwordAlgo, passwordResetToken: null })
            return config.updateUser(user)
              .then(() => {
                req.session.user = user
                res.json(user)
              })
          })
      })
      .catch(next)
  })

  return app
}
