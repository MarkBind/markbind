import path from 'path';
import pathIsInside from 'path-is-inside';

const BOILERPLATE_FOLDER_NAME = '_markbind/boilerplates';

/**
 * Calculates the absolute path of of the immediate parent site of the specified filePath.
 * @param filePath The absolute file path to look up that is nested inside the root directory
 * @param root The base directory from which to terminate the look up
 * @param lookUp The set of urls representing the sites' base directories
 * @return String The immediate parent site's absolute path.
 * @throws If a non-absolute path or path outside the root is given
 */
function getParentSiteAbsolutePath(filePath: string, root: string, lookUp: Set<string>) {
  if (!path.isAbsolute(filePath)) {
    throw new Error(`Non-absolute path given to getParentSiteAbsolutePath: '${filePath}'`);
  }
  if (!pathIsInside(filePath, root)) {
    throw new Error(`Path given '${filePath}' is not in root '${root}'`);
  }

  function calculate(file: string): string {
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
function getParentSiteAbsoluteAndRelativePaths(filePath: string, root: string, lookUp: Set<string>) {
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
function calculateBoilerplateFilePath(
  pathInBoilerplates: string, asIfAt: string, config: Record<string, any>,
) {
  return path.resolve(getParentSiteAbsolutePath(asIfAt, config.rootPath, config.baseUrlMap),
                      BOILERPLATE_FOLDER_NAME, pathInBoilerplates);
}

const isUrlRegex = /^(?:[a-z]+:)?\/\//i;
function isUrl(unknownPath: string) {
  return isUrlRegex.test(unknownPath);
}

function stripBaseUrl(src: string, baseUrl: string) {
  return src.startsWith(baseUrl)
    ? src.substring(baseUrl.length)
    : src;
}

export {
  getParentSiteAbsolutePath,
  getParentSiteAbsoluteAndRelativePaths,
  calculateBoilerplateFilePath,
  isUrl,
  stripBaseUrl,
};
