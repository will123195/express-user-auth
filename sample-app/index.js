const express = require('express')
const auth = require('..')

const app = express();

app.use('/', auth({
  secret: 'xyz',
  authenticate: (username, password) => {
    return new Promise((resolve, reject) => {
      if (username === 'abc' && password === 'abc') {
        return resolve({ username })
      }
      reject({ message: 'Wrong password.' })
    })
  },
  createUser: (user) => {
    return new Promise((resolve, reject) => {
      if (user.email === 'test@example.com') {
        return reject({ message: 'This email address is already registered.' })
      }
      resolve({ id: 1 })
    })
  },
  forgotPassword: (email) => {
    return new Promise((resolve, reject) => {
      resolve({ message: 'Sent.' })
    })
  }
}))

app.get('/', (req, res) => {
  const message = req.session.user ? 'are' : 'are not'
  const html = `
    <h1>Hello.</h1>
    <div>You ${message} logged in.</div>
    <a href="/login">Log in</a>
    <a href="/logout">Log out</a>
  `
  res.send(html)
})

module.exports = app