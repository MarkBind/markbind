const path = require('path');
const pathIsInside = require('path-is-inside');

const _ = {};
_.pick = require('lodash/pick');

const {
  BOILERPLATE_FOLDER_NAME,
} = require('../constants');

/**
 * @param filePath The absolute file path to look up that is nested inside the root directory
 * @param root The base directory from which to terminate the look up
 * @param lookUp The set of urls representing the sites' base directories
 * @return An object containing
 *         1. The parent site's path of that the immediate parent site of the specified filePath,
 *            or the root site's path if there is none
 *         2. The relative path from (1) to the immediate parent site of the specified filePath
 * @throws If a non-absolute path or path outside the root is given
 */
function calculateNewBaseUrls(filePath, root, lookUp) {
  if (!path.isAbsolute(filePath)) {
    throw new Error(`Non-absolute path given to calculateNewBaseUrls: '${filePath}'`);
  }
  if (!pathIsInside(filePath, root)) {
    throw new Error(`Path given '${filePath}' is not in root '${root}'`);
  }

  function calculate(file, result) {
    if (file === root) {
      return { relative: '', parent: root };
    }

    const parent = path.dirname(file);
    if (lookUp.has(parent)) {
      return result
        ? { relative: path.relative(parent, result), parent }
        : calculate(parent, parent);
    }

    return calculate(parent, result);
  }

  return calculate(filePath, undefined);
}

function calculateBoilerplateFilePath(pathInBoilerplates, asIfAt, config) {
  const { parent, relative } = calculateNewBaseUrls(asIfAt, config.rootPath, config.baseUrlMap);
  return path.resolve(parent, relative, BOILERPLATE_FOLDER_NAME, pathInBoilerplates);
}

module.exports = {
  calculateBoilerplateFilePath,
  calculateNewBaseUrls,
};
