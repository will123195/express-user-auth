const test = require('tape')
const request = require('request-promise')
const http = require('http')
const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

let server
let port = 5555

test('clean', t => {
  rimraf.sync(src)
  rimraf.sync(dist)
  t.end()
})

test('start server', t => {
  const app = require('../sample-app')
  server = http.createServer(app)
  server.listen(port, t.end.bind(t))
})

test('register', t => {
  return request.get({
    url: '/register'
  })
  .then(res => {
    t.equal(res.statusCode, 200)
    t.end()
  })
})

test('done', t => {
  server.close()
  t.end()
})
