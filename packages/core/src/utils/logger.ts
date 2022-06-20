import winston from 'winston';

let progressBar: any;

const setProgressBar = (bar: any) => {
  progressBar = bar;
};
const removeProgressBar = () => {
  progressBar = null;
};

const consoleTransport = new winston.transports.Console({
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

// create a wrapper for error messages
const errorWrap = (input: any) => {
  if (progressBar) {
    progressBar.interruptBegin();
    winston.error(input);
    progressBar.interruptEnd();
  } else {
    winston.error(input);
  }
};

// create a wrapper for warning messages
const warnWarp = (input: any) => {
  if (progressBar) {
    progressBar.interruptBegin();
    winston.warn(input);
    progressBar.interruptEnd();
  } else {
    winston.warn(input);
  }
};

// create a wrapper for info messages
const infoWarp = (input: any) => {
  if (progressBar) {
    progressBar.interruptBegin();
    winston.info(input);
    progressBar.interruptEnd();
  } else {
    winston.info(input);
  }
};

const { debug } = winston;
const { verbose } = winston;

export {
  errorWrap as error,
  warnWarp as warn,
  infoWarp as info,
  verbose,
  debug,
  setProgressBar,
  removeProgressBar,
};
