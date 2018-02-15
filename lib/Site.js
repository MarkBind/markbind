const path = require('path');
const ignore = require('ignore');
const ejs = require('ejs');
const fs = require('fs-extra-promise');
const walkSync = require('walk-sync');
const Promise = require('bluebird');
const ghpages = require('gh-pages');
const logger = require('./util/logger');

const Page = require('./Page');

const TEMP_FOLDER_NAME = '.temp';
const SITE_CONFIG_NAME = 'site.json';
const INDEX_MARKDOWN_FILE = 'index.md';
const PAGE_TEMPLATE_NAME = 'page.ejs';
const BOILERPLATE_FOLDER_NAME = '_boilerplates';
const SITE_ASSET_FOLDER_NAME = 'asset';
const TEMPLATE_ROOT_FOLDER_NAME = 'template';
const TEMPLATE_SITE_ASSET_FOLDER_NAME = 'markbind';

const SITE_CONFIG_DEFAULT = {
  baseUrl: '',
  pages: [
    {
      src: 'index.md',
      title: 'Hello World',
    },
  ],
  ignore: [
    '_site/*',
    'site.json',
  ],
  deploy: {
    message: 'Site Update.',
  },
};

const INDEX_MARKDOWN_DEFAULT = '# Hello world\nWelcome to your page generated with MarkBind.\n';

function Site(rootPath, outputPath) {
  this.rootPath = rootPath;
  this.outputPath = outputPath;
  this.tempPath = path.join(rootPath, TEMP_FOLDER_NAME);

  // MarkBind assets to be copied
  this.siteAssetsSrcPath = path.resolve(__dirname, '..', SITE_ASSET_FOLDER_NAME);
  this.siteAssetsDestPath = path.join(outputPath, TEMPLATE_SITE_ASSET_FOLDER_NAME);

  // Page template path
  this.pageTemplatePath = path.join(__dirname, TEMPLATE_ROOT_FOLDER_NAME, PAGE_TEMPLATE_NAME);
  this.pageTemplate = ejs.compile(fs.readFileSync(this.pageTemplatePath, 'utf8'));
  this.pageModels = [];
}

/**
 * Util Methods
 */

function rejectHandler(reject, error, removeFolders) {
  Promise.all(removeFolders.map(folder => fs.removeAsync(folder)))
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
    path.basename(filename, path.extname(filename)) + ext,
  );
}

/**
 * Static method for initializing a markbind site.
 * Generate the site.json and an index.md file.
 *
 * @param rootPath
 */
Site.initSite = function (rootPath) {
  const boilerplatePath = path.join(rootPath, BOILERPLATE_FOLDER_NAME);
  const configPath = path.join(rootPath, SITE_CONFIG_NAME);
  const indexPath = path.join(rootPath, INDEX_MARKDOWN_FILE);
  // TODO: log the generate info
  return new Promise((resolve, reject) => {
    fs.accessAsync(boilerplatePath)
      .catch(() => {
        if (fs.existsSync(boilerplatePath)) {
          return Promise.resolve();
        }
        return fs.mkdirSync(boilerplatePath);
      })
      .then(() => fs.accessAsync(configPath))
      .catch(() => {
        if (fs.existsSync(configPath)) {
          return Promise.resolve();
        }
        return fs.outputJsonAsync(configPath, SITE_CONFIG_DEFAULT);
      })
      .then(() => fs.accessAsync(indexPath))
      .catch(() => {
        if (fs.existsSync(indexPath)) {
          return Promise.resolve();
        }
        return fs.outputFileAsync(indexPath, INDEX_MARKDOWN_DEFAULT);
      })
      .then(resolve)
      .catch(reject);
  });
};

Site.prototype.readSiteConfig = function () {
  return new Promise((resolve, reject) => {
    const siteConfigPath = path.join(this.rootPath, SITE_CONFIG_NAME);
    fs.readJsonAsync(siteConfigPath)
      .then((config) => {
        this.siteConfig = config;
        resolve(config);
      })
      .catch((err) => {
        reject(new Error('Failed to read the site config file \'site.json\' at'
          + `${this.rootPath}:\n${err.message}\nPlease ensure the file exist or is valid`));
      });
  });
};

Site.prototype.listAssets = function (fileIgnore) {
  return new Promise((resolve, reject) => {
    let files;
    try {
      files = walkSync(this.rootPath, { directories: false });
      resolve(fileIgnore.filter(files));
    } catch (error) {
      reject(error);
    }
  });
};

Site.prototype.createPageData = function (config) {
  const sourcePath = path.join(this.rootPath, config.pageSrc);
  const tempPath = path.join(this.tempPath, config.pageSrc);
  const resultPath = path.join(this.outputPath, setExtension(config.pageSrc, '.html'));
  return new Page({
    content: '',
    title: config.title || '',
    rootPath: this.rootPath,
    sourcePath,
    tempPath,
    resultPath,
    baseUrl: config.baseUrl,
    pageTemplate: config.pageTemplate,
    baseUrlMap: this.baseUrlMap,
    asset: {
      bootstrap: path.relative(path.dirname(resultPath),
                               path.join(this.siteAssetsDestPath, 'css', 'bootstrap.min.css')),
      highlight: path.relative(path.dirname(resultPath),
                               path.join(this.siteAssetsDestPath, 'css', 'github.min.css')),
      markbind: path.relative(path.dirname(resultPath),
                              path.join(this.siteAssetsDestPath, 'css', 'markbind.css')),
      vue: path.relative(path.dirname(resultPath),
                         path.join(this.siteAssetsDestPath, 'js', 'vue.min.js')),
      vueStrap: path.relative(path.dirname(resultPath),
                              path.join(this.siteAssetsDestPath, 'js', 'vue-strap.min.js')),
      setup: path.relative(path.dirname(resultPath),
                           path.join(this.siteAssetsDestPath, 'js', 'setup.js')),
    },
  });
};

Site.prototype.collectBaseUrl = function () {
  const candidates
    = walkSync(this.rootPath, { directories: false })
      .filter(x => x.endsWith(SITE_CONFIG_NAME))
      .map(x => path.resolve(x));

  this.baseUrlMap = candidates.reduce((pre, now) => {
    // eslint-disable-next-line no-param-reassign
    pre[path.dirname(now)] = true;
    return pre;
  }, {});

  return Promise.resolve();
};

Site.prototype.generate = function () {
  // Create the .tmp folder for storing intermediate results.
  fs.emptydirSync(this.tempPath);
  // Clean the output folder; create it if not exist.
  fs.emptydirSync(this.outputPath);
  return new Promise((resolve, reject) => {
    this.readSiteConfig()
      .then(() => this.collectBaseUrl())
      .then(() => this.buildAssets())
      .then(() => this.buildSourceFiles())
      .then(() => this.copyMarkBindAsset())
      .then(resolve)
      .catch((error) => {
        rejectHandler(reject, error, [this.tempPath, this.outputPath]);
      });
  });
};

/**
 * Build all pages of the site
 */
Site.prototype.buildSourceFiles = function () {
  return new Promise((resolve, reject) => {
    this.generatePages()
      .then(() => fs.removeAsync(this.tempPath))
      .then(resolve)
      .catch((error) => {
        // if error, remove the site and temp folders
        rejectHandler(reject, error, [this.tempPath, this.outputPath]);
      });
  });
};

/**
 * Rebuild pages that are affected by change in filePath
 * @param filePath path of file changed
 */
Site.prototype.rebuildSourceFiles = function (filePath) {
  return new Promise((resolve, reject) => {
    this.regenerateAffectedPages(filePath)
      .then(() => fs.removeAsync(this.tempPath))
      .then(resolve)
      .catch((error) => {
        // if error, remove the site and temp folders
        rejectHandler(reject, error, [this.tempPath, this.outputPath]);
      });
  });
};

Site.prototype.buildAsset = function (filePath) {
  return new Promise((resolve, reject) => {
    // if the file is an ignored file, resolve
    // Else, copy it to its destination
    const ignoreConfig = this.siteConfig.ignore || [];
    const fileRelative = path.relative(this.rootPath, filePath);
    const fileIgnore = ignore().add(ignoreConfig);
    if (fileIgnore.filter([fileRelative]).length === 0) {
      resolve();
    } else {
      fs.copyAsync(filePath, path.join(this.outputPath, fileRelative))
        .then(resolve)
        .catch((error) => {
          rejectHandler(reject, error, []); // assets won't affect deletion
        });
    }
  });
};

Site.prototype.removeAsset = function (filePath) {
  return new Promise((resolve, reject) => {
    const fileRelative = path.relative(this.rootPath, filePath);
    const fileToRemove = path.join(this.outputPath, fileRelative);
    fs.removeAsync(fileToRemove)
      .then(resolve)
      .catch((error) => {
        rejectHandler(reject, error, []); // assets won't affect deletion
      });
  });
};

Site.prototype.buildAssets = function () {
  return new Promise((resolve, reject) => {
    const ignoreConfig = this.siteConfig.ignore || [];
    const outputFolder = path.relative(this.rootPath, this.outputPath);
    ignoreConfig.push(outputFolder); // ignore generated site folder
    const fileIgnore = ignore().add(ignoreConfig);
    // Scan and copy assets (excluding ignore files).
    this.listAssets(fileIgnore)
      .then(assets =>
        assets.map(asset => fs.copyAsync(path.join(this.rootPath, asset), path.join(this.outputPath, asset))),
      )
      .then(copyAssets => Promise.all(copyAssets))
      .then(resolve)
      .catch((error) => {
        rejectHandler(reject, error, []); // assets won't affect deletion
      });
  });
};

/**
 * Renders all pages specified in site configuration file to the output folder
 */
Site.prototype.generatePages = function () {
  // Run MarkBind include and render on each source file.
  // Render the final rendered page to the output folder.
  const { baseUrl } = this.siteConfig;
  const builtFiles = {};
  const pages = this.siteConfig.pages || [];
  const processingFiles = [];
  this.pageModels = pages.map(page => this.createPageData({
    baseUrl,
    pageSrc: page.src,
    title: page.title,
    pageTemplate: this.pageTemplate,
  }));
  this.pageModels.forEach((page) => {
    processingFiles.push(page.generate(builtFiles));
  });
  return new Promise((resolve, reject) => {
    Promise.all(processingFiles)
      .then(resolve)
      .catch(reject);
  });
};

/**
 * Re-renders pages that contain the original file path
 * as the source file or as a static/dynamic included file
 * @param filePath path of file changed
 */
Site.prototype.regenerateAffectedPages = function (filePath) {
  const builtFiles = {};
  const processingFiles = [];
  this.pageModels.forEach((page) => {
    if (page.includedFiles[filePath]) {
      processingFiles.push(page.generate(builtFiles));
    }
  });

  logger.info(`Rebuilding ${processingFiles.length} pages`);

  return new Promise((resolve, reject) => {
    Promise.all(processingFiles)
      .then(() => logger.info('Pages rebuilt'))
      .then(resolve)
      .catch(reject);
  });
};

Site.prototype.copyMarkBindAsset = function () {
  return new Promise((resolve, reject) => {
    fs.copyAsync(this.siteAssetsSrcPath, this.siteAssetsDestPath)
      .then(resolve)
      .catch(reject);
  });
};

Site.prototype.deploy = function () {
  const defaultDeployConfig = {
    branch: 'gh-pages',
    message: 'Site Update.',
    repo: '',
  };
  return new Promise((resolve, reject) => {
    const publish = Promise.promisify(ghpages.publish);
    this.readSiteConfig()
      .then(() => {
        this.siteConfig.deploy = this.siteConfig.deploy || {};
        const basePath = this.siteConfig.deploy.baseDir || this.outputPath;
        if (!fs.existsSync(basePath)) {
          reject(new Error('The site directory does not exist. Please build the site first before deploy.'));
          return undefined;
        }
        const options = {};
        options.branch = this.siteConfig.deploy.branch || defaultDeployConfig.branch;
        options.message = this.siteConfig.deploy.message || defaultDeployConfig.message;
        options.repo = this.siteConfig.deploy.repo || defaultDeployConfig.repo;
        options.logger = logger.info;
        return publish(basePath, options);
      })
      .then(resolve)
      .catch(reject);
  });
};

module.exports = Site;
