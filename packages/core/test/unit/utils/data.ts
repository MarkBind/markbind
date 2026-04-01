import path from 'path';

const PAGE_NJK_LITERAL = `
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
    <link rel="stylesheet" href="{{ asset.fontAwesome }}">
    <link rel="stylesheet" href="{{ asset.glyphicons }}">
    <link rel="stylesheet" id="markbind-highlight-light" href="{{ asset.highlightLight }}">
    <link rel="stylesheet" id="markbind-highlight-dark" href="{{ asset.highlightDark }}">
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
<body >
<div id="app">
    {{ content }}
</div>
</body>
<script src="{{ asset.vue }}"></script>
<script src="{{ asset.components }}"></script>
<script src="{{ asset.bootstrapUtilityJs }}"></script>
<script src="{{ asset.polyfillJs }}"></script>
<script>
  const baseUrl = '{{ baseUrl }}';
</script>
<script src="{{ asset.setup }}"></script>
<script src="{{ asset.layoutScript }}"></script>
</html>
`;
export const PAGE_NJK = {
  [path.join(__dirname, '../../../src/Page/page.njk')]: PAGE_NJK_LITERAL,
};

export const SITE_JSON_DEFAULT = '{\n'
  + '  "baseUrl": "",\n'
  + '  "titlePrefix": "",\n'
  + '  "titleSuffix": "",\n'
  + '  "ignore": [\n'
  + '    "_markbind/layouts/*",\n'
  + '    "_markbind/logs/*",\n'
  + '    "_site/*",\n'
  + '    "site.json",\n'
  + '    "*.md",\n'
  + '    "*.njk",\n'
  + '    ".git/*",\n'
  + '    "node_modules/*"\n'
  + '  ],\n'
  + '  "pagesExclude": ["node_modules/*"],\n'
  + '  "pages": [\n'
  + '    {\n'
  + '      "src": "index.md",\n'
  + '      "title": "Hello World"\n'
  + '    },\n'
  + '    {\n'
  + '      "glob" : "**/index.md"\n'
  + '    },\n'
  + '    {\n'
  + '      "glob" : "**/*.md"\n'
  + '    }\n'
  + '  ],\n'
  + '  "deploy": {\n'
  + '    "message": "Site Update."\n'
  + '  }\n'
  + '}\n';

export const INDEX_MD_DEFAULT = '<frontmatter>\n'
  + '  title: "Hello World"\n'
  + '  footer: footer.md\n'
  + '  header: header.md\n'
  + '  siteNav: site-nav.md\n'
  + '</frontmatter>\n\n'
  + '# Hello world\n'
  + 'Welcome to your page generated with MarkBind.\n';

const DEFAULT_TEMPLATE_DIRECTORY = path.join(__dirname, '../../../template/default');

export function getDefaultTemplateFileFullPath(relativePath: string) {
  return path.join(DEFAULT_TEMPLATE_DIRECTORY, relativePath);
}

// ============================================================================
// Factory functions for SiteGenerationManager tests
// ============================================================================

type JestFn = typeof jest.fn;

export interface MockAddDirectoryResult {
  page_count: number;
  errors?: string[];
}

export interface MockAddHTMLFileResult {
  file?: { path: string };
  errors?: string[];
}

export interface MockIndex {
  addDirectory: ReturnType<JestFn>;
  addHTMLFile: ReturnType<JestFn>;
  writeFiles: ReturnType<JestFn>;
}

export interface MockPagefind {
  createIndex: ReturnType<JestFn>;
  close: ReturnType<JestFn>;
}

/**
 * Creates a mock pagefind index
 * @param result - The result to return from addDirectory
 * @param htmlFileResult - The result to return from addHTMLFile
 */
export function createMockIndex(
  result: MockAddDirectoryResult = { page_count: 1, errors: [] },
  htmlFileResult: MockAddHTMLFileResult = { errors: [] },
): MockIndex {
  return {
    addDirectory: jest.fn().mockResolvedValue(result),
    addHTMLFile: jest.fn().mockResolvedValue(htmlFileResult),
    writeFiles: jest.fn().mockResolvedValue(undefined),
  };
}

/**
 * Creates a mock pagefind module
 * @param mockIndex - The mock index to use (from createMockIndex)
 * @param returnIndexDirectly - If true, returns { index: mockIndex }, otherwise returns mockIndex directly
 */
export function createMockPagefind(mockIndex: MockIndex, returnIndexDirectly = false): MockPagefind {
  return {
    createIndex: jest.fn().mockResolvedValue(
      returnIndexDirectly ? { index: mockIndex } : mockIndex,
    ),
    close: jest.fn().mockResolvedValue(undefined),
  };
}

/**
 * Creates a mock pagefind that returns null index (for error testing)
 */
export function createMockPagefindNullIndex(): MockPagefind {
  return {
    createIndex: jest.fn().mockResolvedValue({ index: null }),
    close: jest.fn().mockResolvedValue(undefined),
  };
}

/**
 * Creates a mock pagefind that rejects (for import failure testing)
 */
export function createMockPagefindReject(error: Error = new Error('Module not found')): MockPagefind {
  return {
    createIndex: jest.fn().mockRejectedValue(error),
    close: jest.fn().mockResolvedValue(undefined),
  };
}

/**
 * Creates a site.json string with pagefind configuration
 * @param pagefindConfig - The pagefind configuration object (without baseUrl)
 */
export function createSiteJsonWithPagefind(pagefindConfig: Record<string, unknown>): string {
  const siteJson = {
    baseUrl: '',
    ...pagefindConfig,
  };
  return JSON.stringify(siteJson);
}
