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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var cheerio = require('cheerio');
require('../patches/htmlparser2');
var fs = require('fs-extra');
var htmlBeautify = require('js-beautify').html;
var path = require('path');
var _ = {};
_.cloneDeep = require('lodash/cloneDeep');
_.isString = require('lodash/isString');
_.isObject = require('lodash/isObject');
_.isArray = require('lodash/isArray');
var CyclicReferenceError = require('../errors').CyclicReferenceError;
var PageSources = require('./PageSources').PageSources;
var NodeProcessor = require('../html/NodeProcessor').NodeProcessor;
var utils = require('../utils');
var logger = require('../utils/logger');
var PACKAGE_VERSION = require('../../package.json').version;
var _a = require('./constants'), PAGE_NAV_ID = _a.PAGE_NAV_ID, PAGE_NAV_TITLE_CLASS = _a.PAGE_NAV_TITLE_CLASS, TITLE_PREFIX_SEPARATOR = _a.TITLE_PREFIX_SEPARATOR;
var LAYOUT_DEFAULT_NAME = require('../constants').LAYOUT_DEFAULT_NAME;
cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities
var Page = /** @class */ (function () {
    /**
     * @param {PageConfig} pageConfig
     */
    function Page(pageConfig) {
        /**
         * Page configuration passed from {@link Site}.
         * This should not be mutated.
         * @type {PageConfig}
         */
        this.pageConfig = pageConfig;
    }
    /**
     * Resets or initialises all stateful variables of the page,
     * which differs from one page generation call to another.
     */
    Page.prototype.resetState = function () {
        /**
         * Object containing asset names as keys and their corresponding file paths,
         * or an array of <link/script> elements extracted from plugins during {@link collectPluginPageNjkAssets}.
         * @type {Object<string, string | Array<string>>}
         */
        this.asset = _.cloneDeep(this.pageConfig.asset);
        /**
         * The pure frontMatter of the page as collected in {@link collectFrontMatter}.
         * https://markbind.org/userGuide/tweakingThePageStructure.html#front-matter
         * @type {Object<string, any>}
         */
        this.frontMatter = {};
        /**
         * Map of heading ids to its text content
         * @type {Object<string, string>}
         */
        this.headings = {};
        /**
         * Stores the next integer to append to a heading id, for resolving heading id conflicts
         * @type {Object<string, number>}
         */
        this.headerIdMap = {};
        /**
         * Set of included files (dependencies) used for live reload
         * https://markbind.org/userGuide/reusingContents.html#includes
         * @type {Set<string>}
         */
        this.includedFiles = new Set([this.pageConfig.sourcePath]);
        /**
         * Map of heading ids (that closest to the keyword) to the keyword text content
         * https://markbind.org/userGuide/makingTheSiteSearchable.html#keywords
         * @type {Object<string, Array>}
         */
        this.keywords = {};
        /**
         * The title of the page.
         * This is initially set to the title specified in the site configuration,
         * if there is none, we look for one in the frontMatter(s) as well.
         * @type {string}
         */
        this.title = this.pageConfig.title || '';
        /*
         * Layouts related properties
         */
        /**
         * The layout to use for this page, which may be further mutated in {@link processFrontMatter.}
         * @type {string}
         */
        this.layout = this.pageConfig.layout;
        /**
         * An object storing the mapping from the navigable headings' id to an
         * object of {text: NAV_TEXT, level: NAV_LEVEL}.
         * Used for page nav generation.
         * @type {Object<string, Object>}
         */
        this.navigableHeadings = {};
    };
    /**
     * Checks if the provided filePath is a dependency of the page
     * @param {string} filePath to check
     */
    Page.prototype.isDependency = function (filePath) {
        return this.includedFiles && this.includedFiles.has(filePath);
    };
    Page.prototype.prepareTemplateData = function (content, hasPageNav) {
        var prefixedTitle = this.pageConfig.titlePrefix
            ? this.pageConfig.titlePrefix + (this.title ? TITLE_PREFIX_SEPARATOR + this.title : '')
            : this.title;
        // construct temporary asset object with only POSIX-style paths
        var asset = {};
        Object.entries(this.asset).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            asset[key] = _.isString(value) ? utils.ensurePosix(value) : value;
        });
        return {
            asset: asset,
            baseUrl: this.pageConfig.baseUrl,
            content: content,
            hasPageNav: hasPageNav,
            dev: this.pageConfig.dev,
            faviconUrl: this.pageConfig.faviconUrl,
            markBindVersion: "MarkBind " + PACKAGE_VERSION,
            title: prefixedTitle,
            enableSearch: this.pageConfig.enableSearch,
        };
    };
    /**
     * Checks if page.frontMatter has a valid page navigation specifier
     */
    Page.prototype.isPageNavigationSpecifierValid = function () {
        var pageNav = this.frontMatter.pageNav;
        return pageNav && (pageNav === 'default' || Number.isInteger(pageNav));
    };
    /**
     * Generates element selector for page navigation, depending on specifier in front matter
     * @param pageNav {string|number} 'default' refers to the configured heading indexing level,
     * otherwise a number that indicates the indexing level.
     */
    Page.prototype.generateElementSelectorForPageNav = function (pageNav) {
        if (pageNav === 'default') {
            return Page.generateHeadingSelector(this.pageConfig.headingIndexingLevel) + ", panel";
        }
        else if (Number.isInteger(pageNav)) {
            return Page.generateHeadingSelector(parseInt(pageNav, 10)) + ", panel";
        }
        // Not a valid specifier
        return undefined;
    };
    /**
     * Collect headings outside of models and unexpanded panels.
     * Collects headings from the header slots of unexpanded panels, but not its content.
     * @param content html content of a page
     */
    Page.prototype.collectNavigableHeadings = function (content) {
        var pageNav = this.frontMatter.pageNav;
        var elementSelector = this.generateElementSelectorForPageNav(pageNav);
        if (elementSelector === undefined) {
            return;
        }
        var $ = cheerio.load(content);
        $('b-modal').remove();
        this._collectNavigableHeadings($, $.root()[0], elementSelector);
    };
    Page.prototype._collectNavigableHeadings = function ($, context, pageNavSelector) {
        var _this = this;
        $(pageNavSelector, context).each(function (i, elem) {
            // Check if heading or panel is already inside an unexpanded panel
            var isInsideUnexpandedPanel = false;
            var panelParents = $(elem).parentsUntil(context).filter('panel').not(elem);
            panelParents.each(function (j, elemParent) {
                if (elemParent.attribs.expanded === undefined) {
                    isInsideUnexpandedPanel = true;
                    return false;
                }
                return true;
            });
            if (isInsideUnexpandedPanel) {
                return;
            }
            // Check if heading / panel is under a panel's header slots, which is handled specially below.
            var slotParents = $(elem).parentsUntil(context).filter('[slot="header"]').not(elem);
            var panelSlotParents = slotParents.parent('panel');
            if (panelSlotParents.length) {
                return;
            }
            if (elem.name === 'panel') {
                // Recurse only on the slot which has priority
                var headings = $(elem).children('[slot="header"]');
                if (!headings.length)
                    return;
                _this._collectNavigableHeadings($, headings.first(), pageNavSelector);
            }
            else if ($(elem).attr('id') !== undefined) {
                // Headings already in content, with a valid ID
                _this.navigableHeadings[$(elem).attr('id')] = {
                    text: $(elem).text(),
                    level: elem.name.replace('h', ''),
                };
            }
        });
    };
    /**
     * Records headings and keywords inside rendered page into this.headings and this.keywords respectively
     */
    Page.prototype.collectHeadingsAndKeywords = function (pageContent) {
        this.collectHeadingsAndKeywordsInContent(pageContent, null, false, []);
    };
    /**
     * Records headings and keywords inside content into this.headings and this.keywords respectively
     * @param content that contains the headings and keywords
     * @param lastHeading
     * @param excludeHeadings
     * @param sourceTraversalStack
     */
    Page.prototype.collectHeadingsAndKeywordsInContent = function (content, lastHeading, excludeHeadings, sourceTraversalStack) {
        var _this = this;
        var $ = cheerio.load(content);
        var headingsSelector = Page.generateHeadingSelector(this.pageConfig.headingIndexingLevel);
        $('b-modal').remove();
        $('panel').not('panel panel')
            .each(function (index, panel) {
            var slotHeader = $(panel).children('[slot="header"]');
            if (slotHeader.length) {
                _this.collectHeadingsAndKeywordsInContent(slotHeader.html(), lastHeading, excludeHeadings, sourceTraversalStack);
            }
        })
            .each(function (index, panel) {
            var shouldExcludeHeadings = excludeHeadings || (panel.attribs.expanded === undefined);
            var closestHeading = Page.getClosestHeading($, headingsSelector, panel);
            if (!closestHeading) {
                closestHeading = lastHeading;
            }
            var slotHeadings = $(panel).children('[slot="header"]').find(':header');
            if (slotHeadings.length) {
                closestHeading = slotHeadings.first();
            }
            if (panel.attribs.src) {
                var src = panel.attribs.src.split('#')[0];
                var buildInnerDir = path.dirname(_this.pageConfig.sourcePath);
                var resultInnerDir = path.dirname(_this.pageConfig.resultPath);
                var includeRelativeToBuildRootDirPath = _this.pageConfig.baseUrl
                    ? path.relative(_this.pageConfig.baseUrl, src)
                    : src.substring(1);
                var includeAbsoluteToBuildRootDirPath = path.resolve(_this.pageConfig.rootPath, includeRelativeToBuildRootDirPath);
                var includeRelativeToInnerDirPath = path.relative(buildInnerDir, includeAbsoluteToBuildRootDirPath);
                var includePath = path.resolve(resultInnerDir, includeRelativeToInnerDirPath);
                var includeContent = fs.readFileSync(includePath);
                var childSourceTraversalStack = sourceTraversalStack.slice();
                childSourceTraversalStack.push(includePath);
                if (childSourceTraversalStack.length > CyclicReferenceError.MAX_RECURSIVE_DEPTH) {
                    throw new CyclicReferenceError(childSourceTraversalStack);
                }
                if (panel.attribs.fragment) {
                    $ = cheerio.load(includeContent);
                    _this.collectHeadingsAndKeywordsInContent($("#" + panel.attribs.fragment).html(), closestHeading, shouldExcludeHeadings, childSourceTraversalStack);
                }
                else {
                    _this.collectHeadingsAndKeywordsInContent(includeContent, closestHeading, shouldExcludeHeadings, childSourceTraversalStack);
                }
            }
            else {
                _this.collectHeadingsAndKeywordsInContent($(panel).html(), closestHeading, shouldExcludeHeadings, sourceTraversalStack);
            }
        });
        $ = cheerio.load(content);
        if (this.pageConfig.headingIndexingLevel > 0) {
            $('b-modal').remove();
            $('panel').remove();
            if (!excludeHeadings) {
                $(headingsSelector).each(function (i, heading) {
                    _this.headings[$(heading).attr('id')] = $(heading).text();
                });
            }
            $('.keyword').each(function (i, keyword) {
                var closestHeading = Page.getClosestHeading($, headingsSelector, keyword);
                if (excludeHeadings || !closestHeading) {
                    if (!lastHeading) {
                        logger.warn("Missing heading for keyword: " + $(keyword).text());
                        return;
                    }
                    closestHeading = lastHeading;
                }
                _this.linkKeywordToHeading($, keyword, closestHeading);
            });
        }
    };
    /**
     * Links a keyword to a heading
     * @param $ a Cheerio object
     * @param keyword to link
     * @param heading to link
     */
    Page.prototype.linkKeywordToHeading = function ($, keyword, heading) {
        var headingId = $(heading).attr('id');
        if (!(headingId in this.keywords)) {
            this.keywords[headingId] = [];
        }
        this.keywords[headingId].push($(keyword).text());
    };
    /**
     * Uses the collected frontmatter from {@link collectFrontMatter} to extract the {@link Page}'s
     * instance configurations.
     * FrontMatter properties always have lower priority than site configuration properties.
     */
    Page.prototype.processFrontMatter = function (frontMatter) {
        this.frontMatter = __assign(__assign(__assign({}, frontMatter), this.pageConfig.globalOverride), this.pageConfig.frontmatterOverride);
        this.title = this.title || this.frontMatter.title || '';
        this.layout = this.layout || this.frontMatter.layout || LAYOUT_DEFAULT_NAME;
    };
    /**
     *  Generates page navigation's heading list HTML
     *
     *  A stack is used to maintain proper indentation levels for the headings at different heading levels.
     */
    Page.prototype.generatePageNavHeadingHtml = function () {
        var _this = this;
        var headingHTML = '';
        var headingStack = [];
        Object.keys(this.navigableHeadings).forEach(function (key) {
            var currentHeadingLevel = _this.navigableHeadings[key].level;
            var currentHeadingHTML = "<a class=\"nav-link py-1\" href=\"#" + key + "\">"
                + (_this.navigableHeadings[key].text + "&#x200E;</a>\n");
            var nestedHeadingHTML = '<nav class="nav nav-pills flex-column my-0 nested no-flex-wrap">\n'
                + ("" + currentHeadingHTML);
            if (headingStack.length === 0 || headingStack[headingStack.length - 1] === currentHeadingLevel) {
                // Add heading without nesting, into headingHTML
                headingHTML += currentHeadingHTML;
            }
            else {
                // Stack has at least 1 other heading level
                var topOfHeadingStack = headingStack[headingStack.length - 1];
                if (topOfHeadingStack < currentHeadingLevel) {
                    // Increase nesting level by 1
                    headingHTML += nestedHeadingHTML;
                }
                else {
                    // Close any nested list with heading level higher than current
                    while (headingStack.length > 1 && topOfHeadingStack > currentHeadingLevel) {
                        headingHTML += '</nav>\n';
                        headingStack.pop();
                        topOfHeadingStack = headingStack[headingStack.length - 1];
                    }
                    if (topOfHeadingStack < currentHeadingLevel) {
                        // Increase nesting level by 1
                        headingHTML += nestedHeadingHTML;
                    }
                    else {
                        headingHTML += currentHeadingHTML;
                    }
                }
            }
            // Update heading level stack
            if (headingStack.length === 0 || headingStack[headingStack.length - 1] !== currentHeadingLevel) {
                headingStack.push(currentHeadingLevel);
            }
        });
        // Ensure proper closing for any nested lists towards the end
        while (headingStack.length > 1
            && headingStack[headingStack.length - 1] > headingStack[headingStack.length - 2]) {
            headingHTML += '</nav>\n';
            headingStack.pop();
        }
        return headingHTML;
    };
    /**
     * Generates page navigation's header if specified in this.frontMatter
     * @returns string string
     */
    Page.prototype.generatePageNavTitleHtml = function () {
        var pageNavTitle = this.frontMatter.pageNavTitle;
        return pageNavTitle
            ? "<a class=\"navbar-brand " + PAGE_NAV_TITLE_CLASS + "\" href=\"#\">" + pageNavTitle.toString() + "</a>"
            : '';
    };
    /**
     *  Builds page navigation bar with headings up to headingIndexingLevel
     */
    Page.prototype.buildPageNav = function (content) {
        var isFmPageNavSpecifierValid = this.isPageNavigationSpecifierValid();
        var doesLayoutHavePageNav = this.pageConfig.layoutManager.layoutHasPageNav(this.layout);
        if (isFmPageNavSpecifierValid && doesLayoutHavePageNav) {
            this.navigableHeadings = {};
            this.collectNavigableHeadings(content);
            var pageNavTitleHtml = this.generatePageNavTitleHtml();
            var pageNavHeadingHTML = this.generatePageNavHeadingHtml();
            return pageNavTitleHtml + "\n"
                + ("<nav id=\"" + PAGE_NAV_ID + "\" class=\"nav nav-pills flex-column my-0 small no-flex-wrap\">\n")
                + (pageNavHeadingHTML + "\n")
                + '</nav>\n';
        }
        return '';
    };
    /**
     * A file configuration object.
     * @typedef {Object<string, any>} FileConfig
     * @property {Set<string>} baseUrlMap the set of urls representing the sites' base directories
     * @property {string} rootPath
     * @property {VariableProcessor} variableProcessor
     * @property {Object<string, number>} headerIdMap
     */
    Page.prototype.generate = function (externalManager) {
        return __awaiter(this, void 0, void 0, function () {
            var fileConfig, _a, variableProcessor, layoutManager, pluginManager, pageSources, nodeProcessor, content, pageContent, pageNav, renderedTemplate, outputTemplateHTML;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.resetState(); // Reset for live reload
                        fileConfig = {
                            baseUrlMap: this.pageConfig.baseUrlMap,
                            baseUrl: this.pageConfig.baseUrl,
                            rootPath: this.pageConfig.rootPath,
                            headerIdMap: this.headerIdMap,
                            ignore: this.pageConfig.ignore,
                            addressablePagesSource: this.pageConfig.addressablePagesSource,
                        };
                        _a = this.pageConfig, variableProcessor = _a.variableProcessor, layoutManager = _a.layoutManager, pluginManager = _a.pluginManager;
                        pageSources = new PageSources();
                        nodeProcessor = new NodeProcessor(fileConfig, pageSources, variableProcessor, pluginManager);
                        content = variableProcessor.renderWithSiteVariables(this.pageConfig.sourcePath, pageSources);
                        return [4 /*yield*/, nodeProcessor.process(this.pageConfig.sourcePath, content)];
                    case 1:
                        content = _b.sent();
                        this.processFrontMatter(nodeProcessor.frontMatter);
                        content = Page.addScrollToTopButton(content);
                        content = pluginManager.postRender(this.frontMatter, content);
                        pageContent = content;
                        pluginManager.collectPluginPageNjkAssets(this.frontMatter, content, this.asset);
                        return [4 /*yield*/, layoutManager.generateLayoutIfNeeded(this.layout)];
                    case 2:
                        _b.sent();
                        pageNav = this.buildPageNav(content);
                        content = layoutManager.combineLayoutWithPage(this.layout, content, pageNav, this.includedFiles);
                        this.asset = __assign(__assign({}, this.asset), layoutManager.getLayoutPageNjkAssets(this.layout));
                        renderedTemplate = this.pageConfig.template.render(this.prepareTemplateData(content, !!pageNav));
                        outputTemplateHTML = this.pageConfig.disableHtmlBeautify
                            ? renderedTemplate
                            : htmlBeautify(renderedTemplate, pluginManager.htmlBeautifyOptions);
                        return [4 /*yield*/, fs.outputFile(this.pageConfig.resultPath, outputTemplateHTML)];
                    case 3:
                        _b.sent();
                        pageSources.addAllToSet(this.includedFiles);
                        return [4 /*yield*/, externalManager.generateDependencies(pageSources.getDynamicIncludeSrc(), this.includedFiles)];
                    case 4:
                        _b.sent();
                        this.collectHeadingsAndKeywords(pageContent);
                        return [2 /*return*/];
                }
            });
        });
    };
    Page.addScrollToTopButton = function (pageData) {
        var button = '<i class="fa fa-arrow-circle-up fa-lg" id="scroll-top-button" '
            + 'onclick="handleScrollTop()" aria-hidden="true"></i>';
        return pageData + "\n" + button;
    };
    /**
     * Generates a selector for headings with level inside the headingIndexLevel
     * or with the index attribute, that do not also have the noindex attribute
     * @param headingIndexingLevel to generate
     */
    Page.generateHeadingSelector = function (headingIndexingLevel) {
        var headingsSelectors = ['.always-index:header', 'h1'];
        for (var i = 2; i <= headingIndexingLevel; i += 1) {
            headingsSelectors.push("h" + i);
        }
        headingsSelectors = headingsSelectors.map(function (selector) { return selector + ":not(.no-index)"; });
        return headingsSelectors.join(',');
    };
    /**
     * Gets the closest heading to an element
     * @param $ a Cheerio object
     * @param headingsSelector jQuery selector for selecting headings
     * @param element to find closest heading
     */
    Page.getClosestHeading = function ($, headingsSelector, element) {
        var prevElements = $(element).prevAll();
        for (var i = 0; i < prevElements.length; i += 1) {
            var currentElement = $(prevElements[i]);
            if (currentElement.is(headingsSelector)) {
                return currentElement;
            }
            var childHeadings = currentElement.find(headingsSelector);
            if (childHeadings.length > 0) {
                return childHeadings.last();
            }
        }
        if ($(element).parent().length === 0) {
            return null;
        }
        return Page.getClosestHeading($, headingsSelector, $(element).parent());
    };
    return Page;
}());
module.exports = Page;
