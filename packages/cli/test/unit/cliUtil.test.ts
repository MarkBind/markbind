import { SITE_JSON_DEFAULT } from '@markbind/core/test/unit/utils/data';
import { vol } from 'memfs';

import path from 'path';
import * as cliUtil from '../../src/util/cliUtil.js';

jest.mock('fs');
jest.mock('process');

afterEach(() => {
  vol.reset();
  jest.resetModules();
});

test('findRootFolder returns user specified root if site config is found there', () => {
  const json = {
    'userSpecifiedRoot/site.json': SITE_JSON_DEFAULT,
  };
  vol.fromJSON(json, '');
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
    './nested/': null,
  };
  const currentWorkingDir = process.cwd();
  const nestedDir = path.join(currentWorkingDir, 'nested');
  vol.fromJSON(json, currentWorkingDir);
  process.cwd = jest.fn().mockReturnValue(nestedDir);
  // @ts-ignore
  expect(cliUtil.findRootFolder()).toBe(currentWorkingDir);
});

test('findRootFolder without user specified root throws error if no parent dirs contain site config', () => {
  const json = {
    './nested': null,
  };
  const currentWorkingDir = process.cwd();
  const nestedDir = path.join(currentWorkingDir, 'nested');
  vol.fromJSON(json, currentWorkingDir);
  process.cwd = jest.fn().mockReturnValue(nestedDir);
  expect(
    () => {
      // @ts-ignore
      cliUtil.findRootFolder();
    })
    .toThrow(`No config file found in parent directories of ${nestedDir}`);
});

// Tests for cleanupFailedMarkbindBuild function
test('cleanupFailedMarkbindBuild removes _markbind directory in current working directory', () => {
  const currentWorkingDir = '/test/root';
  const json = {
    '/test/root/_markbind/logs/': null,
  };
  vol.fromJSON(json, '');
  process.cwd = jest.fn().mockReturnValue(currentWorkingDir);
  cliUtil.cleanupFailedMarkbindBuild();
  expect(vol.existsSync(path.join(currentWorkingDir, '_markbind'))).toBe(false);
});

test('cleanupFailedMarkbindBuild handles missing _markbind directory gracefully', () => {
  const currentWorkingDir = '/test/root';
  const json = {
    '/test/root/': null,
  };
  vol.fromJSON(json, '');
  process.cwd = jest.fn().mockReturnValue(currentWorkingDir);
  // Should not throw an error
  expect(() => {
    cliUtil.cleanupFailedMarkbindBuild();
  }).not.toThrow();
});

test('cleanupFailedMarkbindBuild preserves structure when _markbind/logs contains files', () => {
  const currentWorkingDir = '/test/root';
  const json = {
    '/test/root/_markbind/logs/should-remain.file': 'content',
  };
  vol.fromJSON(json, '');
  process.cwd = jest.fn().mockReturnValue(currentWorkingDir);
  cliUtil.cleanupFailedMarkbindBuild();
  // Structure should remain preserved since logs directory is not empty
  expect(vol.existsSync(path.join(currentWorkingDir, '_markbind'))).toBe(true);
  expect(vol.existsSync(path.join(currentWorkingDir, '_markbind/logs'))).toBe(true);
  expect(vol.existsSync(path.join(currentWorkingDir, '_markbind/logs/should-remain.file'))).toBe(true);
});

test('cleanupFailedMarkbindBuild deletes empty logs directory but not non-empty _markbind', () => {
  const currentWorkingDir = '/test/root';
  const json = {
    '/test/root/_markbind': {
      'should-remain.file': 'content',
      'logs/': {},
    },
  };
  vol.fromNestedJSON(json, '');
  process.cwd = jest.fn().mockReturnValue(currentWorkingDir);
  cliUtil.cleanupFailedMarkbindBuild();
  // Logs directory should be deleted (it was empty)
  expect(vol.existsSync(path.join(currentWorkingDir, '_markbind/logs'))).toBe(false);
  // But _markbind should remain since it contains should-remain.file
  expect(vol.existsSync(path.join(currentWorkingDir, '_markbind'))).toBe(true);
  expect(vol.existsSync(path.join(currentWorkingDir, '_markbind/should-remain.file'))).toBe(true);
});
