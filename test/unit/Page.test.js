const Page = require('../../lib/Page');

test('Page#collectIncludedFiles collects included files from 1 dependency object', () => {
  const page = new Page({});
  page.collectIncludedFiles([{ to: 'somewhere' }]);

  expect(page.includedFiles).toEqual({ somewhere: true });
});

test('Page#collectIncludedFiles ignores other keys in dependency', () => {
  const page = new Page({});
  page.collectIncludedFiles([{ to: 'somewhere', from: 'somewhere else' }]);

  expect(page.includedFiles).toEqual({ somewhere: true });
});

test('Page#collectIncludedFiles collects nothing', () => {
  const page = new Page({});
  page.collectIncludedFiles([]);

  expect(page.includedFiles).toEqual({});
});
