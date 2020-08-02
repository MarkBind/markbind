const path = require('path');
const fs = require('fs');
const Parser = require('../../src/Parser');

jest.mock('fs');

afterEach(() => fs.vol.reset());

test('renderFile converts markdown headers to <h1>', async () => {
  const markbinder = new Parser();
  const rootPath = path.resolve('');
  const headerIdMap = {};
  const indexPath = path.resolve('index.md');

  const index = ['# Index'].join('\n');

  const baseUrlMap = new Set([rootPath]);

  const result = await markbinder.render(index, indexPath, {
    baseUrlMap,
    rootPath,
    headerIdMap,
  });

  const expected = [
    '<h1 id="index">Index</h1>',
    '',
  ].join('\n');

  expect(result).toEqual(expected);
});
