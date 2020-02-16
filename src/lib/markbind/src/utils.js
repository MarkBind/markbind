const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const { markdownFileExts } = require('./constants');

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

  wrapContent(content, front, tail) {
    if (tail === undefined) {
      return front + content + front;
    }
    return front + content + tail;
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

  isAbsolutePath(filePath) {
    return path.isAbsolute(filePath)
            || filePath.includes('{{baseUrl}}')
            || filePath.includes('{{hostBaseUrl}}');
  },

  createErrorElement(error) {
    return `<div style="color: red">${error.message}</div>`;
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

  extractCodeElement(element, codeLanguage = '') {
    let codeBlockElement = cheerio.parseHTML('<div></div>', true)[0];

    element.children.forEach((child) => {
      if (child.name === 'pre' && child.children.length >= 1) {
        const [nestedChild] = child.children;
        if (nestedChild.name !== 'code') {
          return;
        }
        [codeBlockElement] = nestedChild.children;
        codeBlockElement.data = `\`\`\`${codeLanguage}\n${codeBlockElement.data}\n\`\`\``;
      }
    });

    return codeBlockElement;
  },
};
