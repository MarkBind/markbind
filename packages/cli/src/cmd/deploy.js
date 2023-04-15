const path = require('path');

const { Site } = require('@markbind/core').Site;

const cliUtil = require('../util/cliUtil');
const logger = require('../util/logger');

function deploy(userSpecifiedRoot, options) {
  let rootFolder;
  try {
    rootFolder = cliUtil.findRootFolder(userSpecifiedRoot, options.siteConfig);
  } catch (error) {
    logger.error(error.message);
    process.exitCode = 1;
  }
  const outputFolder = path.join(rootFolder, '_site');

  // Choose to build or not build depending on --no-build flag
  // We cannot chain generate and deploy while calling generate conditionally, so we split with if-else
  const site = new Site(rootFolder, outputFolder, undefined, undefined, options.siteConfig);
  if (options.build) {
    site.generate()
      .then(() => {
        logger.info('Build success!');
        site.deploy(options.ci)
          .then(depUrl => (depUrl !== null ? logger.info(
            `The website has been deployed at: ${depUrl}`)
            : logger.info('Deployed!')));
      })
      .catch((error) => {
        logger.error(error.message);
        process.exitCode = 1;
      });
  } else {
    site.deploy(options.ci)
      .then(depUrl => (depUrl !== null ? logger.info(
        `The website has been deployed at: ${depUrl}`)
        : logger.info('Deployed!')))
      .catch((error) => {
        logger.error(error.message);
        process.exitCode = 1;
      });
  }
}

module.exports = {
  deploy,
};
