/* eslint-disable max-classes-per-file */
import cheerio from 'cheerio';
import fs from 'fs-extra';
import ignore, { Ignore } from 'ignore';
import path from 'path';
import walkSync from 'walk-sync';
import simpleGit, { SimpleGit } from 'simple-git';
import Bluebird from 'bluebird';
import ghpages from 'gh-pages';

import { Template as NunjucksTemplate } from 'nunjucks';
import { SiteConfig, SiteConfigPage, SiteConfigStyle } from './SiteConfig';
import { Page } from '../Page';
import { PageConfig } from '../Page/PageConfig';
import { VariableProcessor } from '../variables/VariableProcessor';
import { VariableRenderer } from '../variables/VariableRenderer';
import { ExternalManager } from '../External/ExternalManager';
import { SiteLinkManager } from '../html/SiteLinkManager';
import { PluginManager } from '../plugins/PluginManager';
import type { FrontMatter } from '../plugins/Plugin';
import { sequentialAsyncForEach } from '../utils/async';
import { delay } from '../utils/delay';
import * as fsUtil from '../utils/fsUtil';
import * as gitUtil from '../utils/git';
import * as logger from '../utils/logger';
import { SITE_CONFIG_NAME, LAZY_LOADING_SITE_FILE_NAME, _ } from './constants';
import { LayoutManager } from '../Layout';
import { LayoutConfig } from '../Layout/Layout';
import { ProgressBar } from '../lib/progress';

// Change when migrated to TypeScript
require('../patches/htmlparser2');

const url = {
  join: path.posix.join,
};

const MARKBIND_VERSION = require('../../package.json').version;

const CONFIG_FOLDER_NAME = '_markbind';
const SITE_FOLDER_NAME = '_site';
const TEMP_FOLDER_NAME = '.temp';
const TEMPLATE_SITE_ASSET_FOLDER_NAME = 'markbind';
const LAYOUT_SITE_FOLDER_NAME = 'layouts';

const FAVICON_DEFAULT_PATH = 'favicon.ico';
const USER_VARIABLES_PATH = '_markbind/variables.md';

const PAGE_TEMPLATE_NAME = 'page.njk';
const SITE_DATA_NAME = 'siteData.json';

const MAX_CONCURRENT_PAGE_GENERATION_PROMISES = 4;

const LAZY_LOADING_BUILD_TIME_RECOMMENDATION_LIMIT = 30000;
const LAZY_LOADING_REBUILD_TIME_RECOMMENDATION_LIMIT = 5000;

function getBootswatchThemePath(theme: string) {
  return require.resolve(`bootswatch/dist/${theme}/bootstrap.min.css`);
}

const SUPPORTED_THEMES_PATHS: Record<string, string> = {
  'bootswatch-cerulean': getBootswatchThemePath('cerulean'),
  'bootswatch-cosmo': getBootswatchThemePath('cosmo'),
  'bootswatch-flatly': getBootswatchThemePath('flatly'),
  'bootswatch-journal': getBootswatchThemePath('journal'),
  'bootswatch-litera': getBootswatchThemePath('litera'),
  'bootswatch-lumen': getBootswatchThemePath('lumen'),
  'bootswatch-lux': getBootswatchThemePath('lux'),
  'bootswatch-materia': getBootswatchThemePath('materia'),
  'bootswatch-minty': getBootswatchThemePath('minty'),
  'bootswatch-pulse': getBootswatchThemePath('pulse'),
  'bootswatch-sandstone': getBootswatchThemePath('sandstone'),
  'bootswatch-simplex': getBootswatchThemePath('simplex'),
  'bootswatch-sketchy': getBootswatchThemePath('sketchy'),
  'bootswatch-spacelab': getBootswatchThemePath('spacelab'),
  'bootswatch-united': getBootswatchThemePath('united'),
  'bootswatch-yeti': getBootswatchThemePath('yeti'),
  'bootswatch-zephyr': getBootswatchThemePath('zephyr'),
};

const HIGHLIGHT_ASSETS = {
  dark: 'codeblock-dark.min.css',
  light: 'codeblock-light.min.css',
};

const MARKBIND_WEBSITE_URL = 'https://markbind.org/';
const MARKBIND_LINK_HTML = `<a href='${MARKBIND_WEBSITE_URL}'>MarkBind ${MARKBIND_VERSION}</a>`;

/*
 * A page configuration object.
 */
type PageCreationConfig = {
  externalScripts: string[],
  frontmatter: FrontMatter,
  layout?: string,
  pageSrc: string,
  searchable: boolean,
  faviconUrl?: string,
  glob?: string,
  globExclude?: string
  title?: string,
  fileExtension?: string,
};

type AddressablePage = {
  frontmatter?: FrontMatter,
  layout?: string,
  searchable?: string | boolean,
  src: string,
  externalScripts?: string[],
  faviconUrl?: string,
  title?: string,
  fileExtension?: string,
};

type PageGenerationTask = {
  mode: string,
  pages: Page[]
};

type PageGenerationContext = {
  startTime: Date,
  numPagesGenerated: number,
  numPagesToGenerate: number,
  isCompleted: boolean,
};

type DeployOptions = {
  branch: string,
  message: string,
  repo: string,
  remote: string,
  user?: { name: string; email: string; },
};

/**
 * Manages site assets such as CSS, JS, fonts, and images.
 * Handles copying, building, and removing assets, as well as handling style reloads.
 */
class SiteAssetsManager {
  rootPath: string;
  outputPath: string;
  siteAssetsDestPath: string;
  siteConfig!: SiteConfig;

  constructor(rootPath: string, outputPath: string) {
    this.rootPath = rootPath;
    this.outputPath = outputPath;
    this.siteAssetsDestPath = path.join(outputPath, TEMPLATE_SITE_ASSET_FOLDER_NAME);
  }

  listAssets(fileIgnore: Ignore) {
    const files = walkSync(this.rootPath, { directories: false });
    return fileIgnore.filter(files);
  }

  async _buildMultipleAssets(filePaths: string | string[]) {
    const filePathArray = Array.isArray(filePaths) ? filePaths : [filePaths];
    const uniquePaths = _.uniq(filePathArray);
    const fileIgnore = ignore().add(this.siteConfig.ignore);
    const fileRelativePaths = uniquePaths.map(filePath => path.relative(this.rootPath, filePath));
    const copyAssets = fileIgnore.filter(fileRelativePaths)
      .map(asset => fs.copy(path.join(this.rootPath, asset), path.join(this.outputPath, asset)));
    await Promise.all(copyAssets);
    logger.info('Assets built');
  }

  async _removeMultipleAssets(filePaths: string | string[]) {
    const filePathArray = Array.isArray(filePaths) ? filePaths : [filePaths];
    const uniquePaths = _.uniq(filePathArray);
    const fileRelativePaths = uniquePaths.map(filePath => path.relative(this.rootPath, filePath));
    const filesToRemove = fileRelativePaths.map(
      fileRelativePath => path.join(this.outputPath, fileRelativePath));
    const removeFiles = filesToRemove.map(asset => fs.remove(asset));
    if (removeFiles.length !== 0) {
      await Promise.all(removeFiles);
      logger.debug('Assets removed');
    }
  }

  async buildAssets() {
    logger.info('Building assets...');
    const outputFolder = path.relative(this.rootPath, this.outputPath);
    const fileIgnore = ignore().add([...this.siteConfig.ignore, outputFolder]);

    // Scan and copy assets (excluding ignore files).
    const listOfAssets = this.listAssets(fileIgnore);
    const assetsToCopy = listOfAssets.map(asset =>
      fs.copy(path.join(this.rootPath, asset), path.join(this.outputPath, asset)));
    await Promise.all(assetsToCopy);
    logger.info('Assets built');
  }

  /**
   * Handles the reloading of ignore attributes
   */
  async handleIgnoreReload(oldIgnore: string[]) {
    const assetsToRemove = _.difference(this.siteConfig.ignore, oldIgnore);

    if (!_.isEqual(oldIgnore, this.siteConfig.ignore)) {
      await this._removeMultipleAssets(assetsToRemove);
      await this.buildAssets();
    }
  }

  /**
   * Handles the reloading of the style attribute if it has been modified
   */
  async handleStyleReload(oldStyle: SiteConfigStyle) {
    if (!_.isEqual(oldStyle.bootstrapTheme, this.siteConfig.style.bootstrapTheme)) {
      await this.copyBootstrapTheme(true);
      logger.info('Updated bootstrap theme');
    }
  }

  /**
   * Copies Font Awesome assets to the assets folder
   */
  async copyFontAwesomeAsset() {
    const faRootSrcPath = path.dirname(require.resolve('@fortawesome/fontawesome-free/package.json'));
    const faCssSrcPath = path.join(faRootSrcPath, 'css', 'all.min.css');
    const faCssDestPath = path.join(this.siteAssetsDestPath, 'fontawesome', 'css', 'all.min.css');
    const faFontsSrcPath = path.join(faRootSrcPath, 'webfonts');
    const faFontsDestPath = path.join(this.siteAssetsDestPath, 'fontawesome', 'webfonts');

    await fs.copy(faCssSrcPath, faCssDestPath);
    await fs.copy(faFontsSrcPath, faFontsDestPath);
  }

  /**
   * Copies Octicon assets to the assets folder
   */
  copyOcticonsAsset() {
    const octiconsCssSrcPath = require.resolve('@primer/octicons/build/build.css');
    const octiconsCssDestPath = path.join(this.siteAssetsDestPath, 'css', 'octicons.css');

    return fs.copy(octiconsCssSrcPath, octiconsCssDestPath);
  }

  /**
   * Copies Google Material Icons assets to the assets folder
   */
  copyMaterialIconsAsset() {
    const materialIconsRootSrcPath = path.dirname(require.resolve('material-icons/package.json'));
    const materialIconsCssAndFontsSrcPath = path.join(materialIconsRootSrcPath, 'iconfont');
    const materialIconsCssAndFontsDestPath = path.join(this.siteAssetsDestPath, 'material-icons');

    return fs.copy(materialIconsCssAndFontsSrcPath, materialIconsCssAndFontsDestPath);
  }

  /**
   * Copies core-web bundles and external assets to the assets output folder
   */
  copyCoreWebAsset() {
    const coreWebRootPath = path.dirname(require.resolve('@markbind/core-web/package.json'));
    const coreWebAssetPath = path.join(coreWebRootPath, 'asset');
    fs.copySync(coreWebAssetPath, this.siteAssetsDestPath);

    const dirsToCopy = ['fonts'];
    const filesToCopy = [
      'js/markbind.min.js',
      'css/markbind.min.css',
    ];

    const copyAllFiles = filesToCopy.map((file) => {
      const srcPath = path.join(coreWebRootPath, 'dist', file);
      const destPath = path.join(this.siteAssetsDestPath, file);
      return fs.copy(srcPath, destPath);
    });

    const copyFontsDir = dirsToCopy.map((dir) => {
      const srcPath = path.join(coreWebRootPath, 'dist', dir);
      const destPath = path.join(this.siteAssetsDestPath, 'css', dir);
      return fs.copy(srcPath, destPath);
    });

    return Promise.all([...copyAllFiles, ...copyFontsDir]);
  }

  copyBootstrapIconsAsset() {
    const bootstrapIconsCssSrcPath = require.resolve('bootstrap-icons/font/bootstrap-icons.css');
    const bootstrapIconsFontsSrcPath = path.dirname(bootstrapIconsCssSrcPath);
    const bootstrapIconsFontsDestPath = path.join(this.siteAssetsDestPath, 'bootstrap-icons', 'font');
    return fs.copy(bootstrapIconsFontsSrcPath, bootstrapIconsFontsDestPath);
  }

  /**
   * Copies bootstrapTheme to the assets folder if a valid bootstrapTheme is specified
   * @param isRebuild only true if it is a rebuild
   */
  copyBootstrapTheme(isRebuild: boolean) {
    const { bootstrapTheme } = this.siteConfig.style;

    if ((!isRebuild && !bootstrapTheme)
      || (bootstrapTheme && !_.has(SUPPORTED_THEMES_PATHS, bootstrapTheme))) {
      return _.noop;
    }

    const themeSrcPath = !bootstrapTheme
      ? require.resolve('@markbind/core-web/asset/css/bootstrap.min.css')
      : SUPPORTED_THEMES_PATHS[bootstrapTheme];
    const themeDestPath = path.join(this.siteAssetsDestPath, 'css', 'bootstrap.min.css');

    return fs.copy(themeSrcPath, themeDestPath);
  }

  /**
   * Build/copy assets that are specified in filePaths
   * @param filePaths a single path or an array of paths corresponding to the assets to build
   */
  buildAsset = delay(this._buildMultipleAssets.bind(this) as () => Bluebird<unknown>, 1000);

  /**
   * Remove assets that are specified in filePaths
   * @param filePaths a single path or an array of paths corresponding to the assets to remove
   */
  removeAsset = delay(this._removeMultipleAssets.bind(this) as () => Bluebird<unknown>, 1000);
}

/**
 * Manages the lifecycle and configuration of pages within the site.
 * Handles page creation, collection of addressable pages, and dependency tracking.
 */
class SitePagesManager {
  rootPath: string;
  outputPath: string;
  pageTemplatePath: string;
  pageTemplate: NunjucksTemplate;
  pages: Page[];
  addressablePages: AddressablePage[];
  addressablePagesSource: string[];
  siteConfig!: SiteConfig;

  // Managers
  variableProcessor!: VariableProcessor;
  pluginManager!: PluginManager;
  siteLinkManager!: SiteLinkManager;
  externalManager!: ExternalManager;
  layoutManager!: LayoutManager;
  baseUrlMap: Set<string>;

  isDevMode: boolean;

  constructor(rootPath: string, outputPath: string, isDevMode: boolean) {
    this.rootPath = rootPath;
    this.outputPath = outputPath;
    this.isDevMode = isDevMode;

    // Page template path
    this.pageTemplatePath = path.join(__dirname, '../Page', PAGE_TEMPLATE_NAME);
    this.pageTemplate = VariableRenderer.compile(fs.readFileSync(this.pageTemplatePath, 'utf8'));
    this.pages = [];
    this.addressablePages = [];
    this.addressablePagesSource = [];
    this.baseUrlMap = new Set();
  }

  /**
   * Create a Page object from the site and page creation config.
   */
  createPage(config: PageCreationConfig): Page {
    const sourcePath = path.join(this.rootPath, config.pageSrc);
    const outputExtension = config.fileExtension || '.html';
    const relativePath = fsUtil.ensurePosix(path.relative(this.rootPath, sourcePath));
    const outputPath = fsUtil.setExtension(relativePath, outputExtension);
    const resultPath = path.join(this.outputPath, outputPath);

    const baseAssetsPath = path.posix.join(
      this.siteConfig.baseUrl || '/', TEMPLATE_SITE_ASSET_FOLDER_NAME,
    );

    const pageConfig = new PageConfig({
      asset: {
        bootstrap: path.posix.join(baseAssetsPath, 'css', 'bootstrap.min.css'),
        externalScripts: _.union(this.siteConfig.externalScripts, config.externalScripts),
        fontAwesome: path.posix.join(baseAssetsPath, 'fontawesome', 'css', 'all.min.css'),
        glyphicons: path.posix.join(baseAssetsPath, 'glyphicons', 'css', 'bootstrap-glyphicons.min.css'),
        octicons: path.posix.join(baseAssetsPath, 'css', 'octicons.css'),
        materialIcons: path.posix.join(baseAssetsPath, 'material-icons', 'material-icons.css'),
        bootstrapIcons: path.posix.join(baseAssetsPath, 'bootstrap-icons', 'font', 'bootstrap-icons.css'),
        highlight: path.posix.join(baseAssetsPath, 'css',
                                   HIGHLIGHT_ASSETS[this.siteConfig.style.codeTheme]),
        markBindCss: path.posix.join(baseAssetsPath, 'css', 'markbind.min.css'),
        markBindJs: path.posix.join(baseAssetsPath, 'js', 'markbind.min.js'),
        pageNavCss: path.posix.join(baseAssetsPath, 'css', 'page-nav.css'),
        siteNavCss: path.posix.join(baseAssetsPath, 'css', 'site-nav.css'),
        bootstrapUtilityJs: path.posix.join(baseAssetsPath, 'js', 'bootstrap-utility.min.js'),
        polyfillJs: path.posix.join(baseAssetsPath, 'js', 'polyfill.min.js'),
        // We use development Vue when MarkBind is served in 'dev' mode so that hydration issues are reported
        vue: this.isDevMode
          ? 'https://cdn.jsdelivr.net/npm/vue@3.3.11/dist/vue.global.min.js'
          : path.posix.join(baseAssetsPath, 'js', 'vue.global.prod.min.js'),
        layoutUserScriptsAndStyles: [],
      },
      baseUrlMap: this.baseUrlMap,
      dev: this.isDevMode,
      faviconUrl: config.faviconUrl,
      frontmatterOverride: config.frontmatter,
      layout: config.layout,
      layoutsAssetPath: path.posix.join(baseAssetsPath, LAYOUT_SITE_FOLDER_NAME),
      pluginManager: this.pluginManager,
      resultPath,
      rootPath: this.rootPath,
      searchable: this.siteConfig.enableSearch && config.searchable,
      siteLinkManager: this.siteLinkManager,
      siteOutputPath: this.outputPath,
      sourcePath,
      src: config.pageSrc,
      title: config.title,
      template: this.pageTemplate,
      variableProcessor: this.variableProcessor,
      addressablePagesSource: this.addressablePagesSource,
      layoutManager: this.layoutManager,
    });
    return new Page(pageConfig, this.siteConfig);
  }

  /**
   * Updates the paths to be traversed as addressable pages and returns a list of filepaths to be deleted
   */
  updateAddressablePages() {
    const oldAddressablePagesSources = this.addressablePages.slice().map(page => page.src);
    this.collectAddressablePages();
    const newAddressablePagesSources = this.addressablePages.map(page => page.src);

    return _.difference(oldAddressablePagesSources, newAddressablePagesSources)
      .map(filePath => fsUtil.setExtension(filePath, '.html'));
  }

  getPageGlobPaths(page: SiteConfigPage, pagesExclude: string[]) {
    const pageGlobs = page.glob ?? [];
    return walkSync(this.rootPath, {
      directories: false,
      globs: Array.isArray(pageGlobs) ? pageGlobs : [pageGlobs],
      ignore: [
        CONFIG_FOLDER_NAME,
        SITE_FOLDER_NAME,
        ...pagesExclude.concat(page.globExclude || []),
      ],
    });
  }

  /**
   * Collects the paths to be traversed as addressable pages
   */
  collectAddressablePages() {
    const { pages, pagesExclude } = this.siteConfig;
    const pagesFromSrc = _.flatMap(pages.filter(page => page.src), page => (Array.isArray(page.src)
      ? page.src.map(pageSrc => ({ ...page, src: pageSrc }))
      : [page])) as unknown as AddressablePage[];
    const set = new Set();
    const duplicatePages = pagesFromSrc
      .filter(page => set.size === set.add(page.src).size)
      .map(page => page.src);
    if (duplicatePages.length > 0) {
      throw new Error(`Duplicate page entries found in site config: ${_.uniq(duplicatePages).join(', ')}`);
    }
    const pagesFromGlobs = _.flatMap(pages.filter(page => page.glob),
                                     page => this.getPageGlobPaths(page, pagesExclude)
                                       .map(filePath => ({
                                         src: filePath,
                                         searchable: page.searchable,
                                         layout: page.layout,
                                         frontmatter: page.frontmatter,
                                         fileExtension: page.fileExtension,
                                       }))) as AddressablePage[];
    /*
     Add pages collected from globs and merge properties for pages
     Page properties collected from src have priority over page properties from globs,
     while page properties from later entries take priority over earlier ones.
     */
    const filteredPages: Record<string, AddressablePage> = {};
    pagesFromGlobs.concat(pagesFromSrc).forEach((page) => {
      const filteredPage = _.omitBy(page, _.isUndefined) as AddressablePage;
      filteredPages[page.src] = page.src in filteredPages
        ? { ...filteredPages[page.src], ...filteredPage }
        : filteredPage;
    });
    this.addressablePages = Object.values(filteredPages);
    this.addressablePagesSource.length = 0;
    this.addressablePages.forEach((page) => {
      this.addressablePagesSource.push(fsUtil.removeExtensionPosix(page.src));
    });
  }

  /**
   * Creates new pages and replaces the original pages with the updated version
   */
  updatePages(pagesToUpdate: AddressablePage[]) {
    pagesToUpdate.forEach((pageToUpdate) => {
      this.pages.forEach((page, index) => {
        if (page.pageConfig.src === pageToUpdate.src) {
          const newPage = this.createNewPage(pageToUpdate, this.getFavIconUrl());
          newPage.resetState();
          this.pages[index] = newPage;
        }
      });
    });
  }

  /**
   * Checks if a specified file path is a dependency of a page
   * @param filePath file path to check
   * @returns whether the file path is a dependency of any of the site's pages
   */
  isDependencyOfPage(filePath: string): boolean {
    return this.pages.some(page => page.isDependency(filePath))
      || fsUtil.ensurePosix(filePath).endsWith(USER_VARIABLES_PATH);
  }

  /**
   * Checks if a specified file path satisfies a src or glob in any of the page configurations.
   * @param filePath file path to check
   * @returns whether the file path is satisfies any glob
   */
  isFilepathAPage(filePath: string): boolean {
    const { pages, pagesExclude } = this.siteConfig;
    const relativeFilePath = fsUtil.ensurePosix(path.relative(this.rootPath, filePath));
    const srcesFromPages = _.flatMap(pages.filter(page => page.src),
                                     page => (Array.isArray(page.src) ? page.src : [page.src]));
    if (srcesFromPages.includes(relativeFilePath)) {
      return true;
    }

    const filePathsFromGlobs = _.flatMap(pages.filter(page => page.glob),
                                         page => this.getPageGlobPaths(page, pagesExclude));
    return filePathsFromGlobs.some(fp => fp === relativeFilePath);
  }

  getFavIconUrl() {
    const { baseUrl, faviconPath } = this.siteConfig;

    if (faviconPath) {
      if (!fs.existsSync(path.join(this.rootPath, faviconPath))) {
        logger.warn(`${faviconPath} does not exist`);
      }
      return url.join('/', baseUrl, faviconPath);
    } else if (fs.existsSync(path.join(this.rootPath, FAVICON_DEFAULT_PATH))) {
      return url.join('/', baseUrl, FAVICON_DEFAULT_PATH);
    }

    return undefined;
  }

  /**
   * Maps an array of addressable pages to an array of Page object
   */
  mapAddressablePagesToPages(addressablePages: AddressablePage[], faviconUrl: string | undefined) {
    this.pages = addressablePages.map(page => this.createNewPage(page, faviconUrl));
  }

  /**
   * Creates and returns a new Page with the given page config details and favicon url
   * @param page config
   * @param faviconUrl of the page
   */
  createNewPage(page: AddressablePage, faviconUrl: string | undefined) {
    return this.createPage({
      faviconUrl,
      pageSrc: page.src,
      title: page.title,
      layout: page.layout,
      frontmatter: page.frontmatter || {},
      searchable: page.searchable !== 'no' && page.searchable !== false,
      externalScripts: page.externalScripts || [],
      fileExtension: page.fileExtension,
    });
  }
}

/**
 * Handles the deployment of the generated site to GitHub Pages or other configured remote repositories.
 */
class SiteDeployManager {
  rootPath: string;
  outputPath: string;
  siteConfig!: SiteConfig;

  constructor(rootPath: string, outputPath: string) {
    this.rootPath = rootPath;
    this.outputPath = outputPath;
  }

  deploy(ciTokenVar: string | boolean) {
    const defaultDeployConfig: DeployOptions = {
      branch: 'gh-pages',
      message: 'Site Update.',
      repo: '',
      remote: 'origin',
    };
    process.env.NODE_DEBUG = 'gh-pages';
    return this.generateDepUrl(ciTokenVar, defaultDeployConfig);
  }

  /**
   * Helper function for deploy(). Returns the ghpages link where the repo will be hosted.
   */
  async generateDepUrl(ciTokenVar: boolean | string, defaultDeployConfig: DeployOptions) {
    const publish = Bluebird.promisify(ghpages.publish);
    if (!this.siteConfig) {
      throw new Error('Site config not initialized');
    }

    const depOptions = await this.getDepOptions(ciTokenVar, defaultDeployConfig, publish);
    try {
      return await SiteDeployManager.getDepUrl(depOptions);
    } finally {
      ghpages.clean();
    }
  }

  /**
   * Helper function for deploy(). Set the options needed to be used by ghpages.publish.
   */
  async getDepOptions(ciTokenVar: boolean | string, defaultDeployConfig: DeployOptions,
                      publish: (basePath: string, options: DeployOptions) => Bluebird<unknown>) {
    const basePath = this.siteConfig.deploy.baseDir || this.outputPath;
    if (!fs.existsSync(basePath)) {
      throw new Error(
        'The site directory does not exist. Please build the site first before deploy.');
    }
    const options: DeployOptions = {
      branch: this.siteConfig.deploy.branch || defaultDeployConfig.branch,
      message: this.siteConfig.deploy.message || defaultDeployConfig.message,
      repo: this.siteConfig.deploy.repo || defaultDeployConfig.repo,
      remote: defaultDeployConfig.remote,
    };
    options.message = options.message.concat(' [skip ci]');

    // Globally set Cache Directory to /node_modules/.cache for gh-pages
    if (!process.env.CACHE_DIR || ['true', 'false', '1', '0'].includes(process.env.CACHE_DIR as string)) {
      const cacheDirectory = path.join(this.rootPath, 'node_modules', '.cache');
      fs.emptydirSync(path.join(cacheDirectory, 'gh-pages'));
      process.env.CACHE_DIR = cacheDirectory;
    }

    if (ciTokenVar) {
      const ciToken = _.isBoolean(ciTokenVar) ? 'GITHUB_TOKEN' : ciTokenVar;
      if (!process.env[ciToken]) {
        throw new Error(`The environment variable ${ciToken} does not exist.`);
      }
      const githubToken = process.env[ciToken];
      let repoSlug;

      if (process.env.TRAVIS) {
        repoSlug = SiteDeployManager.extractRepoSlug(options.repo, process.env.TRAVIS_REPO_SLUG);

        options.user = {
          name: 'Deployment Bot',
          email: 'deploy@travis-ci.org',
        };
      } else if (process.env.APPVEYOR) {
        repoSlug = SiteDeployManager.extractRepoSlug(options.repo, process.env.APPVEYOR_REPO_NAME);

        options.user = {
          name: 'AppVeyorBot',
          email: 'deploy@appveyor.com',
        };
      } else if (process.env.GITHUB_ACTIONS) {
        // Set cache folder to a location Github Actions can find.
        process.env.CACHE_DIR = path.join(process.env.GITHUB_WORKSPACE || '.cache');
        repoSlug = SiteDeployManager.extractRepoSlug(options.repo, process.env.GITHUB_REPOSITORY);

        options.user = {
          name: 'github-actions',
          email: 'github-actions@github.com',
        };
      } else if (process.env.CIRCLECI) {
        repoSlug = SiteDeployManager.extractRepoSlug(
          options.repo,
          `${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}`,
        );

        options.user = {
          name: 'circleci-bot',
          email: 'deploy@circleci.com',
        };
      } else {
        throw new Error('-c/--ci should only be run in CI environments.');
      }

      options.repo = `https://x-access-token:${githubToken}@github.com/${repoSlug}.git`;
    }

    // Waits for the repo to be updated.
    await publish(basePath, options);
    return options;
  }

  /**
   * Extract repo slug from user-specified repo URL so that we can include the access token
   */
  static extractRepoSlug(repo: string, ciRepoSlug: string | undefined) {
    if (!repo) {
      return ciRepoSlug;
    }
    const repoSlugRegex = /github\.com[:/]([\w-]+\/[\w-.]+)\.git$/;
    const repoSlugMatch = repoSlugRegex.exec(repo);
    if (!repoSlugMatch) {
      throw new Error('-c/--ci expects a GitHub repository.\n'
            + `The specified repository ${repo} is not valid.`);
    }
    const [, repoSlug] = repoSlugMatch;
    return repoSlug;
  }

  /**
   * Helper function for deploy().
   */
  static getDepUrl(options: DeployOptions) {
    const git = simpleGit({ baseDir: process.cwd() });
    return SiteDeployManager.getDeploymentUrl(git, options);
  }

  /**
   * Gets the deployed website's url, returning null if there was an error retrieving it.
   */
  static async getDeploymentUrl(git: SimpleGit, options: DeployOptions) {
    const HTTPS_PREAMBLE = 'https://';
    const SSH_PREAMBLE = 'git@github.com:';
    const GITHUB_IO_PART = 'github.io';

    // https://<name|org name>.github.io/<repo name>/
    function constructGhPagesUrl(remoteUrl: string) {
      if (!remoteUrl) {
        return null;
      }
      const parts = remoteUrl.split('/');
      if (remoteUrl.startsWith(HTTPS_PREAMBLE)) {
        // https://github.com/<name|org>/<repo>.git (HTTPS)
        const repoNameWithExt = parts[parts.length - 1];
        const repoName = repoNameWithExt.substring(0, repoNameWithExt.lastIndexOf('.'));
        const name = parts[parts.length - 2].toLowerCase();
        return `https://${name}.${GITHUB_IO_PART}/${repoName}`;
      } else if (remoteUrl.startsWith(SSH_PREAMBLE)) {
        // git@github.com:<name|org>/<repo>.git (SSH)
        const repoNameWithExt = parts[parts.length - 1];
        const repoName = repoNameWithExt.substring(0, repoNameWithExt.lastIndexOf('.'));
        const name = parts[0].substring(SSH_PREAMBLE.length);
        return `https://${name}.${GITHUB_IO_PART}/${repoName}`;
      }
      return null;
    }

    const { remote, branch, repo } = options;
    const cnamePromise = gitUtil.getRemoteBranchFile(git, 'blob', remote, branch, 'CNAME');
    const remoteUrlPromise = gitUtil.getRemoteUrl(git, remote);
    const promises = [cnamePromise, remoteUrlPromise];

    try {
      const promiseResults: string[] = await Promise.all(promises) as string[];
      const generateGhPagesUrl = (results: string[]) => {
        const cname = results[0];
        const remoteUrl = results[1];
        if (cname) {
          return cname.trim();
        } else if (repo) {
          return constructGhPagesUrl(repo);
        }
        return constructGhPagesUrl(remoteUrl.trim());
      };

      return generateGhPagesUrl(promiseResults);
    } catch (err) {
      logger.error(err);
      return null;
    }
  }
}

/**
 * Orchestrates the site generation process.
 * Manages the build lifecycle, variable processing, plugin management,
 * and rebuilding strategies (lazy/background).
 */
class SiteGenerationManager {
  rootPath: string;
  outputPath: string;
  tempPath: string;
  siteConfig!: SiteConfig;
  siteConfigPath: string;

  // Managers
  variableProcessor!: VariableProcessor;
  pluginManager!: PluginManager;
  siteLinkManager!: SiteLinkManager;
  externalManager!: ExternalManager;
  layoutManager!: LayoutManager;
  sitePages!: SitePagesManager;
  siteAssets!: SiteAssetsManager;

  // Build state
  forceReload: boolean;
  backgroundBuildMode: string | boolean;
  stopGenerationTimeThreshold: Date;
  postBackgroundBuildFunc: () => void;
  onePagePath: string;
  currentPageViewed: string;
  currentOpenedPages: string[];
  toRebuild: Set<string>;

  constructor(rootPath: string, outputPath: string, onePagePath: string, forceReload = false,
              siteConfigPath = SITE_CONFIG_NAME, isDevMode: any, backgroundBuildMode: boolean,
              postBackgroundBuildFunc: () => void) {
    this.rootPath = rootPath;
    this.outputPath = outputPath;
    this.tempPath = path.join(rootPath, TEMP_FOLDER_NAME);
    this.forceReload = forceReload;
    this.siteConfigPath = siteConfigPath;

    // Background build properties
    this.backgroundBuildMode = onePagePath && backgroundBuildMode;
    this.stopGenerationTimeThreshold = new Date();
    this.postBackgroundBuildFunc = postBackgroundBuildFunc || (() => {});

    // Lazy reload properties
    this.onePagePath = onePagePath;
    this.currentPageViewed = onePagePath
      ? path.resolve(this.rootPath, fsUtil.removeExtension(onePagePath))
      : '';
    this.currentOpenedPages = [];
    this.toRebuild = new Set();
  }

  configure(siteAssets: SiteAssetsManager, sitePages: SitePagesManager) {
    this.siteAssets = siteAssets;
    this.sitePages = sitePages;
  }

  static async rejectHandler(error: unknown, removeFolders: string[]) {
    logger.warn(error);
    try {
      await Promise.all(removeFolders.map(folder => fs.remove(folder)));
    } catch (err) {
      logger.error(`Failed to remove generated files after error!\n${(err as Error).message}`);
    }
  }

  beforeSiteGenerate() {
    this.variableProcessor.invalidateCache();
    this.externalManager.reset();
    this.pluginManager.beforeSiteGenerate();
  }

  /**
   * Changes the site variable of the current page being viewed, building it if necessary.
   * @param normalizedUrl BaseUrl-less and extension-less url of the page
   * @return Boolean of whether the page needed to be rebuilt
   */
  async changeCurrentPage(normalizedUrl: string) {
    this.currentPageViewed = path.join(this.rootPath, normalizedUrl);

    if (this.toRebuild.has(this.currentPageViewed)) {
      this.beforeSiteGenerate();
      /*
       Lazy loading only builds the page being viewed, but the user may be quick enough
       to trigger multiple page builds before the first one has finished building,
       hence we need to take this into account by using the delayed variant of the method.
       */
      this.rebuildPagesBeingViewed(this.currentPageViewed);
      return true;
    }

    return false;
  }

  /**
   * Changes the list of current opened pages
   * @param normalizedUrls Collection of normalized url of pages taken from the clients
   * ordered from most-to-least recently opened
   */
  changeCurrentOpenedPages(normalizedUrls: string[]) {
    if (!this.onePagePath) {
      return;
    }

    const openedPages = normalizedUrls.map(normalizedUrl => path.join(this.rootPath, normalizedUrl));
    this.currentOpenedPages = _.uniq(openedPages);

    if (this.currentOpenedPages.length > 0) {
      logger.info('Current opened pages, from most-to-least recent:');
      this.currentOpenedPages.forEach((pagePath, idx) => {
        logger.info(`${idx + 1}. ${fsUtil.ensurePosix(path.relative(this.rootPath, pagePath))}`);
      });
    } else {
      logger.info('No pages are currently opened');
    }
  }

  /**
   * Read and stores the site config from site.json, in Site, SitePages and SiteAssets.
   * Overwrite the default base URL if it's specified by the user.
   * @param baseUrl user defined base URL (if exists)
   */
  async readSiteConfig(baseUrl?: string) {
    this.siteConfig = await SiteConfig.readSiteConfig(this.rootPath, this.siteConfigPath, baseUrl);
    this.sitePages.siteConfig = this.siteConfig;
    this.siteAssets.siteConfig = this.siteConfig;
    return this.siteConfig;
  }

  /**
   * Collects the base url map in the site/subsites
   */
  collectBaseUrl() {
    const candidates = walkSync(this.rootPath, { directories: false })
      .filter(x => x.endsWith(this.siteConfigPath))
      .map(x => path.resolve(this.rootPath, x));

    const baseUrlMap = new Set(candidates.map(candidate => path.dirname(candidate)));
    this.variableProcessor = new VariableProcessor(this.rootPath, baseUrlMap);
    this.sitePages.baseUrlMap = baseUrlMap; // Update SitePages

    this.buildManagers(baseUrlMap);
  }

  /**
   * Set up the managers used with the configurations.
   */
  buildManagers(baseUrlMap: Set<string>) {
    const config: LayoutConfig = {
      baseUrlMap,
      baseUrl: this.siteConfig.baseUrl,
      rootPath: this.rootPath,
      outputPath: this.outputPath,
      ignore: this.siteConfig.ignore,
      addressablePagesSource: this.sitePages.addressablePagesSource,
      variableProcessor: this.variableProcessor,
      intrasiteLinkValidation: this.siteConfig.intrasiteLinkValidation,
      codeLineNumbers: this.siteConfig.style.codeLineNumbers,
      plantumlCheck: this.siteConfig.plantumlCheck,
      headerIdMap: {},
      siteLinkManager: this.siteLinkManager,
      pluginManager: this.pluginManager,
      externalManager: this.externalManager,
    };
    this.siteLinkManager = new SiteLinkManager(config);
    config.siteLinkManager = this.siteLinkManager;

    this.pluginManager = new PluginManager(config, this.siteConfig.plugins, this.siteConfig.pluginsContext);
    config.pluginManager = this.pluginManager;

    this.externalManager = new ExternalManager(config);
    config.externalManager = this.externalManager;

    this.layoutManager = new LayoutManager(config);

    // Propagate managers to SitePages
    this.sitePages.variableProcessor = this.variableProcessor;
    this.sitePages.pluginManager = this.pluginManager;
    this.sitePages.siteLinkManager = this.siteLinkManager;
    this.sitePages.externalManager = this.externalManager;
    this.sitePages.layoutManager = this.layoutManager;
  }

  /**
   * Collects the user defined variables map in the site/subsites
   */
  collectUserDefinedVariablesMap() {
    this.variableProcessor.resetUserDefinedVariablesMap();

    this.sitePages.baseUrlMap.forEach((base) => {
      const userDefinedVariablesPath = path.resolve(base, USER_VARIABLES_PATH);
      let content;
      try {
        content = fs.readFileSync(userDefinedVariablesPath, 'utf8');
      } catch (e) {
        content = '';
        logger.warn((e as Error).message);
      }

      /*
       We retrieve the baseUrl of the (sub)site by appending the relative to the configured base url
       i.e. We ignore the configured baseUrl of the sub sites.
       */
      const siteRelativePathFromRoot = fsUtil.ensurePosix(path.relative(this.rootPath, base));
      const siteBaseUrl = siteRelativePathFromRoot === ''
        ? this.siteConfig.baseUrl
        : path.posix.join(this.siteConfig.baseUrl || '/', siteRelativePathFromRoot);
      this.variableProcessor.addUserDefinedVariable(base, 'baseUrl', siteBaseUrl);
      this.variableProcessor.addUserDefinedVariable(base, 'MarkBind', MARKBIND_LINK_HTML);

      const $ = cheerio.load(content, { decodeEntities: false });
      $('variable,span').each((_index, element) => {
        const name = $(element).attr('name') || $(element).attr('id');

        this.variableProcessor.renderAndAddUserDefinedVariable(base, name, $(element).html());
      });
    });
  }

  /**
   * Collects the user defined variables map in the site/subsites
   * if there is a change in the variables file
   * @param filePaths array of paths corresponding to files that have changed
   */
  collectUserDefinedVariablesMapIfNeeded(filePaths: string[]) {
    const variablesPath = path.resolve(this.rootPath, USER_VARIABLES_PATH);
    if (filePaths.includes(variablesPath)) {
      this.collectUserDefinedVariablesMap();
      return true;
    }
    return false;
  }

  /**
   * Generate the website.
   * @param baseUrl user defined base URL (if exists)
   */
  async generate(baseUrl: string | undefined): Promise<any> {
    const startTime = new Date();
    // Create the .tmp folder for storing intermediate results.
    fs.emptydirSync(this.tempPath);
    // Clean the output folder; create it if not exist.
    fs.emptydirSync(this.outputPath);
    const lazyWebsiteGenerationString = this.onePagePath ? '(lazy) ' : '';
    logger.info(`Website generation ${lazyWebsiteGenerationString}started at ${
      startTime.toLocaleTimeString()}`);

    try {
      await this.readSiteConfig(baseUrl);
      this.sitePages.collectAddressablePages();
      this.collectBaseUrl();
      this.collectUserDefinedVariablesMap();
      await this.siteAssets.buildAssets();
      await (this.onePagePath ? this.lazyBuildSourceFiles() : this.buildSourceFiles());
      await this.siteAssets.copyCoreWebAsset();
      await this.siteAssets.copyBootstrapIconsAsset();
      await this.siteAssets.copyBootstrapTheme(false);
      await this.siteAssets.copyFontAwesomeAsset();
      await this.siteAssets.copyOcticonsAsset();
      await this.siteAssets.copyMaterialIconsAsset();
      await this.writeSiteData();
      this.calculateBuildTimeForGenerate(startTime, lazyWebsiteGenerationString);
      if (this.backgroundBuildMode) {
        this.backgroundBuildNotViewedFiles();
      }
    } catch (error) {
      await SiteGenerationManager.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  /**
   * Helper function for generate().
   */
  calculateBuildTimeForGenerate(startTime: Date, lazyWebsiteGenerationString: string) {
    const endTime = new Date();
    const totalBuildTime = (endTime.getTime() - startTime.getTime()) / 1000;
    logger.info(`Website generation ${lazyWebsiteGenerationString}complete! Total build time: ${
      totalBuildTime}s`);

    if (!this.onePagePath && totalBuildTime > LAZY_LOADING_BUILD_TIME_RECOMMENDATION_LIMIT) {
      logger.info('Your site took quite a while to build...'
          + 'Have you considered using markbind serve -o when writing content to speed things up?');
    }
  }

  /**
   * Build all pages of the site
   */
  async buildSourceFiles() {
    this.beforeSiteGenerate();
    logger.info('Generating pages...');

    try {
      await this.generatePages();
      await fs.remove(this.tempPath);
      logger.info('Pages built');
    } catch (error) {
      await SiteGenerationManager.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  /**
   * Adds all pages except the viewed pages to toRebuild, flagging them for lazy building later.
   */
  async lazyBuildAllPagesNotViewed(viewedPages: string | string[]) {
    const viewedPagesArray = Array.isArray(viewedPages) ? viewedPages : [viewedPages];
    this.sitePages.pages.forEach((page) => {
      const normalizedUrl = fsUtil.removeExtension(page.pageConfig.sourcePath);
      if (!viewedPagesArray.some(viewedPage => normalizedUrl === viewedPage)) {
        this.toRebuild.add(normalizedUrl);
      }
    });
  }

  /**
   * Only build landing page of the site, building more as the author goes to different links.
   */
  async lazyBuildSourceFiles() {
    this.beforeSiteGenerate();
    logger.info('Generating landing page...');

    try {
      await this.generateLandingPage();
      await this.copyLazySourceFiles();
      await fs.remove(this.tempPath);
      await this.lazyBuildAllPagesNotViewed(this.currentPageViewed);
      logger.info('Landing page built, other pages will be built as you navigate to them!');
    } catch (error) {
      await SiteGenerationManager.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  /**
   * Helper function for lazyBuildSourceFiles().
   */
  copyLazySourceFiles() {
    const lazyLoadingSpinnerHtmlFilePath = path.join(__dirname, LAZY_LOADING_SITE_FILE_NAME);
    const outputSpinnerHtmlFilePath = path.join(this.outputPath, LAZY_LOADING_SITE_FILE_NAME);

    return fs.copy(lazyLoadingSpinnerHtmlFilePath, outputSpinnerHtmlFilePath);
  }

  async _rebuildAffectedSourceFiles(filePaths: string | string[]) {
    if (this.backgroundBuildMode) {
      this.stopOngoingBuilds();
    }

    const filePathArray = Array.isArray(filePaths) ? filePaths : [filePaths];
    const uniquePaths = _.uniq(filePathArray);
    this.beforeSiteGenerate();

    try {
      await this.layoutManager.updateLayouts(filePathArray);
      await this.regenerateAffectedPages(uniquePaths);
      await fs.remove(this.tempPath);
      if (this.backgroundBuildMode) {
        this.backgroundBuildNotViewedFiles();
      }
    } catch (error) {
      await SiteGenerationManager.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  async _rebuildPagesBeingViewed(normalizedUrls: string[]) {
    const startTime = new Date();
    const normalizedUrlArray = Array.isArray(normalizedUrls) ? normalizedUrls : [normalizedUrls];
    const uniqueUrls = _.uniq(normalizedUrlArray);
    uniqueUrls.forEach(normalizedUrl => logger.info(
      `Building ${normalizedUrl} as some of its dependencies were changed since the last visit`));

    const pagesToRebuild = this.sitePages.pages.filter(page =>
      uniqueUrls.some(pageUrl => fsUtil.removeExtension(page.pageConfig.sourcePath) === pageUrl));
    const pageGenerationTask = {
      mode: 'async',
      pages: pagesToRebuild,
    };

    try {
      this._setTimestampVariable();
      await this.runPageGenerationTasks([pageGenerationTask]);
      await this.writeSiteData();
      SiteGenerationManager.calculateBuildTimeForRebuildPagesBeingViewed(startTime);
    } catch (err) {
      await SiteGenerationManager.rejectHandler(err, [this.tempPath, this.outputPath]);
    }

    await fs.remove(this.tempPath);
  }

  /**
   * Helper function for _rebuildPagesBeingViewed().
   */
  static calculateBuildTimeForRebuildPagesBeingViewed(startTime: Date) {
    const endTime = new Date();
    const totalBuildTime = (endTime.getTime() - startTime.getTime()) / 1000;
    return logger.info(`Lazy website regeneration complete! Total build time: ${totalBuildTime}s`);
  }

  async _backgroundBuildNotViewedFiles() {
    if (this.toRebuild.size === 0) {
      return;
    }

    logger.info('Building files that are not viewed in the background...');
    const isCompleted = await this.generatePagesMarkedToRebuild();
    if (isCompleted) {
      logger.info('Background building completed!');
      this.postBackgroundBuildFunc();
    }
  }

  /**
   * Generates pages that are marked to be built/rebuilt.
   * @returns A Promise that resolves once all pages are generated.
   */
  async generatePagesMarkedToRebuild(): Promise<boolean> {
    const pagesToRebuild = this.sitePages.pages.filter((page) => {
      const normalizedUrl = fsUtil.removeExtension(page.pageConfig.sourcePath);
      return this.toRebuild.has(normalizedUrl);
    });

    const pageRebuildTask = {
      mode: 'async',
      pages: pagesToRebuild,
    };
    return this.runPageGenerationTasks([pageRebuildTask]);
  }

  async _rebuildSourceFiles() {
    if (this.backgroundBuildMode) {
      this.stopOngoingBuilds();
    }

    logger.info('Pages or site config modified, updating pages...');
    this.beforeSiteGenerate();

    this.layoutManager.removeLayouts();

    const removedPageFilePaths = this.sitePages.updateAddressablePages();
    try {
      await this.siteAssets.removeAsset(removedPageFilePaths);
      await this.rebuildRequiredPages();
      if (this.backgroundBuildMode) {
        this.backgroundBuildNotViewedFiles();
      }
    } catch (error) {
      await SiteGenerationManager.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  /**
   * Helper function for _rebuildSourceFiles().
   */
  async rebuildRequiredPages() {
    if (this.onePagePath) {
      this.sitePages
        .mapAddressablePagesToPages(this.sitePages.addressablePages || [], this.sitePages.getFavIconUrl());

      await this._rebuildPagesBeingViewed(this.currentOpenedPages);
      await this.lazyBuildAllPagesNotViewed(this.currentOpenedPages);
      return;
    }

    logger.warn('Rebuilding all pages...');
    await this.buildSourceFiles();
  }

  /**
   * Writes the site data to siteData.json
   * @param verbose Flag to emit logs of the operation
   */
  async writeSiteData(verbose: boolean = true) {
    const siteDataPath = path.join(this.outputPath, SITE_DATA_NAME);
    const siteData = {
      enableSearch: this.siteConfig.enableSearch,
      pages: this.sitePages.pages.filter(page => page.pageConfig.searchable && page.headings)
        .map(page => ({
          src: page.pageConfig.src,
          title: page.title,
          headings: page.headings,
          headingKeywords: page.keywords,
          frontmatterKeywords: page.frontmatter.keywords,
        })),
    };

    try {
      await fs.outputJson(siteDataPath, siteData, { spaces: 2 });
      if (verbose) {
        logger.info('Site data built');
      }
    } catch (error) {
      await SiteGenerationManager.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  stopOngoingBuilds() {
    this.stopGenerationTimeThreshold = new Date();
  }

  /**
   * Runs the supplied page generation tasks according to the specified mode of each task.
   * A page generation task can be a sequential generation or an asynchronous generation.
   * @param pageGenerationTasks Array of page generation tasks
   * @returns A Promise that resolves to a boolean which indicates whether the generation
   * ran to completion
   */
  async runPageGenerationTasks(pageGenerationTasks: PageGenerationTask[]): Promise<boolean> {
    const pagesCount = pageGenerationTasks.reduce((acc, task) => acc + task.pages.length, 0);
    const progressBar = new ProgressBar(`[:bar] :current / ${pagesCount} pages built`, { total: pagesCount });
    progressBar.render();
    logger.setProgressBar(progressBar);

    const startTime = new Date();
    let isCompleted = true;
    await sequentialAsyncForEach(pageGenerationTasks, async (task) => {
      if (this.backgroundBuildMode && startTime < this.stopGenerationTimeThreshold) {
        logger.info('Page generation stopped');
        logger.debug('Page generation stopped at generation task queue');
        isCompleted = false;
        return;
      }

      if (task.mode === 'sequential') {
        isCompleted = await this.generatePagesSequential(task.pages, progressBar);
      } else {
        isCompleted = await this.generatePagesAsyncThrottled(task.pages, progressBar) as boolean;
      }

      logger.removeProgressBar();
      this.siteLinkManager.validateAllIntralinks();
    });
    return isCompleted;
  }

  /**
   * Generate pages sequentially. That is, the pages are generated
   * one-by-one in order.
   * @param pages Pages to be generated
   * @param progressBar Progress bar of the overall generation process
   * @returns A Promise that resolves to a boolean which indicates whether the generation
   * ran to completion
   */
  async generatePagesSequential(pages: Page[], progressBar: ProgressBar): Promise<boolean> {
    const startTime = new Date();
    let isCompleted = true;
    await sequentialAsyncForEach(pages, async (page) => {
      if (this.backgroundBuildMode && startTime < this.stopGenerationTimeThreshold) {
        logger.info('Page generation stopped');
        logger.debug('Page generation stopped at sequential generation');
        isCompleted = false;
        return;
      }

      try {
        await page.generate(this.externalManager);
        this.toRebuild.delete(fsUtil.removeExtension(page.pageConfig.sourcePath));
        if (this.backgroundBuildMode) {
          await this.writeSiteData(false);
        }
        progressBar.tick();
      } catch (err) {
        throw new Error(`Error while generating ${page.pageConfig.sourcePath}: ${err}`);
      }
    });
    return isCompleted;
  }

  /**
   * Creates the supplied pages' page generation promises at a throttled rate.
   * This is done to avoid pushing too many callbacks into the event loop at once. (#1245)
   * @param pages Pages to be generated
   * @param progressBar Progress bar of the overall generation process
   * @returns A Promise that resolves to a boolean which indicates whether the generation
   * ran to completion
   */
  generatePagesAsyncThrottled(pages: Page[], progressBar: ProgressBar): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const context: PageGenerationContext = {
        startTime: new Date(),
        numPagesGenerated: 0,
        numPagesToGenerate: pages.length,
        isCompleted: true,
      };

      // Map pages into array of callbacks for delayed execution
      const pageGenerationQueue = pages.map(page => async () => {
        // Pre-generate guard to ensure no newly executed callbacks start on stop
        if (this.backgroundBuildMode && context.startTime < this.stopGenerationTimeThreshold) {
          if (context.isCompleted) {
            logger.info('Page generation stopped');
            logger.debug('Page generation stopped at asynchronous generation');
            context.isCompleted = false;
            resolve(false);
          }
          return;
        }

        try {
          await page.generate(this.externalManager);
          this.toRebuild.delete(fsUtil.removeExtension(page.pageConfig.sourcePath));
          if (this.backgroundBuildMode) {
            await this.writeSiteData(false);
          }
          this.generateProgressBarStatus(progressBar, context, pageGenerationQueue, resolve);
        } catch (err) {
          logger.error(err);
          reject(new Error(`Error while generating ${page.pageConfig.sourcePath}`));
        }
      });

      /*
       Take the first MAX_CONCURRENT_PAGE_GENERATION_PROMISES callbacks and execute them.
       Whenever a page generation callback resolves,
       it pops the next unprocessed callback off pageGenerationQueue and executes it.
       */
      pageGenerationQueue.splice(0, MAX_CONCURRENT_PAGE_GENERATION_PROMISES)
        .forEach(generatePage => generatePage());
    });
  }

  /**
   * Helper function for generatePagesAsyncThrottled().
   */
  generateProgressBarStatus(progressBar: ProgressBar, context: PageGenerationContext,
                            pageGenerationQueue: (() => Promise<void>)[], resolve: ((arg0: boolean) => any)) {
    // Post-generate guard to ensure no new callbacks are executed on stop
    if (this.backgroundBuildMode && context.startTime < this.stopGenerationTimeThreshold) {
      if (context.isCompleted) {
        logger.info('Page generation stopped');
        logger.debug('Page generation stopped at asynchronous generation');
        context.isCompleted = false;
        resolve(false);
      }
      return;
    }
    progressBar.tick();
    context.numPagesGenerated += 1;

    if (pageGenerationQueue.length) {
      pageGenerationQueue.pop()!();
    } else if (context.numPagesGenerated === context.numPagesToGenerate) {
      resolve(true);
    }
  }

  /**
   * Renders all pages specified in site configuration file to the output folder
   */
  generatePages() {
    // Run MarkBind include and render on each source file.
    // Render the final rendered page to the output folder.
    const addressablePages = this.sitePages.addressablePages || [];
    const faviconUrl = this.sitePages.getFavIconUrl();

    this._setTimestampVariable();
    this.sitePages.mapAddressablePagesToPages(addressablePages, faviconUrl);

    const pageGenerationTask = {
      mode: 'async',
      pages: this.sitePages.pages,
    };
    return this.runPageGenerationTasks([pageGenerationTask]);
  }

  /**
   * Renders only the starting page for lazy loading to the output folder.
   */
  async generateLandingPage() {
    const addressablePages = this.sitePages.addressablePages || [];
    const faviconUrl = this.sitePages.getFavIconUrl();

    this._setTimestampVariable();
    this.sitePages.mapAddressablePagesToPages(addressablePages, faviconUrl);

    const landingPage = this.sitePages.pages.find(page => page.pageConfig.src === this.onePagePath);
    if (!landingPage) {
      throw new Error(`${this.onePagePath} is not specified in the site configuration.`);
    }

    await landingPage.generate(this.externalManager);
  }

  async regenerateAffectedPages(filePaths: string[]) {
    const startTime = new Date();

    const shouldRebuildAllPages = this.collectUserDefinedVariablesMapIfNeeded(filePaths) || this.forceReload;
    if (shouldRebuildAllPages) {
      logger.warn('Rebuilding all pages as variables file was changed, or the --force-reload flag was set');
    }
    this._setTimestampVariable();

    let openedPagesToRegenerate: Page[] = [];
    const asyncPagesToRegenerate = this.sitePages.pages.filter((page) => {
      const doFilePathsHaveSourceFiles = filePaths.some(filePath => page.isDependency(filePath));

      if (shouldRebuildAllPages || doFilePathsHaveSourceFiles) {
        if (this.onePagePath) {
          const normalizedSource = fsUtil.removeExtension(page.pageConfig.sourcePath);
          const openIdx = this.currentOpenedPages.findIndex(pagePath => pagePath === normalizedSource);
          const isRecentlyViewed = openIdx !== -1;

          if (!isRecentlyViewed) {
            this.toRebuild.add(normalizedSource);
          } else {
            openedPagesToRegenerate[openIdx] = page;
          }

          return false;
        }

        return true;
      }

      return false;
    });

    /*
     * As a side effect of doing assignment to an empty array, some elements might be
     * undefined if it has not been assigned to anything. We filter those out here.
     */
    openedPagesToRegenerate = openedPagesToRegenerate.filter(page => page);

    const totalPagesToRegenerate = openedPagesToRegenerate.length + asyncPagesToRegenerate.length;
    if (totalPagesToRegenerate === 0) {
      logger.info('No pages needed to be rebuilt');
      return;
    }
    logger.info(`Rebuilding ${totalPagesToRegenerate} pages`);

    const pageGenerationTasks = [];
    if (openedPagesToRegenerate.length > 0) {
      const recentPagesGenerationTask = {
        mode: 'sequential',
        pages: openedPagesToRegenerate,
      };
      pageGenerationTasks.push(recentPagesGenerationTask);
    }

    if (asyncPagesToRegenerate.length > 0) {
      const asyncPagesGenerationTask = {
        mode: 'async',
        pages: asyncPagesToRegenerate,
      };
      pageGenerationTasks.push(asyncPagesGenerationTask);
    }

    try {
      await this.runPageGenerationTasks(pageGenerationTasks);
      await this.writeSiteData();
      logger.info('Pages rebuilt');
      this.calculateBuildTimeForRegenerateAffectedPages(startTime);
    } catch (error) {
      await SiteGenerationManager.rejectHandler(error, []);
    }
  }

  /**
   * Helper function for regenerateAffectedPages().
   */
  calculateBuildTimeForRegenerateAffectedPages(startTime: Date) {
    const endTime = new Date();
    const totalBuildTime = (endTime.getTime() - startTime.getTime()) / 1000;
    logger.info(`Website regeneration complete! Total build time: ${totalBuildTime}s`);
    if (!this.onePagePath && totalBuildTime > LAZY_LOADING_REBUILD_TIME_RECOMMENDATION_LIMIT) {
      logger.info('Your pages took quite a while to rebuild...'
          + 'Have you considered using markbind serve -o when writing content to speed things up?');
    }
  }

  _setTimestampVariable() {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: this.siteConfig.timeZone,
      timeZoneName: 'short',
    };
    const time = new Date().toLocaleTimeString(this.siteConfig.locale, options);
    this.variableProcessor.addUserDefinedVariableForAllSites('timestamp', time);
  }

  rebuildPagesBeingViewed = delay(
    this._rebuildPagesBeingViewed.bind(this) as () => Bluebird<unknown>,
    1000,
  );

  /**
   * Rebuild pages that are affected by changes in filePaths
   * @param filePaths a single path or an array of paths corresponding to the files that have changed
   */
  rebuildAffectedSourceFiles = delay(
    this._rebuildAffectedSourceFiles.bind(this) as () => Bluebird<unknown>,
    1000,
  );

  /**
   * Rebuild all pages
   */
  rebuildSourceFiles = delay(
    this._rebuildSourceFiles.bind(this) as unknown as (arg: any[]) => Bluebird<any>,
    1000,
  ) as unknown as () => void;

  /**
   * Builds pages that are yet to build/rebuild in the background
   */
  backgroundBuildNotViewedFiles = delay(
    this._backgroundBuildNotViewedFiles.bind(this) as unknown as (arg: any[]) => Bluebird<any>,
    1000,
  ) as unknown as () => void;

  async reloadSiteConfig() {
    if (this.backgroundBuildMode) {
      this.stopOngoingBuilds();
    }

    const oldSiteConfig = this.siteConfig;
    const oldAddressablePages = this.sitePages.addressablePages.slice();
    const oldPagesSrc = oldAddressablePages.map(page => page.src);
    await this.readSiteConfig();
    await this.siteAssets.handleIgnoreReload(oldSiteConfig.ignore);
    await this.handlePageReload(oldAddressablePages, oldPagesSrc, oldSiteConfig);
    await this.siteAssets.handleStyleReload(oldSiteConfig.style);
    if (this.backgroundBuildMode) {
      this.backgroundBuildNotViewedFiles();
    }
  }

  /**
   * Handles the rebuilding of modified pages
   */
  async handlePageReload(oldAddressablePages: AddressablePage[], oldPagesSrc: string[],
                         oldSiteConfig: SiteConfig) {
    this.sitePages.collectAddressablePages();

    // Comparator for the _differenceWith comparison below
    const isNewPage = (newPage: AddressablePage, oldPage: AddressablePage) =>
      _.isEqual(newPage, oldPage) || newPage.src === oldPage.src;

    const addedPages = _.differenceWith(this.sitePages.addressablePages, oldAddressablePages, isNewPage);
    const removedPages = _.differenceWith(oldAddressablePages, this.sitePages.addressablePages, isNewPage)
      .map(filePath => fsUtil.setExtension(filePath.src as string, '.html'));

    // Checks if any attributes of site.json requiring a global rebuild are modified
    const isGlobalConfigModified = () => !_.isEqual(oldSiteConfig.faviconPath, this.siteConfig.faviconPath)
        || !_.isEqual(oldSiteConfig.titlePrefix, this.siteConfig.titlePrefix)
        || !_.isEqual(oldSiteConfig.titleSuffix, this.siteConfig.titleSuffix)
        || !_.isEqual(oldSiteConfig.style, this.siteConfig.style)
        || !_.isEqual(oldSiteConfig.externalScripts, this.siteConfig.externalScripts)
        || !_.isEqual(oldSiteConfig.globalOverride, this.siteConfig.globalOverride)
        || !_.isEqual(oldSiteConfig.plugins, this.siteConfig.plugins)
        || !_.isEqual(oldSiteConfig.pluginsContext, this.siteConfig.pluginsContext)
        || !_.isEqual(oldSiteConfig.headingIndexingLevel, this.siteConfig.headingIndexingLevel)
        || !_.isEqual(oldSiteConfig.enableSearch, this.siteConfig.enableSearch)
        || !_.isEqual(oldSiteConfig.timeZone, this.siteConfig.timeZone)
        || !_.isEqual(oldSiteConfig.locale, this.siteConfig.locale)
        || !_.isEqual(oldSiteConfig.intrasiteLinkValidation, this.siteConfig.intrasiteLinkValidation)
        || !_.isEqual(oldSiteConfig.plantumlCheck, this.siteConfig.plantumlCheck);

    if (isGlobalConfigModified() || !_.isEmpty(addedPages) || !_.isEmpty(removedPages)) {
      await this.siteAssets.removeAsset(removedPages);
      this.buildManagers(this.sitePages.baseUrlMap);
      await this.rebuildSourceFiles();
      await this.writeSiteData();
    } else {
      // Get pages with edited attributes but with the same src
      const editedPages = _.differenceWith(
        this.sitePages.addressablePages,
        oldAddressablePages,
        (newPage, oldPage) => _.isEqual(newPage, oldPage) || !oldPagesSrc.includes(newPage.src),
      );
      this.sitePages.updatePages(editedPages);
      const siteConfigDirectory = path.dirname(path.join(this.rootPath, this.siteConfigPath));
      this.regenerateAffectedPages(editedPages.map(page => path.join(siteConfigDirectory, page.src)));
    }
  }
}

export class Site {
  isDevMode: boolean;
  rootPath: string;
  outputPath: string;

  // Facade Internal Components
  assetsManager: SiteAssetsManager;
  pagesManager: SitePagesManager;
  deployManager: SiteDeployManager;
  generationManager: SiteGenerationManager;

  // Getters for compatibility
  get siteConfig() { return this.generationManager.siteConfig; }
  set siteConfig(config: SiteConfig) {
    this.generationManager.siteConfig = config;
    this.assetsManager.siteConfig = config;
    this.pagesManager.siteConfig = config;
    this.deployManager.siteConfig = config;
  }

  get pages() { return this.pagesManager.pages; }
  get addressablePages() { return this.pagesManager.addressablePages; }
  get addressablePagesSource() { return this.pagesManager.addressablePagesSource; }
  get baseUrlMap() { return this.pagesManager.baseUrlMap; }
  get variableProcessor() { return this.generationManager.variableProcessor; }
  get pluginManager() { return this.generationManager.pluginManager; }
  get siteLinkManager() { return this.generationManager.siteLinkManager; }
  get externalManager() { return this.generationManager.externalManager; }
  get layoutManager() { return this.generationManager.layoutManager; }
  get tempPath() { return this.generationManager.tempPath; }
  get siteAssetsDestPath() { return this.assetsManager.siteAssetsDestPath; }
  get pageTemplatePath() { return this.pagesManager.pageTemplatePath; }
  get pageTemplate() { return this.pagesManager.pageTemplate; }
  get forceReload() { return this.generationManager.forceReload; }
  get siteConfigPath() { return this.generationManager.siteConfigPath; }
  get backgroundBuildMode() { return this.generationManager.backgroundBuildMode; }
  get stopGenerationTimeThreshold() { return this.generationManager.stopGenerationTimeThreshold; }
  get postBackgroundBuildFunc() { return this.generationManager.postBackgroundBuildFunc; }
  get onePagePath() { return this.generationManager.onePagePath; }
  get currentPageViewed() { return this.generationManager.currentPageViewed; }
  get currentOpenedPages() { return this.generationManager.currentOpenedPages; }
  get toRebuild() { return this.generationManager.toRebuild; }

  constructor(rootPath: string, outputPath: string, onePagePath: string, forceReload = false,
              siteConfigPath = SITE_CONFIG_NAME, isDevMode: any, backgroundBuildMode: boolean,
              postBackgroundBuildFunc: () => void) {
    this.isDevMode = !!isDevMode;
    this.rootPath = rootPath;
    this.outputPath = outputPath;

    this.assetsManager = new SiteAssetsManager(rootPath, outputPath);
    this.pagesManager = new SitePagesManager(rootPath, outputPath, this.isDevMode);
    this.deployManager = new SiteDeployManager(rootPath, outputPath);
    this.generationManager = new SiteGenerationManager(rootPath, outputPath, onePagePath, forceReload,
                                                       siteConfigPath, this.isDevMode, backgroundBuildMode,
                                                       postBackgroundBuildFunc);

    // Configure Generator with references
    this.generationManager.configure(this.assetsManager, this.pagesManager);
  }

  createNewPage(page: AddressablePage, faviconUrl: string | undefined) {
    return this.pagesManager.createNewPage(page, faviconUrl);
  }

  static async rejectHandler(error: unknown, removeFolders: string[]) {
    return SiteGenerationManager.rejectHandler(error, removeFolders);
  }

  beforeSiteGenerate() {
    this.generationManager.beforeSiteGenerate();
  }

  changeCurrentPage(normalizedUrl: string) {
    return this.generationManager.changeCurrentPage(normalizedUrl);
  }

  changeCurrentOpenedPages(normalizedUrls: string[]) {
    return this.generationManager.changeCurrentOpenedPages(normalizedUrls);
  }

  async readSiteConfig(baseUrl?: string) {
    const config = await this.generationManager.readSiteConfig(baseUrl);
    this.siteConfig = config;
    return config;
  }

  listAssets(fileIgnore: Ignore) {
    return this.assetsManager.listAssets(fileIgnore);
  }

  createPage(config: PageCreationConfig): Page {
    return this.pagesManager.createPage(config);
  }

  collectAddressablePages() {
    this.pagesManager.collectAddressablePages();
  }

  static printBaseUrlMessage() {
    logger.info('The default base URL of your site is set to /\n'
      + 'You can change the base URL of your site by editing site.json\n'
      + 'Check https://markbind.org/userGuide/siteConfiguration.html for more information.');
  }

  updateAddressablePages() {
    return this.pagesManager.updateAddressablePages();
  }

  getPageGlobPaths(page: SiteConfigPage, pagesExclude: string[]) {
    return this.pagesManager.getPageGlobPaths(page, pagesExclude);
  }

  collectBaseUrl() {
    this.generationManager.collectBaseUrl();
  }

  collectUserDefinedVariablesMap() {
    this.generationManager.collectUserDefinedVariablesMap();
  }

  collectUserDefinedVariablesMapIfNeeded(filePaths: string[]) {
    return this.generationManager.collectUserDefinedVariablesMapIfNeeded(filePaths);
  }

  async generate(baseUrl: string | undefined): Promise<any> {
    return this.generationManager.generate(baseUrl);
  }

  async buildSourceFiles() {
    return this.generationManager.buildSourceFiles();
  }

  lazyBuildAllPagesNotViewed(viewedPages: string | string[]) {
    return this.generationManager.lazyBuildAllPagesNotViewed(viewedPages);
  }

  async lazyBuildSourceFiles() {
    return this.generationManager.lazyBuildSourceFiles();
  }

  copyLazySourceFiles() {
    return this.generationManager.copyLazySourceFiles();
  }

  rebuildAffectedSourceFiles(filePaths: string | string[]) {
    return this.generationManager.rebuildAffectedSourceFiles(filePaths);
  }

  rebuildPagesBeingViewed(normalizedUrls: string | string[]) {
    // Cast to string[] if needed or let wrapper handle
    return this.generationManager.rebuildPagesBeingViewed(normalizedUrls as string[]);
  }

  rebuildSourceFiles() {
    return this.generationManager.rebuildSourceFiles();
  }

  backgroundBuildNotViewedFiles() {
    return this.generationManager.backgroundBuildNotViewedFiles();
  }

  async rebuildRequiredPages() {
    return this.generationManager.rebuildRequiredPages();
  }

  buildAsset(filePaths: string | string[]) {
    return this.assetsManager.buildAsset(filePaths);
  }

  removeAsset(filePaths: string | string[]) {
    return this.assetsManager.removeAsset(filePaths);
  }

  async reloadSiteConfig() {
    await this.generationManager.reloadSiteConfig();
    this.siteConfig = this.generationManager.siteConfig;
  }

  async copyFontAwesomeAsset() { return this.assetsManager.copyFontAwesomeAsset(); }
  copyOcticonsAsset() { return this.assetsManager.copyOcticonsAsset(); }
  copyMaterialIconsAsset() { return this.assetsManager.copyMaterialIconsAsset(); }
  copyCoreWebAsset() { return this.assetsManager.copyCoreWebAsset(); }
  copyBootstrapIconsAsset() { return this.assetsManager.copyBootstrapIconsAsset(); }
  async copyBootstrapTheme(isRebuild: boolean) { return this.assetsManager.copyBootstrapTheme(isRebuild); }
  async deploy(ciTokenVar: string | boolean) {
    const config = await this.readSiteConfig();
    this.deployManager.siteConfig = config;
    return this.deployManager.deploy(ciTokenVar);
  }
}
