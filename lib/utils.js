'use strict';

var fs = require('fs');
var path = require('path');

module.exports = {
  getCurrentDirectoryBase: function () {
    return path.basename(process.cwd());
  },

  directoryExists: function (filePath) {
    try {
      return fs.statSync(filePath).isDirectory();
    } catch (err) {
      return false;
    }
  },

  getExtName: function (file) {
    let ext = file.split('.').pop();
    if (!ext || ext === file) {
      return '';
    }
    return ext;
  },

  wrapContent: function (content, front, tail) {
    front = front || '';
    if (tail === void 0) {
      return front + content + front;
    }
    return front + content + tail;
  },

  setExtension: function(filename, ext) {
    return path.join(
      path.dirname(filename),
      path.basename(filename, path.extname(filename)) + ext
    );
  },

  isUrl: function(path) {
    var r = new RegExp('^(?:[a-z]+:)?//', 'i');
    return r.test(path);
  },

  createErrorElement: function (error) {
    return `<div style="color: red">${error.message}</div>`;
  },
};
