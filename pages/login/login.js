var $doc = $(document)
var api = require('../../lib/client')

$doc.ready(function () {
  $('input.email').focus()
  $('.ui.form').form({
    fields: {
      email: {
        identifier  : 'email'
      },
      password: {
        identifier  : 'password'
      }
    }
  })
})


$doc.on('submit', 'form.login', function (e) {
  e.preventDefault()
  var $form = $(this)
  $form.find('.error.message').hide()
  api.post('/login', {
    username: $form.find('[name="email"]').val(),
    password: $form.find('[name="password"]').val()
  })
    .then(function () {
      location.href = location.search.substr(1) || '/'
    })
    .catch(function (err) {
      $form.find('.error.message').html(err.message).fadeIn()
    })
  return false
})

$doc.on('click', '.send-reset.button', function (e) {
  var $modal = $(this).parents('.modal')
  $modal.find('.error').hide()
  api.post('/users/send-password-reset', {
    email: $modal.find('[name="email"]').val()
  })
    .then(function () {
      $('.ui.modal.forgot-password')
        .modal('hide')
      $('.ui.modal.sent-password-reset')
        .modal('setting', 'transition', 'horizontal flip')
        .modal('show')
    })
    .catch(function (err) {
      $modal.find('.error').html(err.message).fadeIn()
      $modal.find('[name="email"]').focus()
    })
  e.preventDefault()
  return false
})