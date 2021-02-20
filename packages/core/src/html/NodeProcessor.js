const cheerio = require('cheerio');
const htmlparser = require('htmlparser2'); require('../patches/htmlparser2');
const Promise = require('bluebird');
const slugify = require('@sindresorhus/slugify');

const _ = {};
_.isArray = require('lodash/isArray');
_.cloneDeep = require('lodash/cloneDeep');
_.has = require('lodash/has');

const linkProcessor = require('./linkProcessor');

const md = require('../lib/markdown-it');
const utils = require('../utils');
const logger = require('../utils/logger');

const {
  ATTRIB_CWF,
} = require('../constants');

cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

class NodeProcessor {
  constructor(config) {
    this.config = config;
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

  /**
   * Processes the markdown attribute of the provided element, inserting the corresponding <slot> child
   * if there is no pre-existing slot child with the name of the attribute present.
   * @param node Element to process
   * @param attribute Attribute name to process
   * @param isInline Whether to process the attribute with only inline markdown-it rules
   * @param slotName Name attribute of the <slot> element to insert, which defaults to the attribute name
   */
  static _processAttributeWithoutOverride(node, attribute, isInline, context, slotName = attribute) {
    const hasAttributeSlot = node.children
      && node.children.some(child => _.has(child.attribs, 'slot') && child.attribs.slot === slotName);

    if (!hasAttributeSlot && _.has(node.attribs, attribute)) {
      // console.log(context);
      let rendered;
      if (isInline) {
        rendered = md.renderInline(node.attribs[attribute], context);
      } else {
        rendered = md.render(node.attribs[attribute], context);
      }

      const attributeSlotElement = cheerio.parseHTML(
        `<template slot="${slotName}">${rendered}</template>`, true);
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
      const slot = child.attribs && child.attribs.slot;
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
  }

  /*
   * Panels
   */

  static _processPanelAttributes(node, context) {
    NodeProcessor._processAttributeWithoutOverride(node, 'alt', false, context, '_alt');
    NodeProcessor._processAttributeWithoutOverride(node, 'header', false, context);
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
    const slotChildren = node.children && node.children.filter(child => _.has(child.attribs, 'slot'));
    const headerSlot = slotChildren.find(child => child.attribs.slot === 'header');

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

  static _processQuestion(node, context) {
    NodeProcessor._processAttributeWithoutOverride(node, 'header', false, context, 'header');
    NodeProcessor._processAttributeWithoutOverride(node, 'hint', false, context, 'hint');
    NodeProcessor._processAttributeWithoutOverride(node, 'answer', false, context, 'answer');
  }

  static _processQOption(node, context) {
    NodeProcessor._processAttributeWithoutOverride(node, 'reason', false, context, 'reason');
  }

  static _processQuiz(node, context) {
    NodeProcessor._processAttributeWithoutOverride(node, 'intro', false, context, 'intro');
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

  static _processPopover(node, context) {
    NodeProcessor._warnDeprecatedAttributes(node, { title: 'header' });

    NodeProcessor._processAttributeWithoutOverride(node, 'content', true, context);
    NodeProcessor._processAttributeWithoutOverride(node, 'header', true, context);
    NodeProcessor._processAttributeWithoutOverride(node, 'title', true, context, 'header');

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
      if (!(_.has(child.attribs, 'slot'))) {
        return;
      }
      Object.entries(namePairs)
        .forEach(([deprecatedName, correctName]) => {
          if (child.attribs.slot !== deprecatedName) {
            return;
          }
          logger.warn(`${element.name} slot name '${deprecatedName}' `
            + `is deprecated and may be removed in the future. Please use '${correctName}'`);
        });
    });
  }

  static _processTooltip(node, context) {
    NodeProcessor._processAttributeWithoutOverride(node, 'content', true, context, '_content');

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
      node.children.forEach((c) => {
        const child = c;
        if (_.has(child.attribs, 'slot') && child.attribs.slot === originalName) {
          child.attribs.slot = newName;
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

  static _processModalAttributes(node, context) {
    NodeProcessor._warnDeprecatedAttributes(node, { title: 'header' });
    NodeProcessor._warnDeprecatedSlotNames(node, {
      'modal-header': 'header',
      'modal-footer': 'footer',
    });

    NodeProcessor._processAttributeWithoutOverride(node, 'header', true, context, 'modal-title');
    NodeProcessor._processAttributeWithoutOverride(node, 'title', true, context, 'modal-title');

    NodeProcessor._renameSlot(node, 'header', 'modal-header');
    NodeProcessor._renameSlot(node, 'footer', 'modal-footer');

    node.name = 'b-modal';

    NodeProcessor._renameAttribute(node, 'ok-text', 'ok-title');
    NodeProcessor._renameAttribute(node, 'center', 'centered');

    const hasOkTitle = _.has(node.attribs, 'ok-title');
    const hasFooter = node.children.some(child =>
      _.has(child.attribs, 'slot') && child.attribs.slot === 'modal-footer');

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

  static _processTabAttributes(node, context) {
    NodeProcessor._processAttributeWithoutOverride(node, 'header', true, context, '_header');
  }

  /*
   * Tip boxes
   */

  static _processBoxAttributes(node, context) {
    NodeProcessor._warnConflictingAttributes(node, 'light', ['seamless']);
    NodeProcessor._warnConflictingAttributes(node, 'no-background', ['background-color', 'seamless']);
    NodeProcessor._warnConflictingAttributes(node, 'no-border',
                                             ['border-color', 'border-left-color', 'seamless']);
    NodeProcessor._warnConflictingAttributes(node, 'no-icon', ['icon']);
    NodeProcessor._warnDeprecatedAttributes(node, { heading: 'header' });

    NodeProcessor._processAttributeWithoutOverride(node, 'icon', true, context, 'icon');
    NodeProcessor._processAttributeWithoutOverride(node, 'header', false, context, '_header');

    NodeProcessor._processAttributeWithoutOverride(node, 'heading', false, context, '_header');
  }

  /*
   * Dropdowns
   */

  static _processDropdownAttributes(node, context) {
    const slotChildren = node.children && node.children.filter(child => _.has(child.attribs, 'slot'));
    const hasHeaderSlot = slotChildren && slotChildren.some(child => child.attribs.slot === 'header');

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
      NodeProcessor._processAttributeWithoutOverride(node, 'header', true, context, '_header');
      delete node.attribs.text;
    } else {
      NodeProcessor._processAttributeWithoutOverride(node, 'text', true, context, '_header');
    }
  }

  /**
   * Thumbnails
   */

  static _processThumbnailAttributes(node, context) {
    const isImage = _.has(node.attribs, 'src') && node.attribs.src !== '';
    if (isImage) {
      return;
    }

    const text = _.has(node.attribs, 'text') ? node.attribs.text : '';
    if (text === '') {
      return;
    }

    const renderedText = md.renderInline(text, context);
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
   * API
   */

  static processNode(node, context) {
    try {
      switch (node.name) {
      case 'code':
        node.attribs['v-pre'] = '';
        break;
      case 'panel':
        NodeProcessor._processPanelAttributes(node, context);
        break;
      case 'question':
        NodeProcessor._processQuestion(node, context);
        break;
      case 'q-option':
        NodeProcessor._processQOption(node, context);
        break;
      case 'quiz':
        NodeProcessor._processQuiz(node, context);
        break;
      case 'popover':
        NodeProcessor._processPopover(node, context);
        break;
      case 'tooltip':
        NodeProcessor._processTooltip(node, context);
        break;
      case 'modal':
        NodeProcessor._processModalAttributes(node, context);
        break;
      case 'tab':
      case 'tab-group':
        NodeProcessor._processTabAttributes(node, context);
        break;
      case 'box':
        NodeProcessor._processBoxAttributes(node, context);
        break;
      case 'dropdown':
        NodeProcessor._processDropdownAttributes(node, context);
        break;
      case 'thumbnail':
        NodeProcessor._processThumbnailAttributes(node, context);
        break;
      case 'annotation':
        NodeProcessor._processAnnotationAttributes(node);
        break;
      default:
        break;
      }
    } catch (error) {
      logger.error(error);
    }
  }

  static postProcessNode(node) {
    try {
      switch (node.name) {
      case 'panel':
        NodeProcessor._assignPanelId(node);
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

    // use the flagged cwf from NodePreprocessor to clone the context with the new flagged cwf.
    // TODO merge the two processes to avoid dirty data-included-from hacks
    if (node.attribs && node.attribs['data-included-from']) {
      // eslint-disable-next-line no-param-reassign
      context = _.cloneDeep(context);
      context.cwf = node.attribs['data-included-from'];
    }

    if (linkProcessor.hasTagLink(node)) {
      linkProcessor.convertRelativeLinks(node, context.cwf, this.config.rootPath, this.config.baseUrl);
      linkProcessor.convertMdAndMbdExtToHtmlExt(node);
      linkProcessor.validateIntraLink(node, context.cwf, this.config);
    }

    const isHeadingTag = (/^h[1-6]$/).test(node.name);

    if (isHeadingTag && !node.attribs.id) {
      const textContent = utils.getTextContent(node);
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

    switch (node.name) {
    case 'md':
      node.name = 'span';
      node.children = cheerio.parseHTML(md.renderInline(cheerio.html(node.children), context), true);
      break;
    case 'markdown':
      node.name = 'div';
      node.children = cheerio.parseHTML(md.render(cheerio.html(node.children), context), true);
      break;
    default:
      break;
    }

    NodeProcessor.processNode(node, context);

    if (node.children) {
      node.children.forEach((child) => {
        this._process(child, context);
      });
    }

    NodeProcessor.postProcessNode(node);

    // If a fixed header is applied to the page, generate dummy spans as anchor points
    if (isHeadingTag && node.attribs.id) {
      cheerio(node).prepend(`<span id="${node.attribs.id}" class="anchor"></span>`);
    }

    return node;
  }

  process(file, content, cwf = file) {
    const context = {};
    context.cwf = cwf; // current working file

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

        resolve(cheerio.html(nodes));
      });
      const parser = new htmlparser.Parser(handler);
      const fileExt = utils.getExt(file);
      if (utils.isMarkdownFileExt(fileExt)) {
        const renderedContent = md.render(content, context);
        parser.parseComplete(renderedContent);
      } else if (fileExt === 'html') {
        parser.parseComplete(content);
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
