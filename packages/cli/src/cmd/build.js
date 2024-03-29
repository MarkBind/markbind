const path = require('path');

const { Site } = require('@markbind/core').Site;

const cliUtil = require('../util/cliUtil');
const logger = require('../util/logger');

const _ = {};
_.isBoolean = require('lodash/isBoolean');

function build(userSpecifiedRoot, output, options) {
  // if --baseUrl contains no arguments (options.baseUrl === true) then set baseUrl to empty string
  const baseUrl = _.isBoolean(options.baseUrl) ? '' : options.baseUrl;

  let rootFolder;
  try {
    rootFolder = cliUtil.findRootFolder(userSpecifiedRoot, options.siteConfig);
  } catch (error) {
    logger.error(error.message);
    process.exitCode = 1;
  }

  const defaultOutputRoot = path.join(rootFolder, '_site');
  const outputFolder = output ? path.resolve(process.cwd(), output) : defaultOutputRoot;
  new Site(rootFolder, outputFolder, undefined, undefined, options.siteConfig)
    .generate(baseUrl)
    .then(() => {
      logger.info('Build success!');
    })
    .catch((error) => {
      logger.error(error.message);
      process.exitCode = 1;
    });
}

module.exports = {
  build,
};
