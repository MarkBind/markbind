import cheerio from 'cheerio';
import { DomElement } from 'htmlparser2';

/**
 * Removes every script and style node (written by the user) encountered in the main app,
 * and records all these script nodes in an array so that they can be hoisted to after
 * <body> tag at a later stage.
 *
 * This is to prevent Vue compilation of script/style tags (as they are not meant to be compiled).
 *
 * @param node from the dom traversal
 * @param userScriptsAndStyles to store scripts and style tags for hoisting
 */
export function processScriptAndStyleTag(node: DomElement, userScriptsAndStyles: string[] | undefined) {
  // Do not process script/style tags that are meant to be inserted in head/bottom of HTML
  const isHeadOrBottom = node.parent && (node.parent.name === 'head-top'
    || node.parent.name === 'head-bottom' || node.parent.name === 'script-bottom');
  // Do not process script/style tags that are from External
  const isExternal = userScriptsAndStyles === undefined;
  if (isHeadOrBottom || isExternal) {
    return;
  }

  const nodeSiblings = node.parent?.children ?? [node];
  nodeSiblings.splice(nodeSiblings.indexOf(node), 1);
  node.parent = undefined;
  userScriptsAndStyles.push(cheerio.html(node as cheerio.Element));
}
