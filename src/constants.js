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
  SITE_NAV_LIST_CLASS: 'site-nav-list',
  TITLE_PREFIX_SEPARATOR: ' - ',

  DROPDOWN_BUTTON_ICON_HTML: '<i class="dropdown-btn-icon">\n'
  + '<span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span>\n'
  + '</i>',
  DROPDOWN_EXPAND_KEYWORD: ':expanded:',

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

  ABOUT_MARKDOWN_FILE: 'about.md',
  BUILT_IN_PLUGIN_FOLDER_NAME: 'plugins',
  BUILT_IN_DEFAULT_PLUGIN_FOLDER_NAME: 'plugins/default',
  FAVICON_DEFAULT_PATH: 'favicon.ico',
  FOOTER_PATH: '_markbind/footers/footer.md',
  INDEX_MARKDOWN_FILE: 'index.md',
  MARKBIND_PLUGIN_PREFIX: 'markbind-plugin-',
  PAGE_TEMPLATE_NAME: 'page.njk',
  PROJECT_PLUGIN_FOLDER_NAME: '_markbind/plugins',
  SITE_CONFIG_NAME: 'site.json',
  SITE_DATA_NAME: 'siteData.json',
  LAYOUT_SITE_FOLDER_NAME: 'layouts',
  USER_VARIABLES_PATH: '_markbind/variables.md',
  WIKI_SITE_NAV_PATH: '_Sidebar.md',
  WIKI_FOOTER_PATH: '_Footer.md',
  MARKBIND_WEBSITE_URL: 'https://markbind.org/',

  // src/plugins/algolia.js
  ALGOLIA_CSS_URL: 'https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.css',
  ALGOLIA_JS_URL: 'https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.js',
  ALGOLIA_INPUT_SELECTOR: '#algolia-search-input',

  // src/plugins/copyCode.js
  COPIED_TO_CLIPBOARD: 'Copied!',
  COPY_ICON: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24">'
  + '<path d="M13.508 11.504l.93-2.494 2.998 6.268-6.31 2.779.894-2.478s-8.271-4.205-7.924-11.58c2.'
  + '716 5.939 9.412 7.505 9.412 7.505zm7.492-9.504v-2h-21v21h2v-19h19zm-14.633 2c.441.757.958 1.'
  + '422 1.521 2h14.112v16h-16v-8.548c-.713-.752-1.4-1.615-2-2.576v13.124h20v-20h-17.633z"/></svg>',
  COPY_TO_CLIPBOARD: 'Copy',

  // src/plugins/default/markbind-plugin-anchors.js
  ANCHOR_HTML: '<a class="fa fa-anchor" href="#"></a>',
  HEADER_TAGS: 'h1, h2, h3, h4, h5, h6',

  // src/plugins/default/markbind-plugin-plantuml.js
  ERR_PROCESSING: 'Error processing',
  ERR_READING: 'Error reading',

  // src/template/template.js
  requiredFiles: ['index.md', 'site.json', '_markbind/'],

  // src/util/fsUtil.js
  sourceFileExtNames: ['.html', '.md', '.mbd', '.mbdf'],
};
