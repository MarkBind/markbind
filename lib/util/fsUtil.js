const path = require('path');

module.exports = {
  isInRoot: (root, filename) => {
    root = path.normalize(root);
    filename = path.normalize(filename);
    if (root === '.') {
      return true;
    }
    if (root[root.length - 1] != path.sep) {
      root += path.sep;
    }
    return (filename.substr(0, root.length) === root);
  },

  setExtension: (filename, ext) => path.join(
    path.dirname(filename),
    path.basename(filename, path.extname(filename)) + ext,
  ),

  isUrl: (path) => {
    const r = new RegExp('^(?:[a-z]+:)?//', 'i');
    return r.test(path);
  },

  isMarkdown: filePath => path.extname(filePath) === '.md',
  isHtml: filePath => path.extname(filePath) === '.html',
};
