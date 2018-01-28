var api = require('../../lib/client')
var $doc = $(document)


$doc.on('ready', function () {
  $('input:first').focus()
})

$('.ui.checkbox').checkbox()

$('.ui.form').form({
  fields: {
    firstName: {
      identifier: 'firstName',
      rules: [
        {
          type: 'empty',
          prompt: 'First name is required'
        }
      ]
    },
    lastName: {
      identifier: 'lastName',
      rules: [
        {
          type: 'empty',
          prompt: 'Last name is required'
        }
      ]
    },
    email: {
      identifier: 'email',
      rules: [
        {
          type: 'email',
          prompt: 'Invalid email address'
        }
      ]
    },
    password: {
      identifier: 'password',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter a password'
        },
        {
          type   : 'minLength[6]',
          prompt : 'Your password must be at least {ruleValue} characters'
        }
      ]
    },
    confirmPassword: {
      identifier: 'confirmPassword',
      rules: [
        {
          type   : 'match[password]',
          prompt : 'You did not correctly confirm your password'
        }
      ]
    },
    terms: {
      identifier: 'terms',
      rules: [
        {
          type: 'checked',
          prompt: 'You must agree to the terms of service'
        }
      ]
    }
  }
})

$doc
  .on('submit', '.ui.form.register', function (e) {
    e.preventDefault()
    var $error = $('.error.message')
    var body = {}
    var fields = $('.ui.form.register').serializeArray()
    fields.forEach(function (field) {
      if (field.name.slice(-2) === '[]') {
        var fieldName = field.name.slice(0, -2)
        body[fieldName] = body[fieldName] || []
        body[fieldName].push(field.value)
        return
      }
      body[field.name] = field.value
    })
    api.post('/register', body)
      .then(function () {
        location.href = '/'
      })
      .catch(function (err) {
        $error.html(err.message).show()
      })
    return false
  })