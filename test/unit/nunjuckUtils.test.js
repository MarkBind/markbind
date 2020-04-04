const njUtil = require('../../src/lib/markbind/src/utils/nunjuckUtils');

test('Escaping nunjucks raw tags', () => {
  const escapedString = 'This is a content with escaped data {%raw%} CONTENT {%endraw%}';
  const escapedContent = njUtil.renderRaw(escapedString);

  expect(escapedContent).toBe(escapedString);
});

test('Escaping nunjucks with new lines', () => {
  const escapedString = 'This is a content with escaped data\n {%raw%} \nCONTENT\n {%endraw%}';
  const escapedContent = njUtil.renderRaw(escapedString);

  expect(escapedContent).toBe(escapedString);
});

test('Escaping multiple nunjucks raw tags', () => {
  const escapedString = 'Multiple escapes: {%raw%} first {%endraw%} {%raw%} second {%endraw%}';
  const escapedContent = njUtil.renderRaw(escapedString);

  expect(escapedContent).toBe(escapedString);
});
