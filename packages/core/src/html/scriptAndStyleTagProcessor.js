const cheerio = require('cheerio');

/**
 * Removes every script and style node (written by the user) encountered in the main app,
 * and records all these script nodes in an array so that they can be hoisted to after
 * <body> tag at a later stage.
 *
 * This is to prevent Vue compilation of script/style tags (as they are not meant to be compiled).
 *
 * @param node {Object<any, any>} node from the dom traversal
 * @param userScriptsAndStyles {array} to store scripts and style tags for hoisting
 */
function processScriptAndStyleTag(node, userScriptsAndStyles) {
  // Do not process script/style tags that are meant to be inserted in head/bottom of HTML
  const isHeadOrBottom = node.parent.name === 'head-top'
    || node.parent.name === 'head-bottom' || node.parent.name === 'script-bottom';
  // Do not process script/style tags that are from External
  const isExternal = userScriptsAndStyles === undefined;
  if (isHeadOrBottom || isExternal) {
    return;
  }

  const idx = node.parent.children.indexOf(node);
  if (idx !== -1) {
    node.parent.children.splice(idx, 1);
  }
  node.parent = null;
  userScriptsAndStyles.push(cheerio.html(node));
}

module.exports = {
  processScriptAndStyleTag,
};
