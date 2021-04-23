function errorHandler(req, res, next) {
  const error = new Error("Route Not found");
  error.status = 404;
  next(error);
}

function serverErrorHandler(error, req, res, next) {
  const status = error.status || 500;
  res.status(status).send(error.message);
}

module.exports.errorHandler = errorHandler;
module.exports.serverErrorHandler = serverErrorHandler;
