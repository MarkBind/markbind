import cheerio from 'cheerio';
import has from 'lodash/has';
import { getVslotShorthandName } from './vueSlotSyntaxProcessor';
import type { MarkdownProcessor } from './MarkdownProcessor';
import * as logger from '../utils/logger';
import { createSlotTemplateNode } from './elements';
import { Node, NodeOrText } from '../utils/node';

const _ = {
  has,
};

/**
 * Class that is responsible for rendering markdown-in-attributes
 */
export class MdAttributeRenderer {
  markdownProcessor: MarkdownProcessor;

  constructor(mdp: MarkdownProcessor) {
    this.markdownProcessor = mdp;
  }

  /**
   * Processes the markdown attribute of the provided element, inserting the corresponding <slot> child
   * if there is no pre-existing slot child with the name of the attribute present.
   * @param node Element to process
   * @param attribute Attribute name to process
   * @param isInline Whether to process the attribute with only inline markdown-it rules
   * @param slotName Name attribute of the <slot> element to insert, which defaults to the attribute name
   */
  processAttributeWithoutOverride(node: Node, attribute: string,
                                  isInline: boolean, slotName = attribute): void {
    const hasAttributeSlot = node.children
        && node.children.some(child => getVslotShorthandName(child) === slotName);

    if (!hasAttributeSlot && _.has(node.attribs, attribute)) {
      let rendered;
      if (isInline) {
        rendered = this.markdownProcessor.renderMdInline(node.attribs[attribute]);
      } else {
        rendered = this.markdownProcessor.renderMd(node.attribs[attribute]);
      }

      const attributeSlotElement: NodeOrText[] = createSlotTemplateNode(slotName, rendered);
      node.children = node.children
        ? attributeSlotElement.concat(node.children)
        : attributeSlotElement;
    }

    delete node.attribs[attribute];
  }

  /**
   * Checks if the node has both the given slot and the given attribute,
   * deleting the attribute and logging a warning if both the slot and attribute exist.
   * @param node Element to process
   * @param attribute Attribute name to process
   * @param slotName Name attribute of the <slot> element to insert, which defaults to the attribute name
   * @returns {boolean} whether the node has both the slot and attribute
   */
  // eslint-disable-next-line class-methods-use-this
  hasSlotOverridingAttribute(node: Node, attribute: string, slotName = attribute): boolean {
    const hasNamedSlot = node.children
      && node.children.some(child => getVslotShorthandName(child) === slotName);
    if (!hasNamedSlot || !node.attribs) {
      return false;
    }

    // If the slot is present, remove the attribute as the attribute has no effect.
    const hasAttribute = _.has(node.attribs, attribute);
    if (hasAttribute) {
      logger.warn(`${node.name} has a ${slotName} slot, '${attribute}' attribute has no effect.`);
      delete node.attribs[attribute];
    }

    return hasAttribute;
  }

  processPopoverAttributes(node: Node) {
    if (!this.hasSlotOverridingAttribute(node, 'header')) {
      this.processAttributeWithoutOverride(node, 'header', true);
    }

    // Warn if there is a content slot overriding the attributes 'content' or 'src'
    const hasSlotAndContentAttribute = this.hasSlotOverridingAttribute(node, 'content', 'content');
    const hasSlotAndSrcAttribute = this.hasSlotOverridingAttribute(node, 'src', 'content');
    if (hasSlotAndContentAttribute || hasSlotAndSrcAttribute) {
      return;
    }

    const nodeAttribs = node.attribs ?? {};

    if (_.has(nodeAttribs, 'content') && _.has(nodeAttribs, 'src')) {
      logger.warn(`${node.name} has a 'content' attribute, 'src' attribute has no effect.`);
      delete nodeAttribs.src;
    }

    node.attribs = nodeAttribs;
    this.processAttributeWithoutOverride(node, 'content', true);
  }

  processTooltip(node: Node) {
    this.processAttributeWithoutOverride(node, 'content', true);
  }

  processModalAttributes(node: Node) {
    if (!this.hasSlotOverridingAttribute(node, 'header')) {
      this.processAttributeWithoutOverride(node, 'header', true);
    }
  }

  /*
   * Panels
   */

  processPanelAttributes(node: Node) {
    this.processAttributeWithoutOverride(node, 'alt', false, '_alt');
    if (!this.hasSlotOverridingAttribute(node, 'header')) {
      this.processAttributeWithoutOverride(node, 'header', false);
    }
  }

  /*
   * Questions, QOption, and Quizzes
   */

  processQuestion(node: Node) {
    this.processAttributeWithoutOverride(node, 'header', false);
    this.processAttributeWithoutOverride(node, 'hint', false);
    this.processAttributeWithoutOverride(node, 'answer', false);
  }

  processQOption(node: Node) {
    this.processAttributeWithoutOverride(node, 'reason', false);
  }

  processQuiz(node: Node) {
    this.processAttributeWithoutOverride(node, 'intro', false);
  }

  /*
   * Tabs
   */

  processTabAttributes(node: Node) {
    this.processAttributeWithoutOverride(node, 'header', true);
  }

  /*
   * Boxes
   */

  processBoxAttributes(node: Node) {
    this.processAttributeWithoutOverride(node, 'icon', true);
    this.processAttributeWithoutOverride(node, 'header', false);
  }

  /*
   * Dropdowns
   */

  processDropdownAttributes(node: Node) {
    if (!this.hasSlotOverridingAttribute(node, 'header')) {
      this.processAttributeWithoutOverride(node, 'header', true);
    }
  }

  /**
   * Thumbnails
   */

  processThumbnailAttributes(node: Node) {
    if (!node.attribs) {
      return;
    }

    const isImage = _.has(node.attribs, 'src') && node.attribs.src !== '';
    if (isImage) {
      return;
    }

    const text = _.has(node.attribs, 'text') ? node.attribs.text : '';
    if (text === '') {
      return;
    }

    const renderedText = this.markdownProcessor.renderMdInline(text);
    node.children = cheerio.parseHTML(renderedText) as unknown as NodeOrText[];
    delete node.attribs.text;
  }
}
