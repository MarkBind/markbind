const fs = require('fs');
const path = require('path');

const { SITE_JSON_DEFAULT } = require('@markbind/core/test/unit/utils/data');
const cliUtil = require('../../dist/cli/src/util/cliUtil');

jest.mock('fs');
jest.mock('process');

afterEach(() => {
  fs.vol.reset();
  jest.resetModules();
});

test('findRootFolder returns user specified root if site config is found there', () => {
  const json = {
    'userSpecifiedRoot/site.json': SITE_JSON_DEFAULT,
  };
  fs.vol.fromJSON(json, '');
  const resolvedUserSpecificRoot = path.resolve('userSpecifiedRoot');
  expect(cliUtil.findRootFolder('userSpecifiedRoot')).toBe(resolvedUserSpecificRoot);
});

test('findRootFolder throws error if site config is not found in user specified root', () => {
  const resolvedUserSpecificRoot = path.resolve('userSpecifiedRoot');
  expect(
    () => {
      cliUtil.findRootFolder('userSpecifiedRoot');
    })
    .toThrow(`Config file not found at user specified root ${resolvedUserSpecificRoot}`);
});

test('findRootFolder without user specified root returns first parent dir containing site config', () => {
  const json = {
    './site.json': SITE_JSON_DEFAULT,
    './nested/': {},
  };
  const currentWorkingDir = process.cwd();
  const nestedDir = path.join(currentWorkingDir, 'nested');
  fs.vol.fromJSON(json, currentWorkingDir);
  process.cwd = jest.fn().mockReturnValue(nestedDir);
  expect(cliUtil.findRootFolder()).toBe(currentWorkingDir);
});

test('findRootFolder without user specified root throws error if no parent dirs contain site config', () => {
  const json = {
    './nested': {},
  };
  const currentWorkingDir = process.cwd();
  const nestedDir = path.join(currentWorkingDir, 'nested');
  fs.vol.fromJSON(json, currentWorkingDir);
  process.cwd = jest.fn().mockReturnValue(nestedDir);
  expect(
    () => {
      cliUtil.findRootFolder();
    })
    .toThrow(`No config file found in parent directories of ${nestedDir}`);
});

// Tests for cleanupFailedMarkbindBuild function
test('cleanupFailedMarkbindBuild removes _markbind directory in current working directory', () => {
  const currentWorkingDir = '/test/root';
  const json = {
    '/test/root/_markbind/': {
      'file1.txt': 'content',
      'subdir/': {
        'file2.txt': 'content',
      },
    },
  };
  fs.vol.fromJSON(json, '');
  process.cwd = jest.fn().mockReturnValue(currentWorkingDir);
  cliUtil.cleanupFailedMarkbindBuild();
  expect(fs.vol.existsSync(path.join(currentWorkingDir, '_markbind'))).toBe(false);
});

test('cleanupFailedMarkbindBuild handles missing _markbind directory gracefully', () => {
  const currentWorkingDir = '/test/root';
  const json = {
    '/test/root/': {
      'otherfile.txt': 'content',
    },
  };
  fs.vol.fromJSON(json, '');
  process.cwd = jest.fn().mockReturnValue(currentWorkingDir);
  // Should not throw an error
  expect(() => {
    cliUtil.cleanupFailedMarkbindBuild();
  }).not.toThrow();
});

test('cleanupFailedMarkbindBuild works with different working directories', () => {
  const currentWorkingDir = '/different/working/dir';
  const json = {
    '/different/working/dir/_markbind/': {
      'test.txt': 'content',
    },
  };
  fs.vol.fromJSON(json, '');
  process.cwd = jest.fn().mockReturnValue(currentWorkingDir);
  cliUtil.cleanupFailedMarkbindBuild();
  expect(fs.vol.existsSync(path.join(currentWorkingDir, '_markbind'))).toBe(false);
});
