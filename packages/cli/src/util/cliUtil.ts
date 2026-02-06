import findUp from 'find-up';
import fs from 'fs-extra';
import path from 'path';
import isString from 'lodash/isString';

import { SITE_CONFIG_NAME } from '@markbind/core/src/Site/constants';

const DIR_NOT_EMPTY_ERROR_CODE = 'ENOTEMPTY';

function hasErrorCodeAndMessage(err: any): err is { code: string, message: string } {
  return isString(err.code) && isString(err.message);
}

function tryDeleteFolder(pathName: string) {
  if (!fs.pathExistsSync(pathName)) {
    return;
  }
  try {
    fs.rmdirSync(pathName);
  } catch (error) {
    if (hasErrorCodeAndMessage(error)) {
      // If directory is not empty, fail silently
      if (error.code !== DIR_NOT_EMPTY_ERROR_CODE) {
        // Warn for other unexpected errors
        // Use `console` instead of logger as we don't want to create a new logger instance
        // that might pollute the working directory again.
        // eslint-disable-next-line no-console
        console.warn(`WARNING: Failed to delete directory ${pathName}: ${error.message}`);
      }
    } else {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Failed to delete directory ${pathName}: Unknown err ${error}`);
    }
  }
}

export function findRootFolder(
  userSpecifiedRoot: string, siteConfigPath: string = SITE_CONFIG_NAME): string {
  if (userSpecifiedRoot) {
    const resolvedUserSpecifiedRoot = path.resolve(userSpecifiedRoot);
    const expectedConfigPath = path.join(resolvedUserSpecifiedRoot, siteConfigPath);
    if (!fs.existsSync(expectedConfigPath)) {
      throw new Error(`Config file not found at user specified root ${resolvedUserSpecifiedRoot}`);
    }
    return resolvedUserSpecifiedRoot;
  }

  const currentWorkingDir = process.cwd();
  // Enforces findUp uses value of process.cwd() to determine starting dir
  // This allows us to define starting dir when testing by mocking process.cwd()
  const foundConfigPath = findUp.sync(siteConfigPath, { cwd: currentWorkingDir });
  if (!foundConfigPath) {
    throw new Error(`No config file found in parent directories of ${currentWorkingDir}`);
  }
  return path.dirname(foundConfigPath);
}

export function cleanupFailedMarkbindBuild() {
  const markbindDir = path.join(process.cwd(), '_markbind');
  const logsDir = path.join(markbindDir, 'logs');

  tryDeleteFolder(logsDir);
  tryDeleteFolder(markbindDir);
}
