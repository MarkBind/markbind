import winston from 'winston';

const consoleTransport = new (winston.transports.Console)({
  colorize: true,
  handleExceptions: true,
  humanReadableUnhandledException: true,
  level: 'debug',
  showLevel: true,
});

winston.configure({
  exitOnError: false,
  transports: [consoleTransport],
});

export = {
  error: winston.error,
  warn: winston.warn,
  info: winston.info,
  verbose: winston.verbose,
  debug: winston.debug,
};
