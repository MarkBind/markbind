const { getVslotShorthandName } = require('./vueSlotSyntaxProcessor');

const _ = {};
_.has = require('lodash/has');

function _renameSlot(node, originalName, newName) {
  if (node.children) {
    node.children.forEach((child) => {
      const vslotShorthandName = getVslotShorthandName(child);
      if (vslotShorthandName && vslotShorthandName === originalName) {
        const newVslot = `#${newName}`;
        child.attribs[newVslot] = '';
        delete child.attribs[`#${vslotShorthandName}`];
      }
    });
  }
}

function _renameAttribute(node, originalAttribute, newAttribute) {
  if (_.has(node.attribs, originalAttribute)) {
    node.attribs[newAttribute] = node.attribs[originalAttribute];
    delete node.attribs[originalAttribute];
  }
}

/*
 * Modals, triggers
 *
 * We use bootstrap-vue's modals, but perform various transformations
 * to conform with our syntax instead, and to support triggers.
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
 */

function transformBootstrapVueModalAttributes(node) {
  _renameSlot(node, 'header', 'modal-header');
  _renameSlot(node, 'footer', 'modal-footer');

  node.name = 'b-modal';

  _renameAttribute(node, 'ok-text', 'ok-title');
  _renameAttribute(node, 'center', 'centered');

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
  transformBootstrapVueModalAttributes,
};
