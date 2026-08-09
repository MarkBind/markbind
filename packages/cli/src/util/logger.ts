import chalk from 'chalk';
import figlet from 'figlet';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { transports, format } = winston;

const LEVEL_AND_MESSAGE = (info: winston.Logform.TransformableInfo) =>
  `${info.level}: ${info.stack || info.message}`;

const consoleFormat = format.combine(
  format.colorize(),

  format.printf(LEVEL_AND_MESSAGE),
);

const fileFormat = format.combine(
  format.timestamp(),
  format.printf(info => `${info.timestamp} - ${LEVEL_AND_MESSAGE(info)}`),
);

// @markbind/core's consoleTransport but with level: info
const consoleTransport = new transports.Console({
  format: consoleFormat,
  handleExceptions: true,
  level: 'info',
});

function useDebugConsole(): void {
  consoleTransport.level = 'debug';
}

function useVerboseConsole(): void {
  consoleTransport.level = 'verbose';
}

const dailyRotateFileTransportOptions: DailyRotateFile.DailyRotateFileTransportOptions = {
  format: fileFormat,
  datePattern: 'YYYY-MM-DD',
  dirname: '_markbind/logs',
  filename: 'markbind-%DATE%.log',
  handleExceptions: true,
  level: 'debug',
  maxFiles: 5,
  auditFile: '_markbind/logs/audit.json',
};

let isFileLoggingInitialized = false;

function initializeFileLogging(): void {
  if (isFileLoggingInitialized) {
    return;
  }

  winston.add(new DailyRotateFile(dailyRotateFileTransportOptions));
  isFileLoggingInitialized = true;
}

// Reconfigure the default instance logger winston provides for markbind-cli.
// File logging is added only when a command is about to run.
winston.configure({
  exitOnError: false,
  transports: [consoleTransport],
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
  useVerboseConsole,
  initializeFileLogging,
};

// eslint-disable-next-line no-console
export const logo = () => console.log(chalk.cyan(figlet.textSync('MarkBind', { horizontalLayout: 'full' })));
// eslint-disable-next-line no-console
export const log = (msg: string) => console.log(msg);
