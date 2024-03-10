// const fs = require("fs");
const winston = require("winston");

// const fsPromise = fs.promises;

// async function log(logData) {
//   try {
//     logData = `${new Date().toLocaleTimeString()} ${" Log data : - "} ${logData} \r\n`;
//     await fsPromise.writeFile("log.txt", logData);
//   } catch (err) {
//     console.log(err);
//   }
// }

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "request-loggin" },
  transports: [new winston.transports.File({ filename: "logs.txt" })],
});

const loggerMiddleware = async (req, res, next) => {
  if (!req.url.includes("signin")) {
    const logData = `${new Date().toLocaleTimeString()} ${
      req.url
    } - ${JSON.stringify(req.body)}`;
    // await log(logData);
    logger.info(logData);
  }
  next();
};
module.exports = loggerMiddleware;
