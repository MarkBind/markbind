const cheerio = require('cheerio');
const slugify = require('@sindresorhus/slugify');

const { getVslotShorthandName } = require('./vueSlotSyntaxProcessor');

const _ = {};
_.has = require('lodash/has');

/*
 * h1 - h6
 */
function setHeadingId(node, config) {
  const textContent = cheerio(node).text();
  // remove the '&lt;' and '&gt;' symbols that markdown-it uses to escape '<' and '>'
  const cleanedContent = textContent.replace(/&lt;|&gt;/g, '');
  const slugifiedHeading = slugify(cleanedContent, { decamelize: false });

  let headerId = slugifiedHeading;
  const { headerIdMap } = config;
  if (headerIdMap[slugifiedHeading]) {
    headerId = `${slugifiedHeading}-${headerIdMap[slugifiedHeading]}`;
    headerIdMap[slugifiedHeading] += 1;
  } else {
    headerIdMap[slugifiedHeading] = 2;
  }

  node.attribs.id = headerId;
}

/**
 * Traverses the dom breadth-first from the specified element to find a html heading child.
 * @param node Root element to search from
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
function assignPanelId(node) {
  const slotChildren = node.children
      && node.children.filter(child => getVslotShorthandName(child) !== '');

  const headerSlot = slotChildren.find(child => getVslotShorthandName(child) === 'header');

  if (headerSlot) {
    const header = _findHeaderElement(headerSlot);
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

module.exports = {
  setHeadingId,
  assignPanelId,
};
