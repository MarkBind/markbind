/* eslint-disable no-console */

const chalk = require('chalk');
const figlet = require('figlet');

module.exports = {
  info: text => console.log(chalk.cyan('info: ') + text),
  warn: text => console.log(chalk.yellow(`warning: ${text}`)),
  error: text => console.log(chalk.red(`error: ${text}`)),
  log: text => console.log(text),
  logo: () => console.log(chalk.green(figlet.textSync('MarkBind', { horizontalLayout: 'full' }))),
};
