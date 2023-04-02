import path from 'path';
import fs from 'fs-extra';
import cheerio from 'cheerio';

import isString from 'lodash/isString';
import * as logger from '../utils/logger';
import * as urlUtil from '../utils/urlUtil';
import type { NodeProcessorConfig } from '../html/NodeProcessor';
import { NodeOrText } from '../utils/node';

require('../patches/htmlparser2');

const _ = { isString };

const PLUGIN_OUTPUT_SITE_ASSET_FOLDER_NAME = 'plugins';

export type PluginContext = Record<string, any>;

export type FrontMatter = Record<string, any>;

type TagConfigAttributes = {
  name: string,
  isRelative: boolean,
  isSourceFile: boolean
};

export type TagConfigs = {
  isSpecial: boolean,
  attributes: TagConfigAttributes[]
};

/**
 * Wrapper class around a loaded plugin module
 */
export class Plugin {
  pluginName: string;
  plugin: {
    beforeSiteGenerate: (...args: any[]) => any;
    getLinks: (pluginContext?: PluginContext, frontmatter?: FrontMatter, content?: string) => string[];
    getScripts: (pluginContext?: PluginContext, frontmatter?: FrontMatter, content?: string) => string[];
    postRender: (pluginContext: PluginContext, frontmatter: FrontMatter, content: string) => string;
    processNode: (pluginContext: PluginContext, node: NodeOrText, config?: NodeProcessorConfig) => string;
    postProcessNode: (pluginContext: PluginContext, node: NodeOrText, config?: NodeProcessorConfig) => string;
    tagConfig: Record<string, TagConfigs>;
  };

  pluginOptions: PluginContext;
  pluginAbsolutePath: string;
  pluginAssetOutputPath: string;

  constructor(pluginName: string, pluginPath: string, pluginOptions: PluginContext, siteOutputPath: string) {
    this.pluginName = pluginName;

    /**
     * The plugin module
     */
    // eslint-disable-next-line global-require,import/no-dynamic-require
    this.plugin = require(pluginPath);

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
  _getResolvedAssetElement(assetElementHtml: string, tagName: string, attrName: string, baseUrl: string) {
    const $ = cheerio.load(assetElementHtml);
    const el = $(`${tagName}[${attrName}]`);

    el.attr(attrName, (_i: any, assetPath: any): string => {
      if (!assetPath || !_.isString(assetPath) || urlUtil.isUrl(assetPath)) {
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
  getPageNjkLinksAndScripts(frontmatter: FrontMatter, content: string, baseUrl: string) {
    let links: string[] = [];
    let scripts: string[] = [];

    if (this.plugin.getLinks) {
      const pluginLinks = this.plugin.getLinks(this.pluginOptions, frontmatter, content);
      links = pluginLinks.map(
        (linkHtml: string) => this._getResolvedAssetElement(linkHtml, 'link', 'href', baseUrl));
    }

    if (this.plugin.getScripts) {
      const pluginScripts = this.plugin.getScripts(this.pluginOptions, frontmatter, content);
      scripts = pluginScripts.map((scriptHtml: string) => this._getResolvedAssetElement(scriptHtml, 'script',
                                                                                        'src', baseUrl));
    }

    return {
      links,
      scripts,
    };
  }

  postRender(frontmatter: FrontMatter, content: string) {
    if (this.plugin.postRender) {
      return this.plugin.postRender(this.pluginOptions, frontmatter, content);
    }
    return content;
  }

  processNode(node: NodeOrText, config: NodeProcessorConfig) {
    if (!this.plugin.processNode) {
      return;
    }

    this.plugin.processNode(this.pluginOptions, node, config);
  }

  postProcessNode(node: NodeOrText, config: NodeProcessorConfig) {
    if (!this.plugin.postProcessNode) {
      return;
    }

    this.plugin.postProcessNode(this.pluginOptions, node, config);
  }

  getTagConfig() {
    return this.plugin.tagConfig;
  }
}
