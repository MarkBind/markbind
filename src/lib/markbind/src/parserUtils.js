const cheerio = require('cheerio');
const pathIsInside = require('path-is-inside');
const path = require('path');
const utils = require('./utils');

const _ = {};
_.pick = require('lodash/pick');
const {
  BOILERPLATE_FOLDER_NAME,
  ATTRIB_CWF,
} = require('./constants');

cheerio.prototype.options.xmlMode = true; // Enable xml mode for self-closing tag
cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

/**
* @throws Will throw an error if a non-absolute path or path outside the root is given
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
      return { relative: path.relative(root, root), parent: root };
    }
    const parent = path.dirname(file);
    if (lookUp.has(parent) && result.length === 1) {
      return { relative: path.relative(parent, result[0]), parent };
    } else if (lookUp.has(parent)) {
      return calculate(parent, [parent]);
    }
    return calculate(parent, result);
  }

  return calculate(filePath, []);
}

function calculateBoilerplateFilePath(pathInBoilerplates, asIfAt, config) {
  const { parent, relative } = calculateNewBaseUrls(asIfAt, config.rootPath, config.baseUrlMap);
  return path.resolve(parent, relative, BOILERPLATE_FOLDER_NAME, pathInBoilerplates);
}

function createErrorNode(element, error) {
  const errorElement = cheerio.parseHTML(utils.createErrorElement(error), true)[0];
  return Object.assign(element, _.pick(errorElement, ['name', 'attribs', 'children']));
}

function createEmptyNode() {
  const emptyElement = cheerio.parseHTML('<div></div>', true)[0];
  return emptyElement;
}

function isText(element) {
  return element.type === 'text' || element.type === 'comment';
}

/**
 * Extract variables from an include element
 * @param includeElement include element to extract variables from
 * @param contextVariables variables defined by parent pages
 */
function extractIncludeVariables(includeElement, contextVariables) {
  const includedVariables = { ...contextVariables };
  Object.keys(includeElement.attribs).forEach((attribute) => {
    if (!attribute.startsWith('var-')) {
      return;
    }
    const variableName = attribute.replace(/^var-/, '');
    if (!includedVariables[variableName]) {
      includedVariables[variableName] = includeElement.attribs[attribute];
    }
  });
  if (includeElement.children) {
    includeElement.children.forEach((child) => {
      if (child.name !== 'variable' && child.name !== 'span') {
        return;
      }
      const variableName = child.attribs.name || child.attribs.id;
      if (!variableName) {
        // eslint-disable-next-line no-console
        console.warn(`Missing reference in ${includeElement.attribs[ATTRIB_CWF]}\n`
                     + `Missing 'name' or 'id' in variable for ${includeElement.attribs.src} include.`);
        return;
      }
      if (!includedVariables[variableName]) {
        includedVariables[variableName] = cheerio.html(child.children);
      }
    });
  }
  return includedVariables;
}

export {
  calculateNewBaseUrls,
  calculateBoilerplateFilePath,
  createErrorNode,
  createEmptyNode,
  isText,
  extractIncludeVariables,
};
