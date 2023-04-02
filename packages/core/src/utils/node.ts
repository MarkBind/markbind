import cheerio from 'cheerio';
import { DomElement } from 'htmlparser2';

/*
 * A TextElement is a simple node that does not need complex processing.
 */
export type TextElement = DomElement;

/*
 * MbNode (MarkBindNode) is an element that can be operated on by cheerio and our own node processing
 * methods. It must have a name (used to identify what kind of node it is), attributes (possibly empty),
 * and children nodes (possibly empty). This type allows us to assert that these attributes exist.
 */
export type MbNode = DomElement & cheerio.Element & {
  name: string,
  attribs: Record<string, any>,
  children: NodeOrText[],
};

/*
 * NodeOrText is used before a node can be casted to either TextElement or MbNode.
 */
export type NodeOrText = TextElement | MbNode;

/**
 * Utility function for converting HTML string to a node or text element.
 */
export function parseHTML(html: string) {
  const node = cheerio.parseHTML(html);
  return node as unknown as NodeOrText[];
}
