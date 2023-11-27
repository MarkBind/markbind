import {
  collateAllIntervals,
  splitCodeAndIndentation,
} from '../../../../../src/lib/markdown-it/highlight/helper';

test('splitCodeAndIndentation with leading spaces', () => {
  const [indents, content] = splitCodeAndIndentation('    var x = 1;');
  expect(indents).toEqual('    ');
  expect(content).toEqual('var x = 1;');
});

test('splitCodeAndIndentation with no leading spaces', () => {
  const [indents, content] = splitCodeAndIndentation('var x = 1;');
  expect(indents).toEqual('');
  expect(content).toEqual('var x = 1;');
});

test('collateAllIntervals with overlapping intervals', () => {
  const actual = collateAllIntervals([[0, 2], [1, 3], [8, 10]]);
  const expected = [[0, 3], [8, 10]];
  expect(actual).toEqual(expected);
});

test('collateAllIntervals with separate intervals', () => {
  const actual = collateAllIntervals([[0, 2], [3, 5], [8, 10]]);
  const expected = [[0, 2], [3, 5], [8, 10]];
  expect(actual).toEqual(expected);
});

test('collateAllIntervals with nested intervals', () => {
  const actual = collateAllIntervals([[1, 4], [2, 3]]);
  const expected = [[1, 4]];
  expect(actual).toEqual(expected);
});
