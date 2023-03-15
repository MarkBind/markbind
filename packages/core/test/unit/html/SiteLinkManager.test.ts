import cheerio from 'cheerio';
import { DomElement } from 'htmlparser2';
import { getNewSiteLinkManager } from '../utils/utils';

const fs = require('fs');

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

test('Test invalid URL link ', () => {
  const siteLinkManager = getNewSiteLinkManager();
  const mockLink = '<div>Test</div>';
  const mockNode = cheerio.parseHTML(mockLink)[0] as unknown as DomElement;

  const EXPECTED_RESULT = 'Should not validate';

  expect(siteLinkManager.collectIntraLinkToValidate(mockNode, mockCwf)).toEqual(EXPECTED_RESULT);
});

test('Test mailto URL link', () => {
  const siteLinkManager = getNewSiteLinkManager();
  const mockLink = '<a href="mailto:test@example.com">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0] as unknown as DomElement;

  const EXPECTED_RESULT = 'Should not validate';

  expect(siteLinkManager.collectIntraLinkToValidate(mockNode, mockCwf)).toEqual(EXPECTED_RESULT);
});

test('Test tel URL link', () => {
  const siteLinkManager = getNewSiteLinkManager();
  const mockLink = '<a href="tel:999">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0] as unknown as DomElement;

  const EXPECTED_RESULT = 'Should not validate';

  expect(siteLinkManager.collectIntraLinkToValidate(mockNode, mockCwf)).toEqual(EXPECTED_RESULT);
});

test('Test link for disabled intralink validation', () => {
  const siteLinkManager = getNewSiteLinkManager();
  const mockLink = '<a href="https://markbind.org" no-validation>Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0] as unknown as DomElement;

  const EXPECTED_RESULT = 'Intralink validation disabled';

  expect(siteLinkManager.collectIntraLinkToValidate(mockNode, mockCwf)).toEqual(EXPECTED_RESULT);
});

test('Test invalid, non-existent link ending with no extension to be collected', () => {
  const siteLinkManager = getNewSiteLinkManager();
  const mockLink = '<a href="/missingRawFile">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0] as unknown as DomElement;

  const EXPECTED_RESULT = 'Intralink collected to be validated later';

  expect(siteLinkManager.collectIntraLinkToValidate(mockNode, mockCwf)).toEqual(EXPECTED_RESULT);
});

test('Test valid ".html" extension link ', () => {
  const siteLinkManager = getNewSiteLinkManager();
  const mockLink = '<a href="/index.html">Test</a>';
  const mockNode = cheerio.parseHTML(mockLink)[0] as unknown as DomElement;

  const EXPECTED_RESULT = 'Intralink collected to be validated later';

  expect(siteLinkManager.collectIntraLinkToValidate(mockNode, mockCwf)).toEqual(EXPECTED_RESULT);
});
