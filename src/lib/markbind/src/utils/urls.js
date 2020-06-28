const path = require('path');
const pathIsInside = require('path-is-inside');

const _ = {};
_.pick = require('lodash/pick');

const {
  BOILERPLATE_FOLDER_NAME,
} = require('../constants');

/**
 * Calculates the absolute path of of the immediate parent site of the specified filePath.
 * @param filePath The absolute file path to look up that is nested inside the root directory
 * @param root The base directory from which to terminate the look up
 * @param lookUp The set of urls representing the sites' base directories
 * @return String The immediate parent site's absolute path.
 * @throws If a non-absolute path or path outside the root is given
 */
function getParentSiteAbsolutePath(filePath, root, lookUp) {
  if (!path.isAbsolute(filePath)) {
    throw new Error(`Non-absolute path given to getParentSiteAbsolutePath: '${filePath}'`);
  }
  if (!pathIsInside(filePath, root)) {
    throw new Error(`Path given '${filePath}' is not in root '${root}'`);
  }

  function calculate(file) {
    if (file === root) {
      return file;
    }

    const parent = path.dirname(file);
    return lookUp.has(parent)
      ? parent
      : calculate(parent);
  }

  return calculate(filePath);
}

/**
 * Calculates the absolute and relative path of of the immediate parent site of the specified filePath.
 */
function getParentSiteAbsoluteAndRelativePaths(filePath, root, lookUp) {
  const absolute = getParentSiteAbsolutePath(filePath, root, lookUp);
  return {
    absolute,
    relative: path.relative(root, absolute),
  };
}

/**
 * Calculates a boilerplate's source file path at the immediate parent site of
 * the supplied file path.
 */
function calculateBoilerplateFilePath(pathInBoilerplates, asIfAt, config) {
  return path.resolve(getParentSiteAbsolutePath(asIfAt, config.rootPath, config.baseUrlMap),
                      BOILERPLATE_FOLDER_NAME, pathInBoilerplates);
}

module.exports = {
  getParentSiteAbsolutePath,
  getParentSiteAbsoluteAndRelativePaths,
  calculateBoilerplateFilePath,
};
