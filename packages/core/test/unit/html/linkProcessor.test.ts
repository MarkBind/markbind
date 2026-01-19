import cheerio from 'cheerio';
import * as linkProcessor from '../../../src/html/linkProcessor';
import { NodeProcessorConfig } from '../../../src/html/NodeProcessor';
import { MbNode, parseHTML } from '../../../src/utils/node';

const fs = require('fs-extra');

jest.mock('fs');

// Assets
const json = {
  './userGuide/raw.html': '1',
  './images/logo.png': '2',
  './css/main.css': '3',
  './devGuide/index.html': '4',
  './rawFile': '5',
  './spaced folder/img.png': '6',
};

fs.vol.fromJSON(json, './src');

const mockCwf = 'Test';

const mockConfig: NodeProcessorConfig = {
  rootPath: './src',
  baseUrl: '',
  ignore: [
    '_markbind', '_site/*',
    'lib/*', '*.json',
    '*.md', '*.njk',
    '.git/*', '*.pptx',
    'CNAME',
  ],
  // Pages
  addressablePagesSource: [
    'index',
    'userGuide/index',
  ],
  baseUrlMap: new Set<string>(),
  outputPath: '',
  intrasiteLinkValidation: {
    enabled: false,
  },
  codeLineNumbers: false,
  plantumlCheck: false,
  headerIdMap: {},
};

test.each([
  // Test converting .md to .html
  ['<a href="/index.md">Test</a>', '<a href="/index.html">Test</a>'],
  // Test converting .md to .html with URL fragment
  ['<a href="/index.md#test-1">Test</a>', '<a href="/index.html#test-1">Test</a>'],
  // Test no conversion when no-convert attribute is present
  ['<a href="/index.md#test-1" no-convert>Test</a>', '<a href="/index.md#test-1" no-convert>Test</a>'],
])('Test link auto-conversion for %s', (input, expected) => {
  const mockNode = parseHTML(input)[0] as MbNode;

  linkProcessor.convertMdExtToHtmlExt(mockNode);

  expect(cheerio.html(mockNode)).toBe(expected);
});

test('Test invalid URL link ', () => {
  const mockLink = '<a href="https://markbind.org">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Not Intralink';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid ".html" extension link ', () => {
  // should be checked as page
  const mockLink = '<a href="/index.html">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink with ".html" extension is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid raw (not page source) ".html" extension link ', () => {
  // should be checked as file asset
  const mockLink = '<a href="/userGuide/raw.html">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_ERR_RESULT = 'Intralink with ".html" extension is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_ERR_RESULT);
});

test('Test invalid, non-existent ".html" extension link ', () => {
  // should be checked as page and file asset
  const mockLink = '<a href="/missing.html">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_ERR_RESULT = 'Intralink with ".html" extension is neither a Page Source nor File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_ERR_RESULT);
});

test('Test valid link ending with /', () => {
  // should be checked as page
  const mockLink = '<a href="/userGuide/">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink ending with "/" is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid link ending with /', () => {
  // should be checked as page and file asset
  const mockLink = '<a href="/devGuide/">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink ending with "/" is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test invalid, non-existent link ending with /', () => {
  // should be checked as page and file asset
  const mockLink = '<a href="/missingGuide/">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink ending with "/" is neither a Page Source nor File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid link ending with no extension', () => {
  // should be checked as page
  const mockLink = '<a href="/userGuide">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink with no extension is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid link ending with no extension', () => {
  // should be checked as page and file asset (implicit index resource path will be true)
  const mockLink = '<a href="/devGuide">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink with no extension is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid link ending with no extension', () => {
  // should be checked as file asset (raw file)
  const mockLink = '<a href="/rawFile">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink with no extension is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test invalid, non-existent link ending with no extension', () => {
  // should be checked as page, file asset, and raw file asset
  const mockLink = '<a href="/missingRawFile">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink with no extension is neither a Page Source nor File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid file asset links (png)', () => {
  // should be checked as file asset
  const mockLink = '<img src="/images/logo.png">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink is a valid File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid file asset links (with %20 in the file path)', () => {
  const mockLink = '<a href="/spaced%20folder/img.png">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);
  const EXPECTED_RESULT = 'Intralink is a valid File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid file asset links (with space in the file path)', () => {
  const mockLink = '<a href="/spaced folder/img.png">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);
  const EXPECTED_RESULT = 'Intralink is a valid File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid file asset links (css)', () => {
  // should be checked as file asset
  const mockLink = '<link rel="stylesheet" href="/css/main.css">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink is a valid File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test invalid link for non-existent file asset (css)', () => {
  // should be checked as file asset
  const mockLink = '<link rel="stylesheet" href="/css/missing.css">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink is not a File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test non intralinks (mailto)', () => {
  const mockLink = '<a href="mailto:foo@bar.com">Test Email</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);
  const EXPECTED_RESULT = 'Not Intralink';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test non intralinks (tel)', () => {
  const mockLink = '<a href="tel:999">Test Phone</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);
  const EXPECTED_RESULT = 'Not Intralink';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test non valid hash link', () => {
  const mockLink = '<a href="/userGuide/raw.html#test-1">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);
  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig))
    .toEqual('Intralink with ".html" extension is a valid Page Source or File Asset but hash is not found');
});

test('Test valid hash link', () => {
  const mockLink = '<a href="/userGuide/raw.html#test-1">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);
  const EXPECTED_RESULT = 'Intralink with ".html" extension is a valid Page Source or File Asset';
  const mockMap = new Map<string, Set<string>>();
  mockMap.set('/userGuide/raw.md', new Set(['test-1']));
  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig, mockMap))
    .toEqual(EXPECTED_RESULT);
});

test('Test link with query parameter', () => {
  // should be checked as page
  const mockLink = '<a href="/index.html?param=value">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink with ".html" extension is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

// test('Test invalid, non-existent link ending with / and query parameters', () => {
//   // should be checked as page and file asset
//   const mockLink = '<a href="/missingGuide?param=value/">Test</a>';
//   const mockNode = parseHTML(mockLink)[0] as MbNode;
//   const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);
//
//   const EXPECTED_RESULT = 'Intralink ending with "/" is neither a Page Source nor File Asset';
//
//   expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
// });

test('Test valid link ending with no extension and query parameters', () => {
  // should be checked as page
  const mockLink = '<a href="/userGuide?param=value">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink with no extension is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid link ending with no extension and query parameters', () => {
  // should be checked as page and file asset (implicit index resource path will be true)
  const mockLink = '<a href="/devGuide?param=value">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink with no extension is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid link ending with no extension and query parameters', () => {
  // should be checked as file asset (raw file)
  const mockLink = '<a href="/rawFile?param=value">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink with no extension is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test invalid, non-existent link ending with no extension and query parameters', () => {
  // should be checked as page, file asset, and raw file asset
  const mockLink = '<a href="/missingRawFile?param=value">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);

  const EXPECTED_RESULT = 'Intralink with no extension is neither a Page Source nor File Asset';

  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid hash link with query parameters', () => {
  const mockLink = '<a href="/userGuide/raw.html?param=value#test-1">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);
  const EXPECTED_RESULT = 'Intralink with ".html" extension is a valid Page Source or File Asset';
  const mockMap = new Map<string, Set<string>>();
  mockMap.set('/userGuide/raw.md', new Set(['test-1']));
  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig, mockMap))
    .toEqual(EXPECTED_RESULT);
});

test('Test non valid hash link with query parameters', () => {
  const mockLink = '<a href="/userGuide/raw.html?param=value#test-1">Test</a>';
  const mockNode = parseHTML(mockLink)[0] as MbNode;
  const mockResourcePath = linkProcessor.getDefaultTagsResourcePath(mockNode);
  expect(linkProcessor.validateIntraLink(mockResourcePath, mockCwf, mockConfig))
    .toEqual('Intralink with ".html" extension is a valid Page Source or File Asset but hash is not found');
});
