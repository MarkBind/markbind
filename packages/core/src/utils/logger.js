const winston = require('winston');

const consoleTransport = new (winston.transports.Console)({
  colorize: true,
  handleExceptions: true,
  humanReadableUnhandledException: true,
  level: 'debug',
  showLevel: true,
  format: winston.format.cli(),
});

winston.configure({
  format: winston.format.errors(),
  exitOnError: false,
  transports: [consoleTransport],
});

module.exports = {
  error: winston.error,
  warn: winston.warn,
  info: winston.info,
  verbose: winston.verbose,
  debug: winston.debug,
};
