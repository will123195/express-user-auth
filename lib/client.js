var PromiseImpl = require('es6-promise-polyfill').Promise

// browser compatibility
if (typeof window !== 'undefined' && !window.location.origin) {
  window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '')
}

function parseBody (text) {
  if (!text) return text
  try {
    return JSON.parse(text)
  } catch (err) {
    return text
  }
}

function request (method, uri, body) {
  return new PromiseImpl(function (resolve, reject) {
    var xhr = new XMLHttpRequest()
    var origin = typeof location !== 'undefined' ? location.origin : ''
    xhr.open(method, origin + uri)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onload = function () {
      var data = parseBody(xhr.responseText)
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data)
        return
      }
      if (data && typeof data === 'object') {
        reject(data)
        return
      }
      reject({ message: data || ('Request failed with status ' + xhr.status) })
    }
    xhr.onerror = function () {
      reject(new Error('Network error'))
    }
    xhr.send(body ? JSON.stringify(body) : null)
  })
}

module.exports = {
  post: function (uri, body) {
    return request('POST', uri, body)
  }
}
