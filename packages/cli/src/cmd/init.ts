import fs from 'fs-extra';
import path from 'path';
import isError from 'lodash/isError';

import { Template } from '@markbind/core';

import logger from '../util/logger';

const _ = {
  isError,
};

async function init(root: string, options: any) {
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
    if (_.isError(error)) {
      logger.error(`Failed to initialize site with given template with error: ${error.message}`);
    } else {
      logger.error(`Failed to initialize site with given template with error: ${error}`);
    }
    process.exitCode = 1;
  }

  if (options.convert) {
    logger.info('Converting to MarkBind website.');
    try {
      await template.convert();
      logger.info('Conversion success.');
    } catch (error) {
      if (_.isError(error)) {
        logger.error(error.message);
      } else {
        logger.error(`Unknown error occurred: ${error}`);
      }
      process.exitCode = 1;
    }
  }
}

export { init };
