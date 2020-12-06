const cheerio = require('cheerio'); require('../patches/htmlparser2');
const md = require('../lib/markdown-it');

const {
  SITE_NAV_EMPTY_LINE_REGEX,
  SITE_NAV_LIST_CLASS,
  SITE_NAV_LIST_CLASS_ROOT,
  SITE_NAV_LIST_ITEM_CLASS,
  SITE_NAV_DEFAULT_LIST_ITEM_CLASS,
  SITE_NAV_CUSTOM_LIST_ITEM_CLASS,
  SITE_NAV_DROPDOWN_EXPAND_KEYWORD_REGEX,
  SITE_NAV_DROPDOWN_ICON_ROTATED_HTML,
  SITE_NAV_DROPDOWN_ICON_HTML,
} = require('../Page/constants');

function renderSiteNav(node) {
  const $original = cheerio(node);
  const siteNavText = $original.text().trim();
  if (siteNavText === '') {
    return;
  }

  // collapse into tight list
  const siteNavHtml = md.render(siteNavText.replace(SITE_NAV_EMPTY_LINE_REGEX, '\n'));
  const $ = cheerio.load(`<site-nav>${siteNavHtml}</site-nav>`);

  $('ul').each((i1, ulElem) => {
    const nestingLevel = $(ulElem).parents('ul').length;
    $(ulElem).addClass(SITE_NAV_LIST_CLASS);
    if (nestingLevel === 0) {
      $(ulElem).addClass(SITE_NAV_LIST_CLASS_ROOT);
    }
    const listItemLevelClass = `${SITE_NAV_LIST_ITEM_CLASS}-${nestingLevel}`;
    const defaultListItemClass = `${SITE_NAV_DEFAULT_LIST_ITEM_CLASS} ${listItemLevelClass}`;
    const customListItemClasses = `${SITE_NAV_CUSTOM_LIST_ITEM_CLASS} ${listItemLevelClass}`;

    $(ulElem).children('li').each((i2, liElem) => {
      const nestedLists = $(liElem).children('ul');
      const nestedAnchors = $(liElem).children('a');
      if (nestedLists.length === 0 && nestedAnchors.length === 0) {
        $(liElem).addClass(customListItemClasses);
        return;
      }

      const listItemContent = $(liElem).contents().not('ul');
      const listItemContentHtml = $.html(listItemContent);
      listItemContent.remove();
      $(liElem).prepend(`<div class="${defaultListItemClass}" onclick="handleSiteNavClick(this)">`
        + `${listItemContentHtml}</div>`);
      if (nestedLists.length === 0) {
        return;
      }

      // Found nested list, render dropdown menu
      const listItemParent = $(liElem).children().first();

      const hasExpandedKeyword = SITE_NAV_DROPDOWN_EXPAND_KEYWORD_REGEX.test(listItemContentHtml);
      if (hasExpandedKeyword) {
        nestedLists.addClass('site-nav-dropdown-container site-nav-dropdown-container-open');
        listItemParent.html(listItemContentHtml.replace(SITE_NAV_DROPDOWN_EXPAND_KEYWORD_REGEX, ''));
        listItemParent.append(SITE_NAV_DROPDOWN_ICON_ROTATED_HTML);
      } else {
        nestedLists.addClass('site-nav-dropdown-container');
        listItemParent.append(SITE_NAV_DROPDOWN_ICON_HTML);
      }
    });
  });

  $original.empty();
  $original.append($('site-nav').children());
}

module.exports = {
  renderSiteNav,
};
