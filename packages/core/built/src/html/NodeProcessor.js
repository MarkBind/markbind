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
var htmlparser = require('htmlparser2');
require('../patches/htmlparser2');
var fm = require('fastmatter');
var Promise = require('bluebird');
var slugify = require('@sindresorhus/slugify');
var _ = {};
_.isArray = require('lodash/isArray');
_.cloneDeep = require('lodash/cloneDeep');
_.has = require('lodash/has');
var renderSiteNav = require('./siteNavProcessor').renderSiteNav;
var _a = require('./includePanelProcessor'), processInclude = _a.processInclude, processPanelSrc = _a.processPanelSrc;
var Context = require('./Context').Context;
var linkProcessor = require('./linkProcessor');
var insertTemporaryStyles = require('./tempStyleProcessor').insertTemporaryStyles;
var md = require('../lib/markdown-it');
var utils = require('../utils');
var logger = require('../utils/logger');
var FRONT_MATTER_FENCE = require('../Page/constants').FRONT_MATTER_FENCE;
var MARKBIND_FOOTNOTE_POPOVER_ID_PREFIX = require('./constants').MARKBIND_FOOTNOTE_POPOVER_ID_PREFIX;
var ATTRIB_CWF = require('../constants').ATTRIB_CWF;
cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities
var NodeProcessor = /** @class */ (function () {
    function NodeProcessor(config, pageSources, variableProcessor, pluginManager, docId) {
        if (docId === void 0) { docId = ''; }
        this.config = config;
        this.frontMatter = {};
        this.headTop = [];
        this.headBottom = [];
        this.scriptBottom = [];
        this.pageSources = pageSources;
        this.variableProcessor = variableProcessor;
        this.pluginManager = pluginManager;
        // markdown-it-footnotes state
        this.baseDocId = docId; // encapsulates footnotes in externals (<panel src="...">)
        this.docId = 0; // encapsulates footnotes in <include>s
        // Store footnotes of <include>s and the main content, then combine them at the end
        this.renderedFootnotes = [];
    }
    NodeProcessor.prototype._renderMd = function (text) {
        return md.render(text, this.docId
            ? { docId: "" + this.baseDocId + this.docId }
            : { docId: this.baseDocId });
    };
    NodeProcessor.prototype._renderMdInline = function (text) {
        return md.renderInline(text, this.docId
            ? { docId: "" + this.baseDocId + this.docId }
            : { docId: this.baseDocId });
    };
    /*
     * Private utility functions
     */
    NodeProcessor._trimNodes = function (node) {
        if (node.name === 'pre' || node.name === 'code') {
            return;
        }
        if (node.children) {
            for (var n = 0; n < node.children.length; n += 1) {
                var child = node.children[n];
                if (child.type === 'comment'
                    || (child.type === 'text' && n === node.children.length - 1 && !/\S/.test(child.data))) {
                    node.children.splice(n, 1);
                    n -= 1;
                }
                else if (child.type === 'tag') {
                    NodeProcessor._trimNodes(child);
                }
            }
        }
    };
    NodeProcessor._isText = function (node) {
        return node.type === 'text' || node.type === 'comment';
    };
    /**
     * Processes the markdown attribute of the provided element, inserting the corresponding <slot> child
     * if there is no pre-existing slot child with the name of the attribute present.
     * @param node Element to process
     * @param attribute Attribute name to process
     * @param isInline Whether to process the attribute with only inline markdown-it rules
     * @param slotName Name attribute of the <slot> element to insert, which defaults to the attribute name
     */
    NodeProcessor.prototype._processAttributeWithoutOverride = function (node, attribute, isInline, slotName) {
        if (slotName === void 0) { slotName = attribute; }
        var hasAttributeSlot = node.children
            && node.children.some(function (child) { return _.has(child.attribs, 'slot') && child.attribs.slot === slotName; });
        if (!hasAttributeSlot && _.has(node.attribs, attribute)) {
            var rendered = void 0;
            if (isInline) {
                rendered = this._renderMdInline(node.attribs[attribute]);
            }
            else {
                rendered = this._renderMd(node.attribs[attribute]);
            }
            var attributeSlotElement = cheerio.parseHTML("<template slot=\"" + slotName + "\">" + rendered + "</template>", true);
            node.children
                = node.children ? attributeSlotElement.concat(node.children) : attributeSlotElement;
        }
        delete node.attribs[attribute];
    };
    /**
     * Takes an element, looks for direct elements with slots and transforms to avoid Vue parsing.
     * This is so that we can use bootstrap-vue popovers, tooltips, and modals.
     * @param node Element to transform
     */
    NodeProcessor._transformSlottedComponents = function (node) {
        node.children.forEach(function (child) {
            var slot = child.attribs && child.attribs.slot;
            if (slot) {
                // Turns <div slot="content">... into <div data-mb-slot-name=content>...
                child.attribs['data-mb-slot-name'] = slot;
                delete child.attribs.slot;
            }
            // similarly, need to transform templates to avoid Vue parsing
            if (child.name === 'template') {
                child.name = 'span';
            }
        });
    };
    /*
     * FrontMatter collection
     */
    NodeProcessor.prototype._processFrontMatter = function (node) {
        var currentFrontMatter = {};
        var frontMatter = cheerio(node);
        if (frontMatter.text().trim()) {
            // Retrieves the front matter from either the first frontmatter element
            // or from a frontmatter element that includes from another file
            // The latter case will result in the data being wrapped in a div
            var frontMatterData = frontMatter.find('div').length
                ? frontMatter.find('div')[0].children[0].data
                : frontMatter[0].children[0].data;
            var frontMatterWrapped = FRONT_MATTER_FENCE + "\n" + frontMatterData + "\n" + FRONT_MATTER_FENCE;
            currentFrontMatter = fm(frontMatterWrapped).attributes;
        }
        this.frontMatter = __assign(__assign({}, this.frontMatter), currentFrontMatter);
        cheerio(node).remove();
    };
    /*
     * Panels
     */
    NodeProcessor.prototype._processPanelAttributes = function (node) {
        this._processAttributeWithoutOverride(node, 'alt', false, '_alt');
        this._processAttributeWithoutOverride(node, 'header', false);
    };
    /**
     * Traverses the dom breadth-first from the specified element to find a html heading child.
     * @param node Root element to search from
     * @returns {undefined|*} The header element, or undefined if none is found.
     */
    NodeProcessor._findHeaderElement = function (node) {
        var elements = node.children;
        if (!elements || !elements.length) {
            return undefined;
        }
        var elementQueue = elements.slice(0);
        while (elementQueue.length) {
            var nextEl = elementQueue.shift();
            if ((/^h[1-6]$/).test(nextEl.name)) {
                return nextEl;
            }
            if (nextEl.children) {
                nextEl.children.forEach(function (child) { return elementQueue.push(child); });
            }
        }
        return undefined;
    };
    /**
     * Assigns an id to the root element of a panel component using the heading specified in the
     * panel's header slot or attribute (if any), with the header slot having priority if present.
     * This is to ensure anchors still work when panels are in their minimized form.
     * @param node The root panel element
     */
    NodeProcessor._assignPanelId = function (node) {
        var slotChildren = node.children && node.children.filter(function (child) { return _.has(child.attribs, 'slot'); });
        var headerSlot = slotChildren.find(function (child) { return child.attribs.slot === 'header'; });
        if (headerSlot) {
            var header = NodeProcessor._findHeaderElement(headerSlot);
            if (!header) {
                return;
            }
            if (!header.attribs || !_.has(header.attribs, 'id')) {
                throw new Error('Found a panel heading without an assigned id.\n'
                    + 'Please report this to the MarkBind developers. Thank you!');
            }
            node.attribs.id = header.attribs.id;
        }
    };
    /**
     * Check and warns if element has conflicting attributes.
     * Note that attirbutes in `attrsConflictingWith` are not in conflict with each other,
     * but only towards `attribute`
     * @param node Root element to check
     * @param attribute An attribute that is conflicting with other attributes
     * @param attrsConflictingWith The attributes conflicting with `attribute`
     */
    NodeProcessor._warnConflictingAttributes = function (node, attribute, attrsConflictingWith) {
        if (!(attribute in node.attribs)) {
            return;
        }
        attrsConflictingWith.forEach(function (conflictingAttr) {
            if (conflictingAttr in node.attribs) {
                logger.warn("Usage of conflicting " + node.name + " attributes: "
                    + ("'" + attribute + "' with '" + conflictingAttr + "'"));
            }
        });
    };
    /**
     * Check and warns if element has a deprecated attribute.
     * @param node Root element to check
     * @param attributeNamePairs Object of attribute name pairs with each pair in the form deprecated : correct
     */
    NodeProcessor._warnDeprecatedAttributes = function (node, attributeNamePairs) {
        Object.entries(attributeNamePairs)
            .forEach(function (_a) {
            var deprecatedAttrib = _a[0], correctAttrib = _a[1];
            if (deprecatedAttrib in node.attribs) {
                logger.warn(node.name + " attribute '" + deprecatedAttrib + "' "
                    + ("is deprecated and may be removed in the future. Please use '" + correctAttrib + "'"));
            }
        });
    };
    /*
     * Questions, QOption, and Quizzes
     */
    NodeProcessor.prototype._processQuestion = function (node) {
        this._processAttributeWithoutOverride(node, 'header', false, 'header');
        this._processAttributeWithoutOverride(node, 'hint', false, 'hint');
        this._processAttributeWithoutOverride(node, 'answer', false, 'answer');
    };
    NodeProcessor.prototype._processQOption = function (node) {
        this._processAttributeWithoutOverride(node, 'reason', false, 'reason');
    };
    NodeProcessor.prototype._processQuiz = function (node) {
        this._processAttributeWithoutOverride(node, 'intro', false, 'intro');
    };
    /*
     * Popovers, tooltips, modals, triggers
     *
     * We use bootstrap-vue's popovers, tooltips and modals, but perform various transformations
     * to conform with our syntax instead, and to support triggers.
     *
     * For tooltips and popovers,
     * The content / title is put into hidden [data-mb-slot-name] slots.
     * Then, we call the relevant content getters inside core-web/index.js at runtime to get this content.
     *
     * For modals,
     * only syntactic transformations are performed.
     *
     * For triggers,
     * When building the site, we can't immediately tell whether a trigger references
     * a modal, popover, or tooltip, as the element may not have been processed yet.
     *
     * So, we make every trigger try all 3 at runtime in the browser. (refer to Trigger.vue)
     * It will attempt to open a modal, then a tooltip or popover.
     * For modals, we simply attempt to show the modal via bootstrap-vue's programmatic api.
     * The content of tooltips and popovers is retrieved from the [data-mb-slot-name] slots,
     * then the <b-popover/tooltip> component is dynamically created appropriately.
     */
    NodeProcessor.addTriggerClass = function (node, trigger) {
        var triggerClass = trigger === 'click' ? 'trigger-click' : 'trigger';
        node.attribs.class = node.attribs.class ? node.attribs.class + " " + triggerClass : triggerClass;
    };
    NodeProcessor.prototype._processPopover = function (node) {
        NodeProcessor._warnDeprecatedAttributes(node, { title: 'header' });
        this._processAttributeWithoutOverride(node, 'content', true);
        this._processAttributeWithoutOverride(node, 'header', true);
        this._processAttributeWithoutOverride(node, 'title', true, 'header');
        node.name = 'span';
        var trigger = node.attribs.trigger || 'hover';
        var placement = node.attribs.placement || 'top';
        node.attribs['data-mb-component-type'] = 'popover';
        node.attribs["v-b-popover." + trigger + "." + placement + ".html"] = 'popoverInnerGetters';
        NodeProcessor.addTriggerClass(node, trigger);
        NodeProcessor._transformSlottedComponents(node);
    };
    /**
     * Check and warns if element has a deprecated slot name
     * @param element Root element to check
     * @param namePairs Object of slot name pairs with each pair in the form deprecated : correct
     */
    NodeProcessor._warnDeprecatedSlotNames = function (element, namePairs) {
        if (!(element.children)) {
            return;
        }
        element.children.forEach(function (child) {
            if (!(_.has(child.attribs, 'slot'))) {
                return;
            }
            Object.entries(namePairs)
                .forEach(function (_a) {
                var deprecatedName = _a[0], correctName = _a[1];
                if (child.attribs.slot !== deprecatedName) {
                    return;
                }
                logger.warn(element.name + " slot name '" + deprecatedName + "' "
                    + ("is deprecated and may be removed in the future. Please use '" + correctName + "'"));
            });
        });
    };
    NodeProcessor.prototype._processTooltip = function (node) {
        this._processAttributeWithoutOverride(node, 'content', true, '_content');
        node.name = 'span';
        var trigger = node.attribs.trigger || 'hover';
        var placement = node.attribs.placement || 'top';
        node.attribs['data-mb-component-type'] = 'tooltip';
        node.attribs["v-b-tooltip." + trigger + "." + placement + ".html"] = 'tooltipInnerContentGetter';
        NodeProcessor.addTriggerClass(node, trigger);
        NodeProcessor._transformSlottedComponents(node);
    };
    NodeProcessor._renameSlot = function (node, originalName, newName) {
        if (node.children) {
            node.children.forEach(function (c) {
                var child = c;
                if (_.has(child.attribs, 'slot') && child.attribs.slot === originalName) {
                    child.attribs.slot = newName;
                }
            });
        }
    };
    NodeProcessor._renameAttribute = function (node, originalAttribute, newAttribute) {
        if (_.has(node.attribs, originalAttribute)) {
            node.attribs[newAttribute] = node.attribs[originalAttribute];
            delete node.attribs[originalAttribute];
        }
    };
    NodeProcessor.prototype._processModalAttributes = function (node) {
        NodeProcessor._warnDeprecatedAttributes(node, { title: 'header' });
        NodeProcessor._warnDeprecatedSlotNames(node, {
            'modal-header': 'header',
            'modal-footer': 'footer',
        });
        this._processAttributeWithoutOverride(node, 'header', true, 'modal-title');
        this._processAttributeWithoutOverride(node, 'title', true, 'modal-title');
        NodeProcessor._renameSlot(node, 'header', 'modal-header');
        NodeProcessor._renameSlot(node, 'footer', 'modal-footer');
        node.name = 'b-modal';
        NodeProcessor._renameAttribute(node, 'ok-text', 'ok-title');
        NodeProcessor._renameAttribute(node, 'center', 'centered');
        var hasOkTitle = _.has(node.attribs, 'ok-title');
        var hasFooter = node.children.some(function (child) {
            return _.has(child.attribs, 'slot') && child.attribs.slot === 'modal-footer';
        });
        if (!hasFooter && !hasOkTitle) {
            // markbind doesn't show the footer by default
            node.attribs['hide-footer'] = '';
        }
        else if (hasOkTitle) {
            // bootstrap-vue default is to show ok and cancel
            // if there's an ok-title, markbind only shows the OK button.
            node.attribs['ok-only'] = '';
        }
        if (node.attribs.backdrop === 'false') {
            node.attribs['no-close-on-backdrop'] = '';
        }
        delete node.attribs.backdrop;
        var size = '';
        if (_.has(node.attribs, 'large')) {
            size = 'lg';
            delete node.attribs.large;
        }
        else if (_.has(node.attribs, 'small')) {
            size = 'sm';
            delete node.attribs.small;
        }
        node.attribs.size = size;
        // default for markbind is zoom, default for bootstrap-vue is fade
        var effect = node.attribs.effect === 'fade' ? '' : 'mb-zoom';
        node.attribs['modal-class'] = effect;
        if (_.has(node.attribs, 'id')) {
            node.attribs.ref = node.attribs.id;
        }
    };
    /*
     * Tabs
     */
    NodeProcessor.prototype._processTabAttributes = function (node) {
        this._processAttributeWithoutOverride(node, 'header', true, '_header');
    };
    /*
     * Tip boxes
     */
    NodeProcessor.prototype._processBoxAttributes = function (node) {
        NodeProcessor._warnConflictingAttributes(node, 'light', ['seamless']);
        NodeProcessor._warnConflictingAttributes(node, 'no-background', ['background-color', 'seamless']);
        NodeProcessor._warnConflictingAttributes(node, 'no-border', ['border-color', 'border-left-color', 'seamless']);
        NodeProcessor._warnConflictingAttributes(node, 'no-icon', ['icon']);
        NodeProcessor._warnDeprecatedAttributes(node, { heading: 'header' });
        this._processAttributeWithoutOverride(node, 'icon', true, 'icon');
        this._processAttributeWithoutOverride(node, 'header', false, '_header');
        this._processAttributeWithoutOverride(node, 'heading', false, '_header');
    };
    /*
     * Dropdowns
     */
    NodeProcessor.prototype._processDropdownAttributes = function (node) {
        var slotChildren = node.children && node.children.filter(function (child) { return _.has(child.attribs, 'slot'); });
        var hasHeaderSlot = slotChildren && slotChildren.some(function (child) { return child.attribs.slot === 'header'; });
        // If header slot is present, the header attribute has no effect, and we can simply remove it.
        if (hasHeaderSlot) {
            if (_.has(node.attribs, 'header')) {
                logger.warn(node.name + " has a header slot, 'header' attribute has no effect.");
            }
            if (_.has(node.attribs, 'text')) {
                logger.warn(node.name + " has a header slot, 'text' attribute has no effect.");
            }
            delete node.attribs.header;
            delete node.attribs.text;
            return;
        }
        NodeProcessor._warnDeprecatedAttributes(node, { text: 'header' });
        NodeProcessor._warnConflictingAttributes(node, 'header', ['text']);
        // header attribute takes priority over text attribute if both 'text' and 'header' is used
        if (_.has(node.attribs, 'header')) {
            this._processAttributeWithoutOverride(node, 'header', true, '_header');
            delete node.attribs.text;
        }
        else {
            this._processAttributeWithoutOverride(node, 'text', true, '_header');
        }
    };
    /**
     * Thumbnails
     */
    NodeProcessor.prototype._processThumbnailAttributes = function (node) {
        var isImage = _.has(node.attribs, 'src') && node.attribs.src !== '';
        if (isImage) {
            return;
        }
        var text = _.has(node.attribs, 'text') ? node.attribs.text : '';
        if (text === '') {
            return;
        }
        var renderedText = this._renderMdInline(text);
        node.children = cheerio.parseHTML(renderedText);
        delete node.attribs.text;
    };
    /**
     * Annotations are added automatically by KaTeX when rendering math formulae.
     */
    NodeProcessor._processAnnotationAttributes = function (node) {
        if (!_.has(node.attribs, 'v-pre')) {
            node.attribs['v-pre'] = true;
        }
    };
    /*
     * Footnotes of the main content and <include>s are stored, then combined by NodeProcessor at the end
     */
    NodeProcessor.prototype._processMbTempFootnotes = function (node) {
        var $ = cheerio(node);
        this.renderedFootnotes.push($.html());
        $.remove();
    };
    NodeProcessor.prototype._combineFootnotes = function () {
        var _this = this;
        var hasFootnote = false;
        var prefix = '<hr class="footnotes-sep">\n<section class="footnotes">\n<ol class="footnotes-list">\n';
        var footnotesWithPopovers = this.renderedFootnotes.map(function (footNoteBlock) {
            var $ = cheerio.load(footNoteBlock);
            var popoversHtml = '';
            $('li.footnote-item').each(function (index, li) {
                hasFootnote = true;
                var popoverId = "" + MARKBIND_FOOTNOTE_POPOVER_ID_PREFIX + li.attribs.id;
                var popoverNode = cheerio.parseHTML("<popover id=\"" + popoverId + "\">\n            <div slot=\"content\">\n              " + $(li).html() + "\n            </div>\n          </popover>")[0];
                _this.processNode(popoverNode);
                popoversHtml += cheerio.html(popoverNode);
            });
            return popoversHtml + "\n" + footNoteBlock + "\n";
        }).join('\n');
        var suffix = '</ol>\n</section>\n';
        return hasFootnote
            ? prefix + footnotesWithPopovers + suffix
            : '';
    };
    /*
     * Body
     */
    NodeProcessor._preprocessBody = function (node) {
        // eslint-disable-next-line no-console
        console.warn("<body> tag found in " + node.attribs[ATTRIB_CWF] + ". This may cause formatting errors.");
    };
    /*
     * Layout element collection
     */
    NodeProcessor.prototype._collectLayoutEl = function (node, property) {
        var $ = cheerio(node);
        this[property].push($.html());
        $.remove();
    };
    /*
     * h1 - h6
     */
    NodeProcessor.prototype._setHeadingId = function (node) {
        var textContent = cheerio(node).text();
        // remove the '&lt;' and '&gt;' symbols that markdown-it uses to escape '<' and '>'
        var cleanedContent = textContent.replace(/&lt;|&gt;/g, '');
        var slugifiedHeading = slugify(cleanedContent, { decamelize: false });
        var headerId = slugifiedHeading;
        var headerIdMap = this.config.headerIdMap;
        if (headerIdMap[slugifiedHeading]) {
            headerId = slugifiedHeading + "-" + headerIdMap[slugifiedHeading];
            headerIdMap[slugifiedHeading] += 1;
        }
        else {
            headerIdMap[slugifiedHeading] = 2;
        }
        node.attribs.id = headerId;
    };
    /*
     * API
     */
    NodeProcessor.prototype.processNode = function (node, context) {
        var _this = this;
        try {
            switch (node.name) {
                case 'frontmatter':
                    this._processFrontMatter(node);
                    break;
                case 'body':
                    NodeProcessor._preprocessBody(node);
                    break;
                case 'code':
                    node.attribs['v-pre'] = '';
                    break;
                case 'include':
                    this.docId += 1; // used in markdown-it-footnotes
                    return processInclude(node, context, this.pageSources, this.variableProcessor, function (text) { return _this._renderMd(text); }, function (text) { return _this._renderMdInline(text); }, this.config);
                case 'panel':
                    this._processPanelAttributes(node);
                    return processPanelSrc(node, context, this.pageSources, this.config);
                case 'question':
                    this._processQuestion(node);
                    break;
                case 'q-option':
                    this._processQOption(node);
                    break;
                case 'quiz':
                    this._processQuiz(node);
                    break;
                case 'popover':
                    this._processPopover(node);
                    break;
                case 'tooltip':
                    this._processTooltip(node);
                    break;
                case 'modal':
                    this._processModalAttributes(node);
                    break;
                case 'tab':
                case 'tab-group':
                    this._processTabAttributes(node);
                    break;
                case 'box':
                    this._processBoxAttributes(node);
                    break;
                case 'dropdown':
                    this._processDropdownAttributes(node);
                    break;
                case 'thumbnail':
                    this._processThumbnailAttributes(node);
                    break;
                case 'annotation':
                    NodeProcessor._processAnnotationAttributes(node);
                    break;
                case 'site-nav':
                    renderSiteNav(node);
                    break;
                case 'mb-temp-footnotes':
                    this._processMbTempFootnotes(node);
                    break;
                default:
                    break;
            }
        }
        catch (error) {
            logger.error(error);
        }
        return context;
    };
    NodeProcessor.prototype.postProcessNode = function (node) {
        try {
            switch (node.name) {
                case 'panel':
                    NodeProcessor._assignPanelId(node);
                    break;
                case 'head-top':
                    this._collectLayoutEl(node, 'headTop');
                    break;
                case 'head-bottom':
                    this._collectLayoutEl(node, 'headBottom');
                    break;
                case 'script-bottom':
                    this._collectLayoutEl(node, 'scriptBottom');
                    break;
                default:
                    break;
            }
        }
        catch (error) {
            logger.error(error);
        }
        if (node.attribs) {
            delete node.attribs[ATTRIB_CWF];
        }
    };
    NodeProcessor.prototype._process = function (node, context) {
        var _this = this;
        if (_.isArray(node)) {
            return node.map(function (el) { return _this._process(el, context); });
        }
        if (NodeProcessor._isText(node)) {
            return node;
        }
        if (node.name) {
            node.name = node.name.toLowerCase();
        }
        if (linkProcessor.hasTagLink(node)) {
            linkProcessor.convertRelativeLinks(node, context.cwf, this.config.rootPath, this.config.baseUrl);
            linkProcessor.convertMdAndMbdExtToHtmlExt(node);
            linkProcessor.validateIntraLink(node, context.cwf, this.config);
            linkProcessor.collectSource(node, this.config.rootPath, this.config.baseUrl, this.pageSources);
        }
        var isHeadingTag = (/^h[1-6]$/).test(node.name);
        if (isHeadingTag && !node.attribs.id) {
            this._setHeadingId(node);
        }
        switch (node.name) {
            case 'md':
                node.name = 'span';
                node.children = cheerio.parseHTML(this._renderMdInline(cheerio.html(node.children)), true);
                break;
            case 'markdown':
                node.name = 'div';
                node.children = cheerio.parseHTML(this._renderMd(cheerio.html(node.children)), true);
                break;
            default:
                break;
        }
        // eslint-disable-next-line no-param-reassign
        context = this.processNode(node, context);
        this.pluginManager.processNode(node, this.config);
        if (node.children) {
            node.children.forEach(function (child) {
                _this._process(child, context);
            });
        }
        this.postProcessNode(node);
        insertTemporaryStyles(node);
        if (isHeadingTag && !node.attribs.id) {
            this._setHeadingId(node); // do this one more time, in case the first one assigned a blank id
        }
        // If a fixed header is applied to the page, generate dummy spans as anchor points
        if (isHeadingTag && node.attribs.id) {
            cheerio(node).prepend("<span id=\"" + node.attribs.id + "\" class=\"anchor\"></span>");
        }
        return node;
    };
    NodeProcessor.prototype.process = function (file, content, cwf, extraVariables) {
        var _this = this;
        if (cwf === void 0) { cwf = file; }
        if (extraVariables === void 0) { extraVariables = {}; }
        var context = new Context(cwf, [], extraVariables);
        return new Promise(function (resolve, reject) {
            var handler = new htmlparser.DomHandler(function (error, dom) {
                if (error) {
                    reject(error);
                    return;
                }
                var nodes = dom.map(function (d) {
                    var processed;
                    try {
                        processed = _this._process(d, context);
                    }
                    catch (err) {
                        err.message += "\nError while rendering '" + file + "'";
                        logger.error(err);
                        processed = utils.createErrorNode(d, err);
                    }
                    return processed;
                });
                nodes.forEach(function (d) { return NodeProcessor._trimNodes(d); });
                resolve(cheerio(nodes).html() + _this._combineFootnotes());
            });
            var parser = new htmlparser.Parser(handler);
            var fileExt = utils.getExt(file);
            if (utils.isMarkdownFileExt(fileExt)) {
                var renderedContent = _this._renderMd(content);
                // Wrap with <root> as $.remove() does not work on top level nodes
                parser.parseComplete("<root>" + renderedContent + "</root>");
            }
            else if (fileExt === 'html') {
                parser.parseComplete("<root>" + content + "</root>");
            }
            else {
                var error = new Error("Unsupported File Extension: '" + fileExt + "'");
                reject(error);
            }
        });
    };
    return NodeProcessor;
}());
module.exports = {
    NodeProcessor: NodeProcessor,
};
