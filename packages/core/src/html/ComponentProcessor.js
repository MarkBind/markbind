const cheerio = require('cheerio');

const { getVslotShorthandName } = require('./vueSlotSyntaxProcessor');
const { warnConflictingAttributes, warnDeprecatedAttributes } = require('./warnings');

const _ = {};
_.has = require('lodash/has');

const logger = require('../utils/logger');

class ComponentProcessor {
  constructor(markdownProcessor) {
    this.markdownProcessor = markdownProcessor;
  }

  /*
   * Panels
   */

  processPanelAttributes(node) {
    this.markdownProcessor.processAttributeWithoutOverride(node, 'alt', false, '_alt');
    this.markdownProcessor.processAttributeWithoutOverride(node, 'header', false);
  }

  /*
   * Questions, QOption, and Quizzes
   */

  processQuestion(node) {
    this.markdownProcessor.processAttributeWithoutOverride(node, 'header', false, 'header');
    this.markdownProcessor.processAttributeWithoutOverride(node, 'hint', false, 'hint');
    this.markdownProcessor.processAttributeWithoutOverride(node, 'answer', false, 'answer');
  }

  processQOption(node) {
    this.markdownProcessor.processAttributeWithoutOverride(node, 'reason', false, 'reason');
  }

  processQuiz(node) {
    this.markdownProcessor.processAttributeWithoutOverride(node, 'intro', false, 'intro');
  }

  /*
   * Tabs
   */

  processTabAttributes(node) {
    this.markdownProcessor.processAttributeWithoutOverride(node, 'header', true, 'header');
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

    this.markdownProcessor.processAttributeWithoutOverride(node, 'icon', true, 'icon');
    this.markdownProcessor.processAttributeWithoutOverride(node, 'header', false, 'header');

    this.markdownProcessor.processAttributeWithoutOverride(node, 'heading', false, 'header');
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
      this.markdownProcessor.processAttributeWithoutOverride(node, 'header', true, 'header');
      delete node.attribs.text;
    } else {
      this.markdownProcessor.processAttributeWithoutOverride(node, 'text', true, 'header');
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

    const renderedText = this.markdownProcessor.renderMdInline(text);
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
