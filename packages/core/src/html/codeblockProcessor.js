const cheerio = require('cheerio');
const lodashHas = require('lodash/has');
const md = require('../lib/markdown-it');
const utils = require('../lib/markdown-it/utils');

/**
 * Traverses a line part and applies highlighting if necessary.
 * @param node The node of the line part to be traversed
 * @param hlStart The highlight start position, relative to the start of the line part
 * @param hlEnd The highlight end position, relative to the start of the line part
 * @returns {[number, boolean | [number, number]]} An array of two items.
 */
function traverseLinePart(node, hlStart, hlEnd) {
  // Return value is an array of two items:
  // 1. The number of characters traversed
  // 2. Highlighting data to be used by the node's parent. It can be:
  //    - true (ask to apply highlighting from parent)
  //    - false (do not process this node further)
  //    - array of two numbers (only for text nodes, inform parent to
  //      highlight the text at specified range)

  if (hlEnd <= 0) {
    // Highlight end has passed, no need to traverse further
    return [0, false];
  }

  if (node.type === 'text') {
    // Node is a text node. It is not an inherent HTML element of its own,
    // so to actually highlight this text, we have to ask to apply at its parent.

    const cleanedText = utils.unescapeHtml(node.data);
    const textLength = cleanedText.length;

    if (hlStart >= textLength) {
      // Highlight start is not in this text
      return [textLength, false];
    }

    if (hlStart <= 0 && hlEnd >= textLength) {
      // Highlight spans across the entirety of text
      return [textLength, true];
    }

    // Partial text highlighting
    return [textLength, [hlStart, hlEnd]];
  }

  // The remaining possibility is that node is a tag node.
  // It has at least one child (to contain the text content).
  // It may have more children, such as inner tag nodes.
  let curr = 0;
  const highlightData = node.children.map((child) => {
    const [traversed, data] = traverseLinePart(child, hlStart - curr, hlEnd - curr);
    curr += traversed;

    return data;
  });

  if (highlightData.every(v => v === true)) {
    // Every child wants highlight to be applied at node level
    // For conciseness, ask for the node's parent to highlight, if possible
    return [curr, true];
  }

  // If node level highlighting is not possible, highlight the individual children as needed
  // For tag nodes, it is easy, just add the highlight class
  // For text nodes, it is trickier, as we have to wrap the text inside a <span> first
  // Essentially, we have to change the text node to become a tag node

  node.children.forEach((child, idx) => {
    if (!highlightData[idx]) {
      return;
    }

    if (child.type === 'tag') {
      child.attribs.class = child.attribs.class ? `${child.attribs.class} highlighted` : 'highlighted';
      return;
    }

    const text = child.data;
    let newElement;

    if (highlightData[idx] === true) {
      [newElement] = cheerio.parseHTML(`<span class="highlighted">${text}</span>`);
    } else {
      const [start, end] = highlightData[idx];
      const cleaned = utils.unescapeHtml(text);
      const split = [cleaned.substring(0, start), cleaned.substring(start, end), cleaned.substring(end)];
      const [pre, highlighted, post] = split.map(md.utils.escapeHtml);
      [newElement] = cheerio.parseHTML(
        `<span>${pre}<span class="highlighted">${highlighted}</span>${post}</span>`,
      );
    }

    delete newElement.root;
    node.children[idx] = newElement;
  });

  // Set the references accordingly
  node.children.forEach((child, idx) => {
    child.parent = node;
    child.prev = idx > 0 ? node.children[idx - 1] : null;
    child.next = idx < node.children.length - 1 ? node.children[idx + 1] : null;
  });

  return [curr, false];
}

/**
 * Applies pending highlighting to the code block.
 * This looks into each line for highlighting data, and if found,
 * traverses over the line and applies the highlight.
 * @param node Root of the code block element, which is the 'pre' node
 * @return
 */
function highlightCodeBlock(node) {
  const codeNode = node.children.find(c => c.name === 'code');
  if (!codeNode) {
    return;
  }

  codeNode.children.forEach((line) => {
    if (!lodashHas(line.attribs, 'hl-data')) {
      return;
    }

    const data = line.attribs['hl-data'].split(',').map(boundStr => boundStr.split('-'));
    const bounds = [];
    data.forEach((boundStr) => {
      const [start, end] = boundStr.map(str => parseInt(str, 10));
      if (!Number.isNaN(start) && !Number.isNaN(end)) {
        bounds.push([start, end]);
      }
    });
    bounds.forEach(([start, end]) => traverseLinePart(line, start, end));

    delete line.attribs['hl-data'];
  });
}

module.exports = {
  highlightCodeBlock,
};
