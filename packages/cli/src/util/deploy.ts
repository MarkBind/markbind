import type { DeployResult } from '@markbind/core';
import * as logger from './logger.js';

export function logDeployResult(result: DeployResult) {
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
