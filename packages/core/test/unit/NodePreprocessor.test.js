const path = require('path');
const fs = require('fs');
const { PageSources } = require('../../src/Page/PageSources');
const { NodePreprocessor } = require('../../src/html/NodePreprocessor');
const VariableProcessor = require('../../src/variables/VariableProcessor');

jest.mock('fs');

afterEach(() => fs.vol.reset());

const ROOT_PATH = path.resolve('');
function getNewDefaultVariableProcessor() {
  const DEFAULT_VARIABLE_PROCESSOR = new VariableProcessor(ROOT_PATH, new Set([ROOT_PATH]));
  DEFAULT_VARIABLE_PROCESSOR.addUserDefinedVariable(ROOT_PATH, 'baseUrl', '{{baseUrl}}');

  return DEFAULT_VARIABLE_PROCESSOR;
}

test('includeFile replaces <include> with <div>', async () => {
  const indexPath = path.resolve('index.md');
  const includePath = path.resolve('include.md');

  const index = [
    '# Index',
    '<include src="include.md" />',
    '',
  ].join('\n');

  const include = ['# Include'].join('\n');

  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');
  const baseUrlMap = new Set([ROOT_PATH]);

  const nodePreprocessor = new NodePreprocessor({ baseUrlMap, rootPath: ROOT_PATH },
                                                getNewDefaultVariableProcessor(),
                                                new PageSources());
  const result = await nodePreprocessor.includeFile(indexPath, index);

  const expected = [
    '# Index',
    `<div cwf="${indexPath}">`
    + `<div data-included-from="${includePath}" cwf="${includePath}">`,
    '',
    '# Include',
    '</div></div>',
    '',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile replaces <include src="exist.md" optional> with <div>', async () => {
  const indexPath = path.resolve('index.md');
  const existPath = path.resolve('exist.md');

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
  const baseUrlMap = new Set([ROOT_PATH]);

  const nodePreprocessor = new NodePreprocessor({ baseUrlMap, rootPath: ROOT_PATH },
                                                getNewDefaultVariableProcessor(),
                                                new PageSources());
  const result = await nodePreprocessor.includeFile(indexPath, index);

  const expected = [
    '# Index',
    `<div cwf="${indexPath}">`
    + `<div data-included-from="${existPath}" cwf="${existPath}">`,
    '',
    '# Exist',
    '</div></div>',
    '',
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
  const baseUrlMap = new Set([ROOT_PATH]);

  const nodePreprocessor = new NodePreprocessor({ baseUrlMap, rootPath: ROOT_PATH },
                                                getNewDefaultVariableProcessor(),
                                                new PageSources());
  const result = await nodePreprocessor.includeFile(indexPath, index);

  const expected = [
    '# Index',
    '<div></div>',
    '',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile replaces <include src="include.md#exists"> with <div>', async () => {
  const indexPath = path.resolve('index.md');
  const includePath = path.resolve('include.md');

  const index = [
    '# Index',
    '<include src="include.md#exists"/>',
    '',
  ].join('\n');

  const include = [
    '# Include',
    '<seg id="exists">existing segment</seg>',
  ].join('\n');

  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');
  const baseUrlMap = new Set([ROOT_PATH]);

  const nodePreprocessor = new NodePreprocessor({ baseUrlMap, rootPath: ROOT_PATH },
                                                getNewDefaultVariableProcessor(),
                                                new PageSources());
  const result = await nodePreprocessor.includeFile(indexPath, index);

  const expected = [
    '# Index',
    `<div cwf="${indexPath}">`
    + `<div data-included-from="${includePath}" cwf="${includePath}">`,
    '',
    'existing segment',
    '</div></div>',
    '',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile replaces <include src="include.md#exists" inline> with inline content', async () => {
  const indexPath = path.resolve('index.md');
  const includePath = path.resolve('include.md');

  const index = [
    '# Index',
    '<include src="include.md#exists" inline/>',
    '',
  ].join('\n');

  const include = [
    '# Include',
    '<seg id="exists">existing segment</seg>',
  ].join('\n');

  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');
  const baseUrlMap = new Set([ROOT_PATH]);

  const nodePreprocessor = new NodePreprocessor({ baseUrlMap, rootPath: ROOT_PATH },
                                                getNewDefaultVariableProcessor(),
                                                new PageSources());
  const result = await nodePreprocessor.includeFile(indexPath, index);

  const expected = [
    '# Index',
    `<span cwf="${indexPath}">`
    + `<span data-included-from="${includePath}" cwf="${includePath}">existing segment</span></span>`,
    '',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile replaces <include src="include.md#exists" trim> with trimmed content', async () => {
  const indexPath = path.resolve('index.md');
  const includePath = path.resolve('include.md');

  const index = [
    '# Index',
    '<include src="include.md#exists" trim/>',
    '',
  ].join('\n');

  const include = [
    '# Include',
    '<seg id="exists">\t\texisting segment\t\t</seg>',
  ].join('\n');

  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');
  const baseUrlMap = new Set([ROOT_PATH]);

  const nodePreprocessor = new NodePreprocessor({ baseUrlMap, rootPath: ROOT_PATH },
                                                getNewDefaultVariableProcessor(),
                                                new PageSources());
  const result = await nodePreprocessor.includeFile(indexPath, index);

  const expected = [
    '# Index',
    `<div cwf="${indexPath}">`
    + `<div data-included-from="${includePath}" cwf="${includePath}">`,
    '',
    'existing segment',
    '</div></div>',
    '',
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

  const expectedErrorMessage = `No such segment 'doesNotExist' in file: ${includePath}`
    + `\nMissing reference in ${indexPath}`;

  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');
  const baseUrlMap = new Set([ROOT_PATH]);

  const nodePreprocessor = new NodePreprocessor({ baseUrlMap, rootPath: ROOT_PATH },
                                                getNewDefaultVariableProcessor(),
                                                new PageSources());
  const result = await nodePreprocessor.includeFile(indexPath, index);

  const expected = [
    '# Index',
    `<div style="color: red">${expectedErrorMessage}</div>`,
    '',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile replaces <include src="include.md#exists" optional> with <div>', async () => {
  const indexPath = path.resolve('index.md');
  const includePath = path.resolve('include.md');

  const index = [
    '# Index',
    '<include src="include.md#exists" optional/>',
    '',
  ].join('\n');

  const include = [
    '# Include',
    '<seg id="exists">existing segment</seg>',
  ].join('\n');

  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');
  const baseUrlMap = new Set([ROOT_PATH]);

  const nodePreprocessor = new NodePreprocessor({ baseUrlMap, rootPath: ROOT_PATH },
                                                getNewDefaultVariableProcessor(),
                                                new PageSources());
  const result = await nodePreprocessor.includeFile(indexPath, index);

  const expected = [
    '# Index',
    `<div cwf="${indexPath}">`
    + `<div data-included-from="${includePath}" cwf="${includePath}">`,
    '',
    'existing segment',
    '</div></div>',
    '',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile replaces <include src="include.md#doesNotExist" optional> with empty <div>', async () => {
  const indexPath = path.resolve('index.md');
  const includePath = path.resolve('include.md');

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
  const baseUrlMap = new Set([ROOT_PATH]);

  const nodePreprocessor = new NodePreprocessor({ baseUrlMap, rootPath: ROOT_PATH },
                                                getNewDefaultVariableProcessor(),
                                                new PageSources());
  const result = await nodePreprocessor.includeFile(indexPath, index);

  const expected = [
    '# Index',
    `<div cwf="${indexPath}">`
    + `<div data-included-from="${includePath}" cwf="${includePath}">`,
    '',
    '',
    '</div></div>',
    '',
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
  const baseUrlMap = new Set([ROOT_PATH]);

  const expectedErrorMessage = [
    'Cyclic reference detected.',
    'Last 5 files processed:',
    `\t${indexPath}`,
    `\t${includePath}`,
    `\t${indexPath}`,
    `\t${includePath}`,
    `\t${indexPath}`,
  ].join('\n');

  const nodePreprocessor = new NodePreprocessor({ baseUrlMap, rootPath: ROOT_PATH },
                                                getNewDefaultVariableProcessor(),
                                                new PageSources());
  const result = await nodePreprocessor.includeFile(indexPath, index);

  const expected = `<div style="color: red">${expectedErrorMessage}</div>`;

  expect(result).toContain(expected);
});
