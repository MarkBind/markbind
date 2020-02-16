const path = require('path');
const {
  COLLECT_PLUGIN_SOURCES,
  COLLECT_PLUGIN_TEST_PLUGIN,
} = require('./utils/pageData');
const Page = require('../../src/Page');

test('Page#collectIncludedFiles collects included files from 1 dependency object', () => {
  const page = new Page({});
  page.collectIncludedFiles([{ to: 'somewhere' }]);

  expect(page.includedFiles).toEqual(new Set(['somewhere']));
});

test('Page#collectIncludedFiles ignores other keys in dependency', () => {
  const page = new Page({});
  page.collectIncludedFiles([{ to: 'somewhere', from: 'somewhere else' }]);

  expect(page.includedFiles).toEqual(new Set(['somewhere']));
});

test('Page#collectIncludedFiles collects nothing', () => {
  const page = new Page({});
  page.collectIncludedFiles([]);

  expect(page.includedFiles).toEqual(new Set());
});

test('Page#collectPluginSources collects correct sources', () => {
  const page = new Page({
    sourcePath: path.resolve('/root/index.md'),
    plugins: { testPlugin: COLLECT_PLUGIN_TEST_PLUGIN },
    pluginsContext: { testPlugin: {} },
  });
  page.collectPluginSources(COLLECT_PLUGIN_SOURCES);

  const EXPECTED_SOURCE_FILES = new Set([
    // source files from { sources: [...] }
    path.resolve('/root/paths/here/should/be/resolved/relative/to/processed/page.cpp'),
    path.resolve('/except/absolute/sources.c'),
    // source files found from provided { tagMap: [[tag, srcAttr], ...] }
    path.resolve('/root/images/sample1.png'),
    path.resolve('/root/subdir/images/sample2.png'),
    path.resolve('/root/subdir2/sample3.png'),
    path.resolve('/root/images/sample4.png'),
    path.resolve('/absolute/paths/should/not/be/rewritten.png'),
  ]);

  expect(page.pluginSourceFiles).toEqual(EXPECTED_SOURCE_FILES);
});
