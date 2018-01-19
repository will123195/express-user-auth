const test = require('tape')
const request = require('request-promise')
const http = require('http')
const fs = require('fs')

let server
let port = 5555

function url(uri) {
  return `http://localhost:${port}${uri}`
}

test('start server', t => {
  const app = require('../sample-app')
  server = http.createServer(app)
  server.listen(port, t.end.bind(t))
})

test('register', t => {
  request.get({
    url: url('/register')
  })
  .then(body => {
    t.end()
  })
})

test('done', t => {
  server.close()
  t.end()
})
