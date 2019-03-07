const fs = require('fs');
const path = require('path');

const markdownFileExts = ['md', 'mbd', 'mbdf'];

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

  ensurePosix: filePath => {
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

  createErrorElement(error) {
    return `<div style="color: red">${error.message}</div>`;
  },
};
