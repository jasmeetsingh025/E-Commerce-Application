class ApplicationError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code || 500;
    Error.captureStackTrace(this, this.constructor);
  }

  static appLevelErrorHandlerMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "server error! Try later!!";
    res.status(err.statusCode).json({ success: false, error: err.message });
    next();
  };
}

module.exports = ApplicationError;
