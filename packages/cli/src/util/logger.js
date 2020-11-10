const chalk = require('chalk');
const figlet = require('figlet');
const DailyRotateFile = require('winston-daily-rotate-file');
const winston = require('winston');

const coreLogger = require('@markbind/core/src/utils/logger');

// @markbind/core's consoleTransport but with level: info
const consoleTransport = new (winston.transports.Console)({
  colorize: true,
  handleExceptions: true,
  humanReadableUnhandledException: true,
  level: 'info',
  showLevel: true,
});

function useDebugConsole() {
  consoleTransport.level = 'debug';
}

const dailyRotateFileTransport = new DailyRotateFile({
  datePattern: 'YYYY-MM-DD',
  dirname: '_markbind/logs',
  filename: 'markbind-%DATE%.log',
  handleExceptions: true,
  humanReadableUnhandledException: true,
  level: 'debug',
  maxFiles: 5,
  showLevel: true,
});

// Reconfigure the default instance logger winston provides with DailyRotateFile for markbind-cli
winston.configure({
  exitOnError: false,
  transports: [
    consoleTransport,
    dailyRotateFileTransport,
  ],
});

module.exports = {
  error: coreLogger.error,
  warn: coreLogger.warn,
  info: coreLogger.info,
  verbose: coreLogger.verbose,
  debug: coreLogger.debug,
  /* eslint-disable no-console */
  log: console.log,
  logo: () => console.log(chalk.cyan(figlet.textSync('MarkBind', { horizontalLayout: 'full' }))),
  useDebugConsole,
};
