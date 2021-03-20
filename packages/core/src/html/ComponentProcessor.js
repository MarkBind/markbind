const cheerio = require('cheerio');

const { findHeaderElement } = require('./headerProcessor');
const { getVslotShorthandName } = require('./vueSlotSyntaxProcessor');
const { renderMdInline, processAttributeWithoutOverride } = require('./markdownProcessor');
const { warnConflictingAttributes, warnDeprecatedAttributes } = require('./warnings');

const _ = {};
_.has = require('lodash/has');

const logger = require('../utils/logger');

class ComponentProcessor {
  constructor(docIdManager) {
    this.docIdManager = docIdManager;
  }

  /*
   * Panels
   */

  processPanelAttributes(node) {
    processAttributeWithoutOverride(node, this.docIdManager, 'alt', false, '_alt');
    processAttributeWithoutOverride(node, this.docIdManager, 'header', false);
  }

  /**
   * Assigns an id to the root element of a panel component using the heading specified in the
   * panel's header slot or attribute (if any), with the header slot having priority if present.
   * This is to ensure anchors still work when panels are in their minimized form.
   * @param node The root panel element
   */
  static assignPanelId(node) {
    const slotChildren = node.children
      && node.children.filter(child => getVslotShorthandName(child) !== '');

    const headerSlot = slotChildren.find(child => getVslotShorthandName(child) === 'header');

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
    processAttributeWithoutOverride(node, this.docIdManager, 'header', false, 'header');
    processAttributeWithoutOverride(node, this.docIdManager, 'hint', false, 'hint');
    processAttributeWithoutOverride(node, this.docIdManager, 'answer', false, 'answer');
  }

  processQOption(node) {
    processAttributeWithoutOverride(node, this.docIdManager, 'reason', false, 'reason');
  }

  processQuiz(node) {
    processAttributeWithoutOverride(node, this.docIdManager, 'intro', false, 'intro');
  }

  /*
   * Tabs
   */

  processTabAttributes(node) {
    processAttributeWithoutOverride(node, this.docIdManager, 'header', true, 'header');
  }

  /*
   * Tip boxes
   */

  processBoxAttributes(node) {
    warnConflictingAttributes(node, 'light', ['seamless']);
    warnConflictingAttributes(node, 'no-background', ['background-color', 'seamless']);
    warnConflictingAttributes(node, 'no-border',
                              ['border-color', 'border-left-color', 'seamless']);
    warnConflictingAttributes(node, 'no-icon', ['icon']);
    warnDeprecatedAttributes(node, { heading: 'header' });

    processAttributeWithoutOverride(node, this.docIdManager, 'icon', true, 'icon');
    processAttributeWithoutOverride(node, this.docIdManager, 'header', false, 'header');

    processAttributeWithoutOverride(node, this.docIdManager, 'heading', false, 'header');
  }

  /*
   * Dropdowns
   */

  processDropdownAttributes(node) {
    const hasHeaderSlot = node.children
      && node.children.some(child => getVslotShorthandName(child) === 'header');

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

    warnDeprecatedAttributes(node, { text: 'header' });
    warnConflictingAttributes(node, 'header', ['text']);
    // header attribute takes priority over text attribute if both 'text' and 'header' is used
    if (_.has(node.attribs, 'header')) {
      processAttributeWithoutOverride(node, this.docIdManager, 'header', true, 'header');
      delete node.attribs.text;
    } else {
      processAttributeWithoutOverride(node, this.docIdManager, 'text', true, 'header');
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

    const renderedText = renderMdInline(text, this.docIdManager);
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
