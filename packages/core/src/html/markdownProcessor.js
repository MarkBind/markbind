const cheerio = require('cheerio');
const md = require('../lib/markdown-it');

const { getVslotShorthandName } = require('./vueSlotSyntaxProcessor');

const _ = {};
_.has = require('lodash/has');

function renderMd(text, docIdManager) {
  return md.render(text, docIdManager.docId
    ? { docId: `${docIdManager.baseDocId}${docIdManager.docId}` }
    : { docId: docIdManager.baseDocId });
}

function renderMdInline(text, docIdManager) {
  return md.renderInline(text, docIdManager.docId
    ? { docId: `${docIdManager.baseDocId}${docIdManager.docId}` }
    : { docId: docIdManager.baseDocId });
}

/**
 * Processes the markdown attribute of the provided element, inserting the corresponding <slot> child
 * if there is no pre-existing slot child with the name of the attribute present.
 * @param node Element to process
 * @param docIdManager Document Id manager of the node
 * @param attribute Attribute name to process
 * @param isInline Whether to process the attribute with only inline markdown-it rules
 * @param slotName Name attribute of the <slot> element to insert, which defaults to the attribute name
 */
function processAttributeWithoutOverride(node, docIdManager, attribute, isInline, slotName = attribute) {
  const hasAttributeSlot = node.children
      && node.children.some(child => getVslotShorthandName(child) === slotName);

  if (!hasAttributeSlot && _.has(node.attribs, attribute)) {
    let rendered;
    if (isInline) {
      rendered = renderMdInline(node.attribs[attribute], docIdManager);
    } else {
      rendered = renderMd(node.attribs[attribute], docIdManager);
    }

    const attributeSlotElement = cheerio.parseHTML(
      `<template #${slotName}>${rendered}</template>`, true);
    node.children
        = node.children ? attributeSlotElement.concat(node.children) : attributeSlotElement;
  }

  delete node.attribs[attribute];
}

module.exports = {
  renderMd,
  renderMdInline,
  processAttributeWithoutOverride,
};
