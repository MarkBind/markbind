/**
 * Adds attribute "type=application/javascript" to <script> tag.
 *
 * This is necessary because we are pre-compiling each page as a Vue application,
 * where the Vue compilation ignores and discards the <script> tag.
 *
 * By having this attribute, the compilation will ignore the <script> tag but not discard it.
 *
 * @param {Object<any, any>} node from the dom traversal
 */
function processScriptTag(node) {
  node.attribs.type = 'application/javascript';
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
  /*
    In case the user enables htmlBeautify, we want to prevent the content here to be beautified,
    since the content is not actually javascript. So we add the ignore direction of jsBeautify.
   */
  if (node.children[0].data) {
    node.children[0].data = `/* beautify ignore:start */${node.children[0].data}/* beautify ignore:end */`;
  }
}

module.exports = {
  processScriptTag,
  processStyleTag,
};
