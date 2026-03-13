import winston from 'winston';
import type { ProgressBar } from '../lib/progress';

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
  format.printf(info => `${info.level}: ${info.message}`),
);

const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
  handleExceptions: true,
  level: 'debug',
});

winston.configure({
  exitOnError: false,
  transports: [consoleTransport],
});

/**
 * Creates a wrapper function for a specific Winston log level.
 *
 * The wrapper ensures that if a progress bar is active, it is interrupted
 * before logging and resumed after, preventing the log message from being
 * mangled by the progress bar re-rendering.
 *
 * @param level - The Winston log level (e.g., 'error', 'warn', 'info', 'verbose', 'debug').
 * @returns A function that logs the provided input at the specified level, 
 *          handling progress bar interruptions if necessary.
 */
const createWrapper = (level: string) => (input: any) => {
  if (progressBar) {
    progressBar.interruptBegin();
    winston.log(level, input);
    progressBar.interruptEnd();
  } else {
    winston.log(level, input);
  }
};

const errorWrap = createWrapper('error');
const warnWrap = createWrapper('warn');
const infoWrap = createWrapper('info');
const verboseWrap = createWrapper('verbose');
const debugWrap = createWrapper('debug');

export {
  errorWrap as error,
  warnWrap as warn,
  infoWrap as info,
  verboseWrap as verbose,
  debugWrap as debug,
  setProgressBar,
  removeProgressBar,
};
