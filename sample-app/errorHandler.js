module.exports = (err, req, res, next) => {
  let statusCode = 500;
  if (err.validationError) {
    statusCode = 400;
  }
  if (err.authRequired) {
    statusCode = 401;
  }
  if (err.accessDenied) {
    statusCode = 403;
  }
  if (err.notFound) {
    statusCode = 404;
  }
  const error = {
    message: err.message,
    details: err.details
  };
  // TODO: consider displaying debug info only in non-production environments
  let stack = err.stack.split('\n');
  stack.shift();
  stack = stack
    .filter(line => line.indexOf('node_modules') === -1)
    .map(line => line.trim());
  error.debug = {
    stack,
    request: {
      method: req.method,
      uri: req.originalUrl,
      body: req.body
    },
    statusCode
  };
  // body-parser error
  if (err.body) {
    error.message = 'Could not parse JSON body.';
  }
  res.status(statusCode).json(error);
  if (statusCode === 500) {
    console.log(error);
  }
};