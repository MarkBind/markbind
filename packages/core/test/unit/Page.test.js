const path = require('path');
const Page = require('../../src/Page');
const {
  COLLECT_PLUGIN_SOURCES,
  COLLECT_PLUGIN_TEST_PLUGIN,
} = require('./Page.data');

test('Page#collectIncludedFiles collects included files from 1 dependency object', () => {
  const sourcePath = process.cwd();
  const page = new Page({ sourcePath });
  page.resetState();
  page.collectIncludedFiles([{ to: 'somewhere' }]);

  expect(page.includedFiles).toEqual(new Set(['somewhere', sourcePath]));
});

test('Page#collectIncludedFiles ignores other keys in dependency', () => {
  const sourcePath = process.cwd();
  const page = new Page({ sourcePath });
  page.resetState();
  page.collectIncludedFiles([{ to: 'somewhere', from: 'somewhere else' }]);

  expect(page.includedFiles).toEqual(new Set(['somewhere', sourcePath]));
});

test('Page#collectIncludedFiles collects nothing', () => {
  const sourcePath = process.cwd();
  const page = new Page({ sourcePath });
  page.resetState();
  page.collectIncludedFiles([]);

  expect(page.includedFiles).toEqual(new Set([sourcePath]));
});

test('Page#collectPluginSources collects correct sources', () => {
  const page = new Page({
    sourcePath: path.resolve('/root/index.md'),
    plugins: { testPlugin: COLLECT_PLUGIN_TEST_PLUGIN },
    pluginsContext: { testPlugin: {} },
  });
  page.resetState();
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
