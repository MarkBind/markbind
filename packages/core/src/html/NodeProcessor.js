const cheerio = require('cheerio');
const htmlparser = require('htmlparser2'); require('../patches/htmlparser2');
const fm = require('fastmatter');
const Promise = require('bluebird');
const slugify = require('@sindresorhus/slugify');

const _ = {};
_.isArray = require('lodash/isArray');
_.cloneDeep = require('lodash/cloneDeep');
_.has = require('lodash/has');
_.find = require('lodash/find');

const { renderSiteNav } = require('./siteNavProcessor');
const { processInclude, processPanelSrc } = require('./includePanelProcessor');
const { Context } = require('./Context');
const linkProcessor = require('./linkProcessor');
const { insertTemporaryStyles } = require('./tempStyleProcessor');

const md = require('../lib/markdown-it');
const utils = require('../utils');
const logger = require('../utils/logger');

const { FRONT_MATTER_FENCE } = require('../Page/constants');
const { MARKBIND_FOOTNOTE_POPOVER_ID_PREFIX } = require('./constants');

const {
  ATTRIB_CWF,
} = require('../constants');

cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

class NodeProcessor {
  constructor(config, pageSources, variableProcessor, pluginManager, docId = '') {
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

  _renderMd(text) {
    return md.render(text, this.docId
      ? { docId: `${this.baseDocId}${this.docId}` }
      : { docId: this.baseDocId });
  }

  _renderMdInline(text) {
    return md.renderInline(text, this.docId
      ? { docId: `${this.baseDocId}${this.docId}` }
      : { docId: this.baseDocId });
  }

  /*
   * Private utility functions
   */

  static _trimNodes(node) {
    if (node.name === 'pre' || node.name === 'code') {
      return;
    }
    if (node.children) {
      for (let n = 0; n < node.children.length; n += 1) {
        const child = node.children[n];
        if (child.type === 'comment'
          || (child.type === 'text' && n === node.children.length - 1 && !/\S/.test(child.data))) {
          node.children.splice(n, 1);
          n -= 1;
        } else if (child.type === 'tag') {
          NodeProcessor._trimNodes(child);
        }
      }
    }
  }

  static _isText(node) {
    return node.type === 'text' || node.type === 'comment';
  }

  static getVslotShorthand(node) {
    if (!node.attribs) {
      return undefined;
    }
    const keys = Object.keys(node.attribs);
    return _.find(keys, key => key.startsWith('#'));
  }

  /**
   * Processes the markdown attribute of the provided element, inserting the corresponding <slot> child
   * if there is no pre-existing slot child with the name of the attribute present.
   * @param node Element to process
   * @param attribute Attribute name to process
   * @param isInline Whether to process the attribute with only inline markdown-it rules
   * @param slotName Name attribute of the <slot> element to insert, which defaults to the attribute name
   */
  _processAttributeWithoutOverride(node, attribute, isInline, slotName = attribute) {
    const hasAttributeSlot = node.children
      && node.children.some((child) => {
        const vslot = NodeProcessor.getVslotShorthand(child);
        if (!vslot) {
          return false;
        }
        const name = vslot.substring(1, vslot.length); // remove # vslot shorthand
        return name === slotName;
      });

    if (!hasAttributeSlot && _.has(node.attribs, attribute)) {
      let rendered;
      if (isInline) {
        rendered = this._renderMdInline(node.attribs[attribute]);
      } else {
        rendered = this._renderMd(node.attribs[attribute]);
      }

      const attributeSlotElement = cheerio.parseHTML(
        `<template #${slotName}>${rendered}</template>`, true);
      node.children
        = node.children ? attributeSlotElement.concat(node.children) : attributeSlotElement;
    }

    delete node.attribs[attribute];
  }

  /**
   * Takes an element, looks for direct elements with slots and transforms to avoid Vue parsing.
   * This is so that we can use bootstrap-vue popovers, tooltips, and modals.
   * @param node Element to transform
   */
  static _transformSlottedComponents(node) {
    node.children.forEach((child) => {
      // Turns <div #content>... into <div data-mb-slot-name=content>...
      const vslot = NodeProcessor.getVslotShorthand(child);
      if (vslot) {
        const slotName = vslot.substring(1, vslot.length); // remove # vslot shorthand
        child.attribs['data-mb-slot-name'] = slotName;
        delete child.attribs[vslot];
      }
      // similarly, need to transform templates to avoid Vue parsing
      if (child.name === 'template') {
        child.name = 'span';
      }
    });
  }

  /*
   * FrontMatter collection
   */
  _processFrontMatter(node, context) {
    let currentFrontMatter = {};
    const frontMatter = cheerio(node);
    if (!context.processingOptions.omitFrontmatter && frontMatter.text().trim()) {
      // Retrieves the front matter from either the first frontmatter element
      // or from a frontmatter element that includes from another file
      // The latter case will result in the data being wrapped in a div
      const frontMatterData = frontMatter.find('div').length
        ? frontMatter.find('div')[0].children[0].data
        : frontMatter[0].children[0].data;
      const frontMatterWrapped = `${FRONT_MATTER_FENCE}\n${frontMatterData}\n${FRONT_MATTER_FENCE}`;

      currentFrontMatter = fm(frontMatterWrapped).attributes;
    }

    this.frontMatter = {
      ...this.frontMatter,
      ...currentFrontMatter,
    };
    cheerio(node).remove();
  }

  /*
   * Panels
   */

  _processPanelAttributes(node) {
    this._processAttributeWithoutOverride(node, 'alt', false, '_alt');
    this._processAttributeWithoutOverride(node, 'header', false);
  }

  /**
   * Traverses the dom breadth-first from the specified element to find a html heading child.
   * @param node Root element to search from
   * @returns {undefined|*} The header element, or undefined if none is found.
   */
  static _findHeaderElement(node) {
    const elements = node.children;
    if (!elements || !elements.length) {
      return undefined;
    }

    const elementQueue = elements.slice(0);
    while (elementQueue.length) {
      const nextEl = elementQueue.shift();
      if ((/^h[1-6]$/).test(nextEl.name)) {
        return nextEl;
      }

      if (nextEl.children) {
        nextEl.children.forEach(child => elementQueue.push(child));
      }
    }

    return undefined;
  }

  /**
   * Assigns an id to the root element of a panel component using the heading specified in the
   * panel's header slot or attribute (if any), with the header slot having priority if present.
   * This is to ensure anchors still work when panels are in their minimized form.
   * @param node The root panel element
   */
  static _assignPanelId(node) {
    // can remove
    const slotChildren = node.children
      && node.children.filter(child => NodeProcessor.getVslotShorthand(child) !== undefined);

    const headerSlot = slotChildren.find((child) => {
      const vslot = NodeProcessor.getVslotShorthand(child);
      // vslot is guaranteed to exist since we have filtered
      const slotName = vslot.substring(1, vslot.length); // remove # vslot shorthand
      return slotName === 'header';
    });

    if (headerSlot) {
      const header = NodeProcessor._findHeaderElement(headerSlot);
      if (!header) {
        return;
      }

      if (!header.attribs || !_.has(header.attribs, 'id')) {
        throw new Error('Found a panel heading without an assigned id.\n'
          + 'Please report this to the MarkBind developers. Thank you!');
      }

      node.attribs.id = header.attribs.id;
    }
  }

  /**
   * Check and warns if element has conflicting attributes.
   * Note that attirbutes in `attrsConflictingWith` are not in conflict with each other,
   * but only towards `attribute`
   * @param node Root element to check
   * @param attribute An attribute that is conflicting with other attributes
   * @param attrsConflictingWith The attributes conflicting with `attribute`
   */
  static _warnConflictingAttributes(node, attribute, attrsConflictingWith) {
    if (!(attribute in node.attribs)) {
      return;
    }
    attrsConflictingWith.forEach((conflictingAttr) => {
      if (conflictingAttr in node.attribs) {
        logger.warn(`Usage of conflicting ${node.name} attributes: `
          + `'${attribute}' with '${conflictingAttr}'`);
      }
    });
  }

  /**
   * Check and warns if element has a deprecated attribute.
   * @param node Root element to check
   * @param attributeNamePairs Object of attribute name pairs with each pair in the form deprecated : correct
   */
  static _warnDeprecatedAttributes(node, attributeNamePairs) {
    Object.entries(attributeNamePairs)
      .forEach(([deprecatedAttrib, correctAttrib]) => {
        if (deprecatedAttrib in node.attribs) {
          logger.warn(`${node.name} attribute '${deprecatedAttrib}' `
            + `is deprecated and may be removed in the future. Please use '${correctAttrib}'`);
        }
      });
  }

  /*
   * Questions, QOption, and Quizzes
   */

  _processQuestion(node) {
    this._processAttributeWithoutOverride(node, 'header', false, 'header');
    this._processAttributeWithoutOverride(node, 'hint', false, 'hint');
    this._processAttributeWithoutOverride(node, 'answer', false, 'answer');
  }

  _processQOption(node) {
    this._processAttributeWithoutOverride(node, 'reason', false, 'reason');
  }

  _processQuiz(node) {
    this._processAttributeWithoutOverride(node, 'intro', false, 'intro');
  }

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

  static addTriggerClass(node, trigger) {
    const triggerClass = trigger === 'click' ? 'trigger-click' : 'trigger';
    node.attribs.class = node.attribs.class ? `${node.attribs.class} ${triggerClass}` : triggerClass;
  }

  _processPopover(node) {
    NodeProcessor._warnDeprecatedAttributes(node, { title: 'header' });

    this._processAttributeWithoutOverride(node, 'content', true);
    this._processAttributeWithoutOverride(node, 'header', true);
    this._processAttributeWithoutOverride(node, 'title', true, 'header');

    node.name = 'span';
    const trigger = node.attribs.trigger || 'hover';
    const placement = node.attribs.placement || 'top';
    node.attribs['data-mb-component-type'] = 'popover';
    node.attribs[`v-b-popover.${trigger}.${placement}.html`] = 'popoverInnerGetters';
    NodeProcessor.addTriggerClass(node, trigger);
    NodeProcessor._transformSlottedComponents(node);
  }

  /**
   * Check and warns if element has a deprecated slot name
   * @param element Root element to check
   * @param namePairs Object of slot name pairs with each pair in the form deprecated : correct
   */

  static _warnDeprecatedSlotNames(element, namePairs) {
    if (!(element.children)) {
      return;
    }
    element.children.forEach((child) => {
      const vslot = NodeProcessor.getVslotShorthand(child);
      if (!vslot) {
        return;
      }
      const slotName = vslot.substring(1, vslot.length); // remove # vslot shorthand
      Object.entries(namePairs)
        .forEach(([deprecatedName, correctName]) => {
          if (slotName !== deprecatedName) {
            return;
          }
          logger.warn(`${element.name} slot name '${deprecatedName}' `
            + `is deprecated and may be removed in the future. Please use '${correctName}'`);
        });
    });
  }

  _processTooltip(node) {
    this._processAttributeWithoutOverride(node, 'content', true, '_content');

    node.name = 'span';
    const trigger = node.attribs.trigger || 'hover';
    const placement = node.attribs.placement || 'top';
    node.attribs['data-mb-component-type'] = 'tooltip';
    node.attribs[`v-b-tooltip.${trigger}.${placement}.html`] = 'tooltipInnerContentGetter';
    NodeProcessor.addTriggerClass(node, trigger);
    NodeProcessor._transformSlottedComponents(node);
  }

  static _renameSlot(node, originalName, newName) {
    if (node.children) {
      node.children.forEach((child) => {
        const vslot = NodeProcessor.getVslotShorthand(child);
        if (vslot) {
          const slotName = vslot.substring(1, vslot.length); // remove # vslot shorthand
          if (slotName === originalName) {
            const newVslot = `#${newName}`;
            child.attribs[newVslot] = '';
            delete child.attribs[vslot];
          }
        }
      });
    }
  }

  static _renameAttribute(node, originalAttribute, newAttribute) {
    if (_.has(node.attribs, originalAttribute)) {
      node.attribs[newAttribute] = node.attribs[originalAttribute];
      delete node.attribs[originalAttribute];
    }
  }

  _processModalAttributes(node) {
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

    const hasOkTitle = _.has(node.attribs, 'ok-title');
    const hasFooter = node.children.some((child) => {
      const vslot = NodeProcessor.getVslotShorthand(child);
      if (!vslot) {
        return false;
      }
      const slotName = vslot.substring(1, vslot.length); // remove # vslot shorthand
      return slotName === 'modal-footer';
    });

    if (!hasFooter && !hasOkTitle) {
      // markbind doesn't show the footer by default
      node.attribs['hide-footer'] = '';
    } else if (hasOkTitle) {
      // bootstrap-vue default is to show ok and cancel
      // if there's an ok-title, markbind only shows the OK button.
      node.attribs['ok-only'] = '';
    }

    if (node.attribs.backdrop === 'false') {
      node.attribs['no-close-on-backdrop'] = '';
    }
    delete node.attribs.backdrop;

    let size = '';
    if (_.has(node.attribs, 'large')) {
      size = 'lg';
      delete node.attribs.large;
    } else if (_.has(node.attribs, 'small')) {
      size = 'sm';
      delete node.attribs.small;
    }
    node.attribs.size = size;

    // default for markbind is zoom, default for bootstrap-vue is fade
    const effect = node.attribs.effect === 'fade' ? '' : 'mb-zoom';
    node.attribs['modal-class'] = effect;

    if (_.has(node.attribs, 'id')) {
      node.attribs.ref = node.attribs.id;
    }
  }

  /*
   * Tabs
   */

  _processTabAttributes(node) {
    this._processAttributeWithoutOverride(node, 'header', true, '_header');
  }

  /*
   * Tip boxes
   */

  _processBoxAttributes(node) {
    NodeProcessor._warnConflictingAttributes(node, 'light', ['seamless']);
    NodeProcessor._warnConflictingAttributes(node, 'no-background', ['background-color', 'seamless']);
    NodeProcessor._warnConflictingAttributes(node, 'no-border',
                                             ['border-color', 'border-left-color', 'seamless']);
    NodeProcessor._warnConflictingAttributes(node, 'no-icon', ['icon']);
    NodeProcessor._warnDeprecatedAttributes(node, { heading: 'header' });

    this._processAttributeWithoutOverride(node, 'icon', true, 'icon');
    this._processAttributeWithoutOverride(node, 'header', false, '_header');

    this._processAttributeWithoutOverride(node, 'heading', false, '_header');
  }

  /*
   * Dropdowns
   */

  _processDropdownAttributes(node) {
    // can remove
    const slotChildren = node.children
      && node.children.filter(child => NodeProcessor.getVslotShorthand(child) !== undefined);

    const hasHeaderSlot = slotChildren.find((child) => {
      const vslot = NodeProcessor.getVslotShorthand(child);
      // vslot is guaranteed to exist since we have filtered
      const slotName = vslot.substring(1, vslot.length); // remove # vslot shorthand
      return slotName === 'header';
    });

    // We do not search for v-slot here because as the slots have not been converted to v-slot yet.
    // const slotChildren = node.children && node.children.filter(child => _.has(child.attribs, 'slot'));
    // const hasHeaderSlot = slotChildren && slotChildren.some(child => child.attribs.slot === 'header');

    // If header slot is present, the header attribute has no effect, and we can simply remove it.
    if (hasHeaderSlot) {
      if (_.has(node.attribs, 'header')) {
        logger.warn(`${node.name} has a header slot, 'header' attribute has no effect.`);
      }
      if (_.has(node.attribs, 'text')) {
        logger.warn(`${node.name} has a header slot, 'text' attribute has no effect.`);
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
    } else {
      this._processAttributeWithoutOverride(node, 'text', true, '_header');
    }
  }

  /**
   * Thumbnails
   */

  _processThumbnailAttributes(node) {
    const isImage = _.has(node.attribs, 'src') && node.attribs.src !== '';
    if (isImage) {
      return;
    }

    const text = _.has(node.attribs, 'text') ? node.attribs.text : '';
    if (text === '') {
      return;
    }

    const renderedText = this._renderMdInline(text);
    node.children = cheerio.parseHTML(renderedText);
    delete node.attribs.text;
  }

  /**
   * Annotations are added automatically by KaTeX when rendering math formulae.
   */

  static _processAnnotationAttributes(node) {
    if (!_.has(node.attribs, 'v-pre')) {
      node.attribs['v-pre'] = true;
    }
  }

  /*
   * Footnotes of the main content and <include>s are stored, then combined by NodeProcessor at the end
   */

  _processMbTempFootnotes(node) {
    const $ = cheerio(node);
    this.renderedFootnotes.push($.html());
    $.remove();
  }

  _combineFootnotes() {
    let hasFootnote = false;
    const prefix = '<hr class="footnotes-sep">\n<section class="footnotes">\n<ol class="footnotes-list">\n';

    const footnotesWithPopovers = this.renderedFootnotes.map((footNoteBlock) => {
      const $ = cheerio.load(footNoteBlock);
      let popoversHtml = '';

      $('li.footnote-item').each((index, li) => {
        hasFootnote = true;
        const popoverId = `${MARKBIND_FOOTNOTE_POPOVER_ID_PREFIX}${li.attribs.id}`;
        const popoverNode = cheerio.parseHTML(`<popover id="${popoverId}">
            <div #content>
              ${$(li).html()}
            </div>
          </popover>`)[0];
        this.processNode(popoverNode);

        popoversHtml += cheerio.html(popoverNode);
      });

      return `${popoversHtml}\n${footNoteBlock}\n`;
    }).join('\n');

    const suffix = '</ol>\n</section>\n';

    return hasFootnote
      ? prefix + footnotesWithPopovers + suffix
      : '';
  }

  /*
   * Body
   */

  static _preprocessBody(node) {
    // eslint-disable-next-line no-console
    console.warn(`<body> tag found in ${node.attribs[ATTRIB_CWF]}. This may cause formatting errors.`);
  }

  /*
   * Layout element collection
   */

  _collectLayoutEl(node, property) {
    const $ = cheerio(node);
    this[property].push($.html());
    $.remove();
  }

  /*
   * h1 - h6
   */
  _setHeadingId(node) {
    const textContent = cheerio(node).text();
    // remove the '&lt;' and '&gt;' symbols that markdown-it uses to escape '<' and '>'
    const cleanedContent = textContent.replace(/&lt;|&gt;/g, '');
    const slugifiedHeading = slugify(cleanedContent, { decamelize: false });

    let headerId = slugifiedHeading;
    const { headerIdMap } = this.config;
    if (headerIdMap[slugifiedHeading]) {
      headerId = `${slugifiedHeading}-${headerIdMap[slugifiedHeading]}`;
      headerIdMap[slugifiedHeading] += 1;
    } else {
      headerIdMap[slugifiedHeading] = 2;
    }

    node.attribs.id = headerId;
  }

  /*
   * API
   */

  processNode(node, context) {
    try {
      switch (node.name) {
      case 'frontmatter':
        this._processFrontMatter(node, context);
        break;
      case 'body':
        NodeProcessor._preprocessBody(node);
        break;
      case 'code':
        node.attribs['v-pre'] = '';
        break;
      case 'include':
        this.docId += 1; // used in markdown-it-footnotes
        return processInclude(node, context, this.pageSources, this.variableProcessor,
                              text => this._renderMd(text), text => this._renderMdInline(text),
                              this.config);
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
    } catch (error) {
      logger.error(error);
    }

    return context;
  }

  postProcessNode(node) {
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
    } catch (error) {
      logger.error(error);
    }

    if (node.attribs) {
      delete node.attribs[ATTRIB_CWF];
    }
  }

  _process(node, context) {
    if (_.isArray(node)) {
      return node.map(el => this._process(el, context));
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
      if (this.config.intrasiteLinkValidation.enabled) {
        linkProcessor.validateIntraLink(node, context.cwf, this.config);
      }
      linkProcessor.collectSource(node, this.config.rootPath, this.config.baseUrl, this.pageSources);
    }

    const isHeadingTag = (/^h[1-6]$/).test(node.name);

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
      node.children.forEach((child) => {
        this._process(child, context);
      });
    }

    this.postProcessNode(node);

    insertTemporaryStyles(node);

    if (isHeadingTag && !node.attribs.id) {
      this._setHeadingId(node); // do this one more time, in case the first one assigned a blank id
    }

    // If a fixed header is applied to the page, generate dummy spans as anchor points
    if (isHeadingTag && node.attribs.id) {
      cheerio(node).prepend(`<span id="${node.attribs.id}" class="anchor"></span>`);
    }

    return node;
  }

  process(file, content, cwf = file, extraVariables = {}) {
    const context = new Context(cwf, [], extraVariables, {});

    return new Promise((resolve, reject) => {
      const handler = new htmlparser.DomHandler((error, dom) => {
        if (error) {
          reject(error);
          return;
        }
        const nodes = dom.map((d) => {
          let processed;
          try {
            processed = this._process(d, context);
          } catch (err) {
            err.message += `\nError while rendering '${file}'`;
            logger.error(err);
            processed = utils.createErrorNode(d, err);
          }
          return processed;
        });
        nodes.forEach(d => NodeProcessor._trimNodes(d));

        resolve(cheerio(nodes).html() + this._combineFootnotes());
      });
      const parser = new htmlparser.Parser(handler);
      const fileExt = utils.getExt(file);
      if (utils.isMarkdownFileExt(fileExt)) {
        const renderedContent = this._renderMd(content);
        // Wrap with <root> as $.remove() does not work on top level nodes
        parser.parseComplete(`<root>${renderedContent}</root>`);
      } else if (fileExt === 'html') {
        parser.parseComplete(`<root>${content}</root>`);
      } else {
        const error = new Error(`Unsupported File Extension: '${fileExt}'`);
        reject(error);
      }
    });
  }
}

module.exports = {
  NodeProcessor,
};
