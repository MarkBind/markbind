var cheerio = require('cheerio');
var fs = require('fs-extra');
var linkProcessor = require('../../../src/html/linkProcessor');
jest.mock('fs');
// Assets
var json = {
    './userGuide/raw.html': '1',
    './images/logo.png': '2',
    './css/main.css': '3',
    './devGuide/index.html': '4',
    './rawFile': '5',
};
fs.vol.fromJSON(json, './src');
var mockCwf = 'Test';
var mockConfig = {
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
test('Test invalid URL link ', function () {
    var mockLink = '<a href="https://markbind.org">Test</a>';
    var mockNode = cheerio.parseHTML(mockLink)[0];
    var EXPECTED_RESULT = 'Not Intralink';
    expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});
test('Test valid ".html" extension link ', function () {
    // should be checked as page
    var mockLink = '<a href="/index.html">Test</a>';
    var mockNode = cheerio.parseHTML(mockLink)[0];
    var EXPECTED_RESULT = 'Intralink with ".html" extension is a valid Page Source or File Asset';
    expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});
test('Test valid raw (not page source) ".html" extension link ', function () {
    // should be checked as file asset
    var mockLink = '<a href="/userGuide/raw.html">Test</a>';
    var mockNode = cheerio.parseHTML(mockLink)[0];
    var EXPECTED_ERR_RESULT = 'Intralink with ".html" extension is a valid Page Source or File Asset';
    expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_ERR_RESULT);
});
test('Test invalid, non-existent ".html" extension link ', function () {
    // should be checked as page and file asset
    var mockLink = '<a href="/missing.html">Test</a>';
    var mockNode = cheerio.parseHTML(mockLink)[0];
    var EXPECTED_ERR_RESULT = 'Intralink with ".html" extension is neither a Page Source nor File Asset';
    expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_ERR_RESULT);
});
test('Test valid link ending with /', function () {
    // should be checked as page
    var mockLink = '<a href="/userGuide/">Test</a>';
    var mockNode = cheerio.parseHTML(mockLink)[0];
    var EXPECTED_RESULT = 'Intralink ending with "/" is a valid Page Source or File Asset';
    expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});
test('Test valid link ending with /', function () {
    // should be checked as page and file asset
    var mockLink = '<a href="/devGuide/">Test</a>';
    var mockNode = cheerio.parseHTML(mockLink)[0];
    var EXPECTED_RESULT = 'Intralink ending with "/" is a valid Page Source or File Asset';
    expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});
test('Test invalid, non-existent link ending with /', function () {
    // should be checked as page and file asset
    var mockLink = '<a href="/missingGuide/">Test</a>';
    var mockNode = cheerio.parseHTML(mockLink)[0];
    var EXPECTED_RESULT = 'Intralink ending with "/" is neither a Page Source nor File Asset';
    expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});
test('Test valid link ending with no extension', function () {
    // should be checked as page
    var mockLink = '<a href="/userGuide">Test</a>';
    var mockNode = cheerio.parseHTML(mockLink)[0];
    var EXPECTED_RESULT = 'Intralink with no extension is a valid Page Source or File Asset';
    expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});
test('Test valid link ending with no extension', function () {
    // should be checked as page and file asset (implicit index resource path will be true)
    var mockLink = '<a href="/devGuide">Test</a>';
    var mockNode = cheerio.parseHTML(mockLink)[0];
    var EXPECTED_RESULT = 'Intralink with no extension is a valid Page Source or File Asset';
    expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});
test('Test valid link ending with no extension', function () {
    // should be checked as file asset (raw file)
    var mockLink = '<a href="/rawFile">Test</a>';
    var mockNode = cheerio.parseHTML(mockLink)[0];
    var EXPECTED_RESULT = 'Intralink with no extension is a valid Page Source or File Asset';
    expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});
test('Test invalid, non-existent link ending with no extension', function () {
    // should be checked as page, file asset, and raw file asset
    var mockLink = '<a href="/missingRawFile">Test</a>';
    var mockNode = cheerio.parseHTML(mockLink)[0];
    var EXPECTED_RESULT = 'Intralink with no extension is neither a Page Source nor File Asset';
    expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});
test('Test valid file asset links (png)', function () {
    // should be checked as file asset
    var mockLink = '<img src="/images/logo.png">Test</a>';
    var mockNode = cheerio.parseHTML(mockLink)[0];
    var EXPECTED_RESULT = 'Intralink is a valid File Asset';
    expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});
test('Test valid file asset links (css)', function () {
    // should be checked as file asset
    var mockLink = '<link rel="stylesheet" href="/css/main.css">Test</a>';
    var mockNode = cheerio.parseHTML(mockLink)[0];
    var EXPECTED_RESULT = 'Intralink is a valid File Asset';
    expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});
test('Test invalid link for non-existent file asset (css)', function () {
    // should be checked as file asset
    var mockLink = '<link rel="stylesheet" href="/css/missing.css">Test</a>';
    var mockNode = cheerio.parseHTML(mockLink)[0];
    var EXPECTED_RESULT = 'Intralink is not a File Asset';
    expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});
test('Test link for disabled intralink validation', function () {
    var mockLink = '<a href="https://markbind.org" no-validation>Test</a>';
    var mockNode = cheerio.parseHTML(mockLink)[0];
    var EXPECTED_RESULT = 'Intralink validation disabled';
    expect(linkProcessor.validateIntraLink(mockNode, mockCwf, mockConfig)).toEqual(EXPECTED_RESULT);
});
