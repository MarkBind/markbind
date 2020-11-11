const path = require('path');
const fs = require('fs-extra');
const ensurePosix = require('ensure-posix-path');

module.exports = {
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

  setExtension: (normalizedFilename, ext) => module.exports.removeExtension(normalizedFilename) + ext,

  removeExtension: filePathWithExt => path.join(
    path.dirname(filePathWithExt),
    path.basename(filePathWithExt, path.extname(filePathWithExt)),
  ),

  removeExtensionPosix: filePathWithExt => ensurePosix(path.join(
    path.dirname(filePathWithExt),
    path.basename(filePathWithExt, path.extname(filePathWithExt)),
  )),

  copySyncWithOptions: function copySyncWithOptions(src, dest, options) {
    const files = fs.readdirSync(src);
    files.forEach((file) => {
      const curSource = path.join(src, file);
      const curDest = path.join(dest, file);

      if (fs.lstatSync(curSource).isDirectory()) {
        if (!fs.existsSync(curDest)) {
          fs.mkdirSync(curDest);
        }
        copySyncWithOptions(curSource, curDest, options);
      } else {
        if (options.overwrite === false && fs.existsSync(curDest)) {
          return;
        }
        fs.copySync(curSource, curDest);
      }
    });
  },
};
