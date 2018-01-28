const express = require('express')
const errorHandler = require('./errorHandler')
const auth = require('..')

const app = express();

const db = {}

app.use('/', auth({
  jwtSecret: 'xyz',
  sessionSecret: 'xyz',
  createUser: user => Promise.resolve(Object.assign(db, { user })),
  getUserById: userId => Promise.resolve(db.user),
  getUserByUsername: username => Promise.resolve(db.user),
  updateUser: data => Promise.resolve(Object.assign(db.user, data))
}))

app.get('/', (req, res) => {
  const message = req.session.user ? 'are' : 'are not'
  res.send(`
    <h1>Hello.</h1>
    <div>You ${message} logged in.</div>
    ${req.session.user
      ? '<a href="/logout">Log out</a>'
      : '<a href="/login">Log in</a>'
    }
  `)
})

app.use(errorHandler)

module.exports = app