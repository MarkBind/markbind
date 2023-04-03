import fs from 'fs-extra';
import path from 'path';
import * as fsUtil from '../utils/fsUtil';

const requiredFiles = ['index.md', 'site.json', '_markbind/'];
const omitOnConvertFiles = ['.gitignore'];

const PATH_TO_TEMPLATE = '../../template';

export class Template {
  root: string;
  template: string;
  toConvert: boolean;
  omitFiles: Array<string>;

  constructor(rootPath: string, templatePath: string, toConvert: boolean) {
    this.root = rootPath;
    this.template = path.join(__dirname, PATH_TO_TEMPLATE, templatePath);
    this.toConvert = toConvert;
    this.omitFiles = omitOnConvertFiles.map(file => path.join(this.template, file));
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
        .then(() => fsUtil.copySyncWithOptions(this.template, this.root, { overwrite: false },
                                               this.toConvert ? this.omitFiles : []))
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
