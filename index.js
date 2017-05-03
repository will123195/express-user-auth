const Router = require('express').Router
const router = new Router()
const bodyParser = require('body-parser')

router.use(bodyParser.json())

// router.use((req, res, next) => {
//   console.log(req.originalUrl)
//   next()
// })

router.get('/register', (req, res, next) => {
  res.send('register')
})

module.exports = function (config) {
  return router
}