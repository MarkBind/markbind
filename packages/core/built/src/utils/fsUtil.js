var path = require('path');
var fs = require('fs-extra');
var ensurePosix = require('ensure-posix-path');
module.exports = {
    isInRoot: function (root, fileName) {
        var normalizedRoot = path.normalize(root);
        if (normalizedRoot === '.') {
            return true;
        }
        if (normalizedRoot[normalizedRoot.length - 1] !== path.sep) {
            normalizedRoot += path.sep;
        }
        var normalizedFilename = path.normalize(fileName);
        return (normalizedFilename.substr(0, normalizedRoot.length) === normalizedRoot);
    },
    isUrl: function (unknownPath) {
        var r = new RegExp('^(?:[a-z]+:)?//', 'i');
        return r.test(unknownPath);
    },
    setExtension: function (normalizedFilename, ext) { return module.exports.removeExtension(normalizedFilename) + ext; },
    removeExtension: function (filePathWithExt) { return path.join(path.dirname(filePathWithExt), path.basename(filePathWithExt, path.extname(filePathWithExt))); },
    removeExtensionPosix: function (filePathWithExt) { return ensurePosix(path.join(path.dirname(filePathWithExt), path.basename(filePathWithExt, path.extname(filePathWithExt)))); },
    copySyncWithOptions: function copySyncWithOptions(src, dest, options) {
        var files = fs.readdirSync(src);
        files.forEach(function (file) {
            var curSource = path.join(src, file);
            var curDest = path.join(dest, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                if (!fs.existsSync(curDest)) {
                    fs.mkdirSync(curDest);
                }
                copySyncWithOptions(curSource, curDest, options);
            }
            else {
                if (options.overwrite === false && fs.existsSync(curDest)) {
                    return;
                }
                fs.copySync(curSource, curDest);
            }
        });
    },
};
