var cheerio = require('cheerio');
require('../patches/htmlparser2');
var path = require('path');
var url = require('url');
var logger = require('../utils/logger');
var CyclicReferenceError = require('../errors').CyclicReferenceError;
var utils = require('../utils');
var urlUtils = require('../utils/urls');
var _ = {};
_.has = require('lodash/has');
_.isEmpty = require('lodash/isEmpty');
/*
 * Common panel and include helper functions
 */
/**
 * Returns either an empty or error node depending on whether the file specified exists
 * and whether this file is optional if not.
 */
function _getFileExistsNode(element, context, actualFilePath, pageSources, isOptional) {
    if (isOptional === void 0) { isOptional = false; }
    if (!utils.fileExists(actualFilePath)) {
        if (isOptional) {
            return utils.createEmptyNode();
        }
        pageSources.missingIncludeSrc.push({
            from: context.cwf,
            to: actualFilePath,
        });
        var error = new Error("No such file: " + actualFilePath + "\nMissing reference in " + context.cwf);
        logger.error(error);
        return utils.createErrorNode(element, error);
    }
    return false;
}
function _getBoilerplateFilePath(node, filePath, config) {
    var element = node;
    var isBoilerplate = _.has(element.attribs, 'boilerplate');
    if (isBoilerplate) {
        element.attribs.boilerplate = element.attribs.boilerplate || path.basename(filePath);
        return urlUtils.calculateBoilerplateFilePath(element.attribs.boilerplate, filePath, config);
    }
    return undefined;
}
/**
 * Retrieves several flags and file paths from the src attribute specified in the element.
 */
function _getSrcFlagsAndFilePaths(element, config) {
    var isUrl = utils.isUrl(element.attribs.src);
    // We do this even if the src is not a url to get the hash, if any
    var includeSrc = url.parse(element.attribs.src);
    var filePath;
    if (isUrl) {
        filePath = element.attribs.src;
    }
    else {
        var includePath = decodeURIComponent(includeSrc.path);
        /*
         If the src starts with the baseUrl (or simply '/' if there is no baseUrl specified),
         get the relative path from the rootPath first,
         then use it to resolve the absolute path of the referenced file on the filesystem.
         */
        var relativePathToFile = path.posix.relative(config.baseUrl + "/", includePath);
        filePath = path.resolve(config.rootPath, relativePathToFile);
    }
    var boilerplateFilePath = _getBoilerplateFilePath(element, filePath, config);
    var actualFilePath = boilerplateFilePath || filePath;
    return {
        isUrl: isUrl,
        hash: includeSrc.hash,
        filePath: filePath,
        actualFilePath: actualFilePath,
    };
}
/*
 * Panels
 */
/**
 * PreProcesses panels with a src attribute specified.
 * Replaces the panel with an error node if the src is invalid.
 * Otherwise, sets the fragment attribute of the panel as parsed from the src,
 * and adds the appropriate include.
 */
function processPanelSrc(node, context, pageSources, config) {
    var hasSrc = _.has(node.attribs, 'src');
    if (!hasSrc) {
        return context;
    }
    var _a = _getSrcFlagsAndFilePaths(node, config), isUrl = _a.isUrl, hash = _a.hash, filePath = _a.filePath, actualFilePath = _a.actualFilePath;
    var fileExistsNode = _getFileExistsNode(node, context, actualFilePath, pageSources);
    if (fileExistsNode) {
        return fileExistsNode;
    }
    if (!isUrl && hash) {
        node.attribs.fragment = hash.substring(1);
    }
    var fragment = node.attribs.fragment;
    var relativePath = utils.setExtension(path.relative(config.rootPath, filePath), '._include_.html');
    var fullResourcePath = path.posix.join(config.baseUrl + "/", utils.ensurePosix(relativePath));
    node.attribs.src = fragment ? fullResourcePath + "#" + fragment : fullResourcePath;
    delete node.attribs.boilerplate;
    pageSources.dynamicIncludeSrc.push({
        from: context.cwf,
        to: actualFilePath,
        asIfTo: filePath,
    });
    return node;
}
/*
 * Includes
 */
function _deleteIncludeAttributes(node) {
    // Delete variable attributes in include tags as they are no longer needed
    // e.g. '<include var-title="..." var-xx="..." />'
    Object.keys(node.attribs).forEach(function (attribute) {
        if (attribute.startsWith('var-')) {
            delete node.attribs[attribute];
        }
    });
    delete node.attribs.boilerplate;
    delete node.attribs.src;
    delete node.attribs.inline;
    delete node.attribs.trim;
    delete node.attribs.optional;
}
/**
 * PreProcesses includes.
 * Replaces it with an error node if the specified src is invalid,
 * or an empty node if the src is invalid but optional.
 */
function processInclude(node, context, pageSources, variableProcessor, renderMd, renderMdInline, config) {
    if (_.isEmpty(node.attribs.src)) {
        var error = new Error("Empty src attribute in include in: " + context.cwf);
        logger.error(error);
        cheerio(node).replaceWith(utils.createErrorNode(node, error));
    }
    var _a = _getSrcFlagsAndFilePaths(node, config), isUrl = _a.isUrl, hash = _a.hash, filePath = _a.filePath, actualFilePath = _a.actualFilePath;
    var isOptional = _.has(node.attribs, 'optional');
    var fileExistsNode = _getFileExistsNode(node, context, actualFilePath, pageSources, isOptional);
    if (fileExistsNode) {
        return fileExistsNode;
    }
    var isInline = _.has(node.attribs, 'inline');
    var isTrim = _.has(node.attribs, 'trim');
    node.name = isInline ? 'span' : 'div';
    // No need to process url contents
    if (isUrl) {
        _deleteIncludeAttributes(node);
        return node;
    }
    pageSources.staticIncludeSrc.push({
        from: context.cwf,
        to: actualFilePath,
    });
    var _b = variableProcessor.renderIncludeFile(actualFilePath, pageSources, node, context, filePath), nunjucksProcessed = _b.nunjucksProcessed, childContext = _b.childContext;
    // Process sources with or without hash, retrieving and appending
    // the appropriate children to a wrapped include element
    var actualContent = nunjucksProcessed;
    if (hash) {
        var $ = cheerio.load(actualContent);
        actualContent = $(hash).html();
        if (actualContent === null) {
            actualContent = '';
            if (!isOptional) {
                var error = new Error("No such segment '" + hash + "' in file: " + actualFilePath + "\n"
                    + ("Missing reference in " + context.cwf));
                logger.error(error);
                actualContent = cheerio.html(utils.createErrorNode(node, error));
            }
        }
    }
    if (isTrim) {
        actualContent = actualContent.trim();
    }
    if (utils.isMarkdownFileExt(utils.getExt(actualFilePath))) {
        actualContent = isInline
            ? renderMdInline(actualContent)
            : renderMd(actualContent);
    }
    var $includeEl = cheerio(node);
    $includeEl.empty();
    $includeEl.append(actualContent);
    if (node.children && node.children.length > 0) {
        childContext.addCwfToCallstack(context.cwf);
        if (childContext.hasExceededMaxCallstackSize()) {
            var error = new CyclicReferenceError(childContext.callStack);
            logger.error(error);
            cheerio(node).replaceWith(utils.createErrorNode(node, error));
        }
    }
    _deleteIncludeAttributes(node);
    return childContext;
}
module.exports = {
    processInclude: processInclude,
    processPanelSrc: processPanelSrc,
};
