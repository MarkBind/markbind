const path = require('path');
const fs = require('fs-extra');

const fsUtil = require('../src/utils/fsUtil');

const requiredFiles = ['index.md', 'site.json', '_markbind/'];

class Template {
  constructor(rootPath, templatePath) {
    this.root = rootPath;
    this.template = templatePath;
  }

  static validateTemplateFromPath(templatePath) {
    for (let i = 0; i < requiredFiles.length; i += 1) {
      const requiredFile = requiredFiles[i];
      const requiredFilePath = path.join(templatePath, requiredFile);

      if (!fs.existsSync(requiredFilePath)) {
        return false;
      }
    }

    return true;
  }

  static generateSiteWithTemplate(rootPath, templatePath) {
    return new Promise((resolve, reject) => {
      fs.access(rootPath)
        .catch(() => fs.mkdirSync(rootPath))
        .then(() => fsUtil.copySyncWithOptions(templatePath, rootPath, { overwrite: false }))
        .then(resolve)
        .catch(reject);
    });
  }

  init() {
    const templatePath = path.join(__dirname, this.template);

    if (!Template.validateTemplateFromPath(templatePath)) {
      throw new Error('Template validation failed. Required files does not exist');
    }

    return new Promise((resolve, reject) => {
      Template.generateSiteWithTemplate(this.root, templatePath)
        .then(resolve)
        .catch(reject);
    });
  }
}

module.exports = {
  Template,
};
