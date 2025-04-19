import path from 'path';
import { getNewDefaultNodeProcessor } from '../utils/utils';
import * as logger from '../../../src/utils/logger';

const fs = require('fs');

jest.mock('fs');

const expectedErrors = [
  'No such segment \'#doesNotExist\' in file',
  'Cyclic reference detected.',
];

beforeAll(() => {
  logger.info(
    `The following ${
      expectedErrors.length === 1 ? 'error is' : 'errors are'
    } expected to be thrown during the test run:`,
  );
  expectedErrors.forEach((error, index) => {
    logger.info(`${index + 1}: ${error}`);
  });
});

afterEach(() => fs.vol.reset());

test('includeFile replaces <include> with <div>', async () => {
  const indexPath = path.resolve('index.md');

  const index = [
    '# Index',
    '<include src="include.md" />',
    '',
  ].join('\n');

  const include = ['# Include'].join('\n');

  const json = {
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');

  const nodeProcessor = getNewDefaultNodeProcessor();
  const result = await nodeProcessor.process(indexPath, index);

  const expected = ['<h1 id="index">Index</h1>', '<div><h1 id="include">Include</h1></div>'].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile replaces <include src="exist.md" optional> with <div>', async () => {
  const indexPath = path.resolve('index.md');

  const index = [
    '# Index',
    '<include src="exist.md" optional/>',
    '',
  ].join('\n');

  const exist = ['# Exist'].join('\n');

  const json = {
    'index.md': index,
    'exist.md': exist,
  };

  fs.vol.fromJSON(json, '');

  const nodeProcessor = getNewDefaultNodeProcessor();
  const result = await nodeProcessor.process(indexPath, index);

  const expected = [
    '<h1 id="index">Index</h1>',
    '<div><h1 id="exist">Exist</h1></div>',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile replaces <include src="doesNotExist.md" optional> with empty <div>', async () => {
  const indexPath = path.resolve('index.md');

  const index = [
    '# Index',
    '<include src="doesNotExist.md" optional/>',
    '',
  ].join('\n');

  const json = {
    'index.md': index,
  };

  fs.vol.fromJSON(json, '');

  const nodeProcessor = getNewDefaultNodeProcessor();
  const result = await nodeProcessor.process(indexPath, index);

  const expected = [
    '<h1 id="index">Index</h1>',
    '<include src="/doesNotExist.md" optional></include>',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile import footnote from hash', async () => {
  const indexPath = path.resolve('index.md');

  const index = [
    '<include src="include.md#exists"/>',
    '',
  ].join('\n');

  const include = [
    '<div id="exists">',
    '',
    'text^[footnote]',
    '</div>',
    '',
  ].join('\n');

  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');

  const nodeProcessor = getNewDefaultNodeProcessor();
  const result = await nodeProcessor.process(indexPath, index);
  const expected = '<div>\n'
                 + '<p>text<trigger for="pop:footnotefn-1-1"><sup class="footnote-ref"><a aria-describedby="'
                 + 'footnote-label" href="#fn-1-1">[1]</a></sup>'
                 + '</trigger></p></div><hr class="footnotes-sep">\n'
                 + '<section class="footnotes">\n'
                 + '<ol class="footnotes-list">\n'
                 + '<popover id="pop:footnotefn-1-1">\n'
                 + '            <template #content><div>\n'
                 + '              <p>footnote</p>\n'
                 + '\n'
                 + '            </div></template>\n'
                 + '          </popover>\n'
                 + '<li id="fn-1-1" class="footnote-item"><p>footnote</p>\n'
                 + '</li>\n'
                 + '</ol>\n'
                 + '</section>\n';

  expect(result).toEqual(expected);
});

test('includeFile replaces <include src="include.md#exists"> with <div>', async () => {
  const indexPath = path.resolve('index.md');

  const index = [
    '# Index',
    '<include src="include.md#exists"/>',
    '',
  ].join('\n');

  const include = [
    '# Include',
    '<div id="exists">existing segment</div>',
  ].join('\n');

  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');

  const nodeProcessor = getNewDefaultNodeProcessor();
  const result = await nodeProcessor.process(indexPath, index);

  const expected = [
    '<h1 id="index">Index</h1>',
    '<div>existing segment</div>',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile replaces an empty segment <include src="include.md#empty"> with <div>', async () => {
  const indexPath = path.resolve('index.md');

  const index = [
    '# Index',
    '<include src="include.md#empty"/>',
    '',
  ].join('\n');

  const include = [
    '# Include',
    'This is an empty segment:',
    '<div id="empty"></div>',
  ].join('\n');

  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');

  const nodeProcessor = getNewDefaultNodeProcessor();
  const result = await nodeProcessor.process(indexPath, index);

  const expected = [
    '<h1 id="index">Index</h1>',
    '<div></div>',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile replaces <include src="include.md#exists" inline> with inline content', async () => {
  const indexPath = path.resolve('index.md');

  const index = [
    '# Index',
    '<include src="include.md#exists" inline/>',
    '',
  ].join('\n');

  const include = [
    '# Include',
    '<div id="exists">existing segment</div>',
  ].join('\n');

  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');

  const nodeProcessor = getNewDefaultNodeProcessor();
  const result = await nodeProcessor.process(indexPath, index);

  const expected = [
    '<h1 id="index">Index</h1>',
    '<span>existing segment</span>',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile replaces <include src="include.md#exists" trim> with trimmed content', async () => {
  const indexPath = path.resolve('index.md');

  const index = [
    '# Index',
    '<include src="include.md#exists" trim/>',
    '',
  ].join('\n');

  const include = [
    '# Include',
    '<div id="exists">\t\texisting segment\t\t</div>',
  ].join('\n');

  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');

  const nodeProcessor = getNewDefaultNodeProcessor();
  const result = await nodeProcessor.process(indexPath, index);

  const expected = [
    '<h1 id="index">Index</h1>',
    '<div>existing segment</div>',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile replaces <include src="include.md#doesNotExist"> with error <div>', async () => {
  const indexPath = path.resolve('index.md');
  const includePath = path.resolve('include.md');

  const index = [
    '# Index',
    '<include src="include.md#doesNotExist"/>',
    '',
  ].join('\n');

  const include = ['# Include'].join('\n');

  const expectedErrorMessage = `No such segment '#doesNotExist' in file: ${includePath}`
    + `\nMissing reference in ${indexPath}`;

  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');

  const nodeProcessor = getNewDefaultNodeProcessor();
  const result = await nodeProcessor.process(indexPath, index);

  const expected = [
    '<h1 id="index">Index</h1>',
    `<div style="color: red"><div style="color: red">${expectedErrorMessage}</div></div>`,
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile replaces <include src="include.md#exists" optional> with <div>', async () => {
  const indexPath = path.resolve('index.md');

  const index = [
    '# Index',
    '<include src="include.md#exists" optional/>',
    '',
  ].join('\n');

  const include = [
    '# Include',
    '<div id="exists">existing segment</div>',
  ].join('\n');

  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');

  const nodeProcessor = getNewDefaultNodeProcessor();
  const result = await nodeProcessor.process(indexPath, index);

  const expected = [
    '<h1 id="index">Index</h1>',
    '<div>existing segment</div>',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile replaces <include src="include.md#doesNotExist" optional> with empty <div>', async () => {
  const indexPath = path.resolve('index.md');

  const index = [
    '# Index',
    '<include src="include.md#doesNotExist" optional/>',
    '',
  ].join('\n');

  const include = ['# Include'].join('\n');

  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');

  const nodeProcessor = getNewDefaultNodeProcessor();
  const result = await nodeProcessor.process(indexPath, index);

  const expected = [
    '<h1 id="index">Index</h1>',
    '<div></div>',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile detects cyclic references for static cyclic includes', async () => {
  const indexPath = path.resolve('index.md');
  const includePath = path.resolve('include.md');

  const index = [
    '# Index',
    '<include src="include.md" />',
    '',
  ].join('\n');

  const include = [
    '# Include',
    '<include src="index.md" />',
    '',
  ].join('\n');

  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');

  const expectedErrorMessage = [
    'Cyclic reference detected.',
    'Last 5 files processed:',
    `\t${indexPath}`,
    `\t${includePath}`,
    `\t${indexPath}`,
    `\t${includePath}`,
    `\t${indexPath}`,
  ].join('\n');

  const nodeProcessor = getNewDefaultNodeProcessor();
  const result = await nodeProcessor.process(indexPath, index);

  const expected = `<div style="color: red">${expectedErrorMessage}</div>`;

  expect(result).toContain(expected);
});

test('process include should preserve included frontmatter data', async () => {
  const indexPath = path.resolve('index.md');

  const index = [
    '# Index',
    '<include src="exist.md" />',
    '',
  ].join('\n');

  const exist = [
    '<frontmatter>',
    '  title: This should be present',
    '</frontmatter>',
    '',
    '# Exist',
  ].join('\n');

  const json = {
    'index.md': index,
    'exist.md': exist,
  };

  fs.vol.fromJSON(json, '');

  const nodeProcessor = getNewDefaultNodeProcessor();
  const result = await nodeProcessor.process(indexPath, index);

  const expectedHtml = [
    '<h1 id="index">Index</h1>',
    '<div>',
    '<h1 id="exist">Exist</h1></div>',
  ].join('\n');

  const expectedFrontmatter = {
    title: 'This should be present',
  };

  expect(result).toEqual(expectedHtml);
  expect(nodeProcessor.frontmatter).toEqual(expectedFrontmatter);
});

test('process include with omitFrontmatter should discard included frontmatter data', async () => {
  const indexPath = path.resolve('index.md');

  const index = [
    '# Index',
    '<include src="exist.md" omitFrontmatter/>',
    '',
  ].join('\n');

  const exist = [
    '<frontmatter>',
    '  title: This should not be present',
    '</frontmatter>',
    '',
    '# Exist',
  ].join('\n');

  const json = {
    'index.md': index,
    'exist.md': exist,
  };

  fs.vol.fromJSON(json, '');

  const nodeProcessor = getNewDefaultNodeProcessor();
  const result = await nodeProcessor.process(indexPath, index);

  const expectedHtml = [
    '<h1 id="index">Index</h1>',
    '<div>',
    '<h1 id="exist">Exist</h1></div>',
  ].join('\n');

  const expectedFrontmatter = {};

  expect(result).toEqual(expectedHtml);
  expect(nodeProcessor.frontmatter).toEqual(expectedFrontmatter);
});
