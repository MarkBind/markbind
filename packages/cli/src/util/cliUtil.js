const findUp = require('find-up');
const fs = require('fs-extra');
const path = require('path');

const { SITE_CONFIG_NAME } = require('@markbind/core/src/Site/constants');

const findRootFolder = (userSpecifiedRoot, siteConfigPath = SITE_CONFIG_NAME) => {
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
};

/**
 * Referenced from StackOverflow:
 * https://stackoverflow.com/questions/5284147/validating-ipv4-addresses-with-regexp
 *
 * Credits to Danail Gabenski
 */
const isIpv4Address = (address) => {
  const patternForIpV4 = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;

  return patternForIpV4.test(address);
};

/**
 * Referenced from StackOverflow:
 * https://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
 *
 * Credits to David M. Syzdek
 */
const isIpv6Address = (address) => {
  const patternForIpV6 = new RegExp(
    '^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}'
    + '|([0-9a-fA-F]{1,4}:){1,7}:'
    + '|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}'
    + '|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}'
    + '|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}'
    + '|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}'
    + '|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}'
    + '|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})'
    + '|:((:[0-9a-fA-F]{1,4}){1,7}|:)'
    + '|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}'
    + '|::(ffff(:0{1,4}){0,1}:){0,1}'
    + '((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}'
    + '(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])'
    + '|([0-9a-fA-F]{1,4}:){1,4}:'
    + '((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}'
    + '(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$');

  return patternForIpV6.test(address);
};

module.exports = {
  findRootFolder,
  isIpv4Address,
  isIpv6Address,
};
