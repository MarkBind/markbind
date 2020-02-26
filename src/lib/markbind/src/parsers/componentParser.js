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
 * @param node Element to transform
 */
function _transformSlottedComponents(node) {
  node.children.forEach((child) => {
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

/**
 * Check and warns if element has conflicting attributes.
 * Note that attirbutes in `attrsConflictingWith` are not in conflict with each other,
 * but only towards `attribute`
 * @param node Root element to check
 * @param attribute An attribute that is conflicting with other attributes
 * @param attrsConflictingWith The attributes conflicting with `attribute`
 */
function _warnConflictingAttributes(node, attribute, attrsConflictingWith) {
  if (!(attribute in node.attribs)) {
    return;
  }
  attrsConflictingWith.forEach((conflictingAttr) => {
    if (conflictingAttr in node.attribs) {
      // TODO: Use logger here instead of console.warn. See issue #1060
      // eslint-disable-next-line no-console
      console.warn(`warn: Usage of conflicting ${node.name} attributes: `
        + `'${attribute}' with '${conflictingAttr}'`);
    }
  });
}

/**
 * Check and warns if element has a deprecated attribute.
 * @param node Root element to check
 * @param attributeNamePairs Object of attribute name pairs with each pair in the form deprecated : correct
 */
function _warnDeprecatedAttributes(node, attributeNamePairs) {
  Object.entries(attributeNamePairs).forEach(([deprecatedAttrib, correctAttrib]) => {
    if (deprecatedAttrib in node.attribs) {
      // TODO: Use logger here instead of console.warn. See issue #1060
      // eslint-disable-next-line no-console
      console.warn(`warn: ${node.name} attribute '${deprecatedAttrib}' `
        + `is deprecated and may be removed in the future. Please use '${correctAttrib}'`);
    }
  });
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

function _parseTrigger(node) {
  node.name = 'span';
  const trigger = node.attribs.trigger || 'hover';
  const placement = node.attribs.placement || 'top';
  node.attribs[`v-b-popover.${trigger}.${placement}.html`]
    = 'popoverGenerator';
  node.attribs[`v-b-tooltip.${trigger}.${placement}.html`]
    = 'tooltipContentGetter';
  const convertedTrigger = trigger === 'hover' ? 'mouseover' : trigger;
  node.attribs[`v-on:${convertedTrigger}`] = `$refs['${node.attribs.for}'].show()`;
  node.attribs.class = node.attribs.class ? `${node.attribs.class} trigger` : 'trigger';
}

/*
 * Popovers
 *
 * We hide the content and header via _transformSlottedComponents, for retrieval by triggers.
 *
 * Then, we add in a trigger for this popover.
 */

function _parsePopover(node) {
  _warnDeprecatedAttributes(node, { title: 'header' });

  _parseAttributeWithoutOverride(node, 'content', true);
  _parseAttributeWithoutOverride(node, 'header', true);
  _parseAttributeWithoutOverride(node, 'title', true, 'header');

  node.name = 'span';
  const trigger = node.attribs.trigger || 'hover';
  const placement = node.attribs.placement || 'top';
  node.attribs['data-mb-component-type'] = 'popover';
  node.attribs[`v-b-popover.${trigger}.${placement}.html`]
    = 'popoverInnerGenerator';
  node.attribs.class = node.attribs.class ? `${node.attribs.class} trigger` : 'trigger';
  _transformSlottedComponents(node);
}

/**
 * Check and warns if element has a deprecated slot name
 * @param element Root element to check
 * @param namePairs Object of slot name pairs with each pair in the form deprecated : correct
 */

function _warnDeprecatedSlotNames(element, namePairs) {
  if (!(element.children)) {
    return;
  }
  element.children.forEach((child) => {
    if (!(_.has(child.attribs, 'slot'))) {
      return;
    }
    Object.entries(namePairs).forEach(([deprecatedName, correctName]) => {
      if (child.attribs.slot !== deprecatedName) {
        return;
      }
      // TODO: Use logger here instead of console.warn. See issue #1060
      // eslint-disable-next-line no-console
      console.warn(`warn: ${element.name} slot name '${deprecatedName}' `
        + `is deprecated and may be removed in the future. Please use '${correctName}'`);
    });
  });
}

/*
 * Tooltips
 *
 * Similar to popovers.
 */

function _parseTooltip(node) {
  _parseAttributeWithoutOverride(node, 'content', true, '_content');

  node.name = 'span';
  const trigger = node.attribs.trigger || 'hover';
  const placement = node.attribs.placement || 'top';
  node.attribs['data-mb-component-type'] = 'tooltip';
  node.attribs[`v-b-tooltip.${trigger}.${placement}.html`]
    = 'tooltipInnerContentGetter';
  node.attribs.class = node.attribs.class ? `${node.attribs.class} trigger` : 'trigger';
  _transformSlottedComponents(node);
}

function _renameSlot(node, originalName, newName) {
  if (node.children) {
    node.children.forEach((c) => {
      const child = c;
      if (_.has(child.attribs, 'slot') && child.attribs.slot === originalName) {
        child.attribs.slot = newName;
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
 * Modals
 *
 * We are using bootstrap-vue modals, and some of their attributes/slots differ from ours.
 * So, we will transform from markbind modal syntax into bootstrap-vue modal syntax.
 */

function _parseModalAttributes(node) {
  _warnDeprecatedAttributes(node, { title: 'header' });
  _warnDeprecatedSlotNames(node, { 'modal-header': 'header', 'modal-footer': 'footer' });
  
  _parseAttributeWithoutOverride(node, 'header', true, 'modal-title');
  _parseAttributeWithoutOverride(node, 'title', true, 'modal-title');

  _renameSlot(node, 'header', 'modal-header');
  _renameSlot(node, 'footer', 'modal-footer');

  node.name = 'b-modal';

  _renameAttribute(node, 'ok-text', 'ok-title');
  _renameAttribute(node, 'center', 'centered');

  node.attribs['ok-only'] = ''; // only show OK button

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

function _parseTabAttributes(node) {
  _parseAttributeWithoutOverride(node, 'header', true, '_header');
}

/*
 * Tip boxes
 */

function _parseBoxAttributes(node) {
  _warnConflictingAttributes(node, 'light', ['seamless']);
  _warnConflictingAttributes(node, 'no-background', ['background-color', 'seamless']);
  _warnConflictingAttributes(node, 'no-border', ['border-color', 'border-left-color', 'seamless']);
  _warnConflictingAttributes(node, 'no-icon', ['icon']);
  _warnDeprecatedAttributes(node, { heading: 'header' });

  _parseAttributeWithoutOverride(node, 'icon', true, '_icon');
  _parseAttributeWithoutOverride(node, 'header', false, '_header');

  _parseAttributeWithoutOverride(node, 'heading', false, '_header');
}

/*
 * Dropdowns
 */

function _parseDropdownAttributes(node) {
  const slotChildren = node.children && node.children.filter(child => _.has(child.attribs, 'slot'));
  const hasHeaderSlot = slotChildren && slotChildren.some(child => child.attribs.slot === 'header');

  // If header slot is present, the header attribute has no effect, and we can simply remove it.
  if (hasHeaderSlot) {
    if (_.has(node.attribs, 'header')) {
      // TODO: Use logger here instead of console.warn. See issue #1060
      // eslint-disable-next-line no-console
      console.warn(`warn: ${node.name} has a header slot, 'header' attribute has no effect.`);
    }
    if (_.has(node.attribs, 'text')) {
      // TODO: Use logger here instead of console.warn. See issue #1060
      // eslint-disable-next-line no-console
      console.warn(`warn: ${node.name} has a header slot, 'text' attribute has no effect.`);
    }
    delete node.attribs.header;
    delete node.attribs.text;
    return;
  }

  _warnDeprecatedAttributes(node, { text: 'header' });
  _warnConflictingAttributes(node, 'header', ['text']);
  // header attribute takes priority over text attribute if both 'text' and 'header' is used
  if (_.has(node.attribs, 'header')) {
    _parseAttributeWithoutOverride(node, 'header', true, '_header');
    delete node.attribs.text;
  } else {
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
