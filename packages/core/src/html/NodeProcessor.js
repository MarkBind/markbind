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
const { ComponentProcessor } = require('./ComponentProcessor');
const { insertTemporaryStyles } = require('./tempStyleProcessor');
const { highlightCodeBlock } = require('./codeblockProcessor');

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
    this.componentProcessor = new ComponentProcessor(NodeProcessor);
  }

  static renderMd(text) {
    return md.render(text, this.docId
      ? { docId: `${this.baseDocId}${this.docId}` }
      : { docId: this.baseDocId });
  }

  static renderMdInline(text) {
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

  static getVslotShorthandName(node) {
    if (!node.attribs) {
      return '';
    }

    const keys = Object.keys(node.attribs);
    const vslotShorthand = _.find(keys, key => key.startsWith('#'));
    if (!vslotShorthand) {
      return '';
    }

    return vslotShorthand.substring(1, vslotShorthand.length); // remove #
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
      && node.children.some(child => NodeProcessor.getVslotShorthandName(child) === slotName);

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

  static processAttributeWithoutOverride(node, attribute, isInline, slotName = attribute) {
    const hasAttributeSlot = node.children
        && node.children.some(child => NodeProcessor.getVslotShorthandName(child) === slotName);

    if (!hasAttributeSlot && _.has(node.attribs, attribute)) {
      let rendered;
      if (isInline) {
        rendered = NodeProcessor.renderMdInline(node.attribs[attribute]);
      } else {
        rendered = NodeProcessor.renderMd(node.attribs[attribute]);
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
      // Turns <template #content>... into <span data-mb-slot-name=content>...
      const vslotShorthandName = NodeProcessor.getVslotShorthandName(child);
      if (vslotShorthandName) {
        child.attribs['data-mb-slot-name'] = vslotShorthandName;
        delete child.attribs[`#${vslotShorthandName}`];
        // similarly, need to transform templates to avoid Vue parsing
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
    const slotChildren = node.children
      && node.children.filter(child => NodeProcessor.getVslotShorthandName(child) !== '');

    const headerSlot = slotChildren.find(child => NodeProcessor.getVslotShorthandName(child) === 'header');

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
      const vslotShorthandName = NodeProcessor.getVslotShorthandName(child);
      if (vslotShorthandName) {
        Object.entries(namePairs)
          .forEach(([deprecatedName, correctName]) => {
            if (vslotShorthandName !== deprecatedName) {
              return;
            }
            logger.warn(`${element.name} shorthand slot name '${deprecatedName}' `
              + `is deprecated and may be removed in the future. Please use '${correctName}'`);
          });
      }
    });
  }

  static _renameSlot(node, originalName, newName) {
    if (node.children) {
      node.children.forEach((child) => {
        const vslotShorthandName = NodeProcessor.getVslotShorthandName(child);
        if (vslotShorthandName && vslotShorthandName === originalName) {
          const newVslot = `#${newName}`;
          child.attribs[newVslot] = '';
          delete child.attribs[`#${vslotShorthandName}`];
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
   * Shifts the slot node deeper by one level by creating a new intermediary node with template tag name.
   */
  static shiftSlotNodeDeeper(node) {
    if (!node.children) {
      return;
    }

    node.children.forEach((child) => {
      const vslotShorthandName = NodeProcessor.getVslotShorthandName(child);
      if (vslotShorthandName && child.name !== 'template') {
        const newSlotNode = cheerio.parseHTML('<template></template>')[0];

        const vslotShorthand = `#${vslotShorthandName}`;
        newSlotNode.attribs[vslotShorthand] = '';
        delete child.attribs[vslotShorthand];

        newSlotNode.parent = node;
        child.parent = newSlotNode;

        newSlotNode.children.push(child);

        // replace the shifted old child node with the new slot node
        node.children.forEach((childNode, idx) => {
          if (childNode === child) {
            node.children[idx] = newSlotNode;
          }
        });
      }
    });
  }

  /*
   * Transforms deprecated vue slot syntax (slot="test") into the updated Vue slot shorthand syntax (#test).
   */
  static transformOldSlotSyntax(node) {
    if (!node.children) {
      return;
    }

    node.children.forEach((child) => {
      if (_.has(child.attribs, 'slot')) {
        const vslotShorthandName = `#${child.attribs.slot}`;
        child.attribs[vslotShorthandName] = '';
        delete child.attribs.slot;
      }
    });
  }

  /*
   * API
   */

  processNode(node, context) {
    try {
      NodeProcessor.transformOldSlotSyntax(node);
      NodeProcessor.shiftSlotNodeDeeper(node);

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
                              text => NodeProcessor.renderMd(text),
                              text => NodeProcessor.renderMdInline(text),
                              this.config);
      case 'panel':
        this.componentProcessor.processPanelAttributes(node);
        return processPanelSrc(node, context, this.pageSources, this.config);
      case 'question':
        this.componentProcessor._processQuestion(node);
        break;
      case 'q-option':
        this.componentProcessor._processQOption(node);
        break;
      case 'quiz':
        this.componentProcessor._processQuiz(node);
        break;
      case 'popover':
        // this.componentProcessor._processPopover(node);
        this._processPopover(node);
        break;
      case 'tooltip':
        this.componentProcessor._processTooltip(node);
        break;
      case 'modal':
        this.componentProcessor._processModalAttributes(node);
        break;
      case 'tab':
      case 'tab-group':
        this.componentProcessor._processTabAttributes(node);
        break;
      case 'box':
        this.componentProcessor._processBoxAttributes(node);
        break;
      case 'dropdown':
        this.componentProcessor._processDropdownAttributes(node);
        break;
      case 'thumbnail':
        this.componentProcessor._processThumbnailAttributes(node);
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
      case 'pre':
        highlightCodeBlock(node);
        break;
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
      node.children = cheerio.parseHTML(NodeProcessor.renderMdInline(cheerio.html(node.children)), true);
      break;
    case 'markdown':
      node.name = 'div';
      node.children = cheerio.parseHTML(NodeProcessor.renderMd(cheerio.html(node.children)), true);
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
        const renderedContent = NodeProcessor.renderMd(content);
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
