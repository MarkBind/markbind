/* eslint-disable no-console */

const chalk = require('chalk');
const figlet = require('figlet');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

winston.configure({
  exitOnError: false,
  transports: [
    new DailyRotateFile({
      datePattern: 'YYYY-MM-DD',
      dirname: '_markbind/logs',
      filename: 'markbind-%DATE%.log',
      handleExceptions: true,
      humanReadableUnhandledException: true,
      level: 'debug',
      maxFiles: '2d',
      showLevel: true,
    }),
  ],
});

module.exports = {
  error: (text) => {
    console.log(chalk.red(`error: ${text}`));
    winston.error(text);
  },
  warn: (text) => {
    console.log(chalk.yellow(`warning: ${text}`));
    winston.warn(text);
  },
  info: (text) => {
    console.log(chalk.cyan('info: ') + text);
    winston.info(text);
  },
  verbose: (text) => {
    winston.verbose(text);
  },
  debug: (text) => {
    winston.debug(text);
  },
  log: (text) => {
    console.log(text);
  },
  logo: () => console.log(chalk.green(figlet.textSync('MarkBind', { horizontalLayout: 'full' }))),
  profile: (key) => {
    winston.profile(key);
  },
};
