import chalk from 'chalk';
import figlet from 'figlet';

import { winston, transports } from './logger-wrapper.cjs';

// @markbind/core's consoleTransport but with level: info
const consoleTransport = new transports.Console({
  colorize: true,
  handleExceptions: true,
  humanReadableUnhandledException: true,
  level: 'info',
  showLevel: true,
});

function useDebugConsole(): void {
  consoleTransport.level = 'debug';
}

const dailyRotateFileTransport = new transports.DailyRotateFile({
  datePattern: 'YYYY-MM-DD',
  dirname: '_markbind/logs',
  filename: 'markbind-%DATE%.log',
  handleExceptions: true,
  level: 'debug',
  maxFiles: 5,
});

// Reconfigure the default instance logger winston provides with DailyRotateFile for markbind-cli
winston.configure({
  exitOnError: false,
  transports: [
    consoleTransport,
    dailyRotateFileTransport,
  ],
});

export {
  error,
  warn,
  info,
  verbose,
  debug,
} from '@markbind/core/src/utils/logger';

export {
  useDebugConsole,
};

// eslint-disable-next-line no-console
export const logo = () => console.log(chalk.cyan(figlet.textSync('MarkBind', { horizontalLayout: 'full' })));
// eslint-disable-next-line no-console
export const log = (msg: string) => console.log(msg);
