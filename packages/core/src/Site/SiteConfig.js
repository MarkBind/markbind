const {
  HEADING_INDEXING_LEVEL_DEFAULT,
} = require('./constants');

/**
 * Represents a read only site config read from the site configuration file,
 * with default values for unspecified properties.
 */
class SiteConfig {
  /**
   * @param siteConfigJson The raw json read from the site configuration file
   * @param cliBaseUrl As read from the --baseUrl option
   */
  constructor(siteConfigJson, cliBaseUrl) {
    /**
     * @type {string}
     */
    this.baseUrl = cliBaseUrl !== undefined
      ? cliBaseUrl
      : (siteConfigJson.baseUrl || '');
    /**
     * @type {boolean}
     */
    this.enableSearch = siteConfigJson.enableSearch === undefined || siteConfigJson.enableSearch;
    /**
     * @type {string}
     */
    this.faviconPath = siteConfigJson.faviconPath;
    /**
     * @type {number}
     */
    this.headingIndexingLevel = siteConfigJson.headingIndexingLevel || HEADING_INDEXING_LEVEL_DEFAULT;
    /**
     * @type {string}
     */
    this.theme = siteConfigJson.theme || false;

    /**
     * @type {Array}
     */
    this.pages = siteConfigJson.pages || [];

    /**
     * @type {Array}
     */
    this.pagesExclude = siteConfigJson.pagesExclude || [];

    /**
     * @type {Array}
     */
    this.ignore = siteConfigJson.ignore || [];
    /**
     * @type {Array}
     */
    this.externalScripts = siteConfigJson.externalScripts || [];
    /**
     * @type {string}
     */
    this.titlePrefix = siteConfigJson.titlePrefix || '';
    /**
     * @type {boolean}
     */
    this.disableHtmlBeautify = siteConfigJson.disableHtmlBeautify || false;
    /**
     * @type {Object<string, any>}
     */
    this.globalOverride = siteConfigJson.globalOverride || {};

    /**
     * @type {string}
     */
    this.timeZone = siteConfigJson.timeZone || 'UTC';
    /**
     * @type {string}
     */
    this.locale = siteConfigJson.locale || 'en-GB';

    /**
     * @type {Array}
     */
    this.plugins = siteConfigJson.plugins || [];
    /**
     * @type {Object<string, Object<string, any>>}
     */
    this.pluginsContext = siteConfigJson.pluginsContext || {};

    /**
     * @type {Object<string, Object<string, any>>}
     */
    this.deploy = siteConfigJson.deploy || {};
  }
}

module.exports = SiteConfig;
