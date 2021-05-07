const cheerio = require('cheerio');

/**
 * Removes every script node (written by the user) encountered in the main app,
 * and records all these script nodes in an array so that they can be hoisted
 * to after <body> tag at a later stage.
 *
 * @param {Object<any, any>} node from the dom traversal
 */
function processScriptTag(node, userScripts) {
  const idx = node.parent.children.indexOf(node);
  if (idx !== -1) {
    node.parent.children.splice(idx, 1);
  }
  node.parent = null;
  userScripts.push(cheerio.html(node));
}

/**
 * Changes <style> tag into placeholder tag:
 * <script src defer type="application/javascript" style-bypass-vue-compilation>.
 *
 * This is necessary because we are pre-compiling each page as a Vue application,
 * where the Vue compilation ignores and discards the <style> tag.
 *
 * We work around this problem by piggybacking on the approach we used for <script> tags to be ignored
 * and not discarded; by changing <style> tags to the placeholder tag as shown above.
 * We will change it back to <style> tag after Vue compilation and after the element is created by Vue.
 *
 * @param {Object<any, any>} node from the dom traversal
 */
function processStyleTag(node) {
  node.name = 'script';
  /*
    This node is not intended to be ran as a script. Thus, we have to defer the execution of the script
    until the node is restored as a style node (which is handled by MarkBind's script).
    The defer attribute requires the src attribute to work. Thus, the src attribute is used as a dummy.
  */
  node.attribs.src = '';
  node.attribs.defer = '';
  node.attribs.type = 'application/javascript'; // to bypass Vue compilation as a script tag
  node.attribs['style-bypass-vue-compilation'] = ''; // to allow specific query selection of this element
}

module.exports = {
  processScriptTag,
  processStyleTag,
};
