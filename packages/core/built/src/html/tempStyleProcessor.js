var cheerio = require('cheerio');
require('../patches/htmlparser2');
var TEMP_NAVBAR_CLASS = 'temp-navbar';
var TEMP_DROPDOWN_CLASS = 'temp-dropdown';
var TEMP_DROPDOWN_PLACEHOLDER_CLASS = 'temp-dropdown-placeholder';
/**
 * Insert temporary styles to some elements to combat FOUC
 */
function insertTemporaryStyles(node) {
    if (node.name === 'navbar') {
        node.attribs.class = (node.attribs.class || '') + " " + TEMP_NAVBAR_CLASS;
    }
    else if (node.name === 'dropdown') {
        var attributes = node.attribs;
        // TODO remove attributes.text once text attribute is fully deprecated
        var placeholder = "<div>" + (attributes.header || attributes.text || '') + "</div>";
        var $dropdown = cheerio(node);
        $dropdown.before(placeholder);
        $dropdown.prev().addClass(attributes.class).addClass(TEMP_DROPDOWN_PLACEHOLDER_CLASS);
        $dropdown.addClass(TEMP_DROPDOWN_CLASS);
    }
}
module.exports = {
    insertTemporaryStyles: insertTemporaryStyles,
};
