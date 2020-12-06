const cheerio = require('cheerio'); require('../patches/htmlparser2');

const TEMP_NAVBAR_CLASS = 'temp-navbar';
const TEMP_DROPDOWN_CLASS = 'temp-dropdown';
const TEMP_DROPDOWN_PLACEHOLDER_CLASS = 'temp-dropdown-placeholder';

/**
 * Insert temporary styles to some elements to combat FOUC
 */
function insertTemporaryStyles(node) {
  if (node.name === 'navbar') {
    node.attribs.class = `${node.attribs.class || ''} ${TEMP_NAVBAR_CLASS}`;
  } else if (node.name === 'dropdown') {
    const attributes = node.attribs;
    // TODO remove attributes.text once text attribute is fully deprecated
    const placeholder = `<div>${attributes.header || attributes.text || ''}</div>`;
    const $dropdown = cheerio(node);
    $dropdown.before(placeholder);
    $dropdown.prev().addClass(attributes.class).addClass(TEMP_DROPDOWN_PLACEHOLDER_CLASS);
    $dropdown.addClass(TEMP_DROPDOWN_CLASS);
  }
}

module.exports = {
  insertTemporaryStyles,
};
