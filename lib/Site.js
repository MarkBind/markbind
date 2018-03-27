/* eslint-disable no-underscore-dangle */

const cheerio = require('cheerio');
const delay = require('./util/delay');
const path = require('path');
const ignore = require('ignore');
const ejs = require('ejs');
const fs = require('fs-extra-promise');
const walkSync = require('walk-sync');
const Promise = require('bluebird');
const ghpages = require('gh-pages');
const logger = require('./util/logger');
const fm = require('fastmatter');
const MarkBind = require('./markbind/lib/parser');

const _ = {};
_.uniq = require('lodash/uniq');

const Page = require('./Page');

const TEMP_FOLDER_NAME = '.temp';
const SITE_CONFIG_NAME = 'site.json';
const INDEX_MARKDOWN_FILE = 'index.md';
const PAGE_TEMPLATE_NAME = 'page.ejs';
const BOILERPLATE_FOLDER_NAME = '_markbind/boilerplates';
const SITE_ASSET_FOLDER_NAME = 'asset';
const TEMPLATE_ROOT_FOLDER_NAME = 'template';
const TEMPLATE_SITE_ASSET_FOLDER_NAME = 'markbind';
const USER_VARIABLES_PATH = '_markbind/variables.md';

const markbinder = new MarkBind();

const SITE_CONFIG_DEFAULT = {
  baseUrl: '',
  addressable: ['**/index.md'],
  ignore: [
    '_markbind/logs/*',
    '_site/*',
    '*.json',
    '*.md',
  ],
  deploy: {
    message: 'Site Update.',
  },
};

const INDEX_MARKDOWN_DEFAULT = '<frontmatter>\ntitle: "Hello World"\n</frontmatter>\n\n# Hello world\n'
  + 'Welcome to your page generated with MarkBind.\n';

const USER_VARIABLES_DEFAULT = '<span id="example">\n'
  + 'To inject this HTML segment in your markbind files, use {{ example }} where you want to place it.\n'
  + 'More generally, surround the segment\'s id with double curly braces.\n'
  + '</span>';

const GENERATE_SITE_LOGGING_KEY = 'Generate Site';

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

  this.filePaths = [];
  this.frontMatterData = [];
}

/**
 * Util Methods
 */

function rejectHandler(reject, error, removeFolders) {
  logger.warn(error);
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
  const userDefinedVariablesPath = path.join(rootPath, USER_VARIABLES_PATH);
  // TODO: log the generate info
  return new Promise((resolve, reject) => {
    fs.accessAsync(boilerplatePath)
      .catch(() => {
        if (fs.existsSync(boilerplatePath)) {
          return Promise.resolve();
        }
        return fs.mkdirp(boilerplatePath);
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
      .then(() => fs.accessAsync(userDefinedVariablesPath))
      .catch(() => {
        if (fs.existsSync(userDefinedVariablesPath)) {
          return Promise.resolve();
        }
        return fs.outputFileAsync(userDefinedVariablesPath, USER_VARIABLES_DEFAULT);
      })
      .then(resolve)
      .catch(reject);
  });
};

Site.prototype.readSiteConfig = function (baseUrl) {
  return new Promise((resolve, reject) => {
    const siteConfigPath = path.join(this.rootPath, SITE_CONFIG_NAME);
    fs.readJsonAsync(siteConfigPath)
      .then((config) => {
        this.siteConfig = config;
        this.siteConfig.baseUrl = (baseUrl === undefined) ? this.siteConfig.baseUrl : baseUrl;
        resolve(this.siteConfig);
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
    pageSrc: config.pageSrc,
    rootPath: this.rootPath,
    sourcePath,
    tempPath,
    resultPath,
    baseUrl: config.baseUrl,
    pageTemplate: config.pageTemplate,
    baseUrlMap: this.baseUrlMap,
    userDefinedVariablesMap: this.userDefinedVariablesMap,
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

/**
 * Collects the user defined variables map in the site/subsites
 */
Site.prototype.collectUserDefinedVariablesMap = function () {
  // The key is the base directory of the site/subsites,
  // while the value is a mapping of user defined variables
  this.userDefinedVariablesMap = {};

  Object.keys(this.baseUrlMap).forEach((base) => {
    const userDefinedVariables = {};
    let content;
    try {
      const userDefinedVariablesPath = path.resolve(base, USER_VARIABLES_PATH);
      content = fs.readFileSync(userDefinedVariablesPath, 'utf8');
    } catch (e) {
      content = '';
      logger.warn(e.message);
    }
    const $ = cheerio.load(content);
    $.root().children().each(function () {
      const id = $(this).attr('id');
      const html = $(this).html();
      userDefinedVariables[id] = html;
    });

    // This is to prevent the first nunjuck call from converting {{baseUrl}} to an empty string
    // and let the baseUrl value be injected later.
    userDefinedVariables.baseUrl = '{{baseUrl}}';
    this.userDefinedVariablesMap[base] = userDefinedVariables;
  });
};

Site.prototype.generate = function (baseUrl) {
  // Create the .tmp folder for storing intermediate results.
  logger.profile(GENERATE_SITE_LOGGING_KEY);
  fs.emptydirSync(this.tempPath);
  // Clean the output folder; create it if not exist.
  fs.emptydirSync(this.outputPath);
  return new Promise((resolve, reject) => {
    this.readSiteConfig(baseUrl)
      .then(() => this.collectBaseUrl())
      .then(() => this.collectUserDefinedVariablesMap())
      .then(() => this.buildAssets())
      .then(() => this.buildIndex())
      .then(() => this.buildSourceFiles())
      .then(() => this.copyMarkBindAsset())
      .then(resolve)
      .catch((error) => {
        rejectHandler(reject, error, [this.tempPath, this.outputPath]);
      })
      .finally(() => logger.profile(GENERATE_SITE_LOGGING_KEY));
  });
};

/**
 * Build all pages of the site
 */
Site.prototype.buildSourceFiles = function () {
  return new Promise((resolve, reject) => {
    this.generatePages()
      .then(() => fs.removeAsync(this.tempPath))
      .then(() => logger.info('Pages built'))
      .then(() => fs.writeJsonAsync(path.join(this.rootPath, 'siteData.json'), { pages: this.frontMatterData }))
      .then(() => logger.info('siteData.json built'))
      .then(resolve)
      .catch((error) => {
        // if error, remove the site and temp folders
        rejectHandler(reject, error, [this.tempPath, this.outputPath]);
      });
  });
};

Site.prototype._rebuildAffectedSourceFiles = function (filePaths) {
  const uniquePaths = _.uniq(filePaths);
  logger.verbose(`Rebuild affected paths: ${uniquePaths}`);
  return new Promise((resolve, reject) => {
    this.regenerateAffectedPages(uniquePaths)
      .then(() => fs.removeAsync(this.tempPath))
      .then(resolve)
      .catch((error) => {
        // if error, remove the site and temp folders
        rejectHandler(reject, error, [this.tempPath, this.outputPath]);
      });
  });
};

/**
 * Rebuild pages that are affected by changes in filePaths
 * @param filePaths a single path or an array of paths corresponding to the files that have changed
 */
Site.prototype.rebuildAffectedSourceFiles
  = delay(Site.prototype._rebuildAffectedSourceFiles, 1000);

Site.prototype._buildMultipleAssets = function (filePaths) {
  const uniquePaths = _.uniq(filePaths);
  const ignoreConfig = this.siteConfig.ignore || [];
  const fileIgnore = ignore().add(ignoreConfig);
  const fileRelativePaths = uniquePaths.map(filePath => path.relative(this.rootPath, filePath));
  const copyAssets = fileIgnore.filter(fileRelativePaths)
    .map(asset => fs.copyAsync(path.join(this.rootPath, asset), path.join(this.outputPath, asset)));
  return Promise.all(copyAssets)
    .then(() => logger.info('Assets built'));
};

/**
 * Build/copy assets that are specified in filePaths
 * @param filePaths a single path or an array of paths corresponding to the assets to build
 */
Site.prototype.buildAsset
 = delay(Site.prototype._buildMultipleAssets, 1000);

Site.prototype._removeMultipleAssets = function (filePaths) {
  const uniquePaths = _.uniq(filePaths);
  const fileRelativePaths = uniquePaths.map(filePath => path.relative(this.rootPath, filePath));
  const filesToRemove = fileRelativePaths.map(
    fileRelativePath => path.join(this.outputPath, fileRelativePath));
  const removeFiles = filesToRemove.map(asset => fs.removeAsync(asset));
  return Promise.all(removeFiles)
    .then(() => logger.info('Assets removed'));
};

/**
 * Remove assets that are specified in filePaths
 * @param filePaths a single path or an array of paths corresponding to the assets to remove
 */
Site.prototype.removeAsset
 = delay(Site.prototype._removeMultipleAssets, 1000);

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
  const processingFiles = [];
  const pages = this.filePaths || [];
  this.pageModels = pages.map(page => this.createPageData({
    baseUrl,
    pageSrc: page,
    pageTemplate: this.pageTemplate,
    titlePrefix: this.siteConfig.titlePrefix ? this.siteConfig.titlePrefix + TITLE_PREFIX_SEPARATOR : '',
  }));
  this.pageModels.forEach((page) => {
    processingFiles.push(page.generate(builtFiles));
  });
  return new Promise((resolve, reject) => {
    Promise.all(processingFiles)
      .then((frontMatterData) => {
        this.frontMatterData = frontMatterData;
        resolve();
      })
      .catch(reject);
  });
  return Promise.all(promises).then(() => fs.writeJsonAsync(path.join(this.rootPath, 'siteData.json')
    , { pages: frontMatterData }))
    .then(() => Promise.resolve(frontMatterData));
};


/**
 * Builds the index of files to be traversed as addressable pages
 */
Site.prototype.buildIndex = function () {
  const filePathIndex = walkSync(this.rootPath,
                                 {
                                   directories: false,
                                   globs: this.siteConfig.addressable,
                                   ignore: [BOILERPLATE_FOLDER_NAME],
                                 });
  this.filePaths = filePathIndex;
};

/**
 * Re-renders pages that contain the original file path
 * as the source file or as a static/dynamic included file
 * @param filePaths array of paths corresponding to files that have changed
 */
Site.prototype.regenerateAffectedPages = function (filePaths) {
  const builtFiles = {};
  const processingFiles = [];
  this.pageModels.forEach((page) => {
    if (filePaths.some(filePath => page.includedFiles[filePath])) {
      processingFiles.push(page.generate(builtFiles)
        .catch((err) => {
          logger.error(err);
          return Promise.reject(new Error(`Error while generating ${page.sourcePath}`));
        }));
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
  process.env.NODE_DEBUG = 'gh-pages';
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
        return publish(basePath, options);
      })
      .then(resolve)
      .catch(reject);
  });
};

module.exports = Site;
