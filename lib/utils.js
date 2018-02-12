const fs = require('fs');
const path = require('path');

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

  fileExists(filePath) {
    try {
      return fs.statSync(filePath).isFile();
    } catch (err) {
      return false;
    }
  },

  getExtName(file) {
    const ext = file.split('.').pop();
    if (!ext || ext === file) {
      return '';
    }
    return ext;
  },

  wrapContent(content, front, tail) {
    front = front || '';
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

  isUrl(filePath) {
    const r = new RegExp('^(?:[a-z]+:)?//', 'i');
    return r.test(filePath);
  },

  createErrorElement(error) {
    return `<div style="color: red">${error.message}</div>`;
  },
};
