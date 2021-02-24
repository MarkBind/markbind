const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const _ = {};
_.pick = require('lodash/pick');

const {
  markdownFileExts,
} = require('../constants');

module.exports = {
  getCurrentDirectoryBase() {
    return path.basename(process.cwd());
  },

  directoryExists(filePath) {
    try {
      return fs.statSync(filePath).isDirectory();
    } catch (err) {
      return false;
    }
  },

  ensurePosix: (filePath) => {
    if (path.sep !== '/') {
      return filePath.replace(/\\/g, '/');
    }

    return filePath;
  },

  fileExists(filePath) {
    try {
      return fs.statSync(filePath).isFile();
    } catch (err) {
      return false;
    }
  },

  getExt(file) {
    const ext = file.split('.').pop();
    if (!ext || ext === file) {
      return '';
    }
    return ext;
  },

  setExtension(filename, ext) {
    return path.join(
      path.dirname(filename),
      path.basename(filename, path.extname(filename)) + ext,
    );
  },

  isMarkdownFileExt(ext) {
    return markdownFileExts.includes(ext);
  },

  isUrl(filePath) {
    const r = new RegExp('^(?:[a-z]+:)?//', 'i');
    return r.test(filePath);
  },

  stripBaseUrl(src, baseUrl) {
    return src.startsWith(baseUrl)
      ? src.substring(baseUrl.length)
      : src;
  },

  createErrorNode(element, error) {
    const errorElement = cheerio.parseHTML(
      `<div style="color: red">${error.message}</div>`, true)[0];
    return Object.assign(element, _.pick(errorElement, ['name', 'attribs', 'children']));
  },

  createEmptyNode() {
    return cheerio.parseHTML('<div></div>', true)[0];
  },

  /**
   * Traverses the dom depth-first from the specified element to concatenate
   * all text of the specified element.
   * @param element Root element to search from
   * @returns string The concatenated text, or undefined if it is an empty string.
   */
  getTextContent(element) {
    const elements = element.children;
    if (!elements || !elements.length) {
      return undefined;
    }

    const elementStack = elements.slice();
    const text = [];
    while (elementStack.length) {
      const nextEl = elementStack.shift();
      if (nextEl.type === 'text') {
        text.push(nextEl.data);
      }

      if (nextEl.children && nextEl.type !== 'comment') {
        elementStack.unshift(...nextEl.children);
      }
    }

    return text.join('').trim();
  },
};
