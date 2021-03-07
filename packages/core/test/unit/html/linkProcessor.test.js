const cheerio = require('cheerio');
const fs = require('fs-extra');
const linkProcessor = require('../../../src/html/linkProcessor');

jest.mock('fs');

// Assets
const json = {
  './userGuide/raw.html': '1',
  './images/logo.png': '2',
  './css/main.css': '3',
  './devGuide/index.html': '4',
  './rawFile': '5',
};

fs.vol.fromJSON(json, './src');

const mockCwf = 'Test';

const mockConfig = {
  rootPath: './src',
  baseUrl: '',
  ignore: [
    '_markbind', '_site/*',
    'lib/*', '*.json',
    '*.md', '*.mbd',
    '*.mbdf', '*.njk',
    '.git/*', '*.pptx',
    'CNAME',
  ],
  // Pages
  addressablePagesSource: [
    'index',
    'userGuide/index',
  ],
};

test.each([
  // Test converting .md to .html
  ['.md', '', '', '', '<a href="/index.html">Test</a>'],
  // Test converting .mbd to .html
  ['.mbd', '', '', '', '<a href="/index.html">Test</a>'],
  // Test conversion when both .md and .mbd are present, and .mbd is extension
  ['.md', '.mbd', '', '', '<a href="/index.md.html">Test</a>'],
  // Test conversion when both .md and .mbd are present, and .md is extension
  ['.mbd', '.md', '', '', '<a href="/index.mbd.html">Test</a>'],
  // Test converting .md to .html with URL fragment
  ['.md', '', '#test-1', '', '<a href="/index.html#test-1">Test</a>'],
  // Test converting .mbd to .html with URL fragment
  ['.mbd', '', '#test-1', '', '<a href="/index.html#test-1">Test</a>'],
  // Test conversion when both .md and .mbd are present, and .mbd is extension, with URL fragment
  ['.md', '.mbd', '#test-1', '', '<a href="/index.md.html#test-1">Test</a>'],
  // Test conversion when both .md and .mbd are present, and .md is extension, with URL fragment
  ['.mbd', '.md', '#test-1', '', '<a href="/index.mbd.html#test-1">Test</a>'],
  // Test no conversion when no-convert attribute is present
  ['.md', '', '#test-1', 'no-convert', '<a href="/index.md#test-1" no-convert>Test</a>'],
  // Test no conversion when neither .md nor .mbd extensions are present
  ['', '', '', '', '<a href="/index">Test</a>'],
])('Test link auto-conversion for (%s, %s, %s, %s)', (ext1, ext2, fragment, attr, expected) => {
  const mockLink = `<a href="/index${ext1}${ext2}${fragment}" ${attr}>Test</a>`;
  const mockNode = cheerio.parseHTML(mockLink)[0];

  linkProcessor.convertMdAndMbdExtToHtmlExt(mockNode);

  expect(cheerio.html(mockNode)).toBe(expected);
});

test('Test invalid URL link ', () => {
  const mockLink = '<a href="https://markbind.org">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0];

  const EXPECTED_RESULT = 'Not Intralink';

  expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid ".html" extension link ', () => {
  // should be checked as page
  const mockLink = '<a href="/index.html">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0];

  const EXPECTED_RESULT = 'Intralink with ".html" extension is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid raw (not page source) ".html" extension link ', () => {
  // should be checked as file asset
  const mockLink = '<a href="/userGuide/raw.html">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0];

  const EXPECTED_ERR_RESULT = 'Intralink with ".html" extension is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_ERR_RESULT);
});

test('Test invalid, non-existent ".html" extension link ', () => {
  // should be checked as page and file asset
  const mockLink = '<a href="/missing.html">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0];

  const EXPECTED_ERR_RESULT = 'Intralink with ".html" extension is neither a Page Source nor File Asset';

  expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_ERR_RESULT);
});

test('Test valid link ending with /', () => {
  // should be checked as page
  const mockLink = '<a href="/userGuide/">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0];

  const EXPECTED_RESULT = 'Intralink ending with "/" is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid link ending with /', () => {
  // should be checked as page and file asset
  const mockLink = '<a href="/devGuide/">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0];

  const EXPECTED_RESULT = 'Intralink ending with "/" is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test invalid, non-existent link ending with /', () => {
  // should be checked as page and file asset
  const mockLink = '<a href="/missingGuide/">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0];

  const EXPECTED_RESULT = 'Intralink ending with "/" is neither a Page Source nor File Asset';

  expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid link ending with no extension', () => {
  // should be checked as page
  const mockLink = '<a href="/userGuide">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0];

  const EXPECTED_RESULT = 'Intralink with no extension is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid link ending with no extension', () => {
  // should be checked as page and file asset (implicit index resource path will be true)
  const mockLink = '<a href="/devGuide">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0];

  const EXPECTED_RESULT = 'Intralink with no extension is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid link ending with no extension', () => {
  // should be checked as file asset (raw file)
  const mockLink = '<a href="/rawFile">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0];

  const EXPECTED_RESULT = 'Intralink with no extension is a valid Page Source or File Asset';

  expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test invalid, non-existent link ending with no extension', () => {
  // should be checked as page, file asset, and raw file asset
  const mockLink = '<a href="/missingRawFile">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0];

  const EXPECTED_RESULT = 'Intralink with no extension is neither a Page Source nor File Asset';

  expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid file asset links (png)', () => {
  // should be checked as file asset
  const mockLink = '<img src="/images/logo.png">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0];

  const EXPECTED_RESULT = 'Intralink is a valid File Asset';

  expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test valid file asset links (css)', () => {
  // should be checked as file asset
  const mockLink = '<link rel="stylesheet" href="/css/main.css">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0];

  const EXPECTED_RESULT = 'Intralink is a valid File Asset';

  expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test invalid link for non-existent file asset (css)', () => {
  // should be checked as file asset
  const mockLink = '<link rel="stylesheet" href="/css/missing.css">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0];

  const EXPECTED_RESULT = 'Intralink is not a File Asset';

  expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});

test('Test link for disabled intralink validation', () => {
  const mockLink = '<a href="https://markbind.org" no-validation>Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0];

  const EXPECTED_RESULT = 'Intralink validation disabled';

  expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});
