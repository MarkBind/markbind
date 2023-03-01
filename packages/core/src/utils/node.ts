import cheerio from 'cheerio';
import { DomElement } from 'htmlparser2';

export type TextElement = DomElement;

export type Node = DomElement & cheerio.Element & {
  name: string,
  attribs: { [key: string]: any },
  children: NodeOrText[],
};

export type NodeOrText = TextElement | Node;

export function parseHTML(html: string) {
  const node = cheerio.parseHTML(html)[0];
  return node as unknown as NodeOrText;
}
