const fs = require('fs-extra');
const path = require('path');

const { Template } = require('@markbind/core');
const { Site } = require('@markbind/core');

const logger = require('../util/logger');

function init(root, options) {
  const rootFolder = path.resolve(root || process.cwd());

  if (options.convert) {
    if (fs.existsSync(path.resolve(rootFolder, 'site.json'))) {
      logger.error('Cannot convert an existing MarkBind website!');
      return;
    }
  }

  const template = new Template(rootFolder, options.template);
  template.init()
    .then((templateConfig) => {
      logger.info('Initialization success.');
      const outputRoot = path.join(rootFolder, '_site');
      new Site(rootFolder, outputRoot).initSite(templateConfig, options.convert)
        .catch((error) => {
          logger.error(`Failed to generate template default with error: ${error.message}`);
          process.exitCode = 1;
        });
    })
    .catch((error) => {
      logger.error(`Failed to initialize site with given template with error: ${error.message}`);
      process.exitCode = 1;
    });
}

module.exports = {
  init,
};
