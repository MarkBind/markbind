const markdownIt = require('markdown-it')()
  .use(require('../../src/lib/markbind/src/lib/markdown-it/markdown-it-icons'));

test('markdown-it-icons renders icon syntax correctly', () => {
  const source = ':fab-font-awesome: :glyphicon-home:';

  const result = markdownIt.renderInline(source);
  const expected = [
    '<span aria-hidden="true" class="fab fa-font-awesome"></span>',
    '<span aria-hidden="true" class="glyphicon glyphicon-home"></span>',
  ].join(' ');

  expect(result).toEqual(expected);
});

test('markdown-it-icons renders icon syntax in multi-line source correctly', () => {
  const source = [
    'text with special characters: before icons',
    ':fab-font-awesome:',
    'text with special characters: between icons',
    ':glyphicon-home:',
    'text with special characters: after icons',
  ].join('\n');

  const result = markdownIt.renderInline(source);
  const expected = [
    'text with special characters: before icons',
    '<span aria-hidden="true" class="fab fa-font-awesome"></span>',
    'text with special characters: between icons',
    '<span aria-hidden="true" class="glyphicon glyphicon-home"></span>',
    'text with special characters: after icons',
  ].join('\n');

  expect(result).toEqual(expected);
});
