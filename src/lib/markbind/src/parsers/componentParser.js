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
 * @param element Element to parse
 * @param attribute Attribute name to parse
 * @param isInline Whether to parse the attribute with only inline markdown-it rules
 * @param slotName Name attribute of the <slot> element to insert, which defaults to the attribute name
 */
function _parseAttributeWithoutOverride(element, attribute, isInline, slotName = attribute) {
  const el = element;

  const hasAttributeSlot = el.children
    && el.children.some(child => _.has(child.attribs, 'slot') && child.attribs.slot === slotName);

  if (!hasAttributeSlot && _.has(el.attribs, attribute)) {
    let rendered;
    if (isInline) {
      rendered = vueAttrRenderer.renderInline(el.attribs[attribute]);
    } else {
      rendered = vueAttrRenderer.render(el.attribs[attribute]);
    }

    const attributeSlotElement = cheerio.parseHTML(
      `<template slot="${slotName}">${rendered}</template>`, true);
    el.children = el.children ? attributeSlotElement.concat(el.children) : attributeSlotElement;
  }

  delete el.attribs[attribute];
}

/**
 * Takes an element, looks for direct elements with slots and transforms to avoid Vue parsing.
 * @param element Element to transform
 */
function _transformSlottedComponents(element) {
  element.children.forEach((c) => {
    const child = c;
    const slot = child.attribs && child.attribs.slot;
    if (slot) {
      // Turns <div slot="content">... into <div data-mb-html-for=content>...
      child.attribs['data-mb-html-for'] = slot;
      delete child.attribs.slot;
    }
    // similarly, need to transform templates to avoid Vue parsing
    if (child.name === 'template') {
      child.name = 'span';
    }
  });
}

/*
 * Panels
 */

function _parsePanelAttributes(element) {
  const el = element;

  _parseAttributeWithoutOverride(element, 'alt', false, '_alt');

  const slotChildren = el.children && el.children.filter(child => _.has(child.attribs, 'slot'));
  const hasAltSlot = slotChildren && slotChildren.some(child => child.attribs.slot === '_alt');
  const hasHeaderSlot = slotChildren && slotChildren.some(child => child.attribs.slot === 'header');

  // If both are present, the header attribute has no effect, and we can simply remove it.
  if (hasAltSlot && hasHeaderSlot) {
    delete el.attribs.header;
    return;
  }

  _parseAttributeWithoutOverride(element, 'header', false, '_header');
}

/**
 * Traverses the dom breadth-first from the specified element to find a html heading child.
 * @param element Root element to search from
 * @returns {undefined|*} The header element, or undefined if none is found.
 */
function _findHeaderElement(element) {
  const elements = element.children;
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
 * @param element The root panel element
 */
function _assignPanelId(element) {
  const el = element;

  const slotChildren = el.children && el.children.filter(child => _.has(child.attribs, 'slot'));
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

    el.attribs.id = header.attribs.id;
  }
}

/*
 * Triggers
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
 */

function _parsePopover(element) {
  const el = element;
  _parseAttributeWithoutOverride(el, 'content', true);
  _parseAttributeWithoutOverride(el, 'header', true);
  // TODO deprecate title attribute for popovers
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

/*
 * Modals
 */

function _renameSlot(element, originalName, newName) {
  if (element.children) {
    element.children.forEach((c) => {
      const child = c;

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

function _parseModalAttributes(element) {
  const el = element;
  _parseAttributeWithoutOverride(el, 'header', true, 'modal-title');
  // TODO deprecate title attribute for modals
  _parseAttributeWithoutOverride(el, 'title', true, 'modal-title');

  // TODO deprecate modal-header, modal-footer attributes for modals
  _renameSlot(el, 'header', 'modal-header');
  _renameSlot(el, 'footer', 'modal-footer');

  el.name = 'b-modal';

  _renameAttribute(el, 'ok-text', 'ok-title');
  _renameAttribute(el, 'center', 'centered');

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

  const effect = el.attribs.effect === 'fade' ? '' : 'mb-zoom';
  el.attribs['modal-class'] = effect;

  if (_.has(el.attribs, 'id')) {
    el.attribs.ref = el.attribs.id;
  }
}

/*
 * Tabs
 */

function _parseTabAttributes(element) {
  _parseAttributeWithoutOverride(element, 'header', true, '_header');
}

/*
 * Tip boxes
 */

function _parseBoxAttributes(element) {
  _parseAttributeWithoutOverride(element, 'icon', true, '_icon');
  _parseAttributeWithoutOverride(element, 'header', false, '_header');

  // TODO deprecate heading attribute for box
  _parseAttributeWithoutOverride(element, 'heading', false, '_header');

  // TODO warn when light and seamless attributes are both present
}

/*
 * Dropdowns
 */

function _parseDropdownAttributes(element) {
  const el = element;
  const slotChildren = el.children && el.children.filter(child => _.has(child.attribs, 'slot'));
  const hasHeaderSlot = slotChildren && slotChildren.some(child => child.attribs.slot === 'header');

  // If header slot is present, the header attribute has no effect, and we can simply remove it.
  if (hasHeaderSlot) {
    delete el.attribs.header;
    // TODO deprecate text attribute of dropdown
    delete el.attribs.text;
    return;
  }

  // header attribute takes priority over text attribute
  if (_.has(element.attribs, 'header')) {
    _parseAttributeWithoutOverride(element, 'header', true, '_header');
    delete el.attribs.text;
  } else {
    // TODO deprecate text attribute of dropdown
    _parseAttributeWithoutOverride(element, 'text', true, '_header');
  }
}

/*
 * API
 */

function parseComponents(element, errorHandler) {
  try {
    switch (element.name) {
    case 'panel':
      _parsePanelAttributes(element);
      break;
    case 'trigger':
      _parseTrigger(element);
      break;
    case 'popover':
      _parsePopover(element);
      break;
    case 'tooltip':
      _parseTooltip(element);
      break;
    case 'modal':
      _parseModalAttributes(element);
      break;
    case 'tab':
    case 'tab-group':
      _parseTabAttributes(element);
      break;
    case 'box':
      _parseBoxAttributes(element);
      break;
    case 'dropdown':
      _parseDropdownAttributes(element);
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

function postParseComponents(element, errorHandler) {
  try {
    switch (element.name) {
    case 'panel':
      _assignPanelId(element);
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
