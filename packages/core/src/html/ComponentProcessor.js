const cheerio = require('cheerio');

const _ = {};
_.isArray = require('lodash/isArray');
_.cloneDeep = require('lodash/cloneDeep');
_.has = require('lodash/has');
_.find = require('lodash/find');

const logger = require('../utils/logger');

class ComponentProcessor {
  constructor(NodeProcessor) {
    this.NodeProcessor = NodeProcessor;
  }

  processPanelAttributes(node) {
    this.NodeProcessor.processAttributeWithoutOverride(node, 'alt', false, '_alt');
    this.NodeProcessor.processAttributeWithoutOverride(node, 'header', false);
  }

  /*
   * Questions, QOption, and Quizzes
   */

  _processQuestion(node) {
    this.NodeProcessor.processAttributeWithoutOverride(node, 'header', false, 'header');
    this.NodeProcessor.processAttributeWithoutOverride(node, 'hint', false, 'hint');
    this.NodeProcessor.processAttributeWithoutOverride(node, 'answer', false, 'answer');
  }

  _processQOption(node) {
    this.NodeProcessor.processAttributeWithoutOverride(node, 'reason', false, 'reason');
  }

  _processQuiz(node) {
    this.NodeProcessor.processAttributeWithoutOverride(node, 'intro', false, 'intro');
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

  _processPopover(node) {
    this.NodeProcessor._warnDeprecatedAttributes(node, { title: 'header' });

    this.NodeProcessor.processAttributeWithoutOverride(node, 'content', true);
    this.NodeProcessor.processAttributeWithoutOverride(node, 'header', true);
    this.NodeProcessor.processAttributeWithoutOverride(node, 'title', true, 'header');

    node.name = 'span';
    const trigger = node.attribs.trigger || 'hover';
    const placement = node.attribs.placement || 'top';
    node.attribs['data-mb-component-type'] = 'popover';
    node.attribs[`v-b-popover.${trigger}.${placement}.html`] = 'popoverInnerGetters';
    this.NodeProcessor.addTriggerClass(node, trigger);
    this.NodeProcessor._transformSlottedComponents(node);
  }

  _processTooltip(node) {
    this.NodeProcessor.processAttributeWithoutOverride(node, 'content', true, '_content');

    node.name = 'span';
    const trigger = node.attribs.trigger || 'hover';
    const placement = node.attribs.placement || 'top';
    node.attribs['data-mb-component-type'] = 'tooltip';
    node.attribs[`v-b-tooltip.${trigger}.${placement}.html`] = 'tooltipInnerContentGetter';
    this.NodeProcessor.addTriggerClass(node, trigger);
    this.NodeProcessor._transformSlottedComponents(node);
  }

  _processModalAttributes(node) {
    this.NodeProcessor._warnDeprecatedAttributes(node, { title: 'header' });
    this.NodeProcessor._warnDeprecatedSlotNames(node, {
      'modal-header': 'header',
      'modal-footer': 'footer',
    });

    this.NodeProcessor.processAttributeWithoutOverride(node, 'header', true, 'modal-title');
    this.NodeProcessor.processAttributeWithoutOverride(node, 'title', true, 'modal-title');

    this.NodeProcessor._renameSlot(node, 'header', 'modal-header');
    this.NodeProcessor._renameSlot(node, 'footer', 'modal-footer');

    node.name = 'b-modal';

    this.NodeProcessor._renameAttribute(node, 'ok-text', 'ok-title');
    this.NodeProcessor._renameAttribute(node, 'center', 'centered');

    const hasOkTitle = _.has(node.attribs, 'ok-title');
    const hasFooter = node.children
      .some(child => this.NodeProcessor.getVslotShorthandName(child) === 'modal-footer');

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
    this.NodeProcessor.processAttributeWithoutOverride(node, 'header', true, 'header');
  }

  /*
   * Tip boxes
   */

  _processBoxAttributes(node) {
    this.NodeProcessor._warnConflictingAttributes(node, 'light', ['seamless']);
    this.NodeProcessor._warnConflictingAttributes(node, 'no-background', ['background-color', 'seamless']);
    this.NodeProcessor._warnConflictingAttributes(node, 'no-border',
                                                  ['border-color', 'border-left-color', 'seamless']);
    this.NodeProcessor._warnConflictingAttributes(node, 'no-icon', ['icon']);
    this.NodeProcessor._warnDeprecatedAttributes(node, { heading: 'header' });

    this.NodeProcessor.processAttributeWithoutOverride(node, 'icon', true, 'icon');
    this.NodeProcessor.processAttributeWithoutOverride(node, 'header', false, 'header');

    this.NodeProcessor.processAttributeWithoutOverride(node, 'heading', false, 'header');
  }

  /*
   * Dropdowns
   */

  _processDropdownAttributes(node) {
    const hasHeaderSlot = node.children
      && node.children.some(child => this.NodeProcessor.getVslotShorthandName(child) === 'header');

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

    this.NodeProcessor._warnDeprecatedAttributes(node, { text: 'header' });
    this.NodeProcessor._warnConflictingAttributes(node, 'header', ['text']);
    // header attribute takes priority over text attribute if both 'text' and 'header' is used
    if (_.has(node.attribs, 'header')) {
      this.NodeProcessor.processAttributeWithoutOverride(node, 'header', true, 'header');
      delete node.attribs.text;
    } else {
      this.NodeProcessor.processAttributeWithoutOverride(node, 'text', true, 'header');
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

    const renderedText = this.NodeProcessor.renderMdInline(text);
    node.children = cheerio.parseHTML(renderedText);
    delete node.attribs.text;
  }
}

module.exports = { ComponentProcessor };
