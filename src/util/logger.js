/* eslint-disable no-console */

const chalk = require('chalk');
const figlet = require('figlet');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

winston.configure({
  exitOnError: false,
  transports: [
    new winston.transports.Console({
      colorize: true,
      handleExceptions: true,
      humanReadableUnhandledException: true,
      level: 'info',
      showLevel: true,
    }),
    new DailyRotateFile({
      datePattern: 'YYYY-MM-DD',
      dirname: '_markbind/logs',
      filename: 'markbind-%DATE%.log',
      handleExceptions: true,
      humanReadableUnhandledException: true,
      level: 'debug',
      maxFiles: 5,
      showLevel: true,
    }),
  ],
});

module.exports = {
  error: text => {
    winston.error(text);
  },
  warn: text => {
    winston.warn(text);
  },
  info: text => {
    winston.info(text);
  },
  verbose: text => {
    winston.verbose(text);
  },
  debug: text => {
    winston.debug(text);
  },
  log: text => {
    console.log(text);
  },
  logo: () =>
    console.log(
      chalk.cyan(figlet.textSync('MarkBind', { horizontalLayout: 'full' })),
    ),
  profile: key => {
    winston.profile(key);
  },
};
