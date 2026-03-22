import winston from 'winston';
import type { ProgressBar } from '../lib/progress/index.js';

const { format } = winston;

let progressBar: ProgressBar | null = null;

const setProgressBar = (bar: ProgressBar) => {
  progressBar = bar;
};
const removeProgressBar = () => {
  progressBar = null;
};

const consoleFormat = format.combine(
  format.colorize(),
  format.errors({ stack: true }),
  format.printf(info => `${info.level}: ${info.message}`),
);

const consoleTransport = new winston.transports.Console({
  handleExceptions: true,
  level: 'debug',
});

winston.configure({
  exitOnError: false,
  format: consoleFormat,
  transports: [consoleTransport],
});

const createLoggerThatInterruptsProgressBar = (level: string) => (...args: any[]) => {
  if (progressBar) {
    progressBar.interruptBegin();
    (winston as any).log(level, ...args);
    progressBar.interruptEnd();
  } else {
    (winston as any).log(level, ...args);
  }
};

const errorWrap = createLoggerThatInterruptsProgressBar('error');
const warnWrap = createLoggerThatInterruptsProgressBar('warn');
const infoWrap = createLoggerThatInterruptsProgressBar('info');
const verboseWrap = createLoggerThatInterruptsProgressBar('verbose');
const debugWrap = createLoggerThatInterruptsProgressBar('debug');

export {
  errorWrap as error,
  warnWrap as warn,
  infoWrap as info,
  verboseWrap as verbose,
  debugWrap as debug,
  setProgressBar,
  removeProgressBar,
};
