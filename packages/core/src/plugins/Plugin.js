const path = require('path');
const fs = require('fs-extra');
const cheerio = require('cheerio'); require('../patches/htmlparser2');

const PLUGIN_OUTPUT_SITE_ASSET_FOLDER_NAME = 'plugins';

const utils = require('../utils');
const logger = require('../utils/logger');

/**
 * Wrapper class around a loaded plugin module
 */
class Plugin {
  constructor(pluginName, pluginPath, pluginOptions, siteOutputPath) {
    this.pluginName = pluginName;

    /**
     * The plugin module
     * @type {Object}
     */
    // eslint-disable-next-line global-require,import/no-dynamic-require
    this.plugin = require(pluginPath);

    /**
     * @type {Object<string, any>}
     */
    this.pluginOptions = pluginOptions || {};

    // For resolving plugin asset source paths later
    this.pluginAbsolutePath = path.dirname(pluginPath);
    this.pluginAssetOutputPath = path.join(siteOutputPath, PLUGIN_OUTPUT_SITE_ASSET_FOLDER_NAME,
                                           path.basename(pluginPath, '.js'));
  }

  executeBeforeSiteGenerate() {
    if (this.plugin.beforeSiteGenerate) {
      this.plugin.beforeSiteGenerate(this.pluginOptions);
    }
  }

  /**
   * Resolves a resource specified as an attribute in a html asset tag
   * (eg. '<script>' or '<link>') provided by a plugin, and copies said asset
   * into the plugin's asset output folder.
   * Does nothing if the resource is a url.
   * @param assetElementHtml The asset element html, as a string, such as '<script src="...">'
   * @param tagName The name of the resource tag
   * @param attrName The attribute name where the resource is specified in the tag
   * @param baseUrl baseUrl of the site
   * @return String html of the element, with the attribute's asset resolved
   */
  _getResolvedAssetElement(assetElementHtml, tagName, attrName, baseUrl) {
    const $ = cheerio.load(assetElementHtml);
    const el = $(`${tagName}[${attrName}]`);

    el.attr(attrName, (i, assetPath) => {
      if (!assetPath || utils.isUrl(assetPath)) {
        return assetPath;
      }

      const srcPath = path.resolve(this.pluginAbsolutePath, assetPath);
      const srcBaseName = path.basename(srcPath);

      fs.ensureDir(this.pluginAssetOutputPath)
        .then(() => {
          const outputPath = path.join(this.pluginAssetOutputPath, srcBaseName);
          fs.copySync(srcPath, outputPath, { overwrite: false });
        })
        .catch(err => logger.error(
          `Failed to copy asset ${assetPath} for plugin ${this.pluginName}\n${err}`));

      return path.posix.join(`${baseUrl}/`, PLUGIN_OUTPUT_SITE_ASSET_FOLDER_NAME,
                             this.pluginName, srcBaseName);
    });

    return $.html();
  }

  /**
   * Collect page content inserted by plugins
   */
  getPageNjkLinksAndScripts(frontMatter, content, baseUrl) {
    let links = [];
    let scripts = [];

    if (this.plugin.getLinks) {
      const pluginLinks = this.plugin.getLinks(this.pluginOptions, frontMatter, content);
      links = pluginLinks.map(linkHtml => this._getResolvedAssetElement(linkHtml, 'link', 'href', baseUrl));
    }

    if (this.plugin.getScripts) {
      const pluginScripts = this.plugin.getScripts(this.pluginOptions, frontMatter, content);
      scripts = pluginScripts.map(scriptHtml => this._getResolvedAssetElement(scriptHtml, 'script',
                                                                              'src', baseUrl));
    }

    return {
      links,
      scripts,
    };
  }

  postRender(frontMatter, content) {
    if (this.plugin.postRender) {
      return this.plugin.postRender(this.pluginOptions, frontMatter, content);
    }
    return content;
  }

  processNode(node, config) {
    if (!this.plugin.processNode) {
      return;
    }

    this.plugin.processNode(this.pluginOptions, node, config);
  }

  getTagConfig() {
    return this.plugin.tagConfig;
  }
}

module.exports = {
  Plugin,
};
