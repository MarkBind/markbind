/**
 * CommonJS wrapper for winston v2 compatibility with ES Modules
 * This file allows winston v2 (CommonJS) to be used in ESM projects
 */

const winston = require('winston');
require('winston-daily-rotate-file');

module.exports = {
  winston,
  transports: winston.transports,
  configure: winston.configure,
};
