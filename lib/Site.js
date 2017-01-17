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
  this.pageTemplate = ejs.compile(fs.readFileSync(this.pageTemplatePath, 'utf8'));
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

Site.prototype.listAssets = function (ignore) {
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
  return new Promise((resolve, reject) => {
    this.reloadSourceFiles()
      .then(() => this.copyMarkBindAsset())
      .then(resolve)
      .catch((error) => {
        rejectHandler(reject, error, [this.tempPath, this.outputPath])
      });
  })
}

Site.prototype.reloadSourceFiles = function () {
  let siteConfig;
  return new Promise((resolve, reject) => {
    this.readSiteConfig()
      .then((config) => {
        siteConfig = config;
        return siteConfig;
      })
      .then(() => this.generateAsset(siteConfig))
      .then(() => this.generatePages(siteConfig))
      .then(resolve)
      .catch((error) => {
        // if error, remove the site and temp folders
        rejectHandler(reject, error, [this.tempPath, this.outputPath])
      });
  });
}

Site.prototype.generateAsset = function (config) {
  return new Promise((resolve, reject) => {
    let ignoreConfig = config.ignore || [];
    let outputFolder = path.relative(this.rootPath, this.outputPath);
    ignoreConfig.push(outputFolder); // ignore generated site folder
    let fileIgnore = ignore().add(ignoreConfig);
    // Scan and copy assets (excluding ignore files).
    this.listAssets(fileIgnore)
      .then((assets) =>
        assets.map((asset) => fs.copyAsync(path.join(this.rootPath, asset), path.join(this.outputPath, asset)))
      )
      .then((copyAssets) => Promise.all(copyAssets))
      .then(resolve)
      .catch(reject);
  });
};

Site.prototype.generatePages = function (config) {
  // Run MarkBind include and render on each source file.
  // Render the final rendered page to the output folder.
  // TODO: Need to ensure the page is inside the rootFolder.
  let pages = config.pages || {};
  let processingFiles = [];
  for (let src in pages) {
    let page = this.createPageData(src, pages[src], this.pageTemplate);
    processingFiles.push(page.generate());
  }
  return new Promise((resolve, reject) => {
    Promise.all(processingFiles)
      .then(() => fs.removeAsync(this.tempPath))
      .then(resolve)
      .catch(reject);
  });
};


Site.prototype.copyMarkBindAsset = function () {
  return new Promise((resolve, reject) => {
    fs.copyAsync(this.siteAssetsSrcPath, this.siteAssetsDestPath)
      .then(resolve)
      .catch(reject);
  })
};

function rejectHandler(reject, error, removeFolders) {
  Promise.all(removeFolders.map((folder) => fs.removeAsync(folder)))
    .then(() => {
      reject(error);
    })
    .catch((err) => {
      reject(new Error(`${error.message}\n${err.message}`));
    });
}

function setExtension(filename, ext) {
  return path.join(
    path.dirname(filename),
    path.basename(filename, path.extname(filename)) + ext
  );
}

module.exports = Site;
