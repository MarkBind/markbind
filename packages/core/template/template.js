const path = require('path');
const fs = require('fs-extra');

const fsUtil = require('../src/utils/fsUtil');

const requiredFiles = ['index.md', 'site.json', '_markbind/'];

class Template {
  constructor(rootPath, templatePath) {
    this.root = rootPath;
    this.template = path.join(__dirname, templatePath);
  }

  validateTemplateFromPath() {
    for (let i = 0; i < requiredFiles.length; i += 1) {
      const requiredFile = requiredFiles[i];
      const requiredFilePath = path.join(this.template, requiredFile);

      if (!fs.existsSync(requiredFilePath)) {
        return false;
      }
    }

    return true;
  }

  generateSiteWithTemplate() {
    return new Promise((resolve, reject) => {
      fs.access(this.root)
        .catch(() => fs.mkdirSync(this.root))
        .then(() => fsUtil.copySyncWithOptions(this.template, this.root, { overwrite: false }))
        .then(resolve)
        .catch(reject);
    });
  }

  initTemplate() {
    if (!this.validateTemplateFromPath()) {
      throw new Error('Template validation failed. Required files does not exist');
    }

    return new Promise((resolve, reject) => {
      this.generateSiteWithTemplate()
        .then(resolve)
        .catch(reject);
    });
  }
}

module.exports = {
  Template,
};
