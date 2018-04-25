const path = require('path');

module.exports = {
  isHtml: filePath => path.extname(filePath) === '.html',
  isMarkdown: filePath => path.extname(filePath) === '.md',
  isSourceFile(filePath) {
    return this.isMarkdown(filePath) || this.isHtml(filePath);
  },

  isInRoot: (root, fileName) => {
    let normalizedRoot = path.normalize(root);
    if (normalizedRoot === '.') {
      return true;
    }
    if (normalizedRoot[normalizedRoot.length - 1] !== path.sep) {
      normalizedRoot += path.sep;
    }
    const normalizedFilename = path.normalize(fileName);
    return (normalizedFilename.substr(0, normalizedRoot.length) === normalizedRoot);
  },

  isUrl: (unknownPath) => {
    const r = new RegExp('^(?:[a-z]+:)?//', 'i');
    return r.test(unknownPath);
  },

  setExtension: (normalizedFilename, ext) => path.join(
    path.dirname(normalizedFilename),
    path.basename(normalizedFilename, path.extname(normalizedFilename)) + ext,
  ),
};
