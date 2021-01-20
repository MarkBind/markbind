const cheerio = require('cheerio'); require('../patches/htmlparser2');
const fs = require('fs-extra');
const ghpages = require('gh-pages');
const ignore = require('ignore');
const path = require('path');
const Promise = require('bluebird');
const ProgressBar = require('progress');
const walkSync = require('walk-sync');
const simpleGit = require('simple-git');

const SiteConfig = require('./SiteConfig');
const Page = require('../Page');
const { PageConfig } = require('../Page/PageConfig');
const VariableProcessor = require('../variables/VariableProcessor');
const VariableRenderer = require('../variables/VariableRenderer');
const { ExternalManager } = require('../External/ExternalManager');
const { LayoutManager } = require('../Layout');
const { PluginManager } = require('../plugins/PluginManager');
const Template = require('../../template/template');

const FsUtil = require('../utils/fsUtil');
const delay = require('../utils/delay');
const logger = require('../utils/logger');
const utils = require('../utils');
const gitUtil = require('../utils/git');

const {
  LAYOUT_DEFAULT_NAME,
  LAYOUT_FOLDER_PATH,
} = require('../constants');

const _ = {};
_.difference = require('lodash/difference');
_.flatMap = require('lodash/flatMap');
_.has = require('lodash/has');
_.isBoolean = require('lodash/isBoolean');
_.isUndefined = require('lodash/isUndefined');
_.noop = require('lodash/noop');
_.omitBy = require('lodash/omitBy');
_.startCase = require('lodash/startCase');
_.union = require('lodash/union');
_.uniq = require('lodash/uniq');

const url = {};
url.join = path.posix.join;

const MARKBIND_VERSION = require('../../package.json').version;

const {
  ABOUT_MARKDOWN_FILE,
  CONFIG_FOLDER_NAME,
  FAVICON_DEFAULT_PATH,
  INDEX_MARKDOWN_FILE,
  LAYOUT_SITE_FOLDER_NAME,
  LAZY_LOADING_SITE_FILE_NAME,
  LAZY_LOADING_BUILD_TIME_RECOMMENDATION_LIMIT,
  LAZY_LOADING_REBUILD_TIME_RECOMMENDATION_LIMIT,
  MARKBIND_WEBSITE_URL,
  MAX_CONCURRENT_PAGE_GENERATION_PROMISES,
  PAGE_TEMPLATE_NAME,
  SITE_CONFIG_NAME,
  SITE_DATA_NAME,
  SITE_FOLDER_NAME,
  TEMP_FOLDER_NAME,
  TEMPLATE_SITE_ASSET_FOLDER_NAME,
  USER_VARIABLES_PATH,
  WIKI_SITE_NAV_PATH,
  WIKI_FOOTER_PATH,
} = require('./constants');

function getBootswatchThemePath(theme) {
  return require.resolve(`bootswatch/dist/${theme}/bootstrap.min.css`);
}

const SUPPORTED_THEMES_PATHS = {
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
};

const HIGHLIGHT_ASSETS = {
  dark: 'codeblock-dark.min.css',
  light: 'codeblock-light.min.css',
};

const ABOUT_MARKDOWN_DEFAULT = '# About\n'
  + 'Welcome to your **About Us** page.\n';

const MARKBIND_LINK_HTML = `<a href='${MARKBIND_WEBSITE_URL}'>MarkBind ${MARKBIND_VERSION}</a>`;

class Site {
  constructor(rootPath, outputPath, onePagePath, forceReload = false,
              siteConfigPath = SITE_CONFIG_NAME, dev) {
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

    /**
     * @type {undefined | SiteConfig}
     */
    this.siteConfig = undefined;
    this.siteConfigPath = siteConfigPath;

    // Site wide variable processor
    this.variableProcessor = undefined;

    // Site wide layout manager
    this.layoutManager = undefined;

    // Site wide plugin manager
    this.pluginManager = undefined;

    // Lazy reload properties
    this.onePagePath = onePagePath;
    this.currentPageViewed = onePagePath
      ? path.resolve(this.rootPath, FsUtil.removeExtension(onePagePath))
      : '';
    this.toRebuild = new Set();
  }

  /**
   * Util Methods
   */

  static async rejectHandler(error, removeFolders) {
    logger.warn(error);
    try {
      await Promise.all(removeFolders.map(folder => fs.remove(folder)));
    } catch (err) {
      logger.error(`Failed to remove generated files after error!\n${err.message}`);
    }
  }

  static setExtension(filename, ext) {
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
   * @param templatePath
   */
  static async initSite(rootPath, templatePath) {
    try {
      return await new Template(rootPath, templatePath).init();
    } catch (err) {
      return new Error(`Failed to initialize site with given template with error: ${err.message}`);
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
  changeCurrentPage(normalizedUrl) {
    this.currentPageViewed = path.join(this.rootPath, normalizedUrl);

    if (this.toRebuild.has(this.currentPageViewed)) {
      this.beforeSiteGenerate();
      this.rebuildPageBeingViewed(this.currentPageViewed);
      return true;
    }

    return false;
  }

  /**
   * Read and store the site config from site.json, overwrite the default base URL
   * if it's specified by the user.
   * @param baseUrl user defined base URL (if exists)
   * @returns {Promise}
   */
  async readSiteConfig(baseUrl) {
    try {
      const siteConfigPath = path.join(this.rootPath, this.siteConfigPath);
      const siteConfigJson = fs.readJsonSync(siteConfigPath);
      this.siteConfig = new SiteConfig(siteConfigJson, baseUrl);

      return this.siteConfig;
    } catch (err) {
      throw (new Error(`Failed to read the site config file '${this.siteConfigPath}' at`
        + `${this.rootPath}:\n${err.message}\nPlease ensure the file exist or is valid`));
    }
  }

  listAssets(fileIgnore) {
    const files = walkSync(this.rootPath, { directories: false });
    return fileIgnore.filter(files);
  }

  /**
   * A page configuration object.
   * @typedef {Object<string, any>} PageCreationConfig
   * @property {string} faviconUrl
   * @property {string} pageSrc
   * @property {string} title
   * @property {string} layout
   * @property {Object<string, any>} frontmatter
   * @property {boolean} searchable
   * @property {Array<string>} externalScripts
   * /

  /**
   * Create a Page object from the site and page creation config.
   * @param {PageCreationConfig} config
   * @returns {Page}
   */
  createPage(config) {
    const sourcePath = path.join(this.rootPath, config.pageSrc);
    const resultPath = path.join(this.outputPath, Site.setExtension(config.pageSrc, '.html'));
    const codeTheme = this.siteConfig.style.codeTheme || 'dark';
    const pageConfig = new PageConfig({
      asset: {
        bootstrap: path.relative(path.dirname(resultPath),
                                 path.join(this.siteAssetsDestPath, 'css', 'bootstrap.min.css')),
        bootstrapVueCss: path.relative(path.dirname(resultPath),
                                       path.join(this.siteAssetsDestPath, 'css', 'bootstrap-vue.min.css')),
        externalScripts: _.union(this.siteConfig.externalScripts, config.externalScripts),
        fontAwesome: path.relative(path.dirname(resultPath),
                                   path.join(this.siteAssetsDestPath, 'fontawesome', 'css', 'all.min.css')),
        glyphicons: path.relative(path.dirname(resultPath),
                                  path.join(this.siteAssetsDestPath, 'glyphicons', 'css',
                                            'bootstrap-glyphicons.min.css')),
        octicons: path.relative(path.dirname(resultPath),
                                path.join(this.siteAssetsDestPath, 'css', 'octicons.css')),
        highlight: path.relative(path.dirname(resultPath),
                                 path.join(this.siteAssetsDestPath, 'css', HIGHLIGHT_ASSETS[codeTheme])),
        markBindCss: path.relative(path.dirname(resultPath),
                                   path.join(this.siteAssetsDestPath, 'css', 'markbind.min.css')),
        markBindJs: path.relative(path.dirname(resultPath),
                                  path.join(this.siteAssetsDestPath, 'js', 'markbind.min.js')),
        pageNavCss: path.relative(path.dirname(resultPath),
                                  path.join(this.siteAssetsDestPath, 'css', 'page-nav.css')),
        siteNavCss: path.relative(path.dirname(resultPath),
                                  path.join(this.siteAssetsDestPath, 'css', 'site-nav.css')),
        bootstrapUtilityJs: path.relative(path.dirname(resultPath),
                                          path.join(this.siteAssetsDestPath, 'js',
                                                    'bootstrap-utility.min.js')),
        polyfillJs: path.relative(path.dirname(resultPath),
                                  path.join(this.siteAssetsDestPath, 'js', 'polyfill.min.js')),
        vue: path.relative(path.dirname(resultPath),
                           path.join(this.siteAssetsDestPath, 'js', 'vue.min.js')),
        jQuery: path.relative(path.dirname(resultPath),
                              path.join(this.siteAssetsDestPath, 'js', 'jquery.min.js')),
      },
      baseUrl: this.siteConfig.baseUrl,
      baseUrlMap: this.baseUrlMap,
      dev: this.dev,
      disableHtmlBeautify: this.siteConfig.disableHtmlBeautify,
      enableSearch: this.siteConfig.enableSearch,
      faviconUrl: config.faviconUrl,
      frontmatterOverride: config.frontmatter,
      globalOverride: this.siteConfig.globalOverride,
      headingIndexingLevel: this.siteConfig.headingIndexingLevel,
      layout: config.layout,
      layoutsAssetPath: path.relative(path.dirname(resultPath),
                                      path.join(this.siteAssetsDestPath, LAYOUT_SITE_FOLDER_NAME)),
      pluginManager: this.pluginManager,
      resultPath,
      rootPath: this.rootPath,
      searchable: this.siteConfig.enableSearch && config.searchable,
      siteOutputPath: this.outputPath,
      sourcePath,
      src: config.pageSrc,
      title: config.title || '',
      titlePrefix: this.siteConfig.titlePrefix,
      template: this.pageTemplate,
      variableProcessor: this.variableProcessor,
      ignore: this.siteConfig.ignore,
      addressablePagesSource: this.addressablePagesSource,
      layoutManager: this.layoutManager,
      intrasiteLinkValidation: this.siteConfig.intrasiteLinkValidation,
    });
    return new Page(pageConfig);
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
      footer = fs.readFileSync(wikiFooterPath, 'utf8');
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
        const relativePagePathWithoutExt = FsUtil.removeExtension(
          path.relative(this.rootPath, addressablePagePath));
        const pageName = _.startCase(FsUtil.removeExtension(path.basename(addressablePagePath)));
        const pageUrl = `{{ baseUrl }}/${relativePagePathWithoutExt}.html`;
        siteNavContent += `* [${pageName}](${pageUrl})\n`;
      });

    return siteNavContent;
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
  static async writeToSiteConfig(config, configPath) {
    const layoutObj = { glob: '**/*.+(md|mbd)', layout: LAYOUT_DEFAULT_NAME };
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
      .map(filePath => Site.setExtension(filePath, '.html'));
  }

  getPageGlobPaths(page, pagesExclude) {
    return walkSync(this.rootPath, {
      directories: false,
      globs: Array.isArray(page.glob) ? page.glob : [page.glob],
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
      : [page]));
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
                                       })));
    /*
     Add pages collected from globs and merge properties for pages
     Page properties collected from src have priority over page properties from globs,
     while page properties from later entries take priority over earlier ones.
     */
    const filteredPages = {};
    pagesFromGlobs.concat(pagesFromSrc).forEach((page) => {
      const filteredPage = _.omitBy(page, _.isUndefined);
      filteredPages[page.src] = page.src in filteredPages
        ? { ...filteredPages[page.src], ...filteredPage }
        : filteredPage;
    });
    this.addressablePages = Object.values(filteredPages);
    this.addressablePagesSource.length = 0;
    this.addressablePages.forEach((page) => {
      this.addressablePagesSource.push(FsUtil.removeExtensionPosix(page.src));
    });
  }

  /**
   * Collects the base url map in the site/subsites
   * @returns {*}
   */
  collectBaseUrl() {
    const candidates = walkSync(this.rootPath, { directories: false })
      .filter(x => x.endsWith(this.siteConfigPath))
      .map(x => path.resolve(this.rootPath, x));

    this.baseUrlMap = new Set(candidates.map(candidate => path.dirname(candidate)));
    this.variableProcessor = new VariableProcessor(this.rootPath, this.baseUrlMap);

    const config = {
      baseUrlMap: this.baseUrlMap,
      baseUrl: this.siteConfig.baseUrl,
      disableHtmlBeautify: this.siteConfig.disableHtmlBeautify,
      rootPath: this.rootPath,
      outputPath: this.outputPath,
      ignore: this.siteConfig.ignore,
      addressablePagesSource: this.addressablePagesSource,
      variableProcessor: this.variableProcessor,
      intrasiteLinkValidation: this.siteConfig.intrasiteLinkValidation,
    };
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
        logger.warn(e.message);
      }

      /*
       We retrieve the baseUrl of the (sub)site by appending the relative to the configured base url
       i.e. We ignore the configured baseUrl of the sub sites.
       */
      const siteRelativePathFromRoot = utils.ensurePosix(path.relative(this.rootPath, base));
      const siteBaseUrl = siteRelativePathFromRoot === ''
        ? this.siteConfig.baseUrl
        : path.posix.join(this.siteConfig.baseUrl || '/', siteRelativePathFromRoot);
      this.variableProcessor.addUserDefinedVariable(base, 'baseUrl', siteBaseUrl);
      this.variableProcessor.addUserDefinedVariable(base, 'MarkBind', MARKBIND_LINK_HTML);

      const $ = cheerio.load(content, { decodeEntities: false });
      $('variable,span').each((index, element) => {
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
  collectUserDefinedVariablesMapIfNeeded(filePaths) {
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
   * @returns {Promise}
   */
  async generate(baseUrl) {
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
      await this.collectBaseUrl();
      this.collectUserDefinedVariablesMap();
      await this.buildAssets();
      await (this.onePagePath ? this.lazyBuildSourceFiles() : this.buildSourceFiles());
      await this.copyCoreWebAsset();
      await this.copyBootswatchTheme();
      await this.copyFontAwesomeAsset();
      await this.copyOcticonsAsset();
      await this.writeSiteData();
      this.calculateBuildTimeForGenerate(startTime, lazyWebsiteGenerationString);
    } catch (error) {
      await Site.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  /**
   * Helper function for generate().
   */
  calculateBuildTimeForGenerate(startTime, lazyWebsiteGenerationString) {
    const endTime = new Date();
    const totalBuildTime = (endTime - startTime) / 1000;
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
   * Adds all pages except the current page being viewed to toRebuild, flagging them for lazy building later.
   */
  async lazyBuildAllPagesNotViewed() {
    this.pages.forEach((page) => {
      const normalizedUrl = FsUtil.removeExtension(page.pageConfig.sourcePath);
      if (normalizedUrl !== this.currentPageViewed) {
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
      await this.lazyBuildAllPagesNotViewed();
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

  async _rebuildAffectedSourceFiles(filePaths) {
    const filePathArray = Array.isArray(filePaths) ? filePaths : [filePaths];
    const uniquePaths = _.uniq(filePathArray);
    this.beforeSiteGenerate();

    try {
      await this.layoutManager.updateLayouts(filePaths);
      await this.regenerateAffectedPages(uniquePaths);
      await fs.remove(this.tempPath);
    } catch (error) {
      await Site.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  async _rebuildPageBeingViewed(normalizedUrls) {
    const startTime = new Date();
    const normalizedUrlArray = Array.isArray(normalizedUrls) ? normalizedUrls : [normalizedUrls];
    const uniqueUrls = _.uniq(normalizedUrlArray);
    uniqueUrls.forEach(normalizedUrl => logger.info(
      `Building ${normalizedUrl} as some of its dependencies were changed since the last visit`));

    /*
     Lazy loading only builds the page being viewed, but the user may be quick enough
     to trigger multiple page builds before the first one has finished building,
     hence we need to take this into account.
     */
    const regeneratePagesBeingViewed = uniqueUrls.map(async (normalizedUrl) => {
      this._setTimestampVariable();
      const pageToRebuild = this.pages.find(page =>
        FsUtil.removeExtension(page.pageConfig.sourcePath) === normalizedUrl);

      if (!pageToRebuild) {
        return;
      }

      this.toRebuild.delete(normalizedUrl);
      try {
        await pageToRebuild.generate(this.externalManager);
        await this.writeSiteData();
        Site.calculateBuildTimeForRebuildPageBeingViewed(startTime);
      } catch (error) {
        await Site.rejectHandler(error, [this.tempPath, this.outputPath]);
      }
    });

    await Promise.all(regeneratePagesBeingViewed);
    await fs.remove(this.tempPath);
  }

  /**
   * Helper function for _rebuildPageBeingViewed().
   */
  static calculateBuildTimeForRebuildPageBeingViewed(startTime) {
    const endTime = new Date();
    const totalBuildTime = (endTime - startTime) / 1000;
    return logger.info(`Lazy website regeneration complete! Total build time: ${totalBuildTime}s`);
  }

  async _rebuildSourceFiles() {
    logger.info('Page added or removed, updating list of site\'s pages...');
    this.beforeSiteGenerate();

    this.layoutManager.removeLayouts();

    const removedPageFilePaths = this.updateAddressablePages();
    try {
      await this.removeAsset(removedPageFilePaths);
      await this.rebuildRequiredPages();
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

      await this.rebuildPageBeingViewed(this.currentPageViewed);
      await this.lazyBuildAllPagesNotViewed();
    }

    logger.warn('Rebuilding all pages...');
    await this.buildSourceFiles();
  }

  async _buildMultipleAssets(filePaths) {
    const filePathArray = Array.isArray(filePaths) ? filePaths : [filePaths];
    const uniquePaths = _.uniq(filePathArray);
    const fileIgnore = ignore().add(this.siteConfig.ignore);
    const fileRelativePaths = uniquePaths.map(filePath => path.relative(this.rootPath, filePath));
    const copyAssets = fileIgnore.filter(fileRelativePaths)
      .map(asset => fs.copy(path.join(this.rootPath, asset), path.join(this.outputPath, asset)));
    await Promise.all(copyAssets);
    logger.info('Assets built');
  }

  async _removeMultipleAssets(filePaths) {
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

  /**
   * Checks if a specified file path is a dependency of a page
   * @param {string} filePath file path to check
   * @returns {boolean} whether the file path is a dependency of any of the site's pages
   */
  isDependencyOfPage(filePath) {
    return this.pages.some(page => page.isDependency(filePath))
      || utils.ensurePosix(filePath).endsWith(USER_VARIABLES_PATH);
  }

  /**
   * Checks if a specified file path satisfies a src or glob in any of the page configurations.
   * @param {string} filePath file path to check
   * @returns {boolean} whether the file path is satisfies any glob
   */
  isFilepathAPage(filePath) {
    const { pages, pagesExclude } = this.siteConfig;
    const relativeFilePath = utils.ensurePosix(path.relative(this.rootPath, filePath));
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
   * @param {Array<Page>} addressablePages
   * @param {String} faviconUrl
   */
  mapAddressablePagesToPages(addressablePages, faviconUrl) {
    this.pages = addressablePages.map(page => this.createPage({
      faviconUrl,
      pageSrc: page.src,
      title: page.title,
      layout: page.layout,
      frontmatter: page.frontmatter,
      searchable: page.searchable !== 'no',
      externalScripts: page.externalScripts,
    }));
  }

  /**
   * Creates the supplied pages' page generation promises at a throttled rate.
   * This is done to avoid pushing too many callbacks into the event loop at once. (#1245)
   * @param {Array<Page>} pages to generate
   * @return {Promise} that resolves once all pages have generated
   */
  generatePagesThrottled(pages) {
    const progressBar = new ProgressBar(`[:bar] :current / ${pages.length} pages built`,
                                        { total: pages.length });
    progressBar.render();

    return new Promise((resolve, reject) => {
      const counter = { numPagesGenerated: 0 };

      // Map pages into array of callbacks for delayed execution
      const pageGenerationQueue = pages.map(page => async () => {
        try {
          await page.generate(this.externalManager);
          Site.generateProgressBarStatus(progressBar, counter, pageGenerationQueue, pages, resolve);
        } catch (err) {
          logger.error(err);
          reject(new Error(`Error while generating ${page.sourcePath}`));
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
   * Helper function for generatePagesThrottled().
   */
  static generateProgressBarStatus(progressBar, counter, pageGenerationQueue, pages, resolve) {
    progressBar.tick();
    counter.numPagesGenerated += 1;

    if (pageGenerationQueue.length) {
      pageGenerationQueue.pop()();
    } else if (counter.numPagesGenerated === pages.length) {
      resolve();
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

    return this.generatePagesThrottled(this.pages);
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

  async regenerateAffectedPages(filePaths) {
    const startTime = new Date();

    const shouldRebuildAllPages = this.collectUserDefinedVariablesMapIfNeeded(filePaths) || this.forceReload;
    if (shouldRebuildAllPages) {
      logger.warn('Rebuilding all pages as variables file was changed, or the --force-reload flag was set');
    }
    this._setTimestampVariable();
    const pagesToRegenerate = this.pages.filter((page) => {
      const doFilePathsHaveSourceFiles = filePaths.some(filePath => page.isDependency(filePath));

      if (shouldRebuildAllPages || doFilePathsHaveSourceFiles) {
        if (this.onePagePath) {
          const normalizedSource = FsUtil.removeExtension(page.pageConfig.sourcePath);
          const isPageBeingViewed = normalizedSource === this.currentPageViewed;

          if (!isPageBeingViewed) {
            this.toRebuild.add(normalizedSource);
            return false;
          }
        }

        return true;
      }

      return false;
    });
    if (!pagesToRegenerate.length) {
      logger.info('No pages needed to be rebuilt');
      return;
    }

    logger.info(`Rebuilding ${pagesToRegenerate.length} pages`);

    try {
      await this.generatePagesThrottled(pagesToRegenerate);
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
  calculateBuildTimeForRegenerateAffectedPages(startTime) {
    const endTime = new Date();
    const totalBuildTime = (endTime - startTime) / 1000;
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
   * Copies bootswatch theme to the assets folder if a valid theme is specified
   */
  copyBootswatchTheme() {
    const { theme } = this.siteConfig;
    if (!theme || !_.has(SUPPORTED_THEMES_PATHS, theme)) {
      return _.noop;
    }

    const themeSrcPath = SUPPORTED_THEMES_PATHS[theme];
    const themeDestPath = path.join(this.siteAssetsDestPath, 'css', 'bootstrap.min.css');

    return fs.copy(themeSrcPath, themeDestPath);
  }

  /**
   * Writes the site data to siteData.json
   */
  async writeSiteData() {
    const siteDataPath = path.join(this.outputPath, SITE_DATA_NAME);
    const siteData = {
      enableSearch: this.siteConfig.enableSearch,
      pages: this.pages.filter(page => page.pageConfig.searchable && page.headings)
        .map(page => ({
          src: page.pageConfig.src,
          title: page.title,
          headings: page.headings,
          headingKeywords: page.keywords,
        })),
    };

    try {
      await fs.outputJson(siteDataPath, siteData, { spaces: 2 });
      logger.info('Site data built');
    } catch (error) {
      await Site.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  deploy(ciTokenVar) {
    const defaultDeployConfig = {
      branch: 'gh-pages',
      message: 'Site Update.',
      repo: '',
      remote: 'origin',
    };
    process.env.NODE_DEBUG = 'gh-pages';
    return this.generateDepUrl(ciTokenVar, defaultDeployConfig);
  }

  /**
   * Helper function for deploy().
   */
  async generateDepUrl(ciTokenVar, defaultDeployConfig) {
    const publish = Promise.promisify(ghpages.publish);
    await this.readSiteConfig();
    const depOptions = await this.getDepOptions(ciTokenVar, defaultDeployConfig, publish);
    return Site.getDepUrl(depOptions, defaultDeployConfig);
  }

  /**
   * Helper function for deploy().
   */
  async getDepOptions(ciTokenVar, defaultDeployConfig, publish) {
    const basePath = this.siteConfig.deploy.baseDir || this.outputPath;
    if (!fs.existsSync(basePath)) {
      throw new Error(
        'The site directory does not exist. Please build the site first before deploy.');
    }
    const options = {};
    options.branch = this.siteConfig.deploy.branch || defaultDeployConfig.branch;
    options.message = this.siteConfig.deploy.message || defaultDeployConfig.message;
    options.repo = this.siteConfig.deploy.repo || defaultDeployConfig.repo;

    if (ciTokenVar) {
      const ciToken = _.isBoolean(ciTokenVar) ? 'GITHUB_TOKEN' : ciTokenVar;
      if (!process.env[ciToken]) {
        throw new Error(`The environment variable ${ciToken} does not exist.`);
      }
      const githubToken = process.env[ciToken];
      let repoSlug;

      if (process.env.TRAVIS) {
        if (options.repo) {
          repoSlug = Site.extractRepoSlug(options.repo);
        } else {
          repoSlug = process.env.TRAVIS_REPO_SLUG;
        }

        options.user = {
          name: 'Deployment Bot',
          email: 'deploy@travis-ci.org',
        };
      } else if (process.env.APPVEYOR) {
        if (options.repo) {
          repoSlug = Site.extractRepoSlug(options.repo);
        } else {
          repoSlug = process.env.APPVEYOR_REPO_NAME;
        }

        options.user = {
          name: 'AppVeyorBot',
          email: 'deploy@appveyor.com',
        };
      } else {
        throw new Error('-c/--ci should only be run in CI environments.');
      }

      options.repo = `https://${githubToken}@github.com/${repoSlug}.git`;
    }

    publish(basePath, options);
    return options;
  }

  /**
   * Extract repo slug from user-specified repo URL so that we can include the access token
   */
  static extractRepoSlug(repo) {
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
  static getDepUrl(options, defaultDeployConfig) {
    const git = simpleGit({ baseDir: process.cwd() });
    options.remote = defaultDeployConfig.remote;
    return Site.getDeploymentUrl(git, options);
  }

  /**
   * Gets the deployed website's url, returning null if there was an error retrieving it.
   */
  static async getDeploymentUrl(git, options) {
    const HTTPS_PREAMBLE = 'https://';
    const SSH_PREAMBLE = 'git@github.com:';
    const GITHUB_IO_PART = 'github.io';

    // https://<name|org name>.github.io/<repo name>/
    function constructGhPagesUrl(remoteUrl) {
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
      const promiseResults = await Promise.all(promises);
      const generateGhPagesUrl = (results) => {
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
    const options = {
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
}

/**
 * Below are functions that are not compatible with the ES6 class syntax.
 */

/**
 * Build/copy assets that are specified in filePaths
 * @param filePaths a single path or an array of paths corresponding to the assets to build
 */
Site.prototype.buildAsset = delay(Site.prototype._buildMultipleAssets, 1000);

Site.prototype.rebuildPageBeingViewed = delay(Site.prototype._rebuildPageBeingViewed, 1000);

/**
 * Rebuild pages that are affected by changes in filePaths
 * @param filePaths a single path or an array of paths corresponding to the files that have changed
 */
Site.prototype.rebuildAffectedSourceFiles = delay(Site.prototype._rebuildAffectedSourceFiles, 1000);

/**
 * Rebuild all pages
 * @param filePaths a single path or an array of paths corresponding to the files that have changed
 */
Site.prototype.rebuildSourceFiles = delay(Site.prototype._rebuildSourceFiles, 1000);

/**
 * Remove assets that are specified in filePaths
 * @param filePaths a single path or an array of paths corresponding to the assets to remove
 */
Site.prototype.removeAsset = delay(Site.prototype._removeMultipleAssets, 1000);

module.exports = Site;
