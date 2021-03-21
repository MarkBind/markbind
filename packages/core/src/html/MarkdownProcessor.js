const cheerio = require('cheerio');
const md = require('../lib/markdown-it');

const { getVslotShorthandName } = require('./vueSlotSyntaxProcessor');

const _ = {};
_.has = require('lodash/has');

class MarkdownProcessor {
  constructor(docId) {
    // markdown-it-footnotes state
    this.baseDocId = docId; // encapsulates footnotes in externals (<panel src="...">)
    this.docId = 0; // encapsulates footnotes in <include>s
  }

  renderMd(text) {
    return md.render(text, this.docId
      ? { docId: `${this.baseDocId}${this.docId}` }
      : { docId: this.baseDocId });
  }

  renderMdInline(text) {
    return md.renderInline(text, this.docId
      ? { docId: `${this.baseDocId}${this.docId}` }
      : { docId: this.baseDocId });
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
        rendered = this.renderMdInline(node.attribs[attribute]);
      } else {
        rendered = this.renderMd(node.attribs[attribute]);
      }

      const attributeSlotElement = cheerio.parseHTML(
        `<template #${slotName}>${rendered}</template>`, true);
      node.children
        = node.children ? attributeSlotElement.concat(node.children) : attributeSlotElement;
    }

    delete node.attribs[attribute];
  }
}

module.exports = {
  MarkdownProcessor,
};
