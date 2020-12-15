var path = require('path');
var lodashHas = require('lodash/has');
var url = require('url');
var ignore = require('ignore');
var utils = require('../utils');
var fsUtils = require('../utils/fsUtil');
var logger = require('../utils/logger');
var PluginManager = require('../plugins/PluginManager').PluginManager;
var pluginTagConfig = PluginManager.tagConfig;
var defaultTagLinkMap = {
    img: 'src',
    pic: 'src',
    thumbnail: 'src',
    a: 'href',
    link: 'href',
    include: 'src',
    panel: 'src',
    script: 'src',
};
function hasTagLink(node) {
    return node.name in defaultTagLinkMap || node.name in pluginTagConfig;
}
function getDefaultTagsResourcePath(node) {
    var linkAttribName = defaultTagLinkMap[node.name];
    var resourcePath = node.attribs && node.attribs[linkAttribName];
    return resourcePath;
}
function getResourcePathFromRoot(rootPath, fullResourcePath) {
    return utils.ensurePosix(path.relative(rootPath, fullResourcePath));
}
function _convertRelativeLink(node, cwf, rootPath, baseUrl, resourcePath, linkAttribName) {
    if (!resourcePath) {
        return;
    }
    if (path.isAbsolute(resourcePath) || utils.isUrl(resourcePath) || resourcePath.startsWith('#')) {
        // Do not rewrite.
        return;
    }
    var cwd = path.dirname(cwf);
    var fullResourcePath = path.join(cwd, resourcePath);
    var resourcePathFromRoot = getResourcePathFromRoot(rootPath, fullResourcePath);
    node.attribs[linkAttribName] = path.posix.join(baseUrl || '/', resourcePathFromRoot);
}
/**
 * Converts relative links in elements to absolute ones, prepended by the {@param baseUrl}.
 * This is needed because a relative link may have been from an included file (through <include>, etc.),
 * hence we need to rewrite the link accordingly.
 *
 * TODO allow plugins to tap into this process / extend {@link defaultTagLinkMap}
 *
 * @param {Object<any, any>} node from the dom traversal
 * @param {string} cwf as flagged from {@link NodeProcessor}
 * @param {string} rootPath of the root site
 * @param {string} baseUrl
 */
function convertRelativeLinks(node, cwf, rootPath, baseUrl) {
    if (node.name in defaultTagLinkMap) {
        var resourcePath = getDefaultTagsResourcePath(node);
        var linkAttribName = defaultTagLinkMap[node.name];
        _convertRelativeLink(node, cwf, rootPath, baseUrl, resourcePath, linkAttribName);
    }
    if (node.name in pluginTagConfig && pluginTagConfig[node.name].attributes && node.attribs) {
        pluginTagConfig[node.name].attributes.forEach(function (attrConfig) {
            if (attrConfig.isRelative) {
                var resourcePath = node.attribs[attrConfig.name];
                _convertRelativeLink(node, cwf, rootPath, baseUrl, resourcePath, attrConfig.name);
            }
        });
    }
}
function convertMdAndMbdExtToHtmlExt(node) {
    if (node.name === 'a' && node.attribs && node.attribs.href) {
        var hasNoConvert = lodashHas(node.attribs, 'no-convert');
        if (hasNoConvert) {
            return;
        }
        var href = node.attribs.href;
        var hasMdExtension = href.slice(-3) === '.md';
        if (hasMdExtension) {
            var newHref = href.substring(0, href.length - 3) + ".html";
            node.attribs.href = newHref;
            return;
        }
        var hasMbdExtension = href.slice(-4) === '.mbd';
        if (hasMbdExtension) {
            var newHref = href.substring(0, href.length - 4) + ".html";
            node.attribs.href = newHref;
        }
    }
}
function isValidPageSource(resourcePath, config) {
    var relativeResourcePath = resourcePath.startsWith('/')
        ? resourcePath.substring(1)
        : resourcePath;
    var relativeResourcePathWithNoExt = fsUtils.removeExtensionPosix(relativeResourcePath);
    var isPageSrc = config.addressablePagesSource.includes(relativeResourcePathWithNoExt);
    return isPageSrc;
}
function isValidFileAsset(resourcePath, config) {
    var relativeResourcePath = resourcePath.startsWith('/')
        ? resourcePath.substring(1)
        : resourcePath;
    var fileIgnore = ignore().add(config.ignore);
    if (relativeResourcePath && fileIgnore.ignores(relativeResourcePath)) {
        return true;
    }
    var fullResourcePath = path.join(config.rootPath, relativeResourcePath);
    return utils.fileExists(fullResourcePath);
}
/**
 * Serves as an internal intra-link validator. Checks if the intra-links are valid.
 * If the intra-links are suspected to be invalid and they do not have the no-validation
 * attribute, a warning message will be logged.
 *
 * @param {Object<any, any>} node from the dom traversal
 * @param {string} cwf as flagged from {@link NodePreprocessor}
 * @param {Object<any, any>} config passed for page metadata access
 * @returns {string} these string return values are for unit testing purposes only
 */
function validateIntraLink(node, cwf, config) {
    if (node.attribs) {
        var hasIntralinkValidationDisabled = lodashHas(node.attribs, 'no-validation');
        if (hasIntralinkValidationDisabled) {
            return 'Intralink validation disabled';
        }
    }
    var resourcePath = getDefaultTagsResourcePath(node);
    if (!resourcePath || utils.isUrl(resourcePath) || resourcePath.startsWith('#')) {
        return 'Not Intralink';
    }
    var err = "You might have an invalid intra-link! Ignore this warning if it was intended.\n'" + resourcePath + "' found in file '" + cwf + "'";
    resourcePath = utils.stripBaseUrl(resourcePath, config.baseUrl);
    var resourcePathUrl = url.parse(resourcePath);
    if (resourcePathUrl.hash) {
        // remove hash portion (if any) in the resourcePath
        resourcePath = resourcePathUrl.path;
    }
    if (resourcePath.endsWith('/')) {
        // append index.html to e.g. /userGuide/
        var implicitResourcePath = resourcePath + "index.html";
        if (!isValidPageSource(implicitResourcePath, config) && !isValidFileAsset(implicitResourcePath, config)) {
            logger.warn(err);
            return 'Intralink ending with "/" is neither a Page Source nor File Asset';
        }
        return 'Intralink ending with "/" is a valid Page Source or File Asset';
    }
    var hasNoFileExtension = path.posix.extname(resourcePath) === '';
    if (hasNoFileExtension) {
        // does not end with '/' and no file ext (e.g. /userGuide)
        var implicitResourcePath = resourcePath + "/index.html";
        var asFileAsset = resourcePath;
        if (!isValidPageSource(implicitResourcePath, config) && !isValidFileAsset(implicitResourcePath, config)
            && !isValidFileAsset(asFileAsset, config)) {
            logger.warn(err);
            return 'Intralink with no extension is neither a Page Source nor File Asset';
        }
        return 'Intralink with no extension is a valid Page Source or File Asset';
    }
    var hasHtmlExt = resourcePath.slice(-5) === '.html';
    if (hasHtmlExt) {
        if (!isValidPageSource(resourcePath, config) && !isValidFileAsset(resourcePath, config)) {
            logger.warn(err);
            return 'Intralink with ".html" extension is neither a Page Source nor File Asset';
        }
        return 'Intralink with ".html" extension is a valid Page Source or File Asset';
    }
    // basic asset check
    if (!isValidFileAsset(resourcePath, config)) {
        logger.warn(err);
        return 'Intralink is not a File Asset';
    }
    return 'Intralink is a valid File Asset';
}
/**
 * Resolves and collects source file paths pointed to by attributes in nodes for live reload.
 * Only necessary for plugins for now.
 *
 * @param {Object<any, any>} node from the dom traversal
 * @param {string} rootPath site root path to resolve the link from
 * @param {string} baseUrl base url to strip off the link (if any)
 * @param {PageSources} pageSources {@link PageSources} object to add the resolved file path to
 * @returns {string} these string return values are for unit testing purposes only
 */
function collectSource(node, rootPath, baseUrl, pageSources) {
    var tagConfig = pluginTagConfig[node.name];
    if (!tagConfig || !tagConfig.attributes) {
        return;
    }
    tagConfig.attributes.forEach(function (attrConfig) {
        if (!attrConfig.isSourceFile) {
            return;
        }
        var sourceFileLink = node.attribs[attrConfig.name];
        if (!sourceFileLink || utils.isUrl(sourceFileLink)) {
            return;
        }
        var linkWithoutBaseUrl = utils.stripBaseUrl(sourceFileLink, baseUrl);
        var linkWithoutLeadingSlash = linkWithoutBaseUrl.startsWith('/')
            ? linkWithoutBaseUrl.substring(1)
            : linkWithoutBaseUrl;
        var fullResourcePath = path.join(rootPath, linkWithoutLeadingSlash);
        pageSources.staticIncludeSrc.push({ to: fullResourcePath });
    });
}
module.exports = {
    hasTagLink: hasTagLink,
    convertRelativeLinks: convertRelativeLinks,
    convertMdAndMbdExtToHtmlExt: convertMdAndMbdExtToHtmlExt,
    validateIntraLink: validateIntraLink,
    collectSource: collectSource,
};
