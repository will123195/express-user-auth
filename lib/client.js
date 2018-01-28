var idiot = require('idiot')

// browser compatibility
if (!window.location.origin) {
  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
}

var client = idiot({
  baseUrl: location.origin,
  Promise: require('es6-promise-polyfill').Promise
})

module.exports = client