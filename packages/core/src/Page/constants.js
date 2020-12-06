module.exports = {
  HEAD_FOLDER_PATH: '_markbind/head',

  LAYOUT_PAGE: 'page.md',
  LAYOUT_FOOTER: 'footer.md',
  LAYOUT_HEAD: 'head.md',
  LAYOUT_HEADER: 'header.md',

  FRONT_MATTER_FENCE: '---',
  FRONT_MATTER_NONE_ATTR: 'none',
  PAGE_NAV_ID: 'mb-page-nav',
  PAGE_NAV_TITLE_CLASS: 'page-nav-title',
  SITE_NAV_ID: 'site-nav',
  SITE_NAV_EMPTY_LINE_REGEX: new RegExp('\\r?\\n\\s*\\r?\\n', 'g'),
  SITE_NAV_LIST_ITEM_CLASS: 'site-nav-list-item',
  SITE_NAV_LIST_CLASS: 'site-nav-list',
  SITE_NAV_LIST_CLASS_ROOT: 'site-nav-list-root',
  SITE_NAV_DEFAULT_LIST_ITEM_CLASS: 'site-nav-default-list-item',
  SITE_NAV_CUSTOM_LIST_ITEM_CLASS: 'site-nav-custom-list-item',
  SITE_NAV_DROPDOWN_EXPAND_KEYWORD_REGEX: new RegExp(':expanded:', 'g'),
  SITE_NAV_DROPDOWN_ICON_HTML: '<i class="site-nav-dropdown-btn-icon" '
    + 'onclick="handleSiteNavClick(this.parentNode, false); event.stopPropagation();">\n'
    + '<span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span>\n'
    + '</i>',
  SITE_NAV_DROPDOWN_ICON_ROTATED_HTML: '<i class="site-nav-dropdown-btn-icon site-nav-rotate-icon" '
    + 'onclick="handleSiteNavClick(this.parentNode, false); event.stopPropagation();">\n'
    + '<span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span>\n'
    + '</i>',
  TITLE_PREFIX_SEPARATOR: ' - ',
};
