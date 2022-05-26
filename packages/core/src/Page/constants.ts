export const HEAD_FOLDER_PATH = '_markbind/head';

export const LAYOUT_PAGE = 'page.md';
export const LAYOUT_FOOTER = 'footer.md';
export const LAYOUT_HEAD = 'head.md';
export const LAYOUT_HEADER = 'header.md';

export const FRONT_MATTER_FENCE = '---';
export const FRONT_MATTER_NONE_ATTR = 'none';
export const PAGE_NAV_ID = 'mb-page-nav';
export const PAGE_NAV_TITLE_CLASS = 'page-nav-title';
export const SITE_NAV_ID = 'site-nav';
export const SITE_NAV_EMPTY_LINE_REGEX = new RegExp('\\r?\\n\\s*\\r?\\n', 'g');
export const SITE_NAV_LIST_ITEM_CLASS = 'site-nav-list-item';
export const SITE_NAV_LIST_CLASS = 'site-nav-list';
export const SITE_NAV_LIST_CLASS_ROOT = 'site-nav-list-root';
export const SITE_NAV_DEFAULT_LIST_ITEM_CLASS = 'site-nav-default-list-item';
export const SITE_NAV_CUSTOM_LIST_ITEM_CLASS = 'site-nav-custom-list-item';
export const SITE_NAV_DROPDOWN_EXPAND_KEYWORD_REGEX = new RegExp(':expanded:', 'g');
export const SITE_NAV_DROPDOWN_ICON_HTML = '<i class="site-nav-dropdown-btn-icon" '
  + 'onclick="handleSiteNavClick(this.parentNode, false); event.stopPropagation();">\n'
  + '<span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span>\n'
  + '</i>';
export const SITE_NAV_DROPDOWN_ICON_ROTATED_HTML
  = '<i class="site-nav-dropdown-btn-icon site-nav-rotate-icon" '
  + 'onclick="handleSiteNavClick(this.parentNode, false); event.stopPropagation();">\n'
  + '<span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span>\n'
  + '</i>';
export const TITLE_PREFIX_SEPARATOR = ' - ';
