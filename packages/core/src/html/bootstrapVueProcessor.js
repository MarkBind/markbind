const _ = {};
_.has = require('lodash/has');

const { getVslotShorthandName } = require('./vueSlotSyntaxProcessor');

/**
 * Takes an element, looks for direct elements with slots and transforms to avoid Vue parsing.
 * This is so that we can use bootstrap-vue popovers, tooltips, and modals.
 * @param node Element to transform
 */
function _transformSlottedComponents(node) {
  node.children.forEach((child) => {
    // Turns <template #content>... into <span data-mb-slot-name=content>...
    const vslotShorthandName = getVslotShorthandName(child);
    if (vslotShorthandName) {
      child.attribs['data-mb-slot-name'] = vslotShorthandName;
      delete child.attribs[`#${vslotShorthandName}`];
      // similarly, need to transform templates to avoid Vue parsing
      child.name = 'span';
    }
  });
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

function _addTriggerClass(node, trigger) {
  const triggerClass = trigger === 'click' ? 'trigger-click' : 'trigger';
  node.attribs.class = node.attribs.class ? `${node.attribs.class} ${triggerClass}` : triggerClass;
}

function transformBootstrapVuePopover(node) {
  node.name = 'span';
  const trigger = node.attribs.trigger || 'hover';
  const placement = node.attribs.placement || 'top';
  node.attribs['data-mb-component-type'] = 'popover';
  node.attribs[`v-b-popover.${trigger}.${placement}.html`] = 'popoverInnerGetters';

  _addTriggerClass(node, trigger);
  _transformSlottedComponents(node);
}

function transformBootstrapVueTooltip(node) {
  node.name = 'span';
  const trigger = node.attribs.trigger || 'hover';
  const placement = node.attribs.placement || 'top';
  node.attribs['data-mb-component-type'] = 'tooltip';
  node.attribs[`v-b-tooltip.${trigger}.${placement}.html`] = 'tooltipInnerContentGetter';

  _addTriggerClass(node, trigger);
  _transformSlottedComponents(node);
}

function transformBootstrapVueModalAttributes(node, renameSlot, renameAttribute) {
  renameSlot('header', 'modal-header');
  renameSlot('footer', 'modal-footer');

  node.name = 'b-modal';

  renameAttribute('ok-text', 'ok-title');
  renameAttribute('center', 'centered');

  const hasOkTitle = _.has(node.attribs, 'ok-title');
  const hasFooter = node.children.some(child => getVslotShorthandName(child) === 'modal-footer');

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

module.exports = {
  transformBootstrapVuePopover,
  transformBootstrapVueTooltip,
  transformBootstrapVueModalAttributes,
};
