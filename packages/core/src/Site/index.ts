import cheerio from 'cheerio';
import fs from 'fs-extra';
import ignore, { Ignore } from 'ignore';
import path from 'path';
import walkSync from 'walk-sync';
import simpleGit, { SimpleGit } from 'simple-git';
import Bluebird from 'bluebird';
import ghpages from 'gh-pages';
import difference from 'lodash/difference';
import differenceWith from 'lodash/differenceWith';
import flatMap from 'lodash/flatMap';
import has from 'lodash/has';
import isBoolean from 'lodash/isBoolean';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import noop from 'lodash/noop';
import omitBy from 'lodash/omitBy';
import startCase from 'lodash/startCase';
import union from 'lodash/union';
import uniq from 'lodash/uniq';

import { Template as NunjucksTemplate } from 'nunjucks';
import { SiteConfig, SiteConfigPage, SiteConfigStyle } from './SiteConfig';
import { Page } from '../Page';
import { PageConfig } from '../Page/PageConfig';
import { VariableProcessor } from '../variables/VariableProcessor';
import { VariableRenderer } from '../variables/VariableRenderer';
import { ExternalManager, ExternalManagerConfig } from '../External/ExternalManager';
import { SiteLinkManager } from '../html/SiteLinkManager';
import { PluginManager } from '../plugins/PluginManager';
import type { FrontMatter } from '../plugins/Plugin';
import { sequentialAsyncForEach } from '../utils/async';
import { delay } from '../utils/delay';
import * as fsUtil from '../utils/fsUtil';
import * as gitUtil from '../utils/git';
import * as logger from '../utils/logger';
import { SITE_CONFIG_NAME, INDEX_MARKDOWN_FILE, LAZY_LOADING_SITE_FILE_NAME } from './constants';

// Change when they are migrated to TypeScript
const ProgressBar = require('../lib/progress');
const { LayoutManager, LAYOUT_DEFAULT_NAME, LAYOUT_FOLDER_PATH } = require('../Layout');
require('../patches/htmlparser2');

const _ = {
  difference,
  differenceWith,
  flatMap,
  has,
  isUndefined,
  isEqual,
  isEmpty,
  isBoolean,
  noop,
  omitBy,
  startCase,
  union,
  uniq,
};

const url = {
  join: path.posix.join,
};

const MARKBIND_VERSION = require('../../package.json').version;

const CONFIG_FOLDER_NAME = '_markbind';
const SITE_FOLDER_NAME = '_site';
const TEMP_FOLDER_NAME = '.temp';
const TEMPLATE_SITE_ASSET_FOLDER_NAME = 'markbind';
const LAYOUT_SITE_FOLDER_NAME = 'layouts';

const ABOUT_MARKDOWN_FILE = 'about.md';
const FAVICON_DEFAULT_PATH = 'favicon.ico';
const USER_VARIABLES_PATH = '_markbind/variables.md';

const PAGE_TEMPLATE_NAME = 'page.njk';
const SITE_DATA_NAME = 'siteData.json';

const WIKI_SITE_NAV_PATH = '_Sidebar.md';
const WIKI_FOOTER_PATH = '_Footer.md';

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

const ABOUT_MARKDOWN_DEFAULT = '# About\n'
  + 'Welcome to your **About Us** page.\n';

const MARKBIND_WEBSITE_URL = 'https://markbind.org/';
const MARKBIND_LINK_HTML = `<a href='${MARKBIND_WEBSITE_URL}'>MarkBind ${MARKBIND_VERSION}</a>`;

/*
 * A page configuration object.
 */
type PageCreationConfig = {
  externalScripts: string[],
  frontmatter: FrontMatter,
  layout: string,
  pageSrc: string,
  searchable: boolean,
  faviconUrl?: string,
  glob?: string,
  globExclude?: string
  title?: string,
};

type AddressablePage = {
  frontmatter: FrontMatter,
  layout: string,
  searchable: string,
  src: string,
  externalScripts?: string[],
  faviconUrl?: string,
  title?: string,
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

export class Site {
  dev: boolean;
  rootPath: string;
  outputPath: string;
  tempPath: string;
  siteAssetsDestPath: string;
  pageTemplatePath: string;
  pageTemplate: NunjucksTemplate;
  pages: Page[];
  addressablePages: AddressablePage[];
  addressablePagesSource: string[];
  baseUrlMap: Set<string>;
  forceReload: boolean;
  siteConfig!: SiteConfig;
  siteConfigPath: string;
  variableProcessor!: VariableProcessor;
  pluginManager!: PluginManager;
  siteLinkManager!: SiteLinkManager;
  backgroundBuildMode: string | boolean;
  stopGenerationTimeThreshold: Date;
  postBackgroundBuildFunc: () => void;
  onePagePath: string;
  currentPageViewed: string;
  currentOpenedPages: string[];
  toRebuild: Set<string>;
  externalManager!: ExternalManager;
  // TODO: add LayoutManager when it has been migrated
  layoutManager: any;

  constructor(rootPath: string, outputPath: string, onePagePath: string, forceReload = false,
              siteConfigPath = SITE_CONFIG_NAME, dev: any, backgroundBuildMode: boolean,
              postBackgroundBuildFunc: () => void) {
    this.dev = !!dev;

    this.rootPath = rootPath;
    this.outputPath = outputPath;
    this.tempPath = path.join(rootPath, TEMP_FOLDER_NAME);

    // MarkBind assets to be copied
    this.siteAssetsDestPath = path.join(outputPath, TEMPLATE_SITE_ASSET_FOLDER_NAME);

    // Page template path
    this.pageTemplatePath = path.join(__dirname, '../Page', PAGE_TEMPLATE_NAME);
    this.pageTemplate = VariableRenderer.compile(fs.readFileSync(this.pageTemplatePath, 'utf8'));
    this.pages = [];

    // Other properties
    this.addressablePages = [];
    this.addressablePagesSource = [];
    this.baseUrlMap = new Set();
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

  /**
   * Util Methods
   */

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
  changeCurrentPage(normalizedUrl: string) {
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
   * Read and store the site config from site.json, overwrite the default base URL
   * if it's specified by the user.
   * @param baseUrl user defined base URL (if exists)
   */
  async readSiteConfig(baseUrl?: string): Promise<any> {
    try {
      const siteConfigPath = path.join(this.rootPath, this.siteConfigPath);
      const siteConfigJson = fs.readJsonSync(siteConfigPath);
      this.siteConfig = new SiteConfig(siteConfigJson, baseUrl);

      return this.siteConfig;
    } catch (err) {
      throw (new Error(`Failed to read the site config file '${this.siteConfigPath}' at`
        + `${this.rootPath}:\n${(err as Error).message}\nPlease ensure the file exist or is valid`));
    }
  }

  listAssets(fileIgnore: Ignore) {
    const files = walkSync(this.rootPath, { directories: false });
    return fileIgnore.filter(files);
  }

  /**
   * Create a Page object from the site and page creation config.
   */
  createPage(config: PageCreationConfig): Page {
    const sourcePath = path.join(this.rootPath, config.pageSrc);
    const resultPath = path.join(this.outputPath, fsUtil.setExtension(config.pageSrc, '.html'));

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
        highlight: path.posix.join(baseAssetsPath, 'css',
                                   HIGHLIGHT_ASSETS[this.siteConfig.style.codeTheme]),
        markBindCss: path.posix.join(baseAssetsPath, 'css', 'markbind.min.css'),
        markBindJs: path.posix.join(baseAssetsPath, 'js', 'markbind.min.js'),
        pageNavCss: path.posix.join(baseAssetsPath, 'css', 'page-nav.css'),
        siteNavCss: path.posix.join(baseAssetsPath, 'css', 'site-nav.css'),
        bootstrapUtilityJs: path.posix.join(baseAssetsPath, 'js', 'bootstrap-utility.min.js'),
        polyfillJs: path.posix.join(baseAssetsPath, 'js', 'polyfill.min.js'),
        // We use development Vue when MarkBind is served in 'dev' mode so that hydration issues are reported
        vue: this.dev
          ? 'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js'
          : path.posix.join(baseAssetsPath, 'js', 'vue.min.js'),
        layoutUserScriptsAndStyles: [],
      },
      baseUrlMap: this.baseUrlMap,
      dev: this.dev,
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
   * Converts an existing GitHub wiki or docs folder to a MarkBind website.
   */
  async convert() {
    await this.readSiteConfig();
    this.collectAddressablePages();
    await this.addIndexPage();
    await this.addAboutPage();
    this.addDefaultLayoutFiles();
    await this.addDefaultLayoutToSiteConfig();
    Site.printBaseUrlMessage();
  }

  /**
   * Copies over README.md or Home.md to default index.md if present.
   */
  async addIndexPage() {
    const indexPagePath = path.join(this.rootPath, INDEX_MARKDOWN_FILE);
    const fileNames = ['README.md', 'Home.md'];
    const filePath = fileNames.find(fileName => fs.existsSync(path.join(this.rootPath, fileName)));
    // if none of the files exist, do nothing
    if (_.isUndefined(filePath)) return;
    try {
      await fs.copy(path.join(this.rootPath, filePath), indexPagePath);
    } catch (error) {
      throw new Error(`Failed to copy over ${filePath}`);
    }
  }

  /**
   * Adds an about page to site if not present.
   */
  async addAboutPage() {
    const aboutPath = path.join(this.rootPath, ABOUT_MARKDOWN_FILE);
    try {
      await fs.access(aboutPath);
    } catch (error) {
      if (fs.existsSync(aboutPath)) {
        return;
      }
      await fs.outputFile(aboutPath, ABOUT_MARKDOWN_DEFAULT);
    }
  }

  /**
   * Adds a footer to default layout of site.
   */
  addDefaultLayoutFiles() {
    const wikiFooterPath = path.join(this.rootPath, WIKI_FOOTER_PATH);
    let footer;
    if (fs.existsSync(wikiFooterPath)) {
      logger.info(`Copied over the existing ${WIKI_FOOTER_PATH} file to the converted layout`);
      footer = `\n${fs.readFileSync(wikiFooterPath, 'utf8')}`;
    }

    const wikiSiteNavPath = path.join(this.rootPath, WIKI_SITE_NAV_PATH);
    let siteNav;
    if (fs.existsSync(wikiSiteNavPath)) {
      logger.info(`Copied over the existing ${WIKI_SITE_NAV_PATH} file to the converted layout\n`
        + 'Check https://markbind.org/userGuide/tweakingThePageStructure.html#site-navigation-menus\n'
        + 'for information on site navigation menus.');
      siteNav = fs.readFileSync(wikiSiteNavPath, 'utf8');
    } else {
      siteNav = this.buildSiteNav();
    }

    const convertedLayoutTemplate = VariableRenderer.compile(
      fs.readFileSync(path.join(__dirname, 'siteConvertLayout.njk'), 'utf8'));
    const renderedLayout = convertedLayoutTemplate.render({
      footer,
      siteNav,
    });
    const layoutOutputPath = path.join(this.rootPath, LAYOUT_FOLDER_PATH, LAYOUT_DEFAULT_NAME);

    fs.writeFileSync(layoutOutputPath, renderedLayout, 'utf-8');
  }

  /**
   * Builds a site navigation file from the directory structure of the site.
   */
  buildSiteNav() {
    let siteNavContent = '';
    this.addressablePages
      .filter(addressablePage => !addressablePage.src.startsWith('_'))
      .forEach((page) => {
        const addressablePagePath = path.join(this.rootPath, page.src);
        const relativePagePathWithoutExt = fsUtil.removeExtensionPosix(
          path.relative(this.rootPath, addressablePagePath));
        const pageName = _.startCase(fsUtil.removeExtension(path.basename(addressablePagePath)));
        const pageUrl = `{{ baseUrl }}/${relativePagePathWithoutExt}.html`;
        siteNavContent += `* [${pageName}](${pageUrl})\n`;
      });

    return siteNavContent.trimEnd();
  }

  /**
   * Applies the default layout to all addressable pages by modifying the site config file.
   */
  async addDefaultLayoutToSiteConfig() {
    const configPath = path.join(this.rootPath, SITE_CONFIG_NAME);
    const config = await fs.readJson(configPath);
    await Site.writeToSiteConfig(config, configPath);
  }

  /**
   * Helper function for addDefaultLayoutToSiteConfig().
   */
  static async writeToSiteConfig(config: SiteConfig, configPath: string) {
    const layoutObj: SiteConfigPage = { glob: '**/*.md', layout: LAYOUT_DEFAULT_NAME };
    config.pages.push(layoutObj);
    await fs.outputJson(configPath, config);
  }

  static printBaseUrlMessage() {
    logger.info('The default base URL of your site is set to /\n'
      + 'You can change the base URL of your site by editing site.json\n'
      + 'Check https://markbind.org/userGuide/siteConfiguration.html for more information.');
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
   * Collects the base url map in the site/subsites
   */
  collectBaseUrl() {
    const candidates = walkSync(this.rootPath, { directories: false })
      .filter(x => x.endsWith(this.siteConfigPath))
      .map(x => path.resolve(this.rootPath, x));

    this.baseUrlMap = new Set(candidates.map(candidate => path.dirname(candidate)));
    this.variableProcessor = new VariableProcessor(this.rootPath, this.baseUrlMap);

    this.buildManagers();
  }

  /**
   * Set up the managers used with the configurations.
   */
  buildManagers() {
    const config: ExternalManagerConfig & { externalManager: ExternalManager } = {
      baseUrlMap: this.baseUrlMap,
      baseUrl: this.siteConfig.baseUrl,
      rootPath: this.rootPath,
      outputPath: this.outputPath,
      ignore: this.siteConfig.ignore,
      addressablePagesSource: this.addressablePagesSource,
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
  }

  /**
   * Collects the user defined variables map in the site/subsites
   */
  collectUserDefinedVariablesMap() {
    this.variableProcessor.resetUserDefinedVariablesMap();

    this.baseUrlMap.forEach((base) => {
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
      this.collectAddressablePages();
      this.collectBaseUrl();
      this.collectUserDefinedVariablesMap();
      await this.buildAssets();
      await (this.onePagePath ? this.lazyBuildSourceFiles() : this.buildSourceFiles());
      await this.copyCoreWebAsset();
      await this.copyBootstrapTheme(false);
      await this.copyFontAwesomeAsset();
      await this.copyOcticonsAsset();
      await this.copyMaterialIconsAsset();
      await this.writeSiteData();
      this.calculateBuildTimeForGenerate(startTime, lazyWebsiteGenerationString);
      if (this.backgroundBuildMode) {
        this.backgroundBuildNotViewedFiles();
      }
    } catch (error) {
      await Site.rejectHandler(error, [this.tempPath, this.outputPath]);
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
      await Site.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  /**
   * Adds all pages except the viewed pages to toRebuild, flagging them for lazy building later.
   */
  async lazyBuildAllPagesNotViewed(viewedPages: string | string[]) {
    const viewedPagesArray = Array.isArray(viewedPages) ? viewedPages : [viewedPages];
    this.pages.forEach((page) => {
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
      await Site.rejectHandler(error, [this.tempPath, this.outputPath]);
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
      await this.layoutManager.updateLayouts(filePaths);
      await this.regenerateAffectedPages(uniquePaths);
      await fs.remove(this.tempPath);
      if (this.backgroundBuildMode) {
        this.backgroundBuildNotViewedFiles();
      }
    } catch (error) {
      await Site.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  async _rebuildPagesBeingViewed(normalizedUrls: string[]) {
    const startTime = new Date();
    const normalizedUrlArray = Array.isArray(normalizedUrls) ? normalizedUrls : [normalizedUrls];
    const uniqueUrls = _.uniq(normalizedUrlArray);
    uniqueUrls.forEach(normalizedUrl => logger.info(
      `Building ${normalizedUrl} as some of its dependencies were changed since the last visit`));

    const pagesToRebuild = this.pages.filter(page =>
      uniqueUrls.some(pageUrl => fsUtil.removeExtension(page.pageConfig.sourcePath) === pageUrl));
    const pageGenerationTask = {
      mode: 'async',
      pages: pagesToRebuild,
    };

    try {
      this._setTimestampVariable();
      await this.runPageGenerationTasks([pageGenerationTask]);
      await this.writeSiteData();
      Site.calculateBuildTimeForRebuildPagesBeingViewed(startTime);
    } catch (err) {
      await Site.rejectHandler(err, [this.tempPath, this.outputPath]);
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
    const pagesToRebuild = this.pages.filter((page) => {
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

    const removedPageFilePaths = this.updateAddressablePages();
    try {
      await this.removeAsset(removedPageFilePaths);
      await this.rebuildRequiredPages();
      if (this.backgroundBuildMode) {
        this.backgroundBuildNotViewedFiles();
      }
    } catch (error) {
      await Site.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  /**
   * Helper function for _rebuildSourceFiles().
   */
  async rebuildRequiredPages() {
    if (this.onePagePath) {
      this.mapAddressablePagesToPages(this.addressablePages || [], this.getFavIconUrl());

      await this._rebuildPagesBeingViewed(this.currentOpenedPages);
      await this.lazyBuildAllPagesNotViewed(this.currentOpenedPages);
      return;
    }

    logger.warn('Rebuilding all pages...');
    await this.buildSourceFiles();
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
    try {
      const listOfAssets = this.listAssets(fileIgnore);
      const assetsToCopy = listOfAssets.map(asset =>
        fs.copy(path.join(this.rootPath, asset), path.join(this.outputPath, asset)));
      await Promise.all(assetsToCopy);
      logger.info('Assets built');
    } catch (error) {
      await Site.rejectHandler(error, []); // assets won't affect deletion
    }
  }

  async reloadSiteConfig() {
    if (this.backgroundBuildMode) {
      this.stopOngoingBuilds();
    }

    const oldSiteConfig = this.siteConfig;
    const oldAddressablePages = this.addressablePages.slice();
    const oldPagesSrc = oldAddressablePages.map(page => page.src);
    await this.readSiteConfig();
    await this.handleIgnoreReload(oldSiteConfig.ignore);
    await this.handlePageReload(oldAddressablePages, oldPagesSrc, oldSiteConfig);
    await this.handleStyleReload(oldSiteConfig.style);
    if (this.backgroundBuildMode) {
      this.backgroundBuildNotViewedFiles();
    }
  }

  /**
   * Handles the rebuilding of modified pages
   */
  async handlePageReload(oldAddressablePages: AddressablePage[], oldPagesSrc: string[],
                         oldSiteConfig: SiteConfig) {
    this.collectAddressablePages();

    // Comparator for the _differenceWith comparison below
    const isNewPage = (newPage: AddressablePage, oldPage: AddressablePage) =>
      _.isEqual(newPage, oldPage) || newPage.src === oldPage.src;

    const addedPages = _.differenceWith(this.addressablePages, oldAddressablePages, isNewPage);
    const removedPages = _.differenceWith(oldAddressablePages, this.addressablePages, isNewPage)
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
      await this.removeAsset(removedPages);
      this.buildManagers();
      await this._rebuildSourceFiles();
      await this.writeSiteData();
    } else {
      // Get pages with edited attributes but with the same src
      const editedPages = _.differenceWith(this.addressablePages, oldAddressablePages, (newPage, oldPage) =>
        _.isEqual(newPage, oldPage) || !oldPagesSrc.includes(newPage.src));
      this.updatePages(editedPages);
      const siteConfigDirectory = path.dirname(path.join(this.rootPath, this.siteConfigPath));
      this.regenerateAffectedPages(editedPages.map(page => path.join(siteConfigDirectory, page.src)));
    }
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
   * Handles the reloading of ignore attributes
   */
  async handleIgnoreReload(oldIgnore: string[]) {
    const assetsToRemove = _.difference(this.siteConfig.ignore, oldIgnore);

    if (!_.isEqual(oldIgnore, this.siteConfig.ignore)) {
      await this._removeMultipleAssets(assetsToRemove);
      this.buildManagers();
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
      frontmatter: page.frontmatter,
      searchable: page.searchable !== 'no',
      externalScripts: page.externalScripts || [],
    });
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
  async generatePagesSequential(pages: Page[], progressBar: any): Promise<boolean> {
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
        logger.error(err);
        throw new Error(`Error while generating ${page.pageConfig.sourcePath}`);
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
  generatePagesAsyncThrottled(pages: Page[], progressBar: any): Promise<boolean> {
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
  generateProgressBarStatus(progressBar: any, context: PageGenerationContext,
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
    const addressablePages = this.addressablePages || [];

    const faviconUrl = this.getFavIconUrl();

    this._setTimestampVariable();
    this.mapAddressablePagesToPages(addressablePages, faviconUrl);

    const pageGenerationTask = {
      mode: 'async',
      pages: this.pages,
    };
    return this.runPageGenerationTasks([pageGenerationTask]);
  }

  /**
   * Renders only the starting page for lazy loading to the output folder.
   */
  async generateLandingPage() {
    const addressablePages = this.addressablePages || [];
    const faviconUrl = this.getFavIconUrl();

    this._setTimestampVariable();
    this.mapAddressablePagesToPages(addressablePages, faviconUrl);

    const landingPage = this.pages.find(page => page.pageConfig.src === this.onePagePath);
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
    const asyncPagesToRegenerate = this.pages.filter((page) => {
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
      await Site.rejectHandler(error, []);
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

  /**
   * Copies bootstrapTheme to the assets folder if a valid bootstrapTheme is specified
   * @param isRebuild only true if it is a rebuild
   */
  copyBootstrapTheme(isRebuild: boolean) {
    const { bootstrapTheme } = this.siteConfig.style;

    /**
     * If it is the initial build using the default bootstrapTheme or if the bootstrapTheme specified
     * is not valid, then do nothing.
     */
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
   * Writes the site data to siteData.json
   * @param verbose Flag to emit logs of the operation
   */
  async writeSiteData(verbose: boolean = true) {
    const siteDataPath = path.join(this.outputPath, SITE_DATA_NAME);
    const siteData = {
      enableSearch: this.siteConfig.enableSearch,
      pages: this.pages.filter(page => page.pageConfig.searchable && page.headings)
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
      await Site.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
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
    await this.readSiteConfig();
    const depOptions = await this.getDepOptions(ciTokenVar, defaultDeployConfig, publish);
    return Site.getDepUrl(depOptions);
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

    if (ciTokenVar) {
      const ciToken = _.isBoolean(ciTokenVar) ? 'GITHUB_TOKEN' : ciTokenVar;
      if (!process.env[ciToken]) {
        throw new Error(`The environment variable ${ciToken} does not exist.`);
      }
      const githubToken = process.env[ciToken];
      let repoSlug;

      if (process.env.TRAVIS) {
        repoSlug = Site.extractRepoSlug(options.repo, process.env.TRAVIS_REPO_SLUG);

        options.user = {
          name: 'Deployment Bot',
          email: 'deploy@travis-ci.org',
        };
      } else if (process.env.APPVEYOR) {
        repoSlug = Site.extractRepoSlug(options.repo, process.env.APPVEYOR_REPO_NAME);

        options.user = {
          name: 'AppVeyorBot',
          email: 'deploy@appveyor.com',
        };
      } else if (process.env.GITHUB_ACTIONS) {
        repoSlug = Site.extractRepoSlug(options.repo, process.env.GITHUB_REPOSITORY);

        options.user = {
          name: 'github-actions',
          email: 'github-actions@github.com',
        };
      } else if (process.env.CIRCLECI) {
        repoSlug = Site.extractRepoSlug(
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
    return Site.getDeploymentUrl(git, options);
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

  /**
   * Build/copy assets that are specified in filePaths
   * @param filePaths a single path or an array of paths corresponding to the assets to build
   */
  buildAsset = delay(this._buildMultipleAssets as () => Bluebird<unknown>, 1000);

  /**
   * Remove assets that are specified in filePaths
   * @param filePaths a single path or an array of paths corresponding to the assets to remove
   */
  removeAsset = delay(this._removeMultipleAssets as () => Bluebird<unknown>, 1000);

  rebuildPagesBeingViewed = delay(this._rebuildPagesBeingViewed as () => Bluebird<unknown>, 1000);

  /**
   * Rebuild pages that are affected by changes in filePaths
   * @param filePaths a single path or an array of paths corresponding to the files that have changed
   */
  rebuildAffectedSourceFiles = delay(this._rebuildAffectedSourceFiles as () => Bluebird<unknown>, 1000);

  /**
   * Rebuild all pages
   */
  rebuildSourceFiles
  = delay(this._rebuildSourceFiles as () => Bluebird<unknown>, 1000) as () => Bluebird<unknown>;

  /**
   * Builds pages that are yet to build/rebuild in the background
   */
  backgroundBuildNotViewedFiles
  = delay(this._backgroundBuildNotViewedFiles as () => Bluebird<unknown>, 1000) as () => Bluebird<unknown>;
}
