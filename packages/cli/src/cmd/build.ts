import path from 'path';
import { Site } from '@markbind/core';
import isBoolean from 'lodash/isBoolean';
import isError from 'lodash/isError';
import * as cliUtil from '../util/cliUtil';
import * as logger from '../util/logger';

const _ = {
  isBoolean,
  isError,
};

function build(userSpecifiedRoot: string, output: string, options: any) {
  // if --baseUrl contains no arguments (options.baseUrl === true) then set baseUrl to empty string
  const baseUrl = _.isBoolean(options.baseUrl) ? '' : options.baseUrl;

  let rootFolder;
  try {
    rootFolder = cliUtil.findRootFolder(userSpecifiedRoot, options.siteConfig);
  } catch (error) {
    if (_.isError(error)) {
      logger.error(error.message);
      logger.error('This directory does not appear to contain a valid MarkBind site. '
          + 'Check that you are running the command in the correct directory!\n'
          + '\n'
          + 'To create a new MarkBind site, run:\n'
          + '   markbind init');
    } else {
      logger.error(`Unknown error occurred: ${error}`);
    }
    cliUtil.cleanupFailedMarkbindBuild();
    process.exitCode = 1;
    process.exit();
  }

  const defaultOutputRoot = path.join(rootFolder, '_site');
  const outputFolder = output ? path.resolve(process.cwd(), output) : defaultOutputRoot;
  new Site(rootFolder, outputFolder, '', undefined, options.siteConfig,
           false, false, () => {})
    .generate(baseUrl)
    .then(() => {
      logger.info('Build success!');
    })
    .catch((error) => {
      logger.error(error.message);
      process.exitCode = 1;
    });
}

export { build };
