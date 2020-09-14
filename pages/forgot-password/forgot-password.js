var $doc = $(document)
var api = require('../../lib/client')

$doc.ready(function () {
  $('input.email').focus()
  $('.ui.form').form({
    fields: {
      email: {
        identifier: 'email',
        rules: [
          {
            type: 'email',
            prompt: 'Invalid email address'
          }
        ]
      }
    }
  })
})

$doc.on('submit', '.forgot-password-form', function (e) {
  var $form = $(this)
  $form.find('.error').hide()
  api.post('/send-password-reset', {
    username: $form.find('[name="email"]').val()
  })
    .then(function () {
      $form.hide()
      $('#email-sent').show()
    })
    .catch(function (err) {
      $form.find('.error').html(err.message).fadeIn()
      $form.find('[name="email"]').focus()
    })
  e.preventDefault()
  return false
})