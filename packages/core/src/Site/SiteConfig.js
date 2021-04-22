const logger = require('../utils/logger');

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
     * Default maximum heading level to index for all pages.
     * @type {number}
     */
    this.headingIndexingLevel = siteConfigJson.headingIndexingLevel || HEADING_INDEXING_LEVEL_DEFAULT;

    /**
     * @type {Object<string, any>}
     */
    this.style = siteConfigJson.style || {};

    /**
     * @type {string}
     */
    this.theme = this.style.bootstrapTheme || siteConfigJson.theme || false;
    if (siteConfigJson.theme) {
      logger.warn("The 'theme' site configuration key has been consolidated under the 'style.bootstrapTheme'"
        + ' key.\n The old key will be deprecated in v3.0.');
    }

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
    /**
     * @type {boolean}
     */
    this.intrasiteLinkValidation = siteConfigJson.intrasiteLinkValidation || {};
    this.intrasiteLinkValidation.enabled = this.intrasiteLinkValidation.enabled !== false;
  }
}

module.exports = SiteConfig;
