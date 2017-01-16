const path = require('path');
const ignore = require('ignore');
const ejs = require('ejs');
const fs = require('fs-extra-promise');
const walkSync = require('walk-sync');
const Promise = require('bluebird');

const Page = require('./Page');

const TEMP_FOLDER_NAME = '.temp';
const SITE_CONFIG_NAME = 'site.json';
const PAGE_TEMPLATE_NAME = 'page.ejs';
const TEMPLATE_ROOT_FOLDER_NAME = 'markbind-site-template';
const TEMPLATE_SITE_ASSET_FOLDER_NAME = 'markbind';

function Site(rootPath, outputPath) {
  this.rootPath = rootPath;
  this.outputPath = outputPath;
  this.tempPath = path.join(rootPath, TEMP_FOLDER_NAME);

  // MarkBind assets to be copied
  this.siteAssetsSrcPath = path.join(__dirname, TEMPLATE_ROOT_FOLDER_NAME, TEMPLATE_SITE_ASSET_FOLDER_NAME);
  this.siteAssetsDestPath = path.join(outputPath, TEMPLATE_SITE_ASSET_FOLDER_NAME);

  // Page template path
  this.pageTemplatePath = path.join(__dirname, TEMPLATE_ROOT_FOLDER_NAME, PAGE_TEMPLATE_NAME);
}

Site.prototype.readSiteConfig = function() {
  return new Promise((resolve, reject) => {
    const siteConfigPath = path.join(this.rootPath, SITE_CONFIG_NAME);
    fs.readJsonAsync(siteConfigPath)
      .then((config) => {
        resolve(config);
      })
      .catch((err) => {
        reject(new Error(`Failed to read the site config file \'site.json\' at ${this.rootPath}:\n${err.message}\nPlease ensure the file exist or is valid`));
      });
  });
};

Site.prototype.listAssets = function(ignore) {
  return new Promise((resolve, reject) => {
    let files;
    try {
      files = walkSync(this.rootPath, {directories: false});
      resolve(ignore.filter(files));
    } catch (error) {
      reject(error);
    }
  })
};

Site.prototype.createPageData = function (pageSrc, title, pageTemplate) {
  let sourcePath = path.join(this.rootPath, pageSrc);
  let tempPath = path.join(this.tempPath, pageSrc);
  let resultPath = path.join(this.outputPath, setExtension(pageSrc, '.html'));
  return new Page({
    content: '',
    title: title || '',
    sourcePath,
    tempPath,
    resultPath,
    pageTemplate,
    asset: {
      bootstrap: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'css', 'bootstrap.min.css')),
      vue: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'js', 'vue.min.js')),
      vueStrap: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'js', 'vue-strap.min.js'))
    }
  });
}

Site.prototype.generate = function () {
  // Create the .tmp folder for storing intermediate results.
  fs.emptydirSync(this.tempPath);

  // Clean the output folder; create it if not exist.
  fs.emptydirSync(this.outputPath);

  let pageTemplate = ejs.compile(fs.readFileSync(this.pageTemplatePath, 'utf8'));
  let siteConfig;
  return new Promise((resolve, reject) => {
    this.readSiteConfig()
      .then((config) => {
        siteConfig = config;
        let ignoreConfig = siteConfig.ignore || [];
        return ignore().add(ignoreConfig);

      })
      .then((ignore) => {
        // Scan and copy assets (excluding ignore files).
        return this.listAssets(ignore);
      })
      .then((assets) => assets.map((asset) => fs.copyAsync(path.join(this.rootPath, asset), path.join(this.outputPath, asset))))
      .then((copyAssets) => {
        return Promise.all(copyAssets);
      })
      .then(() => {
        // Run MarkBind include and render on each source file.
        // Render the final rendered page to the output folder.
        // TODO: Need to ensure the page is inside the rootFolder.
        let pages = siteConfig.pages || {};
        let processingFiles = [];
        for (let src in pages) {
          let page = this.createPageData(src, pages[src], pageTemplate);
          processingFiles.push(page.generate());
        }
        return Promise.all(processingFiles);
      })
      .then(() => {
        return fs.removeAsync(this.tempPath);
      })
      .then(() => {
        // Copy core markbind assets
        return fs.copyAsync(this.siteAssetsSrcPath, this.siteAssetsDestPath);
      })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        // if error, remove the site and temp folders
        fs.removeAsync(this.tempPath)
          .then(() => {
            return fs.removeAsync(this.outputPath);
          })
          .then(() => {
            reject(error);
          });
      });
  });
}

function setExtension(filename, ext) {
  return path.join(
    path.dirname(filename),
    path.basename(filename, path.extname(filename)) + ext
  );
}

module.exports = Site;
