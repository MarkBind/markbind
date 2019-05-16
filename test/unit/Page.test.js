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
