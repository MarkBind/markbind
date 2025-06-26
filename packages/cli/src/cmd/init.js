const fs = require('fs-extra');
const path = require('path');

const { Template } = require('@markbind/core');
const logger = require('../util/logger');
const { autoGenerateTitles } = require('../util/autoTitle'); // <--- You will create this file

async function init(root, options) {
  const rootFolder = path.resolve(root || process.cwd());

  if (options.convert) {
    if (fs.existsSync(path.resolve(rootFolder, 'site.json'))) {
      logger.error('Cannot convert an existing MarkBind website!');
      return;
    }
  }

  const template = new Template(rootFolder, options.template);

  try {
    await template.init();
    logger.info('Initialization success.');
  } catch (error) {
    logger.error(`Failed to initialize site with given template with error: ${error.message}`);
    process.exitCode = 1;
  }

  if (options.convert) {
    logger.info('Converting to MarkBind website.');
    try {
      await template.convert();
      logger.info('Conversion success.');

      // ✅ New auto-title logic
      if (options.autoTitle) {
        logger.info('Auto-generating titles for markdown files...');
        await autoGenerateTitles(rootFolder);
        logger.info('Auto title generation completed.');
      }

    } catch (error) {
      logger.error(error.message);
      process.exitCode = 1;
    }
  }
}

module.exports = {
  init,
};

