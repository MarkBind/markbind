const cheerio = require('cheerio');
const slugify = require('@sindresorhus/slugify');

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
function findHeaderElement(node) {
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

module.exports = {
  setHeadingId,
  findHeaderElement,
};
