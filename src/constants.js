const path = require('path');

module.exports = {
  // index.js
  ACCEPTED_COMMANDS: ['init', 'build', 'serve', 'deploy'],
  ACCEPTED_COMMANDS_ALIAS: ['i', 'b', 's', 'd'],

  // src/Page.js
  FOOTERS_FOLDER_PATH: '_markbind/footers',
  HEAD_FOLDER_PATH: '_markbind/head',
  HEADERS_FOLDER_PATH: '_markbind/headers',
  LAYOUT_DEFAULT_NAME: 'default',
  LAYOUT_FOLDER_PATH: '_markbind/layouts',

  LAYOUT_PAGE: 'page.md',
  LAYOUT_PAGE_BODY_VARIABLE: 'MAIN_CONTENT_BODY',
  LAYOUT_FOOTER: 'footer.md',
  LAYOUT_HEAD: 'head.md',
  LAYOUT_HEADER: 'header.md',
  LAYOUT_NAVIGATION: 'navigation.md',
  NAVIGATION_FOLDER_PATH: '_markbind/navigation',

  CONTENT_WRAPPER_ID: 'content-wrapper',
  FRONT_MATTER_FENCE: '---',
  FRONT_MATTER_NONE_ATTR: 'none',
  PAGE_NAV_ID: 'page-nav',
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

  TEMP_NAVBAR_CLASS: 'temp-navbar',
  TEMP_DROPDOWN_CLASS: 'temp-dropdown',
  TEMP_DROPDOWN_PLACEHOLDER_CLASS: 'temp-dropdown-placeholder',

  // src/Site.js
  CONFIG_FOLDER_NAME: '_markbind',
  HEADING_INDEXING_LEVEL_DEFAULT: 3,
  SITE_ASSET_FOLDER_NAME: 'asset',
  SITE_FOLDER_NAME: '_site',
  TEMP_FOLDER_NAME: '.temp',
  TEMPLATE_SITE_ASSET_FOLDER_NAME: 'markbind',
  PLUGIN_SITE_ASSET_FOLDER_NAME: 'plugins',

  ABOUT_MARKDOWN_FILE: 'about.md',
  FAVICON_DEFAULT_PATH: 'favicon.ico',
  FOOTER_PATH: '_markbind/footers/footer.md',
  INDEX_MARKDOWN_FILE: 'index.md',
  MARKBIND_DEFAULT_PLUGIN_DIRECTORY: path.join(path.dirname(require.resolve('@markbind/core')),
                                               'src/plugins/default'),
  MARKBIND_PLUGIN_DIRECTORY: path.join(path.dirname(require.resolve('@markbind/core')), 'src/plugins'),
  MARKBIND_PLUGIN_PREFIX: 'markbind-plugin-',
  MAX_CONCURRENT_PAGE_GENERATION_PROMISES: 4,
  PAGE_TEMPLATE_NAME: 'page.njk',
  PROJECT_PLUGIN_FOLDER_NAME: '_markbind/plugins',
  SITE_CONFIG_NAME: 'site.json',
  SITE_DATA_NAME: 'siteData.json',
  LAYOUT_SITE_FOLDER_NAME: 'layouts',
  LAZY_LOADING_SITE_FILE_NAME: 'LazyLiveReloadLoadingSite.html',
  LAZY_LOADING_BUILD_TIME_RECOMMENDATION_LIMIT: 30000,
  LAZY_LOADING_REBUILD_TIME_RECOMMENDATION_LIMIT: 5000,
  USER_VARIABLES_PATH: '_markbind/variables.md',
  WIKI_SITE_NAV_PATH: '_Sidebar.md',
  WIKI_FOOTER_PATH: '_Footer.md',
  MARKBIND_WEBSITE_URL: 'https://markbind.org/',

  // src/template/template.js
  requiredFiles: ['index.md', 'site.json', '_markbind/'],
};
