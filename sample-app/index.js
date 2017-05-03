const express = require('express')
const auth = require('..')

const app = express();

app.use('/', auth({
  // authenticate, // required
  // getUserById, // required
  // setPassword, // required
  // createUser, // required
  // updateUser, // required
  // facebook,
  // twitter,
  // google
}));

module.exports = app