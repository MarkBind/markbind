var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var path = require('path');
var fs = require('fs-extra');
var walkSync = require('walk-sync');
var ignoreTags = require('../patches').ignoreTags;
var Plugin = require('./Plugin').Plugin;
var _ = {};
_.flatMap = require('lodash/flatMap');
_.get = require('lodash/get');
_.includes = require('lodash/includes');
_.merge = require('lodash/merge');
var logger = require('../utils/logger');
var MARKBIND_PLUGIN_DIRECTORY = __dirname;
var MARKBIND_DEFAULT_PLUGIN_DIRECTORY = path.join(__dirname, 'default');
var MARKBIND_PLUGIN_PREFIX = 'markbind-plugin-';
var PROJECT_PLUGIN_FOLDER_NAME = '_markbind/plugins';
var PluginManager = /** @class */ (function () {
    function PluginManager(config, plugins, pluginsContext) {
        this.config = config;
        /**
         * @type {Object<string, Plugin>}
         */
        this.plugins = {};
        /**
         * Raw array of plugin names as read from the site configuration
         * @type {Array}
         */
        this.pluginsRaw = plugins;
        /**
         * Raw representation of the site configuration's plugisnContext key
         * @type {Object<string, Object<string, any>>}
         */
        this.pluginsContextRaw = pluginsContext;
        // Plugin special tags may modify this
        this.htmlBeautifyOptions = {};
        this._setup();
    }
    PluginManager.prototype._setup = function () {
        this._collectPlugins();
        this._collectPluginTagConfigs();
    };
    /**
     * Load all plugins of the site
     */
    PluginManager.prototype._collectPlugins = function () {
        var _this = this;
        module.paths.push(path.join(this.config.rootPath, 'node_modules'));
        var defaultPluginNames = walkSync(MARKBIND_DEFAULT_PLUGIN_DIRECTORY, {
            directories: false,
            globs: [MARKBIND_PLUGIN_PREFIX + "*.js"],
        }).map(function (file) { return path.basename(file, '.js'); });
        this.pluginsRaw
            .filter(function (plugin) { return !_.includes(defaultPluginNames, plugin); })
            .forEach(function (plugin) { return _this._loadPlugin(plugin, false); });
        var markbindPrefixRegex = new RegExp("^" + MARKBIND_PLUGIN_PREFIX);
        defaultPluginNames
            .filter(function (plugin) { return !_.get(_this.pluginsContextRaw, [plugin.replace(markbindPrefixRegex, ''), 'off'], false); })
            .forEach(function (plugin) { return _this._loadPlugin(plugin, true); });
    };
    /**
     * Loads a plugin
     * @param plugin name of the plugin
     * @param isDefault whether the plugin is a default plugin
     */
    PluginManager.prototype._loadPlugin = function (plugin, isDefault) {
        try {
            // Check if already loaded
            if (this.plugins[plugin]) {
                logger.warn("Attempted to reload " + plugin + " plugin. Is there a naming conflict?");
                return;
            }
            var pluginPath = PluginManager._getPluginPath(this.config.rootPath, plugin);
            if (isDefault && !pluginPath.startsWith(MARKBIND_DEFAULT_PLUGIN_DIRECTORY)) {
                // Users can override default plugins with their own in the project folder
                logger.warn("Default plugin " + plugin + " will be overridden");
            }
            this.plugins[plugin] = new Plugin(plugin, pluginPath, this.pluginsContextRaw[plugin], this.config.outputPath);
        }
        catch (e) {
            logger.warn("Unable to load plugin " + plugin + ", skipping");
        }
    };
    /**
     * Retrieves the correct plugin path for a plugin name that exists either in (in decreasing priority):
     * - the MarkBind project's 'plugins' folder
     * - the current folder (__dirname)
     * - the 'default' subdirectory under the current folder
     * - one of the environment's valid node_modules folders, as loaded by node's require(...) method
     * @param projectRootPath root of the MarkBind project
     * @param pluginName name of the plugin
     */
    PluginManager._getPluginPath = function (projectRootPath, pluginName) {
        // Check in project folder
        var pluginPath = path.join(projectRootPath, PROJECT_PLUGIN_FOLDER_NAME, pluginName + ".js");
        if (fs.existsSync(pluginPath)) {
            return pluginPath;
        }
        // Check in current (__dirname) folder
        var markbindPluginPath = path.join(MARKBIND_PLUGIN_DIRECTORY, pluginName + ".js");
        if (fs.existsSync(markbindPluginPath)) {
            return markbindPluginPath;
        }
        // Check in default folder
        var markbindDefaultPluginPath = path.join(MARKBIND_DEFAULT_PLUGIN_DIRECTORY, pluginName + ".js");
        if (fs.existsSync(markbindDefaultPluginPath)) {
            return markbindDefaultPluginPath;
        }
        return require.resolve(pluginName);
    };
    /**
     * Collects the tag configuration of the site's plugins, and injects them into the parsers.
     */
    PluginManager.prototype._collectPluginTagConfigs = function () {
        var specialTags = new Set(); // "non-html containing" tags parsed like <script>, <style>
        Object.values(this.plugins).forEach(function (plugin) {
            var pluginTagConfig = plugin.getTagConfig();
            if (!pluginTagConfig) {
                return;
            }
            Object.entries(pluginTagConfig).forEach(function (_a) {
                var tagName = _a[0], tagConfig = _a[1];
                if (tagConfig.isSpecial) {
                    specialTags.add(tagName.toLowerCase());
                }
            });
            _.merge(PluginManager.tagConfig, pluginTagConfig);
        });
        ignoreTags(specialTags);
        this.htmlBeautifyOptions = {
            indent_size: 2,
            content_unformatted: __spreadArrays(['pre', 'textarea'], specialTags),
        };
    };
    /**
     * Run the beforeSiteGenerate hooks
     */
    PluginManager.prototype.beforeSiteGenerate = function () {
        Object.values(this.plugins).forEach(function (plugin) { return plugin.executeBeforeSiteGenerate(); });
    };
    /**
     * Run getLinks and getScripts hooks
     */
    PluginManager.prototype.collectPluginPageNjkAssets = function (frontMatter, content, pageAsset) {
        var _this = this;
        var pluginLinksAndScripts = Object.values(this.plugins)
            .map(function (plugin) { return plugin.getPageNjkLinksAndScripts(frontMatter, content, _this.config.baseUrl); });
        pageAsset.pluginLinks = _.flatMap(pluginLinksAndScripts, function (pluginResult) { return pluginResult.links; });
        pageAsset.pluginScripts = _.flatMap(pluginLinksAndScripts, function (pluginResult) { return pluginResult.scripts; });
    };
    PluginManager.prototype.postRender = function (frontMatter, content) {
        return Object.values(this.plugins)
            .reduce(function (renderedContent, plugin) { return plugin.postRender(frontMatter, renderedContent); }, content);
    };
    PluginManager.prototype.processNode = function (node) {
        var _this = this;
        Object.values(this.plugins).forEach(function (plugin) {
            plugin.processNode(node, _this.config);
        });
    };
    return PluginManager;
}());
// Static property for easy access in linkProcessor
PluginManager.tagConfig = {};
module.exports = {
    PluginManager: PluginManager,
};
