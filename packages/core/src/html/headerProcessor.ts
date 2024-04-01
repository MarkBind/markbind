import cheerio from 'cheerio';
import slugify from '@sindresorhus/slugify';
import has from 'lodash/has';
import { getVslotShorthandName } from './vueSlotSyntaxProcessor';
import type { NodeProcessorConfig } from './NodeProcessor';
import { MbNode, NodeOrText } from '../utils/node';

const _ = {
  has,
};

/**
 * Increment the counter for same heading text, and set the id of the heading node
 *
 * If the addHeaderCount is false, the counter for the same heading text will not be incremented.
 * The heading id will also not have the count appended to it.
 *
 * So for, only SiteLinkManager uses this function with addHeaderCount set to false.
 * This is for validating intralinks in a side-effect free manner.
 *
 * Heading text refers to textContent of h1-h6 Nodes.
 */
export function setHeadingId(node: MbNode,
                             config: NodeProcessorConfig,
                             addHeaderCount: boolean = true) {
  const textContent = cheerio(node).text();
  // remove the '&lt;' and '&gt;' symbols that markdown-it uses to escape '<' and '>'
  const cleanedContent = textContent.replace(/&lt;|&gt;/g, '');
  const slugifiedHeading = slugify(cleanedContent, { decamelize: false });

  let headerId = slugifiedHeading;
  if (!addHeaderCount) {
    node.attribs.id = headerId;
    return;
  }
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
 * @returns  The header element, or undefined if none is found.
 */
function _findHeaderElement(node: MbNode): undefined | NodeOrText {
  const elements = node.children;
  if (!elements || !elements.length) {
    return undefined;
  }

  const elementQueue = elements.slice(0);
  while (elementQueue.length) {
    const nextEl = elementQueue.shift();

    if (nextEl?.name && (/^h[1-6]$/).test(nextEl.name)) {
      return nextEl;
    }

    if (nextEl?.children) {
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
export function assignPanelId(node: MbNode) {
  const slotChildren = node.children
    ? node.children.filter(child => getVslotShorthandName(child) !== '')
    : [];

  const headerSlot = slotChildren.find(child => getVslotShorthandName(child) === 'header');

  if (headerSlot) {
    const header = _findHeaderElement(headerSlot as MbNode);
    if (!header) {
      return;
    }

    if (!header.attribs || !_.has(header.attribs, 'id')) {
      throw new Error('Found a panel heading without an assigned id.\n'
          + 'Please report this to the MarkBind developers. Thank you!');
    }

    node.attribs.panelId = header.attribs.id;
  }
}
