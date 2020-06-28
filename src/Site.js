const cheerio = require('cheerio'); require('markbind/src/patches/htmlparser2');
const fs = require('fs-extra-promise');
const ghpages = require('gh-pages');
const ignore = require('ignore');
const path = require('path');
const Promise = require('bluebird');
const ProgressBar = require('progress');
const walkSync = require('walk-sync');

const injectHtmlParser2SpecialTags = require('markbind/src/patches/htmlparser2');
const injectMarkdownItSpecialTags = require('markbind/src/lib/markdown-it/markdown-it-escape-special-tags');
const njUtil = require('markbind/src/utils/nunjuckUtils');
const utils = require('markbind/src/utils');
const VariablePreprocessor = require('markbind/src/preprocessors/variablePreprocessor');

const _ = {};
_.difference = require('lodash/difference');
_.flatMap = require('lodash/flatMap');
_.get = require('lodash/get');
_.has = require('lodash/has');
_.includes = require('lodash/includes');
_.isBoolean = require('lodash/isBoolean');
_.isUndefined = require('lodash/isUndefined');
_.noop = require('lodash/noop');
_.omitBy = require('lodash/omitBy');
_.startCase = require('lodash/startCase');
_.union = require('lodash/union');
_.uniq = require('lodash/uniq');

const url = {};
url.join = path.posix.join;

const delay = require('./util/delay');
const FsUtil = require('./util/fsUtil');
const logger = require('./util/logger');
const Page = require('./Page');
const SiteConfig = require('./SiteConfig');
const Template = require('./template/template');

const CLI_VERSION = require('../package.json').version;

const {
  ABOUT_MARKDOWN_FILE,
  BUILT_IN_PLUGIN_FOLDER_NAME,
  BUILT_IN_DEFAULT_PLUGIN_FOLDER_NAME,
  CONFIG_FOLDER_NAME,
  FAVICON_DEFAULT_PATH,
  FOOTER_PATH,
  INDEX_MARKDOWN_FILE,
  LAYOUT_DEFAULT_NAME,
  LAYOUT_FOLDER_PATH,
  LAYOUT_SITE_FOLDER_NAME,
  LAZY_LOADING_SITE_FILE_NAME,
  LAZY_LOADING_BUILD_TIME_RECOMMENDATION_LIMIT,
  LAZY_LOADING_REBUILD_TIME_RECOMMENDATION_LIMIT,
  MARKBIND_PLUGIN_PREFIX,
  MARKBIND_WEBSITE_URL,
  PAGE_TEMPLATE_NAME,
  PROJECT_PLUGIN_FOLDER_NAME,
  PLUGIN_SITE_ASSET_FOLDER_NAME,
  SITE_ASSET_FOLDER_NAME,
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
  return path.join(__dirname, '..', 'node_modules', 'bootswatch', 'dist', theme, 'bootstrap.min.css');
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

const ABOUT_MARKDOWN_DEFAULT = '# About\n'
  + 'Welcome to your **About Us** page.\n';

const TOP_NAV_DEFAULT = '<header><navbar placement="top" type="inverse">\n'
  + '  <a slot="brand" href="{{baseUrl}}/index.html" title="Home" class="navbar-brand">'
  + '<i class="far fa-file-image"></i></a>\n'
  + '  <li><a href="{{baseUrl}}/index.html" class="nav-link">HOME</a></li>\n'
  + '  <li><a href="{{baseUrl}}/about.html" class="nav-link">ABOUT</a></li>\n'
  + '  <li slot="right">\n'
  + '    <form class="navbar-form">\n'
  + '      <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback"'
  + ' menu-align-right></searchbar>\n'
  + '    </form>\n'
  + '  </li>\n'
  + '</navbar></header>';

const MARKBIND_LINK_HTML = `<a href='${MARKBIND_WEBSITE_URL}'>MarkBind ${CLI_VERSION}</a>`;

class Site {
  constructor(rootPath, outputPath, onePagePath, forceReload = false, siteConfigPath = SITE_CONFIG_NAME) {
    this.rootPath = rootPath;
    this.outputPath = outputPath;
    this.tempPath = path.join(rootPath, TEMP_FOLDER_NAME);

    // MarkBind assets to be copied
    this.siteAssetsSrcPath = path.resolve(__dirname, '..', SITE_ASSET_FOLDER_NAME);
    this.siteAssetsDestPath = path.join(outputPath, TEMPLATE_SITE_ASSET_FOLDER_NAME);

    // Page template path
    this.pageTemplatePath = path.join(__dirname, PAGE_TEMPLATE_NAME);
    this.pageTemplate = njUtil.compile(fs.readFileSync(this.pageTemplatePath, 'utf8'));
    this.pages = [];

    // Other properties
    this.addressablePages = [];
    this.baseUrlMap = new Set();
    this.forceReload = forceReload;
    this.plugins = {};
    /**
     * @type {undefined | SiteConfig}
     */
    this.siteConfig = undefined;
    this.siteConfigPath = siteConfigPath;

    // Site wide variable preprocessor
    this.variablePreprocessor = undefined;

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

  static rejectHandler(reject, error, removeFolders) {
    logger.warn(error);
    Promise.all(removeFolders.map(folder => fs.removeAsync(folder)))
      .then(() => {
        reject(error);
      })
      .catch((err) => {
        reject(new Error(`${error.message}\n${err.message}`));
      });
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
  static initSite(rootPath, templatePath) {
    return new Promise((resolve, reject) => {
      new Template(rootPath, templatePath).init()
        .then(resolve)
        .catch((err) => {
          reject(new Error(`Failed to initialize site with given template with error: ${err.message}`));
        });
    });
  }

  /**
   * Changes the site variable of the current page being viewed, building it if necessary.
   * @param normalizedUrl BaseUrl-less and extension-less url of the page
   * @return Boolean of whether the page needed to be rebuilt
   */
  changeCurrentPage(normalizedUrl) {
    this.currentPageViewed = path.join(this.rootPath, normalizedUrl);

    if (this.toRebuild.has(this.currentPageViewed)) {
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
    return new Promise((resolve, reject) => {
      let files;
      try {
        files = walkSync(this.rootPath, { directories: false });
        resolve(fileIgnore.filter(files));
      } catch (error) {
        reject(error);
      }
    });
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
    return new Page({
      baseUrl: this.siteConfig.baseUrl,
      baseUrlMap: this.baseUrlMap,
      content: '',
      pluginsContext: this.siteConfig.pluginsContext,
      faviconUrl: config.faviconUrl,
      frontmatter: config.frontmatter,
      disableHtmlBeautify: this.siteConfig.disableHtmlBeautify,
      globalOverride: this.siteConfig.globalOverride,
      pageTemplate: this.pageTemplate,
      plugins: this.plugins || {},
      rootPath: this.rootPath,
      enableSearch: this.siteConfig.enableSearch,
      searchable: this.siteConfig.enableSearch && config.searchable,
      src: config.pageSrc,
      layoutsAssetPath: path.relative(path.dirname(resultPath),
                                      path.join(this.siteAssetsDestPath, LAYOUT_SITE_FOLDER_NAME)),
      layout: config.layout,
      title: config.title || '',
      titlePrefix: this.siteConfig.titlePrefix,
      headingIndexingLevel: this.siteConfig.headingIndexingLevel,
      variablePreprocessor: this.variablePreprocessor,
      sourcePath,
      resultPath,
      asset: {
        bootstrap: path.relative(path.dirname(resultPath),
                                 path.join(this.siteAssetsDestPath, 'css', 'bootstrap.min.css')),
        bootstrapVue: path.relative(path.dirname(resultPath),
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
                                 path.join(this.siteAssetsDestPath, 'css', 'github.min.css')),
        markbind: path.relative(path.dirname(resultPath),
                                path.join(this.siteAssetsDestPath, 'css', 'markbind.css')),
        pageNavCss: path.relative(path.dirname(resultPath),
                                  path.join(this.siteAssetsDestPath, 'css', 'page-nav.css')),
        siteNavCss: path.relative(path.dirname(resultPath),
                                  path.join(this.siteAssetsDestPath, 'css', 'site-nav.css')),
        bootstrapUtilityJs: path.relative(path.dirname(resultPath),
                                          path.join(this.siteAssetsDestPath, 'js',
                                                    'bootstrap-utility.min.js')),
        bootstrapVueJs: path.relative(path.dirname(resultPath),
                                      path.join(this.siteAssetsDestPath, 'js', 'bootstrap-vue.min.js')),
        polyfillJs: path.relative(path.dirname(resultPath),
                                  path.join(this.siteAssetsDestPath, 'js', 'polyfill.min.js')),
        setup: path.relative(path.dirname(resultPath),
                             path.join(this.siteAssetsDestPath, 'js', 'setup.js')),
        vue: path.relative(path.dirname(resultPath),
                           path.join(this.siteAssetsDestPath, 'js', 'vue.min.js')),
        components: path.relative(path.dirname(resultPath),
                                  path.join(this.siteAssetsDestPath, 'js', 'components.min.js')),
      },
    });
  }

  /**
   * Converts an existing GitHub wiki or docs folder to a MarkBind website.
   */
  convert() {
    return this.readSiteConfig()
      .then(() => this.collectAddressablePages())
      .then(() => this.addIndexPage())
      .then(() => this.addAboutPage())
      .then(() => this.addTopNavToDefaultLayout())
      .then(() => this.addFooterToDefaultLayout())
      .then(() => this.addSiteNavToDefaultLayout())
      .then(() => this.addDefaultLayoutToSiteConfig())
      .then(() => Site.printBaseUrlMessage());
  }

  /**
   * Copies over README.md or Home.md to default index.md if present.
   */
  addIndexPage() {
    const indexPagePath = path.join(this.rootPath, INDEX_MARKDOWN_FILE);
    const fileNames = ['README.md', 'Home.md'];
    const filePath = fileNames.find(fileName => fs.existsSync(path.join(this.rootPath, fileName)));
    // if none of the files exist, do nothing
    if (_.isUndefined(filePath)) return Promise.resolve();
    return fs.copyAsync(path.join(this.rootPath, filePath), indexPagePath)
      .catch(() => Promise.reject(new Error(`Failed to copy over ${filePath}`)));
  }

  /**
   * Adds an about page to site if not present.
   */
  addAboutPage() {
    const aboutPath = path.join(this.rootPath, ABOUT_MARKDOWN_FILE);
    return fs.accessAsync(aboutPath)
      .catch(() => {
        if (fs.existsSync(aboutPath)) {
          return Promise.resolve();
        }
        return fs.outputFileAsync(aboutPath, ABOUT_MARKDOWN_DEFAULT);
      });
  }

  /**
   * Adds top navigation menu to default layout of site.
   */
  addTopNavToDefaultLayout() {
    const siteLayoutPath = path.join(this.rootPath, LAYOUT_FOLDER_PATH);
    const siteLayoutHeaderDefaultPath = path.join(siteLayoutPath, LAYOUT_DEFAULT_NAME, 'header.md');

    return fs.outputFileAsync(siteLayoutHeaderDefaultPath, TOP_NAV_DEFAULT);
  }

  /**
   * Adds a footer to default layout of site.
   */
  addFooterToDefaultLayout() {
    const footerPath = path.join(this.rootPath, FOOTER_PATH);
    const siteLayoutPath = path.join(this.rootPath, LAYOUT_FOLDER_PATH);
    const siteLayoutFooterDefaultPath = path.join(siteLayoutPath, LAYOUT_DEFAULT_NAME, 'footer.md');
    const wikiFooterPath = path.join(this.rootPath, WIKI_FOOTER_PATH);

    return fs.accessAsync(wikiFooterPath)
      .then(() => {
        const footerContent = fs.readFileSync(wikiFooterPath, 'utf8');
        const wrappedFooterContent = `<footer>\n\t${footerContent}\n</footer>`;
        return fs.outputFileAsync(siteLayoutFooterDefaultPath, wrappedFooterContent);
      })
      .catch(() => {
        if (fs.existsSync(footerPath)) {
          return fs.copyAsync(footerPath, siteLayoutFooterDefaultPath);
        }
        return Promise.resolve();
      });
  }

  /**
   * Adds a site navigation bar to the default layout of the site.
   */
  addSiteNavToDefaultLayout() {
    const siteLayoutPath = path.join(this.rootPath, LAYOUT_FOLDER_PATH);
    const siteLayoutSiteNavDefaultPath = path.join(siteLayoutPath, LAYOUT_DEFAULT_NAME, 'navigation.md');
    const wikiSiteNavPath = path.join(this.rootPath, WIKI_SITE_NAV_PATH);

    return fs.accessAsync(wikiSiteNavPath)
      .then(() => {
        const siteNavContent = fs.readFileSync(wikiSiteNavPath, 'utf8');
        const wrappedSiteNavContent = `<navigation>\n${siteNavContent}\n</navigation>`;
        logger.info(`Copied over the existing _Sidebar.md file to ${path.relative(
          this.rootPath, siteLayoutSiteNavDefaultPath)}`
          + 'Check https://markbind.org/userGuide/tweakingThePageStructure.html#site-navigation-menus\n'
          + 'for information on site navigation menus.');
        return fs.outputFileSync(siteLayoutSiteNavDefaultPath, wrappedSiteNavContent);
      })
      .catch(() => this.buildSiteNav(siteLayoutSiteNavDefaultPath));
  }

  /**
   * Builds a site navigation file from the directory structure of the site.
   * @param siteLayoutSiteNavDefaultPath
   */
  buildSiteNav(siteLayoutSiteNavDefaultPath) {
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
    const wrappedSiteNavContent = `<navigation>\n${siteNavContent}\n</navigation>`;
    return fs.outputFileAsync(siteLayoutSiteNavDefaultPath, wrappedSiteNavContent);
  }

  /**
   * Applies the default layout to all addressable pages by modifying the site config file.
   */
  addDefaultLayoutToSiteConfig() {
    const configPath = path.join(this.rootPath, SITE_CONFIG_NAME);
    return fs.readJsonAsync(configPath)
      .then((config) => {
        const layoutObj = { glob: '**/*.+(md|mbd)', layout: LAYOUT_DEFAULT_NAME };
        config.pages.push(layoutObj);
        return fs.outputJsonAsync(configPath, config);
      });
  }

  static printBaseUrlMessage() {
    logger.info('The default base URL of your site is set to /\n'
      + 'You can change the base URL of your site by editing site.json\n'
      + 'Check https://markbind.org/userGuide/siteConfiguration.html for more information.');
    return Promise.resolve();
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

  /**
   * Collects the paths to be traversed as addressable pages
   */
  collectAddressablePages() {
    const { pages } = this.siteConfig;
    const pagesFromSrc = _.flatMap(pages.filter(page => page.src), page => (Array.isArray(page.src)
      ? page.src.map(pageSrc => ({ ...page, src: pageSrc }))
      : [page]));
    const set = new Set();
    const duplicatePages = pagesFromSrc
      .filter(page => set.size === set.add(page.src).size)
      .map(page => page.src);
    if (duplicatePages.length > 0) {
      return Promise.reject(
        new Error(`Duplicate page entries found in site config: ${_.uniq(duplicatePages).join(', ')}`));
    }
    const pagesFromGlobs = _.flatMap(pages.filter(page => page.glob), page => walkSync(this.rootPath, {
      directories: false,
      globs: Array.isArray(page.glob) ? page.glob : [page.glob],
      ignore: [CONFIG_FOLDER_NAME, SITE_FOLDER_NAME],
    }).map(filePath => ({
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

    return Promise.resolve();
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
    this.variablePreprocessor = new VariablePreprocessor(this.rootPath, this.baseUrlMap);

    return Promise.resolve();
  }

  /**
   * Collects the user defined variables map in the site/subsites
   */
  collectUserDefinedVariablesMap() {
    this.variablePreprocessor.resetUserDefinedVariablesMap();

    this.baseUrlMap.forEach((base) => {
      const userDefinedVariablesPath = path.resolve(base, USER_VARIABLES_PATH);
      const userDefinedVariablesDir = path.dirname(userDefinedVariablesPath);
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
      this.variablePreprocessor.addUserDefinedVariable(base, 'baseUrl', siteBaseUrl);
      this.variablePreprocessor.addUserDefinedVariable(base, 'MarkBind', MARKBIND_LINK_HTML);

      const $ = cheerio.load(content, { decodeEntities: false });
      $('variable,span').each((index, element) => {
        const name = $(element).attr('name') || $(element).attr('id');
        const variableSource = $(element).attr('from');

        if (variableSource !== undefined) {
          try {
            const variableFilePath = path.resolve(userDefinedVariablesDir, variableSource);
            const jsonData = fs.readFileSync(variableFilePath);
            const varData = JSON.parse(jsonData);
            Object.entries(varData).forEach(([varName, varValue]) => {
              this.variablePreprocessor.renderAndAddUserDefinedVariable(base, varName, varValue);
            });
          } catch (err) {
            logger.warn(`Error ${err.message}`);
          }
        } else {
          this.variablePreprocessor.renderAndAddUserDefinedVariable(base, name, $(element).html());
        }
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
  generate(baseUrl) {
    const startTime = new Date();
    // Create the .tmp folder for storing intermediate results.
    fs.emptydirSync(this.tempPath);
    // Clean the output folder; create it if not exist.
    fs.emptydirSync(this.outputPath);
    const lazyWebsiteGenerationString = this.onePagePath ? '(lazy) ' : '';
    logger.info(`Website generation ${lazyWebsiteGenerationString}started at ${
      startTime.toLocaleTimeString()}`);
    return new Promise((resolve, reject) => {
      this.readSiteConfig(baseUrl)
        .then(() => this.collectAddressablePages())
        .then(() => this.collectBaseUrl())
        .then(() => this.collectUserDefinedVariablesMap())
        .then(() => this.collectPlugins())
        .then(() => this.collectPluginSpecialTags())
        .then(() => this.buildAssets())
        .then(() => (this.onePagePath ? this.lazyBuildSourceFiles() : this.buildSourceFiles()))
        .then(() => this.copyMarkBindAsset())
        .then(() => this.copyComponentsAsset())
        .then(() => this.copyFontAwesomeAsset())
        .then(() => this.copyOcticonsAsset())
        .then(() => this.copyLayouts())
        .then(() => this.updateSiteData(this.onePagePath || undefined))
        .then(() => {
          const endTime = new Date();
          const totalBuildTime = (endTime - startTime) / 1000;
          logger.info(`Website generation ${lazyWebsiteGenerationString}complete! Total build time: ${
            totalBuildTime}s`);

          if (!this.onePagePath && totalBuildTime > LAZY_LOADING_BUILD_TIME_RECOMMENDATION_LIMIT) {
            logger.info('Your site took quite a while to build...'
              + 'Have you considered using markbind serve -o when writing content to speed things up?');
          }
        })
        .then(resolve)
        .catch((error) => {
          Site.rejectHandler(reject, error, [this.tempPath, this.outputPath]);
        });
    });
  }

  /**
   * Build all pages of the site
   */
  buildSourceFiles() {
    return new Promise((resolve, reject) => {
      logger.info('Generating pages...');
      this.generatePages()
        .then(() => fs.removeAsync(this.tempPath))
        .then(() => logger.info('Pages built'))
        .then(resolve)
        .catch((error) => {
          // if error, remove the site and temp folders
          Site.rejectHandler(reject, error, [this.tempPath, this.outputPath]);
        });
    });
  }

  /**
   * Adds all pages except the current page being viewed to toRebuild, flagging them for lazy building later.
   */
  lazyBuildAllPagesNotViewed() {
    this.pages.forEach((page) => {
      const normalizedUrl = FsUtil.removeExtension(page.sourcePath);
      if (normalizedUrl !== this.currentPageViewed) {
        this.toRebuild.add(normalizedUrl);
      }
    });

    return Promise.resolve();
  }

  /**
   * Only build landing page of the site, building more as the author goes to different links.
   */
  lazyBuildSourceFiles() {
    return new Promise((resolve, reject) => {
      logger.info('Generating landing page...');
      this.generateLandingPage()
        .then(() => {
          const lazyLoadingSpinnerHtmlFilePath = path.join(__dirname, LAZY_LOADING_SITE_FILE_NAME);
          const outputSpinnerHtmlFilePath = path.join(this.outputPath, LAZY_LOADING_SITE_FILE_NAME);

          return fs.copyAsync(lazyLoadingSpinnerHtmlFilePath, outputSpinnerHtmlFilePath);
        })
        .then(() => fs.removeAsync(this.tempPath))
        .then(() => this.lazyBuildAllPagesNotViewed())
        .then(() => logger.info('Landing page built, other pages will be built as you navigate to them!'))
        .then(resolve)
        .catch((error) => {
          // if error, remove the site and temp folders
          Site.rejectHandler(reject, error, [this.tempPath, this.outputPath]);
        });
    });
  }

  _rebuildAffectedSourceFiles(filePaths) {
    const filePathArray = Array.isArray(filePaths) ? filePaths : [filePaths];
    const uniquePaths = _.uniq(filePathArray);
    logger.info('Rebuilding affected source files');
    return new Promise((resolve, reject) => {
      this.regenerateAffectedPages(uniquePaths)
        .then(() => fs.removeAsync(this.tempPath))
        .then(resolve)
        .catch((error) => {
          // if error, remove the site and temp folders
          Site.rejectHandler(reject, error, [this.tempPath, this.outputPath]);
        });
    });
  }

  _rebuildPageBeingViewed(normalizedUrls) {
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
    const regeneratePagesBeingViewed = uniqueUrls.map(normalizedUrl =>
      new Promise((resolve, reject) => {
        this._setTimestampVariable();
        const pageToRebuild = this.pages.find(page =>
          FsUtil.removeExtension(page.sourcePath) === normalizedUrl);

        if (!pageToRebuild) {
          Site.rejectHandler(reject,
                             new Error(`Failed to rebuild ${normalizedUrl} during lazy loading`),
                             [this.tempPath, this.outputPath]);
        }

        this.toRebuild.delete(normalizedUrl);
        pageToRebuild.generate(new Set())
          .then(() => {
            pageToRebuild.collectHeadingsAndKeywords();

            return this.writeSiteData();
          })
          .then(() => {
            const endTime = new Date();
            const totalBuildTime = (endTime - startTime) / 1000;
            logger.info(`Lazy website regeneration complete! Total build time: ${totalBuildTime}s`);
          })
          .then(resolve)
          .catch((error) => {
            logger.error(error);
            reject(new Error(`Failed to rebuild ${normalizedUrl} during lazy loading`));
          });
      }),
    );

    return Promise.all(regeneratePagesBeingViewed)
      .then(() => fs.removeAsync(this.tempPath));
  }

  _rebuildSourceFiles() {
    logger.info('File added or removed, updating list of site\'s pages...');
    return new Promise((resolve, reject) => {
      Promise.resolve('')
        .then(() => this.updateAddressablePages())
        .then(filesToRemove => this.removeAsset(filesToRemove))
        .then(() => {
          if (this.onePagePath) {
            this.mapAddressablePagesToPages(this.addressablePages || [], this.getFavIconUrl());

            return this.rebuildPageBeingViewed(this.currentPageViewed)
              .then(() => this.lazyBuildAllPagesNotViewed());
          }

          logger.warn('Rebuilding all pages...');
          return this.buildSourceFiles();
        })
        .then(resolve)
        .catch((error) => {
          // if error, remove the site and temp folders
          Site.rejectHandler(reject, error, [this.tempPath, this.outputPath]);
        });
    });
  }

  _buildMultipleAssets(filePaths) {
    const filePathArray = Array.isArray(filePaths) ? filePaths : [filePaths];
    const uniquePaths = _.uniq(filePathArray);
    const fileIgnore = ignore().add(this.siteConfig.ignore);
    const fileRelativePaths = uniquePaths.map(filePath => path.relative(this.rootPath, filePath));
    const copyAssets = fileIgnore.filter(fileRelativePaths)
      .map(asset => fs.copyAsync(path.join(this.rootPath, asset), path.join(this.outputPath, asset)));
    return Promise.all(copyAssets)
      .then(() => logger.info('Assets built'));
  }

  _removeMultipleAssets(filePaths) {
    const filePathArray = Array.isArray(filePaths) ? filePaths : [filePaths];
    const uniquePaths = _.uniq(filePathArray);
    const fileRelativePaths = uniquePaths.map(filePath => path.relative(this.rootPath, filePath));
    const filesToRemove = fileRelativePaths.map(
      fileRelativePath => path.join(this.outputPath, fileRelativePath));
    const removeFiles = filesToRemove.map(asset => fs.removeAsync(asset));
    return Promise.all(removeFiles)
      .then(() => logger.info('Assets removed'));
  }

  buildAssets() {
    logger.info('Building assets...');
    return new Promise((resolve, reject) => {
      const outputFolder = path.relative(this.rootPath, this.outputPath);
      const fileIgnore = ignore().add([...this.siteConfig.ignore, outputFolder]);
      // Scan and copy assets (excluding ignore files).
      this.listAssets(fileIgnore)
        .then(assets =>
          assets.map(asset =>
            fs.copyAsync(path.join(this.rootPath, asset), path.join(this.outputPath, asset))),
        )
        .then(copyAssets => Promise.all(copyAssets))
        .then(() => logger.info('Assets built'))
        .then(resolve)
        .catch((error) => {
          Site.rejectHandler(reject, error, []); // assets won't affect deletion
        });
    });
  }

  /**
   * Retrieves the correct plugin path for a plugin name, if not in node_modules
   * @param rootPath root of the project
   * @param plugin name of the plugin
   */
  static getPluginPath(rootPath, plugin) {
    // Check in project folder
    const pluginPath = path.join(rootPath, PROJECT_PLUGIN_FOLDER_NAME, `${plugin}.js`);
    if (fs.existsSync(pluginPath)) {
      return pluginPath;
    }

    // Check in src folder
    const srcPath = path.join(__dirname, BUILT_IN_PLUGIN_FOLDER_NAME, `${plugin}.js`);
    if (fs.existsSync(srcPath)) {
      return srcPath;
    }

    // Check in default folder
    const defaultPath = path.join(__dirname, BUILT_IN_DEFAULT_PLUGIN_FOLDER_NAME, `${plugin}.js`);
    if (fs.existsSync(defaultPath)) {
      return defaultPath;
    }

    return '';
  }

  /**
   * Finds plugins in the site's default plugin folder
   */
  static findDefaultPlugins() {
    const globPath = path.join(__dirname, BUILT_IN_DEFAULT_PLUGIN_FOLDER_NAME);
    if (!fs.existsSync(globPath)) {
      return [];
    }
    return walkSync(globPath, {
      directories: false,
      globs: [`${MARKBIND_PLUGIN_PREFIX}*.js`],
    }).map(file => path.parse(file).name);
  }

  /**
   * Checks if a specified file path is a plugin source file
   * @param filePath file path to check
   * @returns {boolean} whether the file path matches a plugin source file path
   */
  isPluginSourceFile(filePath) {
    return this.pages.some(page => page.pluginSourceFiles.has(filePath));
  }

  /**
   * Loads a plugin
   * @param plugin name of the plugin
   * @param isDefault whether the plugin is a default plugin
   */
  loadPlugin(plugin, isDefault) {
    try {
      // Check if already loaded
      if (this.plugins[plugin]) {
        return;
      }

      const pluginPath = Site.getPluginPath(this.rootPath, plugin);
      if (isDefault && !pluginPath.startsWith(path.join(__dirname, BUILT_IN_DEFAULT_PLUGIN_FOLDER_NAME))) {
        logger.warn(`Default plugin ${plugin} will be overridden`);
      }

      // eslint-disable-next-line global-require, import/no-dynamic-require
      this.plugins[plugin] = require(pluginPath || plugin);

      if (!this.plugins[plugin].getLinks && !this.plugins[plugin].getScripts) {
        return;
      }

      // For resolving plugin asset source paths later
      this.plugins[plugin]._pluginAbsolutePath = path.dirname(require.resolve(pluginPath || plugin));
      this.plugins[plugin]._pluginAssetOutputPath = path.resolve(this.outputPath,
                                                                 PLUGIN_SITE_ASSET_FOLDER_NAME, plugin);
    } catch (e) {
      logger.warn(`Unable to load plugin ${plugin}, skipping`);
    }
  }

  /**
   * Load all plugins of the site
   */
  collectPlugins() {
    module.paths.push(path.join(this.rootPath, 'node_modules'));

    const defaultPlugins = Site.findDefaultPlugins();

    this.siteConfig.plugins
      .filter(plugin => !_.includes(defaultPlugins, plugin))
      .forEach(plugin => this.loadPlugin(plugin, false));

    const markbindPrefixRegex = new RegExp(`^${MARKBIND_PLUGIN_PREFIX}`);
    defaultPlugins.filter(plugin => !_.get(this.siteConfig,
                                           ['pluginsContext', plugin.replace(markbindPrefixRegex, ''), 'off'],
                                           false))
      .forEach(plugin => this.loadPlugin(plugin, true));
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
   * Collects the special tags of the site's plugins, and injects them into the parsers.
   */
  collectPluginSpecialTags() {
    const tagsToIgnore = new Set();

    Object.values(this.plugins).forEach((plugin) => {
      if (!plugin.getSpecialTags) {
        return;
      }

      plugin.getSpecialTags(plugin.pluginsContext).forEach((tagName) => {
        if (!tagName) {
          return;
        }

        tagsToIgnore.add(tagName.toLowerCase());
      });
    });

    injectHtmlParser2SpecialTags(tagsToIgnore);
    injectMarkdownItSpecialTags(tagsToIgnore);
    Page.htmlBeautifyOptions = {
      indent_size: 2,
      content_unformatted: ['pre', 'textarea', ...tagsToIgnore],
    };
  }

  /**
   * Renders all pages specified in site configuration file to the output folder
   */
  generatePages() {
    // Run MarkBind include and render on each source file.
    // Render the final rendered page to the output folder.
    const addressablePages = this.addressablePages || [];
    const builtFiles = new Set();
    const processingFiles = [];

    const faviconUrl = this.getFavIconUrl();

    this._setTimestampVariable();
    this.mapAddressablePagesToPages(addressablePages, faviconUrl);

    const progressBar = new ProgressBar(`[:bar] :current / ${this.pages.length} pages built`,
                                        { total: this.pages.length });
    progressBar.render();
    this.pages.forEach((page) => {
      processingFiles.push(page.generate(builtFiles)
        .then(() => progressBar.tick())
        .catch((err) => {
          logger.error(err);
          return Promise.reject(new Error(`Error while generating ${page.sourcePath}`));
        }));
    });
    return new Promise((resolve, reject) => {
      Promise.all(processingFiles)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Renders only the starting page for lazy loading to the output folder.
   */
  generateLandingPage() {
    const addressablePages = this.addressablePages || [];
    const faviconUrl = this.getFavIconUrl();

    this._setTimestampVariable();
    this.mapAddressablePagesToPages(addressablePages, faviconUrl);

    const landingPage = this.pages.find(page => page.src === this.onePagePath);
    if (!landingPage) {
      return Promise.reject(new Error(`${this.onePagePath} is not specified in the site configuration.`));
    }

    return landingPage.generate(new Set());
  }

  regenerateAffectedPages(filePaths) {
    const startTime = new Date();

    const builtFiles = new Set();
    const processingFiles = [];
    const shouldRebuildAllPages = this.collectUserDefinedVariablesMapIfNeeded(filePaths) || this.forceReload;
    if (shouldRebuildAllPages) {
      logger.warn('Rebuilding all pages as variables file was changed, or the --force-reload flag was set');
    }
    this._setTimestampVariable();
    this.pages.forEach((page) => {
      const doFilePathsHaveSourceFiles = filePaths.some((filePath) => {
        const isIncludedFile = page.includedFiles.has(filePath);
        const isPluginSourceFile = page.pluginSourceFiles.has(filePath);

        return isIncludedFile || isPluginSourceFile;
      });

      if (shouldRebuildAllPages || doFilePathsHaveSourceFiles) {
        if (this.onePagePath) {
          const normalizedSource = FsUtil.removeExtension(page.sourcePath);
          const isPageBeingViewed = normalizedSource === this.currentPageViewed;

          if (!isPageBeingViewed) {
            this.toRebuild.add(normalizedSource);
            return;
          }
        }

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
        .then(() => {
          // For lazy loading, we defer updating site data pages not being viewed,
          // even if all pages should be rebuilt, until they are navigated to.
          const shouldUpdateAllSiteData = shouldRebuildAllPages && !this.onePagePath;
          return this.updateSiteData(shouldUpdateAllSiteData ? undefined : filePaths);
        })
        .then(() => logger.info('Pages rebuilt'))
        .then(() => {
          const endTime = new Date();
          const totalBuildTime = (endTime - startTime) / 1000;
          logger.info(`Website regeneration complete! Total build time: ${totalBuildTime}s`);
          if (!this.onePagePath && totalBuildTime > LAZY_LOADING_REBUILD_TIME_RECOMMENDATION_LIMIT) {
            logger.info('Your pages took quite a while to rebuild...'
              + 'Have you considered using markbind serve -o when writing content to speed things up?');
          }
        })
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Uses heading data in built pages to generate heading and keyword information for siteData
   * Subsequently writes to siteData.json
   * @param filePaths optional array of updated file paths during live preview.
   *                  If undefined, generate site data for all pages
   */
  updateSiteData(filePaths) {
    const generateForAllPages = filePaths === undefined;
    const filePathsToUpdateData = Array.isArray(filePaths) ? filePaths : [filePaths];
    this.pages.forEach((page) => {
      if (generateForAllPages || filePathsToUpdateData.some(filePath => page.includedFiles.has(filePath))) {
        page.collectHeadingsAndKeywords();
      }
    });
    this.writeSiteData();
  }

  /**
   * Copies Font Awesome assets to the assets folder
   */
  copyFontAwesomeAsset() {
    const faRootSrcPath = path.join(__dirname, '..', 'node_modules', '@fortawesome', 'fontawesome-free');
    const faCssSrcPath = path.join(faRootSrcPath, 'css', 'all.min.css');
    const faCssDestPath = path.join(this.siteAssetsDestPath, 'fontawesome', 'css', 'all.min.css');
    const faFontsSrcPath = path.join(faRootSrcPath, 'webfonts');
    const faFontsDestPath = path.join(this.siteAssetsDestPath, 'fontawesome', 'webfonts');

    return fs.copyAsync(faCssSrcPath, faCssDestPath).then(fs.copyAsync(faFontsSrcPath, faFontsDestPath));
  }

  /**
   * Copies Octicon assets to the assets folder
   */
  copyOcticonsAsset() {
    const octiconsRootSrcPath = path.join(__dirname, '..', 'node_modules', '@primer', 'octicons', 'build');
    const octiconsCssSrcPath = path.join(octiconsRootSrcPath, 'build.css');
    const octiconsCssDestPath = path.join(this.siteAssetsDestPath, 'css', 'octicons.css');

    return fs.copyAsync(octiconsCssSrcPath, octiconsCssDestPath);
  }

  /**
   * Copies components.min.js bundle to the assets folder
   */
  copyComponentsAsset() {
    const componentsSrcPath = path.join(__dirname, '..', 'frontend', 'components', 'dist',
                                        'components.min.js');
    const componentsDestPath = path.join(this.siteAssetsDestPath, 'js', 'components.min.js');

    return fs.copyAsync(componentsSrcPath, componentsDestPath);
  }

  /**
   * Copies MarkBind assets to the assets folder
   */
  copyMarkBindAsset() {
    const maybeOverrideDefaultBootstrapTheme = () => {
      const { theme } = this.siteConfig;
      if (!theme || !_.has(SUPPORTED_THEMES_PATHS, theme)) {
        return _.noop;
      }

      const themeSrcPath = SUPPORTED_THEMES_PATHS[theme];
      const themeDestPath = path.join(this.siteAssetsDestPath, 'css', 'bootstrap.min.css');

      return new Promise((resolve, reject) => {
        fs.copyAsync(themeSrcPath, themeDestPath)
          .then(resolve)
          .catch(reject);
      });
    };

    return fs.copyAsync(this.siteAssetsSrcPath, this.siteAssetsDestPath)
      .then(maybeOverrideDefaultBootstrapTheme);
  }

  /**
   * Copies layouts to the assets folder
   */
  copyLayouts() {
    const siteLayoutPath = path.join(this.rootPath, LAYOUT_FOLDER_PATH);
    const layoutsDestPath = path.join(this.siteAssetsDestPath, LAYOUT_SITE_FOLDER_NAME);
    if (!fs.existsSync(siteLayoutPath)) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const files = walkSync(siteLayoutPath);
      resolve(files);
    }).then((files) => {
      if (!files) {
        return Promise.resolve();
      }
      const filteredFiles = files.filter(file => _.includes(file, '.') && !_.includes(file, '.md'));
      const copyAll = Promise.all(filteredFiles.map(file =>
        fs.copyAsync(path.join(siteLayoutPath, file), path.join(layoutsDestPath, file))));
      return copyAll.then(() => Promise.resolve());
    });
  }

  /**
   * Writes the site data to a file
   */
  writeSiteData() {
    return new Promise((resolve, reject) => {
      const siteDataPath = path.join(this.outputPath, SITE_DATA_NAME);
      const siteData = {
        enableSearch: this.siteConfig.enableSearch,
        pages: this.pages.filter(page => page.searchable)
          .map(page => ({
            ...page.frontMatter,
            headings: page.headings,
            headingKeywords: page.keywords,
          })),
      };

      fs.outputJsonAsync(siteDataPath, siteData)
        .then(() => logger.info('Site data built'))
        .then(resolve)
        .catch((error) => {
          Site.rejectHandler(reject, error, [this.tempPath, this.outputPath]);
        });
    });
  }

  deploy(travisTokenVar) {
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
          const basePath = this.siteConfig.deploy.baseDir || this.outputPath;
          if (!fs.existsSync(basePath)) {
            reject(new Error(
              'The site directory does not exist. Please build the site first before deploy.'));
            return undefined;
          }
          const options = {};
          options.branch = this.siteConfig.deploy.branch || defaultDeployConfig.branch;
          options.message = this.siteConfig.deploy.message || defaultDeployConfig.message;
          options.repo = this.siteConfig.deploy.repo || defaultDeployConfig.repo;

          if (travisTokenVar) {
            if (!process.env.TRAVIS) {
              reject(new Error('-t/--travis should only be run in Travis CI.'));
              return undefined;
            }
            // eslint-disable-next-line no-param-reassign
            travisTokenVar = _.isBoolean(travisTokenVar) ? 'GITHUB_TOKEN' : travisTokenVar;
            if (!process.env[travisTokenVar]) {
              reject(new Error(`The environment variable ${travisTokenVar} does not exist.`));
              return undefined;
            }

            const githubToken = process.env[travisTokenVar];
            let repoSlug = process.env.TRAVIS_REPO_SLUG;
            if (options.repo) {
              // Extract repo slug from user-specified repo URL so that we can include the access token
              const repoSlugRegex = /github\.com[:/]([\w-]+\/[\w-.]+)\.git$/;
              const repoSlugMatch = repoSlugRegex.exec(options.repo);
              if (!repoSlugMatch) {
                reject(new Error('-t/--travis expects a GitHub repository.\n'
                  + `The specified repository ${options.repo} is not valid.`));
                return undefined;
              }
              [, repoSlug] = repoSlugMatch;
            }
            options.repo = `https://${githubToken}@github.com/${repoSlug}.git`;
            options.user = {
              name: 'Deployment Bot',
              email: 'deploy@travis-ci.org',
            };
          }

          return publish(basePath, options);
        })
        .then(resolve)
        .catch(reject);
    });
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
    this.variablePreprocessor.addUserDefinedVariableForAllSites('timestamp', time);
    return Promise.resolve();
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
