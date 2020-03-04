const cheerio = require('cheerio');

const _ = {};
_.has = require('lodash/has');

const vueAttrRenderer = require('../lib/vue-attribute-renderer');

cheerio.prototype.options.xmlMode = true; // Enable xml mode for self-closing tag
cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

/*
 * Private utility functions
 */

/**
 * Parses the markdown attribute of the provided element, inserting the corresponding <slot> child
 * if there is no pre-existing slot child with the name of the attribute present.
 * @param node Element to parse
 * @param attribute Attribute name to parse
 * @param isInline Whether to parse the attribute with only inline markdown-it rules
 * @param slotName Name attribute of the <slot> element to insert, which defaults to the attribute name
 */
function _parseAttributeWithoutOverride(node, attribute, isInline, slotName = attribute) {
  const hasAttributeSlot = node.children
    && node.children.some(child => _.has(child.attribs, 'slot') && child.attribs.slot === slotName);

  if (!hasAttributeSlot && _.has(node.attribs, attribute)) {
    let rendered;
    if (isInline) {
      rendered = vueAttrRenderer.renderInline(node.attribs[attribute]);
    } else {
      rendered = vueAttrRenderer.render(node.attribs[attribute]);
    }

    const attributeSlotElement = cheerio.parseHTML(
      `<template slot="${slotName}">${rendered}</template>`, true);
    node.children
      = node.children ? attributeSlotElement.concat(node.children) : attributeSlotElement;
  }

  delete node.attribs[attribute];
}

/**
 * Takes an element, looks for direct elements with slots and transforms to avoid Vue parsing.
 * This is so that we can use bootstrap-vue popovers, tooltips, and modals.
 * @param element Element to transform
 */
function _transformSlottedComponents(element) {
  element.children.forEach((child) => {
    const c = child;
    const slot = c.attribs && c.attribs.slot;
    if (slot) {
      // Turns <div slot="content">... into <div data-mb-html-for=content>...
      c.attribs['data-mb-html-for'] = slot;
      delete c.attribs.slot;
    }
    // similarly, need to transform templates to avoid Vue parsing
    if (c.name === 'template') {
      c.name = 'span';
    }
  });
}

/*
 * Panels
 */

function _parsePanelAttributes(node) {
  _parseAttributeWithoutOverride(node, 'alt', false, '_alt');

  const slotChildren = node.children && node.children.filter(child => _.has(child.attribs, 'slot'));
  const hasAltSlot = slotChildren && slotChildren.some(child => child.attribs.slot === '_alt');
  const hasHeaderSlot = slotChildren && slotChildren.some(child => child.attribs.slot === 'header');

  // If both are present, the header attribute has no effect, and we can simply remove it.
  if (hasAltSlot && hasHeaderSlot) {
    delete node.attribs.header;
    return;
  }

  _parseAttributeWithoutOverride(node, 'header', false, '_header');
}

/**
 * Traverses the dom breadth-first from the specified element to find a html heading child.
 * @param element Root element to search from
 * @returns {undefined|*} The header element, or undefined if none is found.
 */
function _findHeaderElement(node) {
  const elements = node.children;
  if (!elements || !elements.length) {
    return undefined;
  }

  const elementQueue = elements.slice(0);
  while (elementQueue.length) {
    const nextEl = elementQueue.shift();
    if ((/^h[1-6]$/).test(nextEl.name)) {
      return nextEl;
    }

    if (nextEl.children) {
      nextEl.children.forEach(child => elementQueue.push(child));
    }
  }

  return undefined;
}

/**
 * Assigns an id to the root element of a panel component using the heading specified in the
 * panel's header slot or attribute (if any), with the header slot having priority if present.
 * This is to ensure anchors still work when panels are in their minimized form.
 * @param node The root panel element
 */
function _assignPanelId(node) {
  const slotChildren = node.children && node.children.filter(child => _.has(child.attribs, 'slot'));
  const headerSlot = slotChildren.find(child => child.attribs.slot === 'header');
  const headerAttributeSlot = slotChildren.find(child => child.attribs.slot === '_header');

  const slotElement = headerSlot || headerAttributeSlot;
  if (slotElement) {
    const header = _findHeaderElement(slotElement);
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
 * Triggers
 *
 * At "compile time", we can't tell whether a trigger references a modal, popover, or toolip,
 * since that element might not have been processed yet.
 *
 * So, we make every trigger try all 3. It will attempt to open a tooltip, popover, and modal.
 *
 * For tooltips and popovers, we call the relevant content getters inside asset/js/setup.js.
 * They will check to see if the element id exists, and whether it is a popover/tooltip,
 * and then return the content as needed.
 *
 * For modals, we make it attempt to show the modal if it exists.
 */

function _parseTrigger(element) {
  const el = element;
  el.name = 'span';
  const trigger = el.attribs.trigger || 'hover';
  const placement = el.attribs.placement || 'top';
  el.attribs[`v-b-popover.${trigger}.${placement}.html`]
    = 'popoverGenerator';
  el.attribs[`v-b-tooltip.${trigger}.${placement}.html`]
    = 'tooltipContentGetter';
  const convertedTrigger = trigger === 'hover' ? 'mouseover' : trigger;
  el.attribs[`v-on:${convertedTrigger}`] = `$refs['${el.attribs.for}'].show()`;
  el.attribs.class = el.attribs.class ? `${el.attribs.class} trigger` : 'trigger';
}

/*
 * Popovers
 *
 * We hide the content and header via _transformSlottedComponents, for retrieval by triggers.
 *
 * Then, we add in a trigger for this popover.
 */

function _parsePopover(element) {
  const el = element;
  _parseAttributeWithoutOverride(el, 'content', true);
  _parseAttributeWithoutOverride(el, 'header', true);
  // TODO deprecate title attribute for popovers
  _parseAttributeWithoutOverride(node, 'title', true, 'header');
  _parseAttributeWithoutOverride(el, 'title', true, 'header');

  el.name = 'span';
  const trigger = el.attribs.trigger || 'hover';
  const placement = el.attribs.placement || 'top';
  el.attribs['data-mb-component-type'] = 'popover';
  el.attribs[`v-b-popover.${trigger}.${placement}.html`]
    = 'popoverInnerGenerator';
  el.attribs.class = el.attribs.class ? `${el.attribs.class} trigger` : 'trigger';
  _transformSlottedComponents(el);
}

/*
 * Tooltips
 *
 * Similar to popovers.
 */

function _parseTooltip(element) {
  const el = element;
  _parseAttributeWithoutOverride(el, 'content', true, '_content');

  el.name = 'span';
  const trigger = el.attribs.trigger || 'hover';
  const placement = el.attribs.placement || 'top';
  el.attribs['data-mb-component-type'] = 'tooltip';
  el.attribs[`v-b-tooltip.${trigger}.${placement}.html`]
    = 'tooltipInnerContentGetter';
  el.attribs.class = el.attribs.class ? `${el.attribs.class} trigger` : 'trigger';
  _transformSlottedComponents(el);
}

function _renameSlot(node, originalName, newName) {
  if (node.children) {
    node.children.forEach((child) => {
      if (_.has(child.attribs, 'slot') && child.attribs.slot === originalName) {
        child.attribs.slot = newName;
      }
    });
  }
}

function _renameAttribute(element, originalAttribute, newAttribute) {
  const el = element;
  if (_.has(el.attribs, originalAttribute)) {
    el.attribs[newAttribute] = el.attribs[originalAttribute];
    delete el.attribs[originalAttribute];
  }
}

/*
 * Modals
 *
 * We are using bootstrap-vue modals, and some of their attributes/slots differ from ours.
 * So, we will transform from markbind modal syntax into bootstrap-vue modal syntax.
 */

function _parseModalAttributes(node) {
  _parseAttributeWithoutOverride(node, 'header', true, '_header');
  // TODO deprecate title attribute for modals
  _parseAttributeWithoutOverride(node, 'title', true, '_header');
  _parseAttributeWithoutOverride(el, 'title', true, 'modal-title');

  // TODO deprecate modal-header, modal-footer attributes for modals
  _renameSlot(node, 'modal-header', 'header');
  _renameSlot(node, 'modal-footer', 'footer');
  _renameSlot(el, 'header', 'modal-header');
  _renameSlot(el, 'footer', 'modal-footer');

  el.name = 'b-modal';

  _renameAttribute(el, 'ok-text', 'ok-title');
  _renameAttribute(el, 'center', 'centered');

  el.attribs['ok-only'] = ''; // only show OK button

  if (el.attribs.backdrop === 'false') {
    el.attribs['no-close-on-backdrop'] = '';
  }
  delete el.attribs.backdrop;

  let size = '';
  if (_.has(el.attribs, 'large')) {
    size = 'lg';
    delete el.attribs.large;
  } else if (_.has(el.attribs, 'small')) {
    size = 'sm';
    delete el.attribs.small;
  }
  el.attribs.size = size;

  // default for markbind is zoom, default for bootstrap-vue is fade
  const effect = el.attribs.effect === 'fade' ? '' : 'mb-zoom';
  el.attribs['modal-class'] = effect;

  if (_.has(el.attribs, 'id')) {
    el.attribs.ref = el.attribs.id;
  }
}

/*
 * Tabs
 */

function _parseTabAttributes(node) {
  _parseAttributeWithoutOverride(node, 'header', true, '_header');
}

/*
 * Tip boxes
 */

function _parseBoxAttributes(node) {
  _parseAttributeWithoutOverride(node, 'icon', true, '_icon');
  _parseAttributeWithoutOverride(node, 'header', false, '_header');

  // TODO deprecate heading attribute for box
  _parseAttributeWithoutOverride(node, 'heading', false, '_header');

  // TODO warn when light and seamless attributes are both present
}

/*
 * Dropdowns
 */

function _parseDropdownAttributes(node) {
  const slotChildren = node.children && node.children.filter(child => _.has(child.attribs, 'slot'));
  const hasHeaderSlot = slotChildren && slotChildren.some(child => child.attribs.slot === 'header');

  // If header slot is present, the header attribute has no effect, and we can simply remove it.
  if (hasHeaderSlot) {
    delete node.attribs.header;
    // TODO deprecate text attribute of dropdown
    delete node.attribs.text;
    return;
  }

  // header attribute takes priority over text attribute
  if (_.has(node.attribs, 'header')) {
    _parseAttributeWithoutOverride(node, 'header', true, '_header');
    delete node.attribs.text;
  } else {
    // TODO deprecate text attribute of dropdown
    _parseAttributeWithoutOverride(node, 'text', true, '_header');
  }
}

/*
 * API
 */

function parseComponents(node, errorHandler) {
  try {
    switch (node.name) {
    case 'panel':
      _parsePanelAttributes(node);
      break;
    case 'trigger':
      _parseTrigger(node);
      break;
    case 'popover':
      _parsePopover(node);
      break;
    case 'tooltip':
      _parseTooltip(node);
      break;
    case 'modal':
      _parseModalAttributes(node);
      break;
    case 'tab':
    case 'tab-group':
      _parseTabAttributes(node);
      break;
    case 'box':
      _parseBoxAttributes(node);
      break;
    case 'dropdown':
      _parseDropdownAttributes(node);
      break;
    default:
      break;
    }
  } catch (error) {
    if (!errorHandler) {
      // eslint-disable-next-line no-console
      console.error(error);
      return;
    }
    errorHandler(error);
  }
}

function postParseComponents(node, errorHandler) {
  try {
    switch (node.name) {
    case 'panel':
      _assignPanelId(node);
      break;
    default:
      break;
    }
  } catch (error) {
    if (!errorHandler) {
      // eslint-disable-next-line no-console
      console.error(error);
      return;
    }
    errorHandler(error);
  }
}


module.exports = {
  parseComponents,
  postParseComponents,
};
