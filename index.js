const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('hbs').__express
const fs = require('fs')
const cookieParser = require('cookie-parser')
const sessions = require('client-sessions')

const browserify = require('browserify-middleware')
const less = require('express-less')

module.exports = function (config) {

  const app = express()

  app.set('view engine', 'html')
  app.set('views', `${__dirname}/pages`)
  app.engine('html', hbs);
  app.use(bodyParser.json())
  app.use(cookieParser())
  app.use(sessions({
    secret: config.secret,
    cookieName: 'session'
  }))

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
  app.post('/api/users/login', (req, res) => {
    config.authenticate(req.body.username, req.body.password)
      .then(user => {
        req.session.user = user
        res.json(user)
      })
      .catch(err => res.status(400).json(err))
  })

  app.get('/logout', (req, res) => {
    delete req.session.user
    res.redirect('/')
  })

  // create new user
  app.post('/api/users', (req, res) => {
    res.json({ hello: true })
  })

  return app
}