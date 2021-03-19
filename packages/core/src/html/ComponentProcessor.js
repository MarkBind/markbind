const cheerio = require('cheerio');

const { findHeaderElement } = require('./headerProcessor');

const _ = {};
_.has = require('lodash/has');

const logger = require('../utils/logger');

class ComponentProcessor {
  constructor(nodeProcessor) {
    this.nodeProcessor = nodeProcessor;
  }

  /*
   * Panels
   */

  processPanelAttributes(node) {
    this.nodeProcessor._processAttributeWithoutOverride(node, 'alt', false, '_alt');
    this.nodeProcessor._processAttributeWithoutOverride(node, 'header', false);
  }

  /**
   * Assigns an id to the root element of a panel component using the heading specified in the
   * panel's header slot or attribute (if any), with the header slot having priority if present.
   * This is to ensure anchors still work when panels are in their minimized form.
   * @param node The root panel element
   */
  assignPanelId(node) {
    const slotChildren = node.children
      && node.children.filter(child => this.nodeProcessor.constructor.getVslotShorthandName(child) !== '');

    const headerSlot = slotChildren.find(child =>
      this.nodeProcessor.constructor.getVslotShorthandName(child) === 'header');

    if (headerSlot) {
      const header = findHeaderElement(headerSlot);
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

  /*
   * Questions, QOption, and Quizzes
   */

  processQuestion(node) {
    this.nodeProcessor._processAttributeWithoutOverride(node, 'header', false, 'header');
    this.nodeProcessor._processAttributeWithoutOverride(node, 'hint', false, 'hint');
    this.nodeProcessor._processAttributeWithoutOverride(node, 'answer', false, 'answer');
  }

  processQOption(node) {
    this.nodeProcessor._processAttributeWithoutOverride(node, 'reason', false, 'reason');
  }

  processQuiz(node) {
    this.nodeProcessor._processAttributeWithoutOverride(node, 'intro', false, 'intro');
  }

  /*
   * Tabs
   */

  processTabAttributes(node) {
    this.nodeProcessor._processAttributeWithoutOverride(node, 'header', true, 'header');
  }

  /*
   * Tip boxes
   */

  processBoxAttributes(node) {
    this.nodeProcessor.constructor._warnConflictingAttributes(node, 'light', ['seamless']);
    this.nodeProcessor.constructor
      ._warnConflictingAttributes(node, 'no-background', ['background-color', 'seamless']);
    this.nodeProcessor.constructor
      ._warnConflictingAttributes(node, 'no-border',
                                  ['border-color', 'border-left-color', 'seamless']);
    this.nodeProcessor.constructor._warnConflictingAttributes(node, 'no-icon', ['icon']);
    this.nodeProcessor.constructor._warnDeprecatedAttributes(node, { heading: 'header' });

    this.nodeProcessor._processAttributeWithoutOverride(node, 'icon', true, 'icon');
    this.nodeProcessor._processAttributeWithoutOverride(node, 'header', false, 'header');

    this.nodeProcessor._processAttributeWithoutOverride(node, 'heading', false, 'header');
  }

  /*
   * Dropdowns
   */

  processDropdownAttributes(node) {
    const hasHeaderSlot = node.children
      && node.children.some(
        child => this.nodeProcessor.constructor.getVslotShorthandName(child) === 'header');

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

    this.nodeProcessor.constructor._warnDeprecatedAttributes(node, { text: 'header' });
    this.nodeProcessor.constructor._warnConflictingAttributes(node, 'header', ['text']);
    // header attribute takes priority over text attribute if both 'text' and 'header' is used
    if (_.has(node.attribs, 'header')) {
      this.nodeProcessor._processAttributeWithoutOverride(node, 'header', true, 'header');
      delete node.attribs.text;
    } else {
      this.nodeProcessor._processAttributeWithoutOverride(node, 'text', true, 'header');
    }
  }

  /**
   * Thumbnails
   */

  processThumbnailAttributes(node) {
    const isImage = _.has(node.attribs, 'src') && node.attribs.src !== '';
    if (isImage) {
      return;
    }

    const text = _.has(node.attribs, 'text') ? node.attribs.text : '';
    if (text === '') {
      return;
    }

    const renderedText = this.nodeProcessor.markdownRenderer.renderMdInline(text);
    node.children = cheerio.parseHTML(renderedText);
    delete node.attribs.text;
  }

  /**
   * Annotations are added automatically by KaTeX when rendering math formulae.
   */

  static processAnnotationAttributes(node) {
    if (!_.has(node.attribs, 'v-pre')) {
      node.attribs['v-pre'] = true;
    }
  }
}

module.exports = {
  ComponentProcessor,
};
