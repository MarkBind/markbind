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
