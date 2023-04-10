import fs from 'fs-extra';
import path from 'path';
import * as fsUtil from '../utils/fsUtil';

const requiredFiles = ['index.md', 'site.json', '_markbind/'];

const PATH_TO_TEMPLATE = '../../template';

export class Template {
  root: string;
  template: string;

  constructor(rootPath: string, templatePath: string) {
    this.root = rootPath;
    this.template = path.join(__dirname, PATH_TO_TEMPLATE, templatePath);
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

  /**
   * A method for initializing a markbind site according to the given template.
   * Generate the site.json and an index.md file.
   */
  async init() {
    if (!this.validateTemplateFromPath()) {
      throw new Error('Template validation failed. Required files does not exist.');
    }

    return new Promise((resolve, reject) => {
      this.generateSiteWithTemplate()
        .then(resolve)
        .catch(reject);
    });
  }
}
