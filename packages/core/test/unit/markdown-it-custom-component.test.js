const markdownIt = require('../../src/lib/markdown-it');
const { injectTags } = require('../../src/lib/markdown-it/patches/custom-component/customComponentPlugin');

test('markdown-it parsing minimized panel as inline/block element', () => {
  injectTags([]); // init custom component plugin

  const initSource = (tag) => {
    const source = [
      'markdown pre text **immediately** prepend a component, without an empty line after',
      tag,
      'line 1 which behaves as per normal ( empty line still counts )\n',
      'lines 3 onward are placed outside of the component',
      '...',
      '...',
      '</panel>',
    ];

    return source.join('\n');
  };

  const tag1 = '<panel minimized>'; // should be rendered as inline element
  const tag2 = '<panel alt="hi" header="hi" minimized>'; // should be rendered as inline element
  const tag3 = '<panel alt="hi" minimized header="hi">'; // should be rendered as inline element
  const tag4 = '<panel minimized alt="hi" header="hi">'; // should be rendered as inline element
  const tag5 = '<panel alt="hi" header="hi">'; // should be rendered as block element

  const test1 = initSource(tag1);
  const result1 = markdownIt.render(test1);
  const expected1 = [
    '<p>markdown pre text <strong>immediately</strong> prepend a component, without an empty line after',
    '<panel minimized>',
    'line 1 which behaves as per normal ( empty line still counts )</p>',
    '<p>lines 3 onward are placed outside of the component',
    '...',
    '...</p>',
    '</panel>',
  ].join('\n');

  expect(result1).toEqual(expected1);

  const test2 = initSource(tag2);
  const result2 = markdownIt.render(test2);
  const expected2 = [
    '<p>markdown pre text <strong>immediately</strong> prepend a component, without an empty line after',
    '<panel alt="hi" header="hi" minimized>',
    'line 1 which behaves as per normal ( empty line still counts )</p>',
    '<p>lines 3 onward are placed outside of the component',
    '...',
    '...</p>',
    '</panel>',
  ].join('\n');

  // "<p>markdown pre text <strong>immediately</strong> prepending a component, without an empty line after\n
  // <panel alt=\"hi\" header=\"hi\" minimized>\n
  // line 1 which behaves as per normal ( empty line still counts )</p>\n
  // <p>lines 3 onward are 'placed' outside of the component\n
  // ...\n
  // ...</p>\n
  // </panel>"

  expect(result2).toEqual(expected2);

  const test3 = initSource(tag3);
  const result3 = markdownIt.render(test3);
  const expected3 = [
    '<p>markdown pre text <strong>immediately</strong> prepend a component, without an empty line after',
    '<panel alt="hi" minimized header="hi">',
    'line 1 which behaves as per normal ( empty line still counts )</p>',
    '<p>lines 3 onward are placed outside of the component',
    '...',
    '...</p>',
    '</panel>',
  ].join('\n');

  expect(result3).toEqual(expected3);

  const test4 = initSource(tag4);
  const result4 = markdownIt.render(test4);
  const expected4 = [
    '<p>markdown pre text <strong>immediately</strong> prepend a component, without an empty line after',
    '<panel minimized alt="hi" header="hi">',
    'line 1 which behaves as per normal ( empty line still counts )</p>',
    '<p>lines 3 onward are placed outside of the component',
    '...',
    '...</p>',
    '</panel>',
  ].join('\n');

  expect(result4).toEqual(expected4);

  const test5 = initSource(tag5);
  const result5 = markdownIt.render(test5);
  const expected5 = [
    '<p>markdown pre text <strong>immediately</strong> prepend a component, without an empty line after</p>',
    '<panel alt="hi" header="hi">',
    'line 1 which behaves as per normal ( empty line still counts )',
    '<p>lines 3 onward are placed outside of the component',
    '...',
    '...</p>',
    '</panel>',
  ].join('\n');

  expect(result5).toEqual(expected5);
});
