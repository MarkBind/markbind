var cheerio = require('cheerio');
require('../patches/htmlparser2');
var md = require('../lib/markdown-it');
var _a = require('../Page/constants'), SITE_NAV_EMPTY_LINE_REGEX = _a.SITE_NAV_EMPTY_LINE_REGEX, SITE_NAV_LIST_CLASS = _a.SITE_NAV_LIST_CLASS, SITE_NAV_LIST_CLASS_ROOT = _a.SITE_NAV_LIST_CLASS_ROOT, SITE_NAV_LIST_ITEM_CLASS = _a.SITE_NAV_LIST_ITEM_CLASS, SITE_NAV_DEFAULT_LIST_ITEM_CLASS = _a.SITE_NAV_DEFAULT_LIST_ITEM_CLASS, SITE_NAV_CUSTOM_LIST_ITEM_CLASS = _a.SITE_NAV_CUSTOM_LIST_ITEM_CLASS, SITE_NAV_DROPDOWN_EXPAND_KEYWORD_REGEX = _a.SITE_NAV_DROPDOWN_EXPAND_KEYWORD_REGEX, SITE_NAV_DROPDOWN_ICON_ROTATED_HTML = _a.SITE_NAV_DROPDOWN_ICON_ROTATED_HTML, SITE_NAV_DROPDOWN_ICON_HTML = _a.SITE_NAV_DROPDOWN_ICON_HTML;
function renderSiteNav(node) {
    var $original = cheerio(node);
    var siteNavText = $original.text().trim();
    if (siteNavText === '') {
        return;
    }
    // collapse into tight list
    var siteNavHtml = md.render(siteNavText.replace(SITE_NAV_EMPTY_LINE_REGEX, '\n'));
    var $ = cheerio.load("<site-nav>" + siteNavHtml + "</site-nav>");
    $('ul').each(function (i1, ulElem) {
        var nestingLevel = $(ulElem).parents('ul').length;
        $(ulElem).addClass(SITE_NAV_LIST_CLASS);
        if (nestingLevel === 0) {
            $(ulElem).addClass(SITE_NAV_LIST_CLASS_ROOT);
        }
        var listItemLevelClass = SITE_NAV_LIST_ITEM_CLASS + "-" + nestingLevel;
        var defaultListItemClass = SITE_NAV_DEFAULT_LIST_ITEM_CLASS + " " + listItemLevelClass;
        var customListItemClasses = SITE_NAV_CUSTOM_LIST_ITEM_CLASS + " " + listItemLevelClass;
        $(ulElem).children('li').each(function (i2, liElem) {
            var nestedLists = $(liElem).children('ul');
            var nestedAnchors = $(liElem).children('a');
            if (nestedLists.length === 0 && nestedAnchors.length === 0) {
                $(liElem).addClass(customListItemClasses);
                return;
            }
            var listItemContent = $(liElem).contents().not('ul');
            var listItemContentHtml = $.html(listItemContent);
            listItemContent.remove();
            $(liElem).prepend("<div class=\"" + defaultListItemClass + "\" onclick=\"handleSiteNavClick(this)\">"
                + (listItemContentHtml + "</div>"));
            if (nestedLists.length === 0) {
                return;
            }
            // Found nested list, render dropdown menu
            var listItemParent = $(liElem).children().first();
            var hasExpandedKeyword = SITE_NAV_DROPDOWN_EXPAND_KEYWORD_REGEX.test(listItemContentHtml);
            if (hasExpandedKeyword) {
                nestedLists.addClass('site-nav-dropdown-container site-nav-dropdown-container-open');
                listItemParent.html(listItemContentHtml.replace(SITE_NAV_DROPDOWN_EXPAND_KEYWORD_REGEX, ''));
                listItemParent.append(SITE_NAV_DROPDOWN_ICON_ROTATED_HTML);
            }
            else {
                nestedLists.addClass('site-nav-dropdown-container');
                listItemParent.append(SITE_NAV_DROPDOWN_ICON_HTML);
            }
        });
    });
    $original.empty();
    $original.append($('site-nav').children());
}
module.exports = {
    renderSiteNav: renderSiteNav,
};
