const isError = require("lodash/isError");
import winston from "winston";

let progressBar;

const setProgressBar = (bar) => {
  progressBar = bar;
};

const removeProgressBar = () => {
  progressBar = null;
};

const consoleTransport = new winston.transports.Console({
  colorize: true,
  handleExceptions: true,
  humanReadableUnhandledException: true,
  level: "debug",
  showLevel: true,
  format: winston.format.cli(),
});

winston.configure({
  exitOnError: false,
  transports: [consoleTransport],
});

// patch inability to print stack trace
// https://github.com/winstonjs/winston/issues/1498#issuecomment-433680788
winston.error = (err) => {
  if (isError(err)) {
    winston.log({ level: "error", message: `${err.stack || err}` });
  } else {
    winston.log({ level: "error", message: err });
  }
};

// create a wrapper for error messages
const errorWrap = (input) => {
  if (progressBar) {
    progressBar.interruptBegin();
    winston.error(input);
    progressBar.interruptEnd();
  } else {
    winston.error(input);
  }
};

// create a wrapper for warning messages
const warnWarp = (input) => {
  if (progressBar) {
    progressBar.interruptBegin();
    winston.warn(input);
    progressBar.interruptEnd();
  } else {
    winston.warn(input);
  }
};

module.exports = {
  error: errorWrap,
  warn: warnWarp,
  info: winston.info,
  verbose: winston.verbose,
  debug: winston.debug,
  setProgressBar,
  removeProgressBar,
};
