const test = require('tape')
const http = require('http')

let server
let port = 5555
let cookie = ''

function url(uri) {
  return `http://localhost:${port}${uri}`
}

function request(uri, options) {
  const opts = options || {}
  const headers = Object.assign({}, opts.headers)
  if (cookie) headers.cookie = cookie
  return fetch(url(uri), Object.assign({ headers }, opts)).then(res => {
    const setCookie = res.headers.get('set-cookie')
    if (setCookie) cookie = setCookie.split(';')[0]
    return res
  })
}

test('start server', t => {
  const app = require('../sample-app')
  server = http.createServer(app)
  server.listen(port, t.end.bind(t))
})

test('register page', t => {
  request('/register')
    .then(res => {
      t.equal(res.status, 200)
      return res.text()
    })
    .then(body => {
      t.ok(body.indexOf('Create New Account') !== -1)
      t.end()
    })
    .catch(t.end)
})

test('register user', t => {
  request('/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      username: 'test@example.com',
      email: 'test@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
      firstName: 'Test'
    })
  })
    .then(res => {
      t.equal(res.status, 200)
      return res.json()
    })
    .then(body => {
      const user = body.user || body
      t.ok(user.passwordHash)
      t.equal(user.passwordAlgo, 'bcrypt')
      t.equal(user.password, undefined)
      t.end()
    })
    .catch(t.end)
})

test('login', t => {
  cookie = ''
  const jwt = require('jsonwebtoken')
  request('/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      username: 'test@example.com',
      password: 'secret123'
    })
  })
    .then(res => {
      t.equal(res.status, 200)
      return res.json()
    })
    .then(data => {
      t.ok(data.jwt)
      t.ok(data.jwt.accessToken)
      t.ok(data.user)
      const decoded = jwt.verify(data.jwt.accessToken, 'xyz', { algorithms: ['HS256'] })
      t.equal(typeof decoded.exp, 'number')
      t.end()
    })
    .catch(t.end)
})

test('login page js', t => {
  request('/js/login.js')
    .then(res => {
      t.equal(res.status, 200)
      t.ok(String(res.headers.get('content-type')).indexOf('javascript') !== -1)
      return res.text()
    })
    .then(js => {
      t.ok(js.indexOf('/login') !== -1)
      t.ok(js.indexOf('XMLHttpRequest') !== -1)
      t.end()
    })
    .catch(t.end)
})

test('login page css', t => {
  request('/css/login.css')
    .then(res => {
      t.equal(res.status, 200)
      t.ok(String(res.headers.get('content-type')).indexOf('css') !== -1)
      return res.text()
    })
    .then(css => {
      t.ok(css.indexOf('background-color') !== -1)
      t.end()
    })
    .catch(t.end)
})

test('done', t => {
  server.close()
  t.end()
})
