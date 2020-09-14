// logger.js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const path = require('path')

const tsFormat = () => (new Date()).toLocaleString('pt-br', { timeZone: 'America/Sao_Paulo', hour12: false });

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'DEBUG' }),
    timestamp({ format: tsFormat }),
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
    new transports.File({ filename: path.join(process.cwd(), 'logs', 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(process.cwd(), 'logs', 'combined.log') })
  ],
  // Enable exception handling when you create your logger.
  exceptionHandlers: [
    new transports.File({ filename: path.join(process.cwd(), 'logs', 'exceptions.log') })
  ],
  exitOnError: false
});

// Call exceptions.handle with a transport to handle exceptions
logger.exceptions.handle(
  new transports.File({ filename: path.join(process.cwd(), 'logs', 'exceptions.log') })
);

module.exports = logger;