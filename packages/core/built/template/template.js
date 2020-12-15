var path = require('path');
var fs = require('fs-extra');
var fsUtils = require('../src/utils/fsUtil');
var requiredFiles = ['index.md', 'site.json', '_markbind/'];
function Template(rootPath, templatePath) {
    this.rootPath = rootPath;
    this.template = templatePath;
}
function validateTemplateFromPath(templatePath) {
    for (var i = 0; i < requiredFiles.length; i += 1) {
        var requiredFile = requiredFiles[i];
        var requiredFilePath = path.join(templatePath, requiredFile);
        if (!fs.existsSync(requiredFilePath)) {
            return false;
        }
    }
    return true;
}
function generateSiteWithTemplate(rootPath, templatePath) {
    return new Promise(function (resolve, reject) {
        fs.access(rootPath)
            .catch(function () { return fs.mkdirSync(rootPath); })
            .then(function () { return fsUtils.copySyncWithOptions(templatePath, rootPath, { overwrite: false }); })
            .then(resolve)
            .catch(reject);
    });
}
Template.prototype.init = function () {
    var _this = this;
    var templatePath = path.join(__dirname, this.template);
    if (!validateTemplateFromPath(templatePath)) {
        throw new Error('Template validation failed. Required files does not exist');
    }
    return new Promise(function (resolve, reject) {
        generateSiteWithTemplate(_this.rootPath, templatePath)
            .then(resolve)
            .catch(reject);
    });
};
module.exports = Template;
