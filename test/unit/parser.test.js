const MarkBind = require('../../src/lib/markbind/src/parser.js');
const path = require('path');
const fs = require('fs');
const { USER_VARIABLES_DEFAULT } = require('./utils/data');

jest.mock('fs');

afterEach(() => fs.vol.reset());

const ROOT_PATH = path.resolve('');
const DEFAULT_USER_DEFINED_VARIABLES_MAP = {};
DEFAULT_USER_DEFINED_VARIABLES_MAP[ROOT_PATH] = {
  example: USER_VARIABLES_DEFAULT,
  baseUrl: '{{baseUrl}}',
};

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
  const baseUrlMap = {};
  baseUrlMap[ROOT_PATH] = true;

  const markbinder = new MarkBind();
  const result = await markbinder.includeFile(indexPath, {
    baseUrlMap,
    rootPath: ROOT_PATH,
    userDefinedVariablesMap: DEFAULT_USER_DEFINED_VARIABLES_MAP,
  });

  const expected = [
    '# Index',
    `<div cwf="${indexPath}" include-path="${includePath}">`,
    '',
    '# Include',
    '</div>',
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
  const baseUrlMap = {};
  baseUrlMap[ROOT_PATH] = true;

  const markbinder = new MarkBind();
  const result = await markbinder.includeFile(indexPath, {
    baseUrlMap,
    rootPath: ROOT_PATH,
    userDefinedVariablesMap: DEFAULT_USER_DEFINED_VARIABLES_MAP,
  });

  const expected = [
    '# Index',
    `<div cwf="${indexPath}" include-path="${existPath}">`,
    '',
    '# Exist',
    '</div>',
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
  const baseUrlMap = {};
  baseUrlMap[ROOT_PATH] = true;

  const markbinder = new MarkBind();
  const result = await markbinder.includeFile(indexPath, {
    baseUrlMap,
    rootPath: ROOT_PATH,
    userDefinedVariablesMap: DEFAULT_USER_DEFINED_VARIABLES_MAP,
  });

  const expected = [
    '# Index',
    '<div/>',
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
  const baseUrlMap = {};
  baseUrlMap[ROOT_PATH] = true;

  const markbinder = new MarkBind();
  const result = await markbinder.includeFile(indexPath, {
    baseUrlMap,
    rootPath: ROOT_PATH,
    userDefinedVariablesMap: DEFAULT_USER_DEFINED_VARIABLES_MAP,
  });

  const expected = [
    '# Index',
    `<div cwf="${indexPath}" include-path="${includePath}">`,
    '',
    'existing segment',
    '</div>',
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
  const baseUrlMap = {};
  baseUrlMap[ROOT_PATH] = true;

  const markbinder = new MarkBind();
  const result = await markbinder.includeFile(indexPath, {
    baseUrlMap,
    rootPath: ROOT_PATH,
    userDefinedVariablesMap: DEFAULT_USER_DEFINED_VARIABLES_MAP,
  });

  const expected = [
    '# Index',
    `<div cwf="${indexPath}" include-path="${includePath}">`,
    '',
    '',
    '</div>',
    '',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('includeFile replaces <include dynamic> with <panel>', async () => {
  const rootPath = path.resolve('');
  const indexPath = path.resolve('index.md');
  const includePath = path.resolve('include.md');

  const index = [
    '# Index',
    '<include src="include.md" dynamic />',
    '',
  ].join('\n');

  const include = ['# Include'].join('\n');


  const json = {
    'index.md': index,
    'include.md': include,
  };

  fs.vol.fromJSON(json, '');
  const baseUrlMap = {};
  baseUrlMap[rootPath] = true;

  const markbinder = new MarkBind();
  const result = await markbinder.includeFile(indexPath, {
    baseUrlMap,
    rootPath,
    userDefinedVariablesMap: DEFAULT_USER_DEFINED_VARIABLES_MAP,
  });

  const expected = [
    '# Index',
    `<panel src="${includePath}" cwf="${indexPath}" include-path="${includePath}"`
    + ' no-close="true" no-switch="true" header=""/>',
    '',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('renderFile converts markdown headers to <h1>', async () => {
  const markbinder = new MarkBind();
  const rootPath = path.resolve('');
  const indexPath = path.resolve('index.md');

  const index = ['# Index'].join('\n');

  const json = {
    'index.md': index,
  };

  fs.vol.fromJSON(json, '');

  const baseUrlMap = {};
  baseUrlMap[rootPath] = true;

  const result = await markbinder.renderFile(indexPath, {
    baseUrlMap,
    rootPath,
  });

  const expected = [
    '<h1 id="index">Index</h1>',
    '',
  ].join('\n');

  expect(result).toEqual(expected);
});
