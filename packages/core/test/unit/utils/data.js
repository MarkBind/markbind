const path = require('path');

const PAGE_NJK = `
<!DOCTYPE html>
<html lang="en-us">
<head>
    {{ headFileTopContent }}
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="generator" content=" markBindVersion ">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ title }}</title>
    <link rel="stylesheet" href="{{ asset.bootstrap }}">
    <link rel="stylesheet" href="{{ asset.bootstrapVue }}">
    <link rel="stylesheet" href="{{ asset.fontAwesome }}">
    <link rel="stylesheet" href="{{ asset.glyphicons }}">
    <link rel="stylesheet" href="{{ asset.highlight }}">
    <link rel="stylesheet" href="{{ asset.markbind }}">
    <link rel="stylesheet" href="{{ asset.layoutStyle }}">
    {% if siteNav %}
        <link rel="stylesheet" href="{{ asset.siteNavCss }}">
    {% endif %}
    {{ headFileBottomContent }}
    {% if faviconUrl %}
        <link rel="icon" href="{{ faviconUrl }}">
    {% endif %}
</head>
<body>
<div id="app">
    {{ content }}
</div>
</body>
<script src="{{ asset.vue }}"></script>
<script src="{{ asset.components }}"></script>
<script src="{{ asset.bootstrapUtilityJs }}"></script>
<script src="{{ asset.polyfillJs }}"></script>
<script src="{{ asset.bootstrapVueJs }}"></script>
<script>
  const baseUrl = '{{ baseUrl }}';
</script>
<script src="{{ asset.setup }}"></script>
<script src="{{ asset.layoutScript }}"></script>
</html>
`;
module.exports.PAGE_NJK = {
  [path.join(__dirname, '../../../src/Page/page.njk')]: PAGE_NJK,
};

module.exports.SITE_JSON_DEFAULT = '{\n'
  + '  "baseUrl": "",\n'
  + '  "titlePrefix": "",\n'
  + '  "ignore": [\n'
  + '    "_markbind/layouts/*",\n'
  + '    "_markbind/logs/*",\n'
  + '    "_site/*",\n'
  + '    "site.json",\n'
  + '    "*.md",\n'
  + '    "*.mbd",\n'
  + '    "*.mbdf",\n'
  + '    "*.njk",\n'
  + '    ".git/*"\n'
  + '  ],\n'
  + '  "pages": [\n'
  + '    {\n'
  + '      "src": "index.md",\n'
  + '      "title": "Hello World"\n'
  + '    },\n'
  + '    {\n'
  + '      "glob" : "**/index.md"\n'
  + '    },\n'
  + '    {\n'
  + '      "glob" : "**/*.+(md|mbd)"\n'
  + '    }\n'
  + '  ],\n'
  + '  "deploy": {\n'
  + '    "message": "Site Update."\n'
  + '  }\n'
  + '}\n';

module.exports.INDEX_MD_DEFAULT = '<frontmatter>\n'
  + '  title: "Hello World"\n'
  + '  footer: footer.md\n'
  + '  header: header.md\n'
  + '  siteNav: site-nav.md\n'
  + '</frontmatter>\n\n'
  + '# Hello world\n'
  + 'Welcome to your page generated with MarkBind.\n';

const DEFAULT_TEMPLATE_DIRECTORY = path.join(__dirname, '../../../template/default');

function getDefaultTemplateFileFullPath(relativePath) {
  return path.join(DEFAULT_TEMPLATE_DIRECTORY, relativePath);
}
module.exports.getDefaultTemplateFileFullPath = getDefaultTemplateFileFullPath;
