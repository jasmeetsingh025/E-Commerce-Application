const winston = require("winston");

const commonLogFormat = winston.format.combine(
  winston.format.prettyPrint(),
  winston.format.align(),
  winston.format.timestamp({ format: "DD-MM-YYYY T hh:mm:ss A" }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level.toUpperCase()} - ${message}`;
  })
);

const commonLoggerConfig = {
  level: "info",
  format: commonLogFormat,
  defaultMeta: { service: "request-loggin" },
};

const logger = winston.createLogger({
  ...commonLoggerConfig,
  transports: [
    new winston.transports.File({
      filename: "logs.txt",
    }),
  ],
});

const logError = winston.createLogger({
  ...commonLoggerConfig,
  level: "error",
  transports: [
    new winston.transports.File({
      filename: "error_logs.txt",
    }),
  ],
});

const requestLoggerMiddleware = (req, res, next) => {
  if (!req.url.includes("signin")) {
    let logData = `${req.url}`;
    if (req.body && Object.keys(req.body).length > 0) {
      logData += ` LOG: - ${JSON.stringify(req.body)}`;
    } else {
      logData += " LOG: - No data available in body";
    }
    logger.info(logData);
  }
  next();
};

// Middleware to log errors
const errorLoggerMiddleware = (err, req, res, next) => {
  const logData = `Status Code: ${
    err.code || err.statusCode || 500
  }, Error Message: ${err.message},
  Error Stack Trace: ${err.stack}`;
  logError.error(logData);
  next(err); // Pass the error to the next middleware (error handler)
};

module.exports = { errorLoggerMiddleware, requestLoggerMiddleware };
