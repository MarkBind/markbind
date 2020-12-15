var _a;
var path = require('path');
var PAGE_NJK = "\n<!DOCTYPE html>\n<html lang=\"en-us\">\n<head>\n    {{ headFileTopContent }}\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n    <meta name=\"generator\" content=\" markBindVersion \">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <title>{{ title }}</title>\n    <link rel=\"stylesheet\" href=\"{{ asset.bootstrap }}\">\n    <link rel=\"stylesheet\" href=\"{{ asset.bootstrapVue }}\">\n    <link rel=\"stylesheet\" href=\"{{ asset.fontAwesome }}\">\n    <link rel=\"stylesheet\" href=\"{{ asset.glyphicons }}\">\n    <link rel=\"stylesheet\" href=\"{{ asset.highlight }}\">\n    <link rel=\"stylesheet\" href=\"{{ asset.markbind }}\">\n    <link rel=\"stylesheet\" href=\"{{ asset.layoutStyle }}\">\n    {% if siteNav %}\n        <link rel=\"stylesheet\" href=\"{{ asset.siteNavCss }}\">\n    {% endif %}\n    {{ headFileBottomContent }}\n    {% if faviconUrl %}\n        <link rel=\"icon\" href=\"{{ faviconUrl }}\">\n    {% endif %}\n</head>\n<body>\n<div id=\"app\">\n    {{ content }}\n</div>\n</body>\n<script src=\"{{ asset.vue }}\"></script>\n<script src=\"{{ asset.components }}\"></script>\n<script src=\"{{ asset.bootstrapUtilityJs }}\"></script>\n<script src=\"{{ asset.polyfillJs }}\"></script>\n<script src=\"{{ asset.bootstrapVueJs }}\"></script>\n<script>\n  const baseUrl = '{{ baseUrl }}';\n</script>\n<script src=\"{{ asset.setup }}\"></script>\n<script src=\"{{ asset.layoutScript }}\"></script>\n</html>\n";
module.exports.PAGE_NJK = (_a = {},
    _a[path.join(__dirname, '../../../src/Page/page.njk')] = PAGE_NJK,
    _a);
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
var DEFAULT_TEMPLATE_DIRECTORY = path.join(__dirname, '../../../template/default');
function getDefaultTemplateFileFullPath(relativePath) {
    return path.join(DEFAULT_TEMPLATE_DIRECTORY, relativePath);
}
module.exports.getDefaultTemplateFileFullPath = getDefaultTemplateFileFullPath;
