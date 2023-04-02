import cheerio from 'cheerio';
import has from 'lodash/has';
import { NodeOrText, MbNode } from '../utils/node';

import md from '../lib/markdown-it';
import * as util from '../lib/markdown-it/utils';

const _ = {
  has,
};

interface TraverseLinePartData {
  numCharsTraversed: number,
  shouldParentHighlight: boolean,
  highlightRange?: number[],
}

/**
 * Traverses a line part and applies highlighting if necessary.
 * @param node The node of the line part to be traversed
 * @param hlStart The highlight start position, relative to the start of the line part
 * @param hlEnd The highlight end position, relative to the start of the line part
 * @returns  An object that contains data to be used by the node's parent.
 */
function traverseLinePart(node: NodeOrText, hlStart: number, hlEnd: number): TraverseLinePartData {
  const resData: TraverseLinePartData = {
    numCharsTraversed: 0,
    shouldParentHighlight: false,
    highlightRange: undefined,
  };

  if (hlEnd <= 0) {
    // Highlight end has passed, no need to traverse further
    return resData;
  }

  if (node.type === 'text') {
    /*
     * Node is a text node. It is not an inherent HTML element of its own,
     * so to actually highlight this text, we have to ask to apply at its parent.
     */

    const cleanedText = util.unescapeHtml(node.data);
    const textLength = cleanedText.length;
    resData.numCharsTraversed = textLength;

    if (hlStart >= textLength) {
      // Highlight start is not in this text
      resData.shouldParentHighlight = false;
      return resData;
    }

    if (hlStart <= 0 && hlEnd >= textLength) {
      // Highlight spans across the entirety of text
      resData.shouldParentHighlight = true;
      return resData;
    }

    // Partial text highlighting
    resData.shouldParentHighlight = true;
    resData.highlightRange = [hlStart, hlEnd];
    return resData;
  }

  if (!node.children) {
    return resData;
  }

  /*
   * The remaining possibility is that node is a tag node.
   * It has at least one child (to contain the text content).
   * It may have more children, such as inner tag nodes.
   */

  const highlightData = node.children.map((child) => {
    const [relativeHlStart, relativeHlEnd] = [hlStart, hlEnd].map(x => x - resData.numCharsTraversed);
    const data = traverseLinePart(child, relativeHlStart, relativeHlEnd);
    resData.numCharsTraversed += data.numCharsTraversed;
    return data;
  });

  if (highlightData.every(data => data.shouldParentHighlight && !data.highlightRange)) {
    /*
     * Every child wants highlight to be applied to the whole content at node level.
     * For conciseness, ask for the node's parent to highlight, if possible
     */
    resData.shouldParentHighlight = true;
    return resData;
  }

  /*
   * If node level highlighting is not possible, highlight the individual children as needed.
   * For text nodes, it is trickier, as we have to wrap the text inside a <span> first.
   * Essentially, we have to change the text node to become a tag node.
   */

  node.children.forEach((child, idx) => {
    const data = highlightData[idx];
    if (!data.shouldParentHighlight) {
      return;
    }

    if (child.type === 'tag') {
      child.attribs = child.attribs ?? {};
      child.attribs.class = child.attribs.class ? `${child.attribs.class} highlighted` : 'highlighted';
      return;
    }

    if (!data.highlightRange) {
      cheerio(child).wrap('<span class="highlighted"></span>');
    } else {
      const [start, end] = data.highlightRange;
      const cleaned = util.unescapeHtml(child.data);
      const split = [cleaned.substring(0, start), cleaned.substring(start, end), cleaned.substring(end)];
      const [pre, highlighted, post] = split.map(md.utils.escapeHtml);
      const newElement = cheerio(`<span>${pre}<span class="highlighted">${highlighted}</span>${post}</span>`);
      cheerio(child).replaceWith(newElement);
    }
  });

  resData.shouldParentHighlight = false;
  return resData;
}

/**
 * Applies pending highlighting to the code block.
 * This looks into each line for highlighting data, and if found,
 * traverses over the line and applies the highlight.
 * @param node Root of the code block element, which is the 'pre' node
 */
export function highlightCodeBlock(node: MbNode) {
  if (!node.children) {
    return;
  }
  const codeNode = node.children.find(c => c.name === 'code');
  if (!codeNode || (!codeNode.children)) {
    return;
  }

  codeNode.children.forEach((lineNode) => {
    if ((!lineNode.attribs) || !_.has(lineNode.attribs, 'hl-data')) {
      return;
    }

    const bounds = lineNode.attribs['hl-data'].split(',').map(boundStr => boundStr.split('-').map(Number));
    bounds.forEach(([start, end]) => traverseLinePart(lineNode, start, end));

    delete lineNode.attribs['hl-data'];
  });
}

/**
 * Adjust the class attribute of code blocks according to the global line numbers setting.
 * Append the 'line-numbers' class if the global setting is true.
 * @param node the code block element, which is the 'code' node
 * @param showCodeLineNumbers true if line numbers should be shown, false otherwise
 */
export function setCodeLineNumbers(node: MbNode, showCodeLineNumbers: boolean) {
  const existingClass = node.attribs.class || '';
  const styleClassRegex = /(^|\s)(no-)?line-numbers($|\s)/;
  const hasStyleClass = styleClassRegex.test(existingClass);
  if (hasStyleClass) {
    return;
  }

  if (showCodeLineNumbers) {
    node.attribs = node.attribs ?? {};
    node.attribs.class = `line-numbers${existingClass === '' ? '' : ` ${existingClass}`}`;
  }
}
