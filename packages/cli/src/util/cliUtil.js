const findUp = require('find-up');
const fs = require('fs-extra');
const path = require('path');

const { SITE_CONFIG_NAME } = require('@markbind/core/src/Site/constants');

module.exports = {
  findRootFolder: (userSpecifiedRoot, siteConfigPath = SITE_CONFIG_NAME) => {
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
  },
  cleanupFailedMarkbindBuild: () => {
    const markbindDir = path.join(process.cwd(), '_markbind');
    const logsDir = path.join(markbindDir, 'logs');

    try {
      // First attempt to delete _markbind/logs
      if (fs.pathExistsSync(logsDir)) {
        fs.rmdirSync(logsDir);
      }
    } catch (error) {
      // Ignore errors when deleting logs directory
    }

    try {
      // Then attempt to delete _markbind
      if (fs.pathExistsSync(markbindDir)) {
        fs.rmdirSync(markbindDir);
      }
    } catch (error) {
      // Ignore errors when deleting markbind directory
    }
  },
};
