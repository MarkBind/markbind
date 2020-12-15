var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var cheerio = require('cheerio');
require('../patches/htmlparser2');
var fs = require('fs-extra');
var ghpages = require('gh-pages');
var ignore = require('ignore');
var path = require('path');
var Promise = require('bluebird');
var ProgressBar = require('progress');
var walkSync = require('walk-sync');
var simpleGit = require('simple-git');
var SiteConfig = require('./SiteConfig');
var Page = require('../Page');
var PageConfig = require('../Page/PageConfig').PageConfig;
var VariableProcessor = require('../variables/VariableProcessor');
var VariableRenderer = require('../variables/VariableRenderer');
var ExternalManager = require('../External/ExternalManager').ExternalManager;
var LayoutManager = require('../Layout').LayoutManager;
var PluginManager = require('../plugins/PluginManager').PluginManager;
var Template = require('../../template/template');
var FsUtil = require('../utils/fsUtil');
var delay = require('../utils/delay');
var logger = require('../utils/logger');
var utils = require('../utils');
var gitUtil = require('../utils/git');
var _a = require('../constants'), LAYOUT_DEFAULT_NAME = _a.LAYOUT_DEFAULT_NAME, LAYOUT_FOLDER_PATH = _a.LAYOUT_FOLDER_PATH;
var _ = {};
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
var url = {};
url.join = path.posix.join;
var MARKBIND_VERSION = require('../../package.json').version;
var _b = require('./constants'), ABOUT_MARKDOWN_FILE = _b.ABOUT_MARKDOWN_FILE, CONFIG_FOLDER_NAME = _b.CONFIG_FOLDER_NAME, FAVICON_DEFAULT_PATH = _b.FAVICON_DEFAULT_PATH, INDEX_MARKDOWN_FILE = _b.INDEX_MARKDOWN_FILE, LAYOUT_SITE_FOLDER_NAME = _b.LAYOUT_SITE_FOLDER_NAME, LAZY_LOADING_SITE_FILE_NAME = _b.LAZY_LOADING_SITE_FILE_NAME, LAZY_LOADING_BUILD_TIME_RECOMMENDATION_LIMIT = _b.LAZY_LOADING_BUILD_TIME_RECOMMENDATION_LIMIT, LAZY_LOADING_REBUILD_TIME_RECOMMENDATION_LIMIT = _b.LAZY_LOADING_REBUILD_TIME_RECOMMENDATION_LIMIT, MARKBIND_WEBSITE_URL = _b.MARKBIND_WEBSITE_URL, MAX_CONCURRENT_PAGE_GENERATION_PROMISES = _b.MAX_CONCURRENT_PAGE_GENERATION_PROMISES, PAGE_TEMPLATE_NAME = _b.PAGE_TEMPLATE_NAME, SITE_CONFIG_NAME = _b.SITE_CONFIG_NAME, SITE_DATA_NAME = _b.SITE_DATA_NAME, SITE_FOLDER_NAME = _b.SITE_FOLDER_NAME, TEMP_FOLDER_NAME = _b.TEMP_FOLDER_NAME, TEMPLATE_SITE_ASSET_FOLDER_NAME = _b.TEMPLATE_SITE_ASSET_FOLDER_NAME, USER_VARIABLES_PATH = _b.USER_VARIABLES_PATH, WIKI_SITE_NAV_PATH = _b.WIKI_SITE_NAV_PATH, WIKI_FOOTER_PATH = _b.WIKI_FOOTER_PATH;
function getBootswatchThemePath(theme) {
    return require.resolve("bootswatch/dist/" + theme + "/bootstrap.min.css");
}
var SUPPORTED_THEMES_PATHS = {
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
var HIGHLIGHT_ASSETS = {
    dark: 'codeblock-dark.min.css',
    light: 'codeblock-light.min.css',
};
var ABOUT_MARKDOWN_DEFAULT = '# About\n'
    + 'Welcome to your **About Us** page.\n';
var MARKBIND_LINK_HTML = "<a href='" + MARKBIND_WEBSITE_URL + "'>MarkBind " + MARKBIND_VERSION + "</a>";
var Site = /** @class */ (function () {
    function Site(rootPath, outputPath, onePagePath, forceReload, siteConfigPath, dev) {
        if (forceReload === void 0) { forceReload = false; }
        if (siteConfigPath === void 0) { siteConfigPath = SITE_CONFIG_NAME; }
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
    Site.rejectHandler = function (error, removeFolders) {
        logger.warn(error);
        return Promise.all(removeFolders.map(function (folder) { return fs.remove(folder); }))
            .catch(function (err) {
            logger.error("Failed to remove generated files after error!\n" + err.message);
        });
    };
    Site.setExtension = function (filename, ext) {
        return path.join(path.dirname(filename), path.basename(filename, path.extname(filename)) + ext);
    };
    /**
     * Static method for initializing a markbind site.
     * Generate the site.json and an index.md file.
     *
     * @param rootPath
     * @param templatePath
     */
    Site.initSite = function (rootPath, templatePath) {
        return new Promise(function (resolve, reject) {
            new Template(rootPath, templatePath).init()
                .then(resolve)
                .catch(function (err) {
                reject(new Error("Failed to initialize site with given template with error: " + err.message));
            });
        });
    };
    Site.prototype.beforeSiteGenerate = function () {
        this.variableProcessor.invalidateCache();
        this.externalManager.reset();
        this.pluginManager.beforeSiteGenerate();
    };
    /**
     * Changes the site variable of the current page being viewed, building it if necessary.
     * @param normalizedUrl BaseUrl-less and extension-less url of the page
     * @return Boolean of whether the page needed to be rebuilt
     */
    Site.prototype.changeCurrentPage = function (normalizedUrl) {
        this.currentPageViewed = path.join(this.rootPath, normalizedUrl);
        if (this.toRebuild.has(this.currentPageViewed)) {
            this.beforeSiteGenerate();
            this.rebuildPageBeingViewed(this.currentPageViewed);
            return true;
        }
        return false;
    };
    /**
     * Read and store the site config from site.json, overwrite the default base URL
     * if it's specified by the user.
     * @param baseUrl user defined base URL (if exists)
     * @returns {Promise}
     */
    Site.prototype.readSiteConfig = function (baseUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var siteConfigPath, siteConfigJson;
            return __generator(this, function (_a) {
                try {
                    siteConfigPath = path.join(this.rootPath, this.siteConfigPath);
                    siteConfigJson = fs.readJsonSync(siteConfigPath);
                    this.siteConfig = new SiteConfig(siteConfigJson, baseUrl);
                    return [2 /*return*/, this.siteConfig];
                }
                catch (err) {
                    throw (new Error("Failed to read the site config file '" + this.siteConfigPath + "' at"
                        + (this.rootPath + ":\n" + err.message + "\nPlease ensure the file exist or is valid")));
                }
                return [2 /*return*/];
            });
        });
    };
    Site.prototype.listAssets = function (fileIgnore) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var files;
            try {
                files = walkSync(_this.rootPath, { directories: false });
                resolve(fileIgnore.filter(files));
            }
            catch (error) {
                reject(error);
            }
        });
    };
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
    Site.prototype.createPage = function (config) {
        var sourcePath = path.join(this.rootPath, config.pageSrc);
        var resultPath = path.join(this.outputPath, Site.setExtension(config.pageSrc, '.html'));
        var codeTheme = this.siteConfig.style.codeTheme || 'dark';
        var pageConfig = new PageConfig({
            asset: {
                bootstrap: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'css', 'bootstrap.min.css')),
                bootstrapVueCss: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'css', 'bootstrap-vue.min.css')),
                externalScripts: _.union(this.siteConfig.externalScripts, config.externalScripts),
                fontAwesome: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'fontawesome', 'css', 'all.min.css')),
                glyphicons: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'glyphicons', 'css', 'bootstrap-glyphicons.min.css')),
                octicons: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'css', 'octicons.css')),
                highlight: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'css', HIGHLIGHT_ASSETS[codeTheme])),
                markBindCss: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'css', 'markbind.min.css')),
                markBindJs: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'js', 'markbind.min.js')),
                pageNavCss: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'css', 'page-nav.css')),
                siteNavCss: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'css', 'site-nav.css')),
                bootstrapUtilityJs: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'js', 'bootstrap-utility.min.js')),
                polyfillJs: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'js', 'polyfill.min.js')),
                vue: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'js', 'vue.min.js')),
                jQuery: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, 'js', 'jquery.min.js')),
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
            layoutsAssetPath: path.relative(path.dirname(resultPath), path.join(this.siteAssetsDestPath, LAYOUT_SITE_FOLDER_NAME)),
            pluginManager: this.pluginManager,
            resultPath: resultPath,
            rootPath: this.rootPath,
            searchable: this.siteConfig.enableSearch && config.searchable,
            siteOutputPath: this.outputPath,
            sourcePath: sourcePath,
            src: config.pageSrc,
            title: config.title || '',
            titlePrefix: this.siteConfig.titlePrefix,
            template: this.pageTemplate,
            variableProcessor: this.variableProcessor,
            ignore: this.siteConfig.ignore,
            addressablePagesSource: this.addressablePagesSource,
            layoutManager: this.layoutManager,
        });
        return new Page(pageConfig);
    };
    /**
     * Converts an existing GitHub wiki or docs folder to a MarkBind website.
     */
    Site.prototype.convert = function () {
        var _this = this;
        return this.readSiteConfig()
            .then(function () { return _this.collectAddressablePages(); })
            .then(function () { return _this.addIndexPage(); })
            .then(function () { return _this.addAboutPage(); })
            .then(function () { return _this.addDefaultLayoutFiles(); })
            .then(function () { return _this.addDefaultLayoutToSiteConfig(); })
            .then(function () { return Site.printBaseUrlMessage(); });
    };
    /**
     * Copies over README.md or Home.md to default index.md if present.
     */
    Site.prototype.addIndexPage = function () {
        var _this = this;
        var indexPagePath = path.join(this.rootPath, INDEX_MARKDOWN_FILE);
        var fileNames = ['README.md', 'Home.md'];
        var filePath = fileNames.find(function (fileName) { return fs.existsSync(path.join(_this.rootPath, fileName)); });
        // if none of the files exist, do nothing
        if (_.isUndefined(filePath))
            return Promise.resolve();
        return fs.copy(path.join(this.rootPath, filePath), indexPagePath)
            .catch(function () { return Promise.reject(new Error("Failed to copy over " + filePath)); });
    };
    /**
     * Adds an about page to site if not present.
     */
    Site.prototype.addAboutPage = function () {
        var aboutPath = path.join(this.rootPath, ABOUT_MARKDOWN_FILE);
        return fs.access(aboutPath)
            .catch(function () {
            if (fs.existsSync(aboutPath)) {
                return Promise.resolve();
            }
            return fs.outputFile(aboutPath, ABOUT_MARKDOWN_DEFAULT);
        });
    };
    /**
     * Adds a footer to default layout of site.
     */
    Site.prototype.addDefaultLayoutFiles = function () {
        var wikiFooterPath = path.join(this.rootPath, WIKI_FOOTER_PATH);
        var footer;
        if (fs.existsSync(wikiFooterPath)) {
            logger.info("Copied over the existing " + WIKI_FOOTER_PATH + " file to the converted layout");
            footer = fs.readFileSync(wikiFooterPath, 'utf8');
        }
        var wikiSiteNavPath = path.join(this.rootPath, WIKI_SITE_NAV_PATH);
        var siteNav;
        if (fs.existsSync(wikiSiteNavPath)) {
            logger.info("Copied over the existing " + WIKI_SITE_NAV_PATH + " file to the converted layout\n"
                + 'Check https://markbind.org/userGuide/tweakingThePageStructure.html#site-navigation-menus\n'
                + 'for information on site navigation menus.');
            siteNav = fs.readFileSync(wikiSiteNavPath, 'utf8');
        }
        else {
            siteNav = this.buildSiteNav();
        }
        var convertedLayoutTemplate = VariableRenderer.compile(fs.readFileSync(path.join(__dirname, 'siteConvertLayout.njk'), 'utf8'));
        var renderedLayout = convertedLayoutTemplate.render({
            footer: footer,
            siteNav: siteNav,
        });
        var layoutOutputPath = path.join(this.rootPath, LAYOUT_FOLDER_PATH, LAYOUT_DEFAULT_NAME);
        fs.writeFileSync(layoutOutputPath, renderedLayout, 'utf-8');
    };
    /**
     * Builds a site navigation file from the directory structure of the site.
     */
    Site.prototype.buildSiteNav = function () {
        var _this = this;
        var siteNavContent = '';
        this.addressablePages
            .filter(function (addressablePage) { return !addressablePage.src.startsWith('_'); })
            .forEach(function (page) {
            var addressablePagePath = path.join(_this.rootPath, page.src);
            var relativePagePathWithoutExt = FsUtil.removeExtension(path.relative(_this.rootPath, addressablePagePath));
            var pageName = _.startCase(FsUtil.removeExtension(path.basename(addressablePagePath)));
            var pageUrl = "{{ baseUrl }}/" + relativePagePathWithoutExt + ".html";
            siteNavContent += "* [" + pageName + "](" + pageUrl + ")\n";
        });
        return siteNavContent;
    };
    /**
     * Applies the default layout to all addressable pages by modifying the site config file.
     */
    Site.prototype.addDefaultLayoutToSiteConfig = function () {
        var configPath = path.join(this.rootPath, SITE_CONFIG_NAME);
        return fs.readJson(configPath)
            .then(function (config) {
            var layoutObj = { glob: '**/*.+(md|mbd)', layout: LAYOUT_DEFAULT_NAME };
            config.pages.push(layoutObj);
            return fs.outputJson(configPath, config);
        });
    };
    Site.printBaseUrlMessage = function () {
        logger.info('The default base URL of your site is set to /\n'
            + 'You can change the base URL of your site by editing site.json\n'
            + 'Check https://markbind.org/userGuide/siteConfiguration.html for more information.');
        return Promise.resolve();
    };
    /**
     * Updates the paths to be traversed as addressable pages and returns a list of filepaths to be deleted
     */
    Site.prototype.updateAddressablePages = function () {
        var oldAddressablePagesSources = this.addressablePages.slice().map(function (page) { return page.src; });
        this.collectAddressablePages();
        var newAddressablePagesSources = this.addressablePages.map(function (page) { return page.src; });
        return _.difference(oldAddressablePagesSources, newAddressablePagesSources)
            .map(function (filePath) { return Site.setExtension(filePath, '.html'); });
    };
    Site.prototype.getPageGlobPaths = function (page, pagesExclude) {
        return walkSync(this.rootPath, {
            directories: false,
            globs: Array.isArray(page.glob) ? page.glob : [page.glob],
            ignore: __spreadArrays([
                CONFIG_FOLDER_NAME,
                SITE_FOLDER_NAME
            ], pagesExclude.concat(page.globExclude || [])),
        });
    };
    /**
     * Collects the paths to be traversed as addressable pages
     */
    Site.prototype.collectAddressablePages = function () {
        var _this = this;
        var _a = this.siteConfig, pages = _a.pages, pagesExclude = _a.pagesExclude;
        var pagesFromSrc = _.flatMap(pages.filter(function (page) { return page.src; }), function (page) { return (Array.isArray(page.src)
            ? page.src.map(function (pageSrc) { return (__assign(__assign({}, page), { src: pageSrc })); })
            : [page]); });
        var set = new Set();
        var duplicatePages = pagesFromSrc
            .filter(function (page) { return set.size === set.add(page.src).size; })
            .map(function (page) { return page.src; });
        if (duplicatePages.length > 0) {
            return Promise.reject(new Error("Duplicate page entries found in site config: " + _.uniq(duplicatePages).join(', ')));
        }
        var pagesFromGlobs = _.flatMap(pages.filter(function (page) { return page.glob; }), function (page) { return _this.getPageGlobPaths(page, pagesExclude)
            .map(function (filePath) { return ({
            src: filePath,
            searchable: page.searchable,
            layout: page.layout,
            frontmatter: page.frontmatter,
        }); }); });
        /*
         Add pages collected from globs and merge properties for pages
         Page properties collected from src have priority over page properties from globs,
         while page properties from later entries take priority over earlier ones.
         */
        var filteredPages = {};
        pagesFromGlobs.concat(pagesFromSrc).forEach(function (page) {
            var filteredPage = _.omitBy(page, _.isUndefined);
            filteredPages[page.src] = page.src in filteredPages
                ? __assign(__assign({}, filteredPages[page.src]), filteredPage) : filteredPage;
        });
        this.addressablePages = Object.values(filteredPages);
        this.addressablePagesSource.length = 0;
        this.addressablePages.forEach(function (page) {
            _this.addressablePagesSource.push(FsUtil.removeExtensionPosix(page.src));
        });
        return Promise.resolve();
    };
    /**
     * Collects the base url map in the site/subsites
     * @returns {*}
     */
    Site.prototype.collectBaseUrl = function () {
        var _this = this;
        var candidates = walkSync(this.rootPath, { directories: false })
            .filter(function (x) { return x.endsWith(_this.siteConfigPath); })
            .map(function (x) { return path.resolve(_this.rootPath, x); });
        this.baseUrlMap = new Set(candidates.map(function (candidate) { return path.dirname(candidate); }));
        this.variableProcessor = new VariableProcessor(this.rootPath, this.baseUrlMap);
        var config = {
            baseUrlMap: this.baseUrlMap,
            baseUrl: this.siteConfig.baseUrl,
            disableHtmlBeautify: this.siteConfig.disableHtmlBeautify,
            rootPath: this.rootPath,
            outputPath: this.outputPath,
            ignore: this.siteConfig.ignore,
            addressablePagesSource: this.addressablePagesSource,
            variableProcessor: this.variableProcessor,
        };
        this.pluginManager = new PluginManager(config, this.siteConfig.plugins, this.siteConfig.pluginsContext);
        config.pluginManager = this.pluginManager;
        this.externalManager = new ExternalManager(config);
        config.externalManager = this.externalManager;
        this.layoutManager = new LayoutManager(config);
    };
    /**
     * Collects the user defined variables map in the site/subsites
     */
    Site.prototype.collectUserDefinedVariablesMap = function () {
        var _this = this;
        this.variableProcessor.resetUserDefinedVariablesMap();
        this.baseUrlMap.forEach(function (base) {
            var userDefinedVariablesPath = path.resolve(base, USER_VARIABLES_PATH);
            var content;
            try {
                content = fs.readFileSync(userDefinedVariablesPath, 'utf8');
            }
            catch (e) {
                content = '';
                logger.warn(e.message);
            }
            /*
             We retrieve the baseUrl of the (sub)site by appending the relative to the configured base url
             i.e. We ignore the configured baseUrl of the sub sites.
             */
            var siteRelativePathFromRoot = utils.ensurePosix(path.relative(_this.rootPath, base));
            var siteBaseUrl = siteRelativePathFromRoot === ''
                ? _this.siteConfig.baseUrl
                : path.posix.join(_this.siteConfig.baseUrl || '/', siteRelativePathFromRoot);
            _this.variableProcessor.addUserDefinedVariable(base, 'baseUrl', siteBaseUrl);
            _this.variableProcessor.addUserDefinedVariable(base, 'MarkBind', MARKBIND_LINK_HTML);
            var $ = cheerio.load(content, { decodeEntities: false });
            $('variable,span').each(function (index, element) {
                var name = $(element).attr('name') || $(element).attr('id');
                _this.variableProcessor.renderAndAddUserDefinedVariable(base, name, $(element).html());
            });
        });
    };
    /**
     * Collects the user defined variables map in the site/subsites
     * if there is a change in the variables file
     * @param filePaths array of paths corresponding to files that have changed
     */
    Site.prototype.collectUserDefinedVariablesMapIfNeeded = function (filePaths) {
        var variablesPath = path.resolve(this.rootPath, USER_VARIABLES_PATH);
        if (filePaths.includes(variablesPath)) {
            this.collectUserDefinedVariablesMap();
            return true;
        }
        return false;
    };
    /**
     * Generate the website.
     * @param baseUrl user defined base URL (if exists)
     * @returns {Promise}
     */
    Site.prototype.generate = function (baseUrl) {
        var _this = this;
        var startTime = new Date();
        // Create the .tmp folder for storing intermediate results.
        fs.emptydirSync(this.tempPath);
        // Clean the output folder; create it if not exist.
        fs.emptydirSync(this.outputPath);
        var lazyWebsiteGenerationString = this.onePagePath ? '(lazy) ' : '';
        logger.info("Website generation " + lazyWebsiteGenerationString + "started at " + startTime.toLocaleTimeString());
        return this.readSiteConfig(baseUrl)
            .then(function () { return _this.collectAddressablePages(); })
            .then(function () { return _this.collectBaseUrl(); })
            .then(function () { return _this.collectUserDefinedVariablesMap(); })
            .then(function () { return _this.buildAssets(); })
            .then(function () { return (_this.onePagePath ? _this.lazyBuildSourceFiles() : _this.buildSourceFiles()); })
            .then(function () { return _this.copyCoreWebAsset(); })
            .then(function () { return _this.copyBootswatchTheme(); })
            .then(function () { return _this.copyFontAwesomeAsset(); })
            .then(function () { return _this.copyOcticonsAsset(); })
            .then(function () { return _this.writeSiteData(); })
            .then(function () {
            var endTime = new Date();
            var totalBuildTime = (endTime - startTime) / 1000;
            logger.info("Website generation " + lazyWebsiteGenerationString + "complete! Total build time: " + totalBuildTime + "s");
            if (!_this.onePagePath && totalBuildTime > LAZY_LOADING_BUILD_TIME_RECOMMENDATION_LIMIT) {
                logger.info('Your site took quite a while to build...'
                    + 'Have you considered using markbind serve -o when writing content to speed things up?');
            }
        })
            .catch(function (error) { return Site.rejectHandler(error, [_this.tempPath, _this.outputPath]); });
    };
    /**
     * Build all pages of the site
     */
    Site.prototype.buildSourceFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.beforeSiteGenerate();
                logger.info('Generating pages...');
                return [2 /*return*/, this.generatePages()
                        .then(function () { return fs.remove(_this.tempPath); })
                        .then(function () { return logger.info('Pages built'); })
                        .catch(function (error) { return Site.rejectHandler(error, [_this.tempPath, _this.outputPath]); })];
            });
        });
    };
    /**
     * Adds all pages except the current page being viewed to toRebuild, flagging them for lazy building later.
     */
    Site.prototype.lazyBuildAllPagesNotViewed = function () {
        var _this = this;
        this.pages.forEach(function (page) {
            var normalizedUrl = FsUtil.removeExtension(page.pageConfig.sourcePath);
            if (normalizedUrl !== _this.currentPageViewed) {
                _this.toRebuild.add(normalizedUrl);
            }
        });
        return Promise.resolve();
    };
    /**
     * Only build landing page of the site, building more as the author goes to different links.
     */
    Site.prototype.lazyBuildSourceFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.beforeSiteGenerate();
                logger.info('Generating landing page...');
                return [2 /*return*/, this.generateLandingPage()
                        .then(function () {
                        var lazyLoadingSpinnerHtmlFilePath = path.join(__dirname, LAZY_LOADING_SITE_FILE_NAME);
                        var outputSpinnerHtmlFilePath = path.join(_this.outputPath, LAZY_LOADING_SITE_FILE_NAME);
                        return fs.copy(lazyLoadingSpinnerHtmlFilePath, outputSpinnerHtmlFilePath);
                    })
                        .then(function () { return fs.remove(_this.tempPath); })
                        .then(function () { return _this.lazyBuildAllPagesNotViewed(); })
                        .then(function () { return logger.info('Landing page built, other pages will be built as you navigate to them!'); })
                        .catch(function (error) { return Site.rejectHandler(error, [_this.tempPath, _this.outputPath]); })];
            });
        });
    };
    Site.prototype._rebuildAffectedSourceFiles = function (filePaths) {
        var _this = this;
        var filePathArray = Array.isArray(filePaths) ? filePaths : [filePaths];
        var uniquePaths = _.uniq(filePathArray);
        this.beforeSiteGenerate();
        return this.layoutManager.updateLayouts(filePaths)
            .then(function () { return _this.regenerateAffectedPages(uniquePaths); })
            .then(function () { return fs.remove(_this.tempPath); })
            .catch(function (error) { return Site.rejectHandler(error, [_this.tempPath, _this.outputPath]); });
    };
    Site.prototype._rebuildPageBeingViewed = function (normalizedUrls) {
        var _this = this;
        var startTime = new Date();
        var normalizedUrlArray = Array.isArray(normalizedUrls) ? normalizedUrls : [normalizedUrls];
        var uniqueUrls = _.uniq(normalizedUrlArray);
        uniqueUrls.forEach(function (normalizedUrl) { return logger.info("Building " + normalizedUrl + " as some of its dependencies were changed since the last visit"); });
        /*
         Lazy loading only builds the page being viewed, but the user may be quick enough
         to trigger multiple page builds before the first one has finished building,
         hence we need to take this into account.
         */
        var regeneratePagesBeingViewed = uniqueUrls.map(function (normalizedUrl) {
            _this._setTimestampVariable();
            var pageToRebuild = _this.pages.find(function (page) {
                return FsUtil.removeExtension(page.pageConfig.sourcePath) === normalizedUrl;
            });
            if (!pageToRebuild) {
                return Promise.resolve();
            }
            _this.toRebuild.delete(normalizedUrl);
            return pageToRebuild.generate(_this.externalManager)
                .then(function () { return _this.writeSiteData(); })
                .then(function () {
                var endTime = new Date();
                var totalBuildTime = (endTime - startTime) / 1000;
                logger.info("Lazy website regeneration complete! Total build time: " + totalBuildTime + "s");
            })
                .catch(function (error) { return Site.rejectHandler(error, [_this.tempPath, _this.outputPath]); });
        });
        return Promise.all(regeneratePagesBeingViewed)
            .then(function () { return fs.remove(_this.tempPath); });
    };
    Site.prototype._rebuildSourceFiles = function () {
        var _this = this;
        logger.info('Page added or removed, updating list of site\'s pages...');
        this.beforeSiteGenerate();
        this.layoutManager.removeLayouts();
        var removedPageFilePaths = this.updateAddressablePages();
        return this.removeAsset(removedPageFilePaths)
            .then(function () {
            if (_this.onePagePath) {
                _this.mapAddressablePagesToPages(_this.addressablePages || [], _this.getFavIconUrl());
                return _this.rebuildPageBeingViewed(_this.currentPageViewed)
                    .then(function () { return _this.lazyBuildAllPagesNotViewed(); });
            }
            logger.warn('Rebuilding all pages...');
            return _this.buildSourceFiles();
        })
            .catch(function (error) { return Site.rejectHandler(error, [_this.tempPath, _this.outputPath]); });
    };
    Site.prototype._buildMultipleAssets = function (filePaths) {
        var _this = this;
        var filePathArray = Array.isArray(filePaths) ? filePaths : [filePaths];
        var uniquePaths = _.uniq(filePathArray);
        var fileIgnore = ignore().add(this.siteConfig.ignore);
        var fileRelativePaths = uniquePaths.map(function (filePath) { return path.relative(_this.rootPath, filePath); });
        var copyAssets = fileIgnore.filter(fileRelativePaths)
            .map(function (asset) { return fs.copy(path.join(_this.rootPath, asset), path.join(_this.outputPath, asset)); });
        return Promise.all(copyAssets)
            .then(function () { return logger.info('Assets built'); });
    };
    Site.prototype._removeMultipleAssets = function (filePaths) {
        var _this = this;
        var filePathArray = Array.isArray(filePaths) ? filePaths : [filePaths];
        var uniquePaths = _.uniq(filePathArray);
        var fileRelativePaths = uniquePaths.map(function (filePath) { return path.relative(_this.rootPath, filePath); });
        var filesToRemove = fileRelativePaths.map(function (fileRelativePath) { return path.join(_this.outputPath, fileRelativePath); });
        var removeFiles = filesToRemove.map(function (asset) { return fs.remove(asset); });
        return removeFiles.length === 0
            ? Promise.resolve('')
            : Promise.all(removeFiles)
                .then(function () { return logger.debug('Assets removed'); });
    };
    Site.prototype.buildAssets = function () {
        var _this = this;
        logger.info('Building assets...');
        var outputFolder = path.relative(this.rootPath, this.outputPath);
        var fileIgnore = ignore().add(__spreadArrays(this.siteConfig.ignore, [outputFolder]));
        // Scan and copy assets (excluding ignore files).
        return this.listAssets(fileIgnore)
            .then(function (assets) {
            return assets.map(function (asset) {
                return fs.copy(path.join(_this.rootPath, asset), path.join(_this.outputPath, asset));
            });
        })
            .then(function (copyAssets) { return Promise.all(copyAssets); })
            .then(function () { return logger.info('Assets built'); })
            .catch(function (error) { return Site.rejectHandler(error, []); }); // assets won't affect deletion
    };
    /**
     * Checks if a specified file path is a dependency of a page
     * @param {string} filePath file path to check
     * @returns {boolean} whether the file path is a dependency of any of the site's pages
     */
    Site.prototype.isDependencyOfPage = function (filePath) {
        return this.pages.some(function (page) { return page.isDependency(filePath); });
    };
    /**
     * Checks if a specified file path satisfies a src or glob in any of the page configurations.
     * @param {string} filePath file path to check
     * @returns {boolean} whether the file path is satisfies any glob
     */
    Site.prototype.isFilepathAPage = function (filePath) {
        var _this = this;
        var _a = this.siteConfig, pages = _a.pages, pagesExclude = _a.pagesExclude;
        var relativeFilePath = utils.ensurePosix(path.relative(this.rootPath, filePath));
        var srcesFromPages = _.flatMap(pages.filter(function (page) { return page.src; }), function (page) { return (Array.isArray(page.src) ? page.src : [page.src]); });
        if (srcesFromPages.includes(relativeFilePath)) {
            return true;
        }
        var filePathsFromGlobs = _.flatMap(pages.filter(function (page) { return page.glob; }), function (page) { return _this.getPageGlobPaths(page, pagesExclude); });
        return filePathsFromGlobs.some(function (fp) { return fp === relativeFilePath; });
    };
    Site.prototype.getFavIconUrl = function () {
        var _a = this.siteConfig, baseUrl = _a.baseUrl, faviconPath = _a.faviconPath;
        if (faviconPath) {
            if (!fs.existsSync(path.join(this.rootPath, faviconPath))) {
                logger.warn(faviconPath + " does not exist");
            }
            return url.join('/', baseUrl, faviconPath);
        }
        else if (fs.existsSync(path.join(this.rootPath, FAVICON_DEFAULT_PATH))) {
            return url.join('/', baseUrl, FAVICON_DEFAULT_PATH);
        }
        return undefined;
    };
    /**
     * Maps an array of addressable pages to an array of Page object
     * @param {Array<Page>} addressablePages
     * @param {String} faviconUrl
     */
    Site.prototype.mapAddressablePagesToPages = function (addressablePages, faviconUrl) {
        var _this = this;
        this.pages = addressablePages.map(function (page) { return _this.createPage({
            faviconUrl: faviconUrl,
            pageSrc: page.src,
            title: page.title,
            layout: page.layout,
            frontmatter: page.frontmatter,
            searchable: page.searchable !== 'no',
            externalScripts: page.externalScripts,
        }); });
    };
    /**
     * Creates the supplied pages' page generation promises at a throttled rate.
     * This is done to avoid pushing too many callbacks into the event loop at once. (#1245)
     * @param {Array<Page>} pages to generate
     * @return {Promise} that resolves once all pages have generated
     */
    Site.prototype.generatePagesThrottled = function (pages) {
        var _this = this;
        var progressBar = new ProgressBar("[:bar] :current / " + pages.length + " pages built", { total: pages.length });
        progressBar.render();
        return new Promise(function (resolve, reject) {
            var numPagesGenerated = 0;
            // Map pages into array of callbacks for delayed execution
            var pageGenerationQueue = pages.map(function (page) { return function () { return page.generate(_this.externalManager)
                .then(function () {
                progressBar.tick();
                numPagesGenerated += 1;
                if (pageGenerationQueue.length) {
                    pageGenerationQueue.pop()();
                }
                else if (numPagesGenerated === pages.length) {
                    resolve();
                }
            })
                .catch(function (err) {
                logger.error(err);
                reject(new Error("Error while generating " + page.sourcePath));
            }); }; });
            /*
             Take the first MAX_CONCURRENT_PAGE_GENERATION_PROMISES callbacks and execute them.
             Whenever a page generation callback resolves,
             it pops the next unprocessed callback off pageGenerationQueue and executes it.
             */
            pageGenerationQueue.splice(0, MAX_CONCURRENT_PAGE_GENERATION_PROMISES)
                .forEach(function (generatePage) { return generatePage(); });
        });
    };
    /**
     * Renders all pages specified in site configuration file to the output folder
     */
    Site.prototype.generatePages = function () {
        // Run MarkBind include and render on each source file.
        // Render the final rendered page to the output folder.
        var addressablePages = this.addressablePages || [];
        var faviconUrl = this.getFavIconUrl();
        this._setTimestampVariable();
        this.mapAddressablePagesToPages(addressablePages, faviconUrl);
        return this.generatePagesThrottled(this.pages);
    };
    /**
     * Renders only the starting page for lazy loading to the output folder.
     */
    Site.prototype.generateLandingPage = function () {
        var _this = this;
        var addressablePages = this.addressablePages || [];
        var faviconUrl = this.getFavIconUrl();
        this._setTimestampVariable();
        this.mapAddressablePagesToPages(addressablePages, faviconUrl);
        var landingPage = this.pages.find(function (page) { return page.pageConfig.src === _this.onePagePath; });
        if (!landingPage) {
            return Promise.reject(new Error(this.onePagePath + " is not specified in the site configuration."));
        }
        return landingPage.generate(this.externalManager);
    };
    Site.prototype.regenerateAffectedPages = function (filePaths) {
        var _this = this;
        var startTime = new Date();
        var shouldRebuildAllPages = this.collectUserDefinedVariablesMapIfNeeded(filePaths) || this.forceReload;
        if (shouldRebuildAllPages) {
            logger.warn('Rebuilding all pages as variables file was changed, or the --force-reload flag was set');
        }
        this._setTimestampVariable();
        var pagesToRegenerate = this.pages.filter(function (page) {
            var doFilePathsHaveSourceFiles = filePaths.some(function (filePath) { return page.isDependency(filePath); });
            if (shouldRebuildAllPages || doFilePathsHaveSourceFiles) {
                if (_this.onePagePath) {
                    var normalizedSource = FsUtil.removeExtension(page.pageConfig.sourcePath);
                    var isPageBeingViewed = normalizedSource === _this.currentPageViewed;
                    if (!isPageBeingViewed) {
                        _this.toRebuild.add(normalizedSource);
                        return false;
                    }
                }
                return true;
            }
            return false;
        });
        if (!pagesToRegenerate.length) {
            logger.info('No pages needed to be rebuilt');
            return Promise.resolve();
        }
        logger.info("Rebuilding " + pagesToRegenerate.length + " pages");
        return this.generatePagesThrottled(pagesToRegenerate)
            .then(function () { return _this.writeSiteData(); })
            .then(function () { return logger.info('Pages rebuilt'); })
            .then(function () {
            var endTime = new Date();
            var totalBuildTime = (endTime - startTime) / 1000;
            logger.info("Website regeneration complete! Total build time: " + totalBuildTime + "s");
            if (!_this.onePagePath && totalBuildTime > LAZY_LOADING_REBUILD_TIME_RECOMMENDATION_LIMIT) {
                logger.info('Your pages took quite a while to rebuild...'
                    + 'Have you considered using markbind serve -o when writing content to speed things up?');
            }
        })
            .catch(function (error) { return Site.rejectHandler(error, []); });
    };
    /**
     * Copies Font Awesome assets to the assets folder
     */
    Site.prototype.copyFontAwesomeAsset = function () {
        var faRootSrcPath = path.dirname(require.resolve('@fortawesome/fontawesome-free/package.json'));
        var faCssSrcPath = path.join(faRootSrcPath, 'css', 'all.min.css');
        var faCssDestPath = path.join(this.siteAssetsDestPath, 'fontawesome', 'css', 'all.min.css');
        var faFontsSrcPath = path.join(faRootSrcPath, 'webfonts');
        var faFontsDestPath = path.join(this.siteAssetsDestPath, 'fontawesome', 'webfonts');
        return fs.copy(faCssSrcPath, faCssDestPath).then(function () { return fs.copy(faFontsSrcPath, faFontsDestPath); });
    };
    /**
     * Copies Octicon assets to the assets folder
     */
    Site.prototype.copyOcticonsAsset = function () {
        var octiconsCssSrcPath = require.resolve('@primer/octicons/build/build.css');
        var octiconsCssDestPath = path.join(this.siteAssetsDestPath, 'css', 'octicons.css');
        return fs.copy(octiconsCssSrcPath, octiconsCssDestPath);
    };
    /**
     * Copies core-web bundles and external assets to the assets output folder
     */
    Site.prototype.copyCoreWebAsset = function () {
        var _this = this;
        var coreWebRootPath = path.dirname(require.resolve('@markbind/core-web/package.json'));
        var coreWebAssetPath = path.join(coreWebRootPath, 'asset');
        fs.copySync(coreWebAssetPath, this.siteAssetsDestPath);
        var dirsToCopy = ['fonts'];
        var filesToCopy = [
            'js/markbind.min.js',
            'css/markbind.min.css',
        ];
        var copyAllFiles = filesToCopy.map(function (file) {
            var srcPath = path.join(coreWebRootPath, 'dist', file);
            var destPath = path.join(_this.siteAssetsDestPath, file);
            return fs.copy(srcPath, destPath);
        });
        var copyFontsDir = dirsToCopy.map(function (dir) {
            var srcPath = path.join(coreWebRootPath, 'dist', dir);
            var destPath = path.join(_this.siteAssetsDestPath, 'css', dir);
            return fs.copy(srcPath, destPath);
        });
        return Promise.all(__spreadArrays(copyAllFiles, copyFontsDir));
    };
    /**
     * Copies bootswatch theme to the assets folder if a valid theme is specified
     */
    Site.prototype.copyBootswatchTheme = function () {
        var theme = this.siteConfig.theme;
        if (!theme || !_.has(SUPPORTED_THEMES_PATHS, theme)) {
            return _.noop;
        }
        var themeSrcPath = SUPPORTED_THEMES_PATHS[theme];
        var themeDestPath = path.join(this.siteAssetsDestPath, 'css', 'bootstrap.min.css');
        return fs.copy(themeSrcPath, themeDestPath);
    };
    /**
     * Writes the site data to siteData.json
     */
    Site.prototype.writeSiteData = function () {
        var _this = this;
        var siteDataPath = path.join(this.outputPath, SITE_DATA_NAME);
        var siteData = {
            enableSearch: this.siteConfig.enableSearch,
            pages: this.pages.filter(function (page) { return page.pageConfig.searchable && page.headings; })
                .map(function (page) { return ({
                src: page.pageConfig.src,
                title: page.title,
                headings: page.headings,
                headingKeywords: page.keywords,
            }); }),
        };
        return fs.outputJson(siteDataPath, siteData, { spaces: 2 })
            .then(function () { return logger.info('Site data built'); })
            .catch(function (error) { return Site.rejectHandler(error, [_this.tempPath, _this.outputPath]); });
    };
    Site.prototype.deploy = function (travisTokenVar) {
        var _this = this;
        var defaultDeployConfig = {
            branch: 'gh-pages',
            message: 'Site Update.',
            repo: '',
            remote: 'origin',
        };
        process.env.NODE_DEBUG = 'gh-pages';
        return new Promise(function (resolve, reject) {
            var publish = Promise.promisify(ghpages.publish);
            _this.readSiteConfig()
                .then(function () {
                var basePath = _this.siteConfig.deploy.baseDir || _this.outputPath;
                if (!fs.existsSync(basePath)) {
                    reject(new Error('The site directory does not exist. Please build the site first before deploy.'));
                    return undefined;
                }
                var options = {};
                options.branch = _this.siteConfig.deploy.branch || defaultDeployConfig.branch;
                options.message = _this.siteConfig.deploy.message || defaultDeployConfig.message;
                options.repo = _this.siteConfig.deploy.repo || defaultDeployConfig.repo;
                if (travisTokenVar) {
                    if (!process.env.TRAVIS) {
                        reject(new Error('-t/--travis should only be run in Travis CI.'));
                        return undefined;
                    }
                    // eslint-disable-next-line no-param-reassign
                    travisTokenVar = _.isBoolean(travisTokenVar) ? 'GITHUB_TOKEN' : travisTokenVar;
                    if (!process.env[travisTokenVar]) {
                        reject(new Error("The environment variable " + travisTokenVar + " does not exist."));
                        return undefined;
                    }
                    var githubToken = process.env[travisTokenVar];
                    var repoSlug = process.env.TRAVIS_REPO_SLUG;
                    if (options.repo) {
                        // Extract repo slug from user-specified repo URL so that we can include the access token
                        var repoSlugRegex = /github\.com[:/]([\w-]+\/[\w-.]+)\.git$/;
                        var repoSlugMatch = repoSlugRegex.exec(options.repo);
                        if (!repoSlugMatch) {
                            reject(new Error('-t/--travis expects a GitHub repository.\n'
                                + ("The specified repository " + options.repo + " is not valid.")));
                            return undefined;
                        }
                        repoSlug = repoSlugMatch[1];
                    }
                    options.repo = "https://" + githubToken + "@github.com/" + repoSlug + ".git";
                    options.user = {
                        name: 'Deployment Bot',
                        email: 'deploy@travis-ci.org',
                    };
                }
                publish(basePath, options);
                return options;
            })
                .then(function (options) {
                var git = simpleGit({ baseDir: process.cwd() });
                options.remote = defaultDeployConfig.remote;
                return Site.getDeploymentUrl(git, options);
            })
                .then(function (depUrl) { return resolve(depUrl); })
                .catch(reject);
        });
    };
    /**
     * Gets the deployed website's url, returning null if there was an error retrieving it.
     */
    Site.getDeploymentUrl = function (git, options) {
        var HTTPS_PREAMBLE = 'https://';
        var SSH_PREAMBLE = 'git@github.com:';
        var GITHUB_IO_PART = 'github.io';
        // https://<name|org name>.github.io/<repo name>/
        function constructGhPagesUrl(remoteUrl) {
            if (!remoteUrl) {
                return null;
            }
            var parts = remoteUrl.split('/');
            if (remoteUrl.startsWith(HTTPS_PREAMBLE)) {
                // https://github.com/<name|org>/<repo>.git (HTTPS)
                var repoNameWithExt = parts[parts.length - 1];
                var repoName = repoNameWithExt.substring(0, repoNameWithExt.lastIndexOf('.'));
                var name_1 = parts[parts.length - 2].toLowerCase();
                return "https://" + name_1 + "." + GITHUB_IO_PART + "/" + repoName;
            }
            else if (remoteUrl.startsWith(SSH_PREAMBLE)) {
                // git@github.com:<name|org>/<repo>.git (SSH)
                var repoNameWithExt = parts[parts.length - 1];
                var repoName = repoNameWithExt.substring(0, repoNameWithExt.lastIndexOf('.'));
                var name_2 = parts[0].substring(SSH_PREAMBLE.length);
                return "https://" + name_2 + "." + GITHUB_IO_PART + "/" + repoName;
            }
            return null;
        }
        var remote = options.remote, branch = options.branch, repo = options.repo;
        var cnamePromise = gitUtil.getRemoteBranchFile(git, 'blob', remote, branch, 'CNAME');
        var remoteUrlPromise = gitUtil.getRemoteUrl(git, remote);
        var promises = [cnamePromise, remoteUrlPromise];
        return Promise.all(promises)
            .then(function (results) {
            var cname = results[0];
            var remoteUrl = results[1];
            if (cname) {
                return cname.trim();
            }
            else if (repo) {
                return constructGhPagesUrl(repo);
            }
            return constructGhPagesUrl(remoteUrl.trim());
        })
            .catch(function (err) {
            logger.error(err);
            return null;
        });
    };
    Site.prototype._setTimestampVariable = function () {
        var options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: this.siteConfig.timeZone,
            timeZoneName: 'short',
        };
        var time = new Date().toLocaleTimeString(this.siteConfig.locale, options);
        this.variableProcessor.addUserDefinedVariableForAllSites('timestamp', time);
        return Promise.resolve();
    };
    return Site;
}());
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
