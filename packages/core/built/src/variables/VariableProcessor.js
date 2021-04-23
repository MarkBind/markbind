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
var cheerio = require('cheerio');
var _ = {};
_.clone = require('lodash/clone');
_.cloneDeep = require('lodash/cloneDeep');
_.has = require('lodash/has');
_.isArray = require('lodash/isArray');
_.isEmpty = require('lodash/isEmpty');
var urlUtils = require('../utils/urls');
var logger = require('../utils/logger');
var VariableRenderer = require('./VariableRenderer');
var PageSources = require('../Page/PageSources').PageSources;
var ATTRIB_CWF = require('../constants').ATTRIB_CWF;
/**
 * All variable extraction and rendering is done here.
 *
 * There are four broad categories of methods here
 * 1. Site level variable extraction and storage methods
 *    These methods provide interfaces to store a particular (sub)site's variables,
 *    rendering them with the same (sub)site's previously extracted variables
 *    before doing so in {@link userDefinedVariablesMap}.
 *
 * 2. Site level variable rendering methods
 *    These methods use the processed variables in {@link userDefinedVariablesMap}
 *    to render provided string content that belongs to a provided content file path.
 *    Using the content file path, we are able to get the appropriate (sub)site's (that
 *    the content belongs to) variables and then render them with it.
 *
 * 3. Page level variable extraction and storage methods
 *    These methods are similar to (1), but extract variables from a page,
 *    declared by <variable>s or <import>s.
 *    There are also some utility methods here facilitating extraction of <variable>s
 *    the are nested within an <include> element, and inline variables ('var-xx') declared
 *    as attributes in the <include> itself.
 *
 * 4. Combined page and site variable rendering methods
 *    These methods are similar to (2), but in addition to the site variables, they
 *    render the content with the page variables extracted from (3) as well.
 */
var VariableProcessor = /** @class */ (function () {
    function VariableProcessor(rootPath, baseUrlMap) {
        var _this = this;
        /**
         * Root site path
         * @type {string}
         */
        this.rootPath = rootPath;
        /**
         * Set of sites' root paths, for resolving the provided file path in
         * rendering methods to the appropriate (sub)site's root path.
         * @type {Set<string>}
         */
        this.baseUrlMap = baseUrlMap;
        /**
         * Map of sites' root paths to their variables
         * @type {Object<string, Object<string, any>>}
         */
        this.userDefinedVariablesMap = {};
        /**
         * Map of sites' root paths to the respective VariableRenderer instances
         * @type {Object<string, VariableRenderer>}
         */
        this.variableRendererMap = {};
        // Set up userDefinedVariablesMap and variableRendererMap
        this.baseUrlMap.forEach(function (siteRootPath) {
            _this.userDefinedVariablesMap[siteRootPath] = {};
            _this.variableRendererMap[siteRootPath] = new VariableRenderer(siteRootPath);
        });
    }
    /*
     * --------------------------------------------------
     * Utility methods
     */
    VariableProcessor.prototype.invalidateCache = function () {
        Object.values(this.variableRendererMap).forEach(function (variableRenderer) { return variableRenderer.invalidateCache(); });
    };
    /*
     * --------------------------------------------------
     * Site level variable storage methods
     */
    /**
     * Adds a variable for a site with the specified name and value.
     * @param site path of the site, as reflected by the Site instance's baseUrlMap
     * @param name of the variable to add
     * @param value of the variable
     */
    VariableProcessor.prototype.addUserDefinedVariable = function (site, name, value) {
        this.userDefinedVariablesMap[site][name] = value;
    };
    /**
     * Renders the variable in addition to adding it, unlike {@link addUserDefinedVariable}.
     * This is to allow using previously declared site variables in site variables declared later on.
     */
    VariableProcessor.prototype.renderAndAddUserDefinedVariable = function (site, name, value) {
        var renderedVal = this.variableRendererMap[site].renderString(value, this.userDefinedVariablesMap[site], new PageSources());
        this.addUserDefinedVariable(site, name, renderedVal);
    };
    /**
     * Version of {@link addUserDefinedVariable} that adds to all sites.
     */
    VariableProcessor.prototype.addUserDefinedVariableForAllSites = function (name, value) {
        var _this = this;
        Object.keys(this.userDefinedVariablesMap)
            .forEach(function (base) { return _this.addUserDefinedVariable(base, name, value); });
    };
    VariableProcessor.prototype.resetUserDefinedVariablesMap = function () {
        var _this = this;
        this.userDefinedVariablesMap = {};
        this.baseUrlMap.forEach(function (siteRootPath) {
            _this.userDefinedVariablesMap[siteRootPath] = {};
        });
    };
    /**
     * Retrieves the appropriate **(sub)site** variables of the supplied file path.
     * @param contentFilePath to look up.
     * @return {*} The appropriate (closest upwards) site variables map
     */
    VariableProcessor.prototype.getParentSiteVariables = function (contentFilePath) {
        var parentSitePath = urlUtils.getParentSiteAbsolutePath(contentFilePath, this.rootPath, this.baseUrlMap);
        return this.userDefinedVariablesMap[parentSitePath];
    };
    /*
     * --------------------------------------------------
     * Site level variable rendering methods
     */
    /**
     * Renders content belonging to a specified file path with the appropriate site's variables,
     * with an optional set of lower and higher priority variables than the site variables to be rendered.
     * @param contentFilePath of the specified content to render
     * @param {PageSources} pageSources to add dependencies found during nunjucks rendering to
     * @param lowerPriorityVariables than the site variables, if any
     */
    VariableProcessor.prototype.renderWithSiteVariables = function (contentFilePath, pageSources, lowerPriorityVariables) {
        if (lowerPriorityVariables === void 0) { lowerPriorityVariables = {}; }
        var userDefinedVariables = this.getParentSiteVariables(contentFilePath);
        var parentSitePath = urlUtils.getParentSiteAbsolutePath(contentFilePath, this.rootPath, this.baseUrlMap);
        return this.variableRendererMap[parentSitePath].renderFile(contentFilePath, __assign(__assign({}, lowerPriorityVariables), userDefinedVariables), pageSources);
    };
    /*
     * --------------------------------------------------
     * Page level variable storage methods
     */
    /**
     * Extracts variables specified as <include var-xx="..."> in include elements.
     * @param includeElement to extract inline variables from
     */
    VariableProcessor.extractIncludeInlineVariables = function (includeElement) {
        var includeInlineVariables = {};
        Object.keys(includeElement.attribs).forEach(function (attribute) {
            if (!attribute.startsWith('var-')) {
                return;
            }
            var variableName = attribute.slice(4);
            includeInlineVariables[variableName] = includeElement.attribs[attribute];
        });
        return includeInlineVariables;
    };
    /**
     * Extracts variables specified as <variable> in include elements.
     * @param includeElement to search child nodes for
     */
    VariableProcessor.extractIncludeChildElementVariables = function (includeElement) {
        if (!(includeElement.children && includeElement.children.length)) {
            return {};
        }
        var includeChildVariables = {};
        includeElement.children.forEach(function (child) {
            if (child.name !== 'variable' && child.name !== 'span') {
                return;
            }
            var variableName = child.attribs.name || child.attribs.id;
            if (!variableName) {
                logger.warn("Missing 'name' or 'id' in variable for " + includeElement.attribs.src + "'s include in " + includeElement.attribs[ATTRIB_CWF] + ".\n");
                return;
            }
            if (!includeChildVariables[variableName]) {
                includeChildVariables[variableName] = cheerio.html(child.children);
            }
        });
        return includeChildVariables;
    };
    /**
     * Extract variables from an <include> element.
     * See https://markbind.org/userGuide/reusingContents.html#specifying-variables-in-an-include for usage.
     * It is a subroutine for {@link renderIncludeFile}
     * @param includeElement include element to extract variables from
     */
    VariableProcessor.extractIncludeVariables = function (includeElement) {
        var includeInlineVariables = VariableProcessor.extractIncludeInlineVariables(includeElement);
        var includeChildVariables = VariableProcessor.extractIncludeChildElementVariables(includeElement);
        return __assign(__assign({}, includeChildVariables), includeInlineVariables);
    };
    /*
     * --------------------------------------------------
     * Combined (both site and page variables) rendering methods
     */
    /**
     * Renders an <include> file with the supplied context, returning the rendered
     * content and new context with respect to the child content.
     * @param filePath of the included file source
     * @param {PageSources} pageSources to add dependencies found during nunjucks rendering to
     * @param node of the include element
     * @param {Context} context object containing the parent <include> (if any) variables for the current
     *        context, which has greater priority than the extracted include variables of the current context.
     * @param asIfAt where the included file should be rendered from
     * @return {Object} object containing the nunjucks-processed content, and a new {@link Context} object
     */
    VariableProcessor.prototype.renderIncludeFile = function (filePath, pageSources, node, context, asIfAt) {
        // Extract included variables from the include element, merging with the parent context variables
        var includeVariables = VariableProcessor.extractIncludeVariables(node);
        var variables = __assign(__assign({}, includeVariables), context.variables);
        // Render the included content with the current <include>'s <variable>s and any parent <include>'s
        var renderedContent = this.renderWithSiteVariables(filePath, pageSources, variables);
        var childContext = context.clone();
        childContext.cwf = asIfAt;
        childContext.variables = variables;
        return {
            nunjucksProcessed: renderedContent,
            childContext: childContext,
        };
    };
    return VariableProcessor;
}());
module.exports = VariableProcessor;
