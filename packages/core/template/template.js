const path = require('path');
const fs = require('fs-extra');

const fsUtils = require('../src/utils/fsUtil');

const requiredFiles = ['index.md', 'site.json', '_markbind/'];

function Template(rootPath, templatePath) {
  this.rootPath = rootPath;
  this.template = templatePath;
}

function validateTemplateFromPath(templatePath) {
  for (let i = 0; i < requiredFiles.length; i += 1) {
    const requiredFile = requiredFiles[i];
    const requiredFilePath = path.join(templatePath, requiredFile);

    if (!fs.existsSync(requiredFilePath)) {
      return false;
    }
  }

  return true;
}

function generateSiteWithTemplate(rootPath, templatePath) {
  return new Promise((resolve, reject) => {
    fs.access(rootPath)
      .catch(() => fs.mkdirSync(rootPath))
      .then(() => fsUtils.copySyncWithOptions(templatePath, rootPath, { overwrite: false }))
      .then(resolve)
      .catch(reject);
  });
}

Template.prototype.init = function () {
  const templatePath = path.join(__dirname, this.template);

  if (!validateTemplateFromPath(templatePath)) {
    throw new Error('Template validation failed. Required files does not exist');
  }

  return new Promise((resolve, reject) => {
    generateSiteWithTemplate(this.rootPath, templatePath)
      .then(resolve)
      .catch(reject);
  });
};

module.exports = Template;
