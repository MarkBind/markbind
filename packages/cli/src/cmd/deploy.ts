import path from 'path';
import { Site } from '@markbind/core';
import type { DeployResult } from '@markbind/core';
import _ from 'lodash';
import * as cliUtil from '../util/cliUtil.js';
import * as logger from '../util/logger.js';

function logDeployResult(result: DeployResult) {
  if (result.ghActionsUrl) {
    logger.info(`GitHub Actions deployment initiated. Check status at: ${result.ghActionsUrl}`);
  }
  if (result.ghPagesUrl) {
    logger.info(`The website will be deployed at: ${result.ghPagesUrl}`);
  }
  if (!result.ghActionsUrl && !result.ghPagesUrl) {
    logger.info('Deployed!');
  }
}

function deploy(userSpecifiedRoot: string, options: any) {
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
    process.exitCode = 1;
    process.exit();
  }
  const outputFolder = path.join(rootFolder, '_site');

  // Choose to build or not build depending on --no-build flag
  // We cannot chain generate and deploy while calling generate conditionally, so we split with if-else
  const site = new Site(rootFolder, outputFolder, '', undefined, options.siteConfig,
                        false, false, () => {});
  if (options.build) {
    site.generate(undefined)
      .then(() => {
        logger.info('Build success!');
        site.deploy(options.ci)
          .then(logDeployResult);
      })
      .catch((error) => {
        logger.error(error.message);
        process.exitCode = 1;
      });
  } else {
    site.deploy(options.ci)
      .then(logDeployResult)
      .catch((error) => {
        logger.error(error.message);
        process.exitCode = 1;
      });
  }
}

export { deploy };
