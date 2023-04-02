import merge from 'lodash/merge';

import path from 'path';
import fs from 'fs-extra';
import walkSync from 'walk-sync';
import flatMap from 'lodash/flatMap';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isError from 'lodash/isError';
import * as logger from '../utils/logger';
import {
  FrontMatter, Plugin, PluginContext, TagConfigs,
} from './Plugin';
import type { NodeProcessorConfig } from '../html/NodeProcessor';
import type { PageAssets } from '../Page/PageConfig';
import { NodeOrText } from '../utils/node';

const { ignoreTags } = require('../patches');

const _ = {
  flatMap,
  get,
  includes,
  isError,
  merge,
};

const MARKBIND_PLUGIN_DIRECTORY = __dirname;
const MARKBIND_DEFAULT_PLUGIN_DIRECTORY = path.join(__dirname, 'default');
const MARKBIND_PLUGIN_PREFIX = 'markbind-plugin-';
const PROJECT_PLUGIN_FOLDER_NAME = '_markbind/plugins';

export class PluginManager {
  static tagConfig: Record<string, TagConfigs>;

  config: NodeProcessorConfig;
  plugins: Record<string, Plugin>;
  pluginsRaw: string[];
  pluginsContextRaw: PluginContext;
  htmlBeautifyOptions: Record<string, any>;

  constructor(config: NodeProcessorConfig, plugins: string[], pluginsContext: PluginContext) {
    this.config = config;

    this.plugins = {};

    /**
     * Raw array of plugin names as read from the site configuration
     */
    this.pluginsRaw = plugins;

    /**
     * Raw representation of the site configuration's plugisnContext key
     */
    this.pluginsContextRaw = pluginsContext;

    // Plugin special tags may modify this
    this.htmlBeautifyOptions = {};

    this._setup();
  }

  _setup() {
    this._collectPlugins();
    this._collectPluginTagConfigs();
  }

  /**
   * Load all plugins of the site
   */
  _collectPlugins() {
    const defaultPluginNames = walkSync(MARKBIND_DEFAULT_PLUGIN_DIRECTORY, {
      directories: false,
      globs: [`${MARKBIND_PLUGIN_PREFIX}*.js`],
    }).map(file => path.basename(file, '.js'));

    this.pluginsRaw
      .filter(plugin => !_.includes(defaultPluginNames, plugin))
      .forEach(plugin => this._loadPlugin(plugin, false));

    const markbindPrefixRegex = new RegExp(`^${MARKBIND_PLUGIN_PREFIX}`);
    defaultPluginNames
      .filter(plugin => !_.get(this.pluginsContextRaw, [plugin.replace(markbindPrefixRegex, ''), 'off'],
                               false))
      .forEach(plugin => this._loadPlugin(plugin, true));
  }

  /**
   * Loads a plugin
   * @param plugin name of the plugin
   * @param isDefault whether the plugin is a default plugin
   */
  _loadPlugin(plugin: string, isDefault: boolean) {
    try {
      // Check if already loaded
      if (this.plugins[plugin]) {
        logger.warn(`Attempted to reload ${plugin} plugin. Is there a naming conflict?`);
        return;
      }

      const pluginPath = PluginManager._getPluginPath(this.config.rootPath, plugin);
      if (isDefault && !pluginPath.startsWith(MARKBIND_DEFAULT_PLUGIN_DIRECTORY)) {
        // Users can override default plugins with their own in the project folder
        logger.warn(`Default plugin ${plugin} will be overridden`);
      }

      this.plugins[plugin] = new Plugin(plugin, pluginPath, this.pluginsContextRaw[plugin],
                                        this.config.outputPath);
    } catch (e) {
      logger.warn(`Unable to load plugin ${plugin}, skipping...\n${e}`);
    }
  }

  /**
   * Retrieves the correct plugin path for a plugin name that exists either in (in decreasing priority):
   * - the MarkBind project's 'plugins' folder
   * - the current folder (__dirname)
   * - the 'default' subdirectory under the current folder
   * - one of the environment's valid node_modules folders, as loaded by node's require(...) method
   * @param projectRootPath root of the MarkBind project
   * @param pluginName name of the plugin
   */
  static _getPluginPath(projectRootPath: string, pluginName: string) {
    // Check in project folder
    const pluginPath = path.join(projectRootPath, PROJECT_PLUGIN_FOLDER_NAME, `${pluginName}.js`);
    if (fs.existsSync(pluginPath)) {
      return pluginPath;
    }

    // Check in current (__dirname) folder
    const markbindPluginPath = path.join(MARKBIND_PLUGIN_DIRECTORY, `${pluginName}.js`);
    if (fs.existsSync(markbindPluginPath)) {
      return markbindPluginPath;
    }

    // Check in default folder
    const markbindDefaultPluginPath = path.join(MARKBIND_DEFAULT_PLUGIN_DIRECTORY, `${pluginName}.js`);
    if (fs.existsSync(markbindDefaultPluginPath)) {
      return markbindDefaultPluginPath;
    }

    // Check the environment's node_modules folders
    try {
      const resolvedPluginPath = require.resolve(pluginName);
      return resolvedPluginPath;
    } catch (err) {
      // An error may be thrown because the module is not found, or for other reasons.
      // If the error is due to MODULE_NOT_FOUND, search project's node_modules
      if (_.isError(err) && (err as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
        return require.resolve(pluginName, { paths: [path.join(projectRootPath, 'node_modules')] });
      }
      // Re-throw all other errors
      throw err;
    }
  }

  /**
   * Collects the tag configuration of the site's plugins, and injects them into the parsers.
   */
  _collectPluginTagConfigs() {
    const specialTags = new Set(); // "non-html containing" tags parsed like <script>, <style>

    Object.values(this.plugins).forEach((plugin) => {
      const pluginTagConfig = plugin.getTagConfig();
      if (!pluginTagConfig) {
        return;
      }

      Object.entries(pluginTagConfig).forEach(([tagName, tagConfig]: [string, TagConfigs]) => {
        if (tagConfig.isSpecial) {
          specialTags.add(tagName.toLowerCase());
        }
      });
      _.merge(PluginManager.tagConfig, pluginTagConfig);
    });

    ignoreTags(specialTags);

    this.htmlBeautifyOptions = {
      indent_size: 2,
      content_unformatted: ['pre', 'textarea', 'script', ...specialTags],
    };
  }

  /**
   * Run the beforeSiteGenerate hooks
   */
  beforeSiteGenerate() {
    Object.values(this.plugins).forEach(plugin => plugin.executeBeforeSiteGenerate());
  }

  /**
   * Run getLinks and getScripts hooks
   */
  collectPluginPageNjkAssets(frontmatter: FrontMatter, content: string, pageAsset: PageAssets) {
    const pluginLinksAndScripts = Object.values(this.plugins)
      .map(plugin => plugin.getPageNjkLinksAndScripts(frontmatter, content, this.config.baseUrl));

    pageAsset.pluginLinks = _.flatMap(pluginLinksAndScripts, pluginResult => pluginResult.links);
    pageAsset.pluginScripts = _.flatMap(pluginLinksAndScripts, pluginResult => pluginResult.scripts);
  }

  postRender(frontmatter: FrontMatter, content: string) {
    return Object.values(this.plugins)
      .reduce((renderedContent, plugin) => plugin.postRender(frontmatter, renderedContent), content);
  }

  processNode(node: NodeOrText) {
    Object.values(this.plugins).forEach((plugin) => {
      plugin.processNode(node, this.config);
    });
  }

  postProcessNode(node: NodeOrText) {
    Object.values(this.plugins).forEach((plugin) => {
      plugin.postProcessNode(node, this.config);
    });
  }
}

// Static property for easy access in linkProcessor
PluginManager.tagConfig = {};
