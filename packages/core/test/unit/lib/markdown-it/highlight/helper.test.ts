import {
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
