const cheerio = require('cheerio');

const { getVslotShorthandName } = require('./vueSlotSyntaxProcessor');

const _ = {};
_.has = require('lodash/has');

const logger = require('../utils/logger');

/**
 * Class that is responsible for rendering markdown-in-attributes
 */
class MdAttributeRenderer {
  constructor(markdownProcessor) {
    this.markdownProcessor = markdownProcessor;
  }

  /**
   * Processes the markdown attribute of the provided element, inserting the corresponding <slot> child
   * if there is no pre-existing slot child with the name of the attribute present.
   * @param node Element to process
   * @param attribute Attribute name to process
   * @param isInline Whether to process the attribute with only inline markdown-it rules
   * @param slotName Name attribute of the <slot> element to insert, which defaults to the attribute name
   */
  processAttributeWithoutOverride(node, attribute, isInline, slotName = attribute) {
    const hasAttributeSlot = node.children
        && node.children.some(child => getVslotShorthandName(child) === slotName);

    if (!hasAttributeSlot && _.has(node.attribs, attribute)) {
      let rendered;
      if (isInline) {
        rendered = this.markdownProcessor.renderMdInline(node.attribs[attribute]);
      } else {
        rendered = this.markdownProcessor.renderMd(node.attribs[attribute]);
      }

      const attributeSlotElement = cheerio.parseHTML(
        `<template #${slotName}>${rendered}</template>`, true);
      node.children
          = node.children ? attributeSlotElement.concat(node.children) : attributeSlotElement;
    }

    delete node.attribs[attribute];
  }

  processPopover(node) {
    this.processAttributeWithoutOverride(node, 'content', true);
    this.processAttributeWithoutOverride(node, 'header', true);
    this.processAttributeWithoutOverride(node, 'title', true, 'header');
  }

  processTooltip(node) {
    this.processAttributeWithoutOverride(node, 'content', true, '_content');
  }

  processModalAttributes(node) {
    this.processAttributeWithoutOverride(node, 'header', true, 'modal-title');
    this.processAttributeWithoutOverride(node, 'title', true, 'modal-title');
  }

  /*
   * Panels
   */

  processPanelAttributes(node) {
    this.processAttributeWithoutOverride(node, 'alt', false, '_alt');
    this.processAttributeWithoutOverride(node, 'header', false);
  }

  /*
   * Questions, QOption, and Quizzes
   */

  processQuestion(node) {
    this.processAttributeWithoutOverride(node, 'header', false, 'header');
    this.processAttributeWithoutOverride(node, 'hint', false, 'hint');
    this.processAttributeWithoutOverride(node, 'answer', false, 'answer');
  }

  processQOption(node) {
    this.processAttributeWithoutOverride(node, 'reason', false, 'reason');
  }

  processQuiz(node) {
    this.processAttributeWithoutOverride(node, 'intro', false, 'intro');
  }

  /*
   * Tabs
   */

  processTabAttributes(node) {
    this.processAttributeWithoutOverride(node, 'header', true, 'header');
  }

  /*
   * Tip boxes
   */

  processBoxAttributes(node) {
    this.processAttributeWithoutOverride(node, 'icon', true, 'icon');
    this.processAttributeWithoutOverride(node, 'header', false, 'header');

    this.processAttributeWithoutOverride(node, 'heading', false, 'header');
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

    // header attribute takes priority over text attribute if both 'text' and 'header' is used
    if (_.has(node.attribs, 'header')) {
      this.processAttributeWithoutOverride(node, 'header', true, 'header');
      delete node.attribs.text;
    } else {
      this.processAttributeWithoutOverride(node, 'text', true, 'header');
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
}

module.exports = {
  MdAttributeRenderer,
};
