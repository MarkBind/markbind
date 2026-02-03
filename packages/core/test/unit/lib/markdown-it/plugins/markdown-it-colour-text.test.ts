import markdownIt from 'markdown-it';

import { colourTextPlugin } from '../../../../../src/lib/markdown-it/plugins/markdown-it-colour-text';

describe('markdown-it-colour-text plugin', () => {
  let md: markdownIt;

  beforeEach(() => {
    md = markdownIt();
    md.use(colourTextPlugin);
  });

  test('should render all supported colors correctly', () => {
    const colorTests = [
      { input: '#r#red text##', expected: '<span class="mkb-text-red">red text</span>' },
      { input: '#g#green text##', expected: '<span class="mkb-text-green">green text</span>' },
      { input: '#b#blue text##', expected: '<span class="mkb-text-blue">blue text</span>' },
      { input: '#c#cyan text##', expected: '<span class="mkb-text-cyan">cyan text</span>' },
      { input: '#m#magenta text##', expected: '<span class="mkb-text-magenta">magenta text</span>' },
      { input: '#y#yellow text##', expected: '<span class="mkb-text-yellow">yellow text</span>' },
      { input: '#k#black text##', expected: '<span class="mkb-text-black">black text</span>' },
      { input: '#w#white text##', expected: '<span class="mkb-text-white">white text</span>' },
    ];

    colorTests.forEach(({ input, expected }) => {
      expect(md.renderInline(input)).toBe(expected);
    });
  });

  test('should handle various content types and formatting', () => {
    // Empty colored text
    expect(md.renderInline('#r###'))
      .toBe('<span class="mkb-text-red"></span>');

    // With whitespace preservation
    expect(md.renderInline('#g#  spaced green text  ##'))
      .toBe('<span class="mkb-text-green">  spaced green text  </span>');

    // Multiline content
    expect(md.renderInline('#b#line one\nline two##'))
      .toBe('<span class="mkb-text-blue">line one\nline two</span>');

    // With nested markdown
    expect(md.renderInline('#r#**bold** red text##'))
      .toBe('<span class="mkb-text-red"><strong>bold</strong> red text</span>');

    // With special characters
    expect(md.renderInline('#r#text with & < > " \' characters##'))
      .toBe('<span class="mkb-text-red">text with &amp; &lt; &gt; &quot; \' characters</span>');

    // With links
    expect(md.renderInline('#r#[red link](https://example.com)##'))
      .toBe('<span class="mkb-text-red"><a href="https://example.com">red link</a></span>');

    // With code
    expect(md.renderInline('#g#some `code` here##'))
      .toBe('<span class="mkb-text-green">some <code>code</code> here</span>');
  });

  test('should handle multiple color sections and complex scenarios', () => {
    // Multiple color sections
    expect(md.renderInline('#r#red## and #b#blue## text'))
      .toBe('<span class="mkb-text-red">red</span> and <span class="mkb-text-blue">blue</span> text');

    // Multiple pairs in same line
    expect(md.renderInline('#r#red## #g#green## #b#blue##'))
      .toBe(
        '<span class="mkb-text-red">red</span> '
        + '<span class="mkb-text-green">green</span> '
        + '<span class="mkb-text-blue">blue</span>');

    // Adjacent color markers
    expect(md.renderInline('#r#red###g#green##'))
      .toBe('<span class="mkb-text-red">red</span><span class="mkb-text-green">green</span>');

    // Nested color text (should process first complete pair)
    const nestedResult = md.renderInline('#r#outer #g#inner## text##');
    expect(nestedResult).toContain('mkb-text-');

    // In block context
    const blockResult = md.render('Paragraph with #r#red text## in it.');
    expect(blockResult).toContain('<span class="mkb-text-red">red text</span>');
  });

  test('should not process invalid or incomplete color syntax', () => {
    const invalidCases = [
      '#r#incomplete', // Missing closing
      '#r#only opening', // Missing closing
      'only closing##', // Missing opening
      '#x#invalid color##', // Invalid color code
      '#r##', // Missing content
      '##text##', // Missing color code
      '#rr#text##', // Invalid color code length
      '#R#text##', // Uppercase color code
      '#1#text##', // Numeric color code
      '#r#text without proper closing #', // Improper closing
    ];

    invalidCases.forEach((testCase) => {
      const result = md.renderInline(testCase);
      expect(result).not.toContain('mkb-text-');
    });
  });
});
