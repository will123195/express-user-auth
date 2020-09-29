var $doc = $(document)
var api = require('../../lib/client')

$doc.ready(function () {
  $('input.password').focus()
  $('.ui.form').form({
    fields: {
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
      }
    }
  })
})

$doc.on('submit', '.reset-password-form', function (e) {
  var $form = $(this)
  $form.find('.error').hide()
  var urlParams = new URLSearchParams(window.location.search)
  api.post('/reset-password', {
    password: $form.find('[name="password"]').val(),
    username: urlParams.get('u'),
    passwordResetToken: urlParams.get('t')
  })
    .then(function () {
      window.location.href = '/reset-password?success=true'
    })
    .catch(function (err) {
      $form.find('.error').html(err.message).fadeIn()
      $form.find('[name="password"]').focus()
    })
  e.preventDefault()
  return false
})