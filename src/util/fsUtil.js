const path = require('path');

const sourceFileExtNames = ['.html', '.md', '.mbd', '.mbdf'];

module.exports = {
  isSourceFile(filePath) {
    return sourceFileExtNames.includes(path.extname(filePath));
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

  removeExtension: (filePathWithExt) => {
    let filePathWithoutExt = filePathWithExt;
    if (filePathWithExt.indexOf('.') > 0) {
      filePathWithoutExt = filePathWithExt.substring(0, filePathWithExt.lastIndexOf('.'));
    }
    return filePathWithoutExt;
  },
};
