/**
 * A page configuration object used to construct a {@link Page}.
 * Its properties will never be modified by {@link Page} itself.
 */
class PageConfig {
  /**
   * Constructs a {@link PageConfig} object.
   * @param args The object containing named arguments used to construct this instance
   */
  constructor(args) {
    /**
     * Object of asset names as keys to their corresponding destination file paths.
     * @type {Object<string, string>}
     */
    this.asset = args.asset;
    /**
     * @type {string}
     */
    this.baseUrl = args.baseUrl;
    /**
     * @type {Set<string>} the set of urls representing the sites' base directories
     */
    this.baseUrlMap = args.baseUrlMap;
    /**
     * @type {boolean}
     */
    this.disableHtmlBeautify = args.disableHtmlBeautify;
    /**
     * @type {boolean}
     */
    this.dev = args.dev;
    /**
     * @type {string}
     */
    this.faviconUrl = args.faviconUrl;
    /**
     * @type {Object<string, any>|{}}
     */
    this.frontmatterOverride = args.frontmatterOverride || {};
    /**
     * @type {boolean}
     */
    this.globalOverride = args.globalOverride;
    /**
     * Default maximum heading level to index for all pages.
     * @type {number}
     */
    this.headingIndexingLevel = args.headingIndexingLevel;
    /**
     * @type {string}
     */
    this.layout = args.layout;
    /**
     * @type {string}
     */
    this.layoutsAssetPath = args.layoutsAssetPath;
    /**
     * Array of plugins used in this page.
     * @type {Array}
     */
    this.plugins = args.plugins;
    /**
     * @type {Object<string, Object<string, any>>}
     */
    this.pluginsContext = args.pluginsContext;
    /**
     * The output path of this page
     * @type {string}
     */
    this.resultPath = args.resultPath;
    /**
     * @type {string}
     */
    this.rootPath = args.rootPath;
    /**
     * @type {boolean}
     */
    this.searchable = !!args.searchable;
    /**
     * @type {string}
     */
    this.siteOutputPath = args.siteOutputPath;
    /**
     * The source file for rendering this page
     * @type {string}
     */
    this.sourcePath = args.sourcePath;
    /**
     * @type {string}
     */
    this.src = args.src;
    /**
     * @type {string|string}
     */
    this.title = args.title || '';
    /**
     * @type {string}
     */
    this.titlePrefix = args.titlePrefix;
    /**
     * @type {string}
     */
    this.template = args.template;
    /**
     * @type {VariableProcessor}
     */
    this.variableProcessor = args.variableProcessor;
  }
}

module.exports = {
  PageConfig,
};
