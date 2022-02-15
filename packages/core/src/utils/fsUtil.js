const path = require('path');
const fs = require('fs-extra');
const ensurePosix = require('ensure-posix-path');

const markdownFileExts = '.md';

module.exports = {
  ensurePosix,

  fileExists(filePath) {
    try {
      return fs.statSync(filePath).isFile();
    } catch (err) {
      return false;
    }
  },

  isMarkdownFileExt(ext) {
    return markdownFileExts.includes(ext);
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
