var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
var _ = {};
_.pick = require('lodash/pick');
var markdownFileExts = require('../constants').markdownFileExts;
module.exports = {
    getCurrentDirectoryBase: function () {
        return path.basename(process.cwd());
    },
    directoryExists: function (filePath) {
        try {
            return fs.statSync(filePath).isDirectory();
        }
        catch (err) {
            return false;
        }
    },
    ensurePosix: function (filePath) {
        if (path.sep !== '/') {
            return filePath.replace(/\\/g, '/');
        }
        return filePath;
    },
    fileExists: function (filePath) {
        try {
            return fs.statSync(filePath).isFile();
        }
        catch (err) {
            return false;
        }
    },
    getExt: function (file) {
        var ext = file.split('.').pop();
        if (!ext || ext === file) {
            return '';
        }
        return ext;
    },
    setExtension: function (filename, ext) {
        return path.join(path.dirname(filename), path.basename(filename, path.extname(filename)) + ext);
    },
    isMarkdownFileExt: function (ext) {
        return markdownFileExts.includes(ext);
    },
    isUrl: function (filePath) {
        var r = new RegExp('^(?:[a-z]+:)?//', 'i');
        return r.test(filePath);
    },
    stripBaseUrl: function (src, baseUrl) {
        return src.startsWith(baseUrl)
            ? src.substring(baseUrl.length)
            : src;
    },
    createErrorNode: function (element, error) {
        var errorElement = cheerio.parseHTML("<div style=\"color: red\">" + error.message + "</div>", true)[0];
        return Object.assign(element, _.pick(errorElement, ['name', 'attribs', 'children']));
    },
    createEmptyNode: function () {
        return cheerio.parseHTML('<div></div>', true)[0];
    },
    /**
     * Traverses the dom depth-first from the specified element to concatenate
     * all text of the specified element.
     * @param element Root element to search from
     * @returns string The concatenated text, or undefined if it is an empty string.
     */
    getTextContent: function (element) {
        var elements = element.children;
        if (!elements || !elements.length) {
            return undefined;
        }
        var elementStack = elements.slice();
        var text = [];
        while (elementStack.length) {
            var nextEl = elementStack.shift();
            if (nextEl.type === 'text') {
                text.push(nextEl.data);
            }
            if (nextEl.children && nextEl.type !== 'comment') {
                elementStack.unshift.apply(elementStack, nextEl.children);
            }
        }
        return text.join('').trim();
    },
};
