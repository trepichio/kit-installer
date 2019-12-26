// logger.js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const path = require('path')


const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'DEBUG' }),
    timestamp(),
    format.splat(),
    format.simple(),
    myFormat
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.Console(),
    new transports.File({ filename: path.join(process.cwd(), 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(process.cwd(), 'combined.log') })
  ],
  // Enable exception handling when you create your logger.
  exceptionHandlers: [
    new transports.File({ filename: path.join(process.cwd(), 'exceptions.log') })
  ],
  exitOnError: false
});

// Call exceptions.handle with a transport to handle exceptions
logger.exceptions.handle(
  new transports.File({ filename: path.join(process.cwd(), 'exceptions.log') })
);

module.exports = logger;