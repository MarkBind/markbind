import markdownIt from 'markdown-it';

const createDoubleDelimiterInlineRule
  = require('../../../../../src/lib/markdown-it/plugins/markdown-it-double-delimiter');

describe('markdown-it-double-delimiter plugin', () => {
  let md: markdownIt;

  beforeEach(() => {
    md = markdownIt();
  });

  describe('dimmed text (%%)', () => {
    beforeEach(() => {
      md.use(createDoubleDelimiterInlineRule('%%', 'dimmed', 'emphasis'));
    });

    test('should render dimmed text with various scenarios', () => {
      expect(md.renderInline('%%dimmed text%%')).toBe('<span class="dimmed">dimmed text</span>');
      expect(md.renderInline('%%first%% normal %%second%%'))
        .toBe('<span class="dimmed">first</span> normal <span class="dimmed">second</span>');
      expect(md.renderInline('%single%')).toBe('%single%');
      expect(md.renderInline('%%%%%text%%%%%'))
        .toBe('%<span class="dimmed"><span class="dimmed">text</span></span>%');
      expect(md.renderInline('%%**bold** text%%'))
        .toBe('<span class="dimmed"><strong>bold</strong> text</span>');
    });
  });

  describe('underline text (!!)', () => {
    beforeEach(() => {
      md.use(createDoubleDelimiterInlineRule('!!', 'underline', 'emphasis'));
    });

    test('should render underline text correctly', () => {
      expect(md.renderInline('!!underlined text!!')).toBe('<span class="underline">underlined text</span>');
      const emptyResult = md.renderInline('!!!!');
      expect(emptyResult).toContain('!');
    });
  });

  describe('large text (++)', () => {
    beforeEach(() => {
      md.use(createDoubleDelimiterInlineRule('++', 'large', 'emphasis'));
    });

    test('should render large text with multiple sections', () => {
      expect(md.renderInline('++large text++')).toBe('<span class="large">large text</span>');
      expect(md.renderInline('Normal ++large++ normal ++also large++ text'))
        .toBe('Normal <span class="large">large</span> normal <span class="large">also large</span> text');
    });
  });

  describe('small text (--)', () => {
    beforeEach(() => {
      md.use(createDoubleDelimiterInlineRule('--', 'small', 'emphasis'));
    });

    test('should render small text with whitespace handling', () => {
      expect(md.renderInline('--small text--')).toBe('<span class="small">small text</span>');
      const spacedResult = md.renderInline('--  spaced text  --');
      expect(spacedResult).toContain('spaced text');
    });
  });

  describe('multiple plugins together', () => {
    beforeEach(() => {
      md.use(createDoubleDelimiterInlineRule('%%', 'dimmed', 'emphasis'))
        .use(createDoubleDelimiterInlineRule('!!', 'underline', 'dimmed'))
        .use(createDoubleDelimiterInlineRule('++', 'large', 'underline'))
        .use(createDoubleDelimiterInlineRule('--', 'small', 'large'));
    });

    test('should handle all delimiter types and nesting', () => {
      expect(md.renderInline('%%dimmed%% !!underline!! ++large++ --small--'))
        .toBe(
          '<span class="dimmed">dimmed</span> '
          + '<span class="underline">underline</span> '
          + '<span class="large">large</span> '
          + '<span class="small">small</span>');
      expect(md.renderInline('++large with !!underlined!! text++'))
        .toBe('<span class="large">large with <span class="underline">underlined</span> text</span>');
      const adjacentResult = md.renderInline('%%dimmed%%%%underline%%');
      expect(adjacentResult).toContain('dimmed');
      expect(adjacentResult).toContain('underline');
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      md.use(createDoubleDelimiterInlineRule('%%', 'dimmed', 'emphasis'));
    });

    test('should handle various edge cases', () => {
      expect(md.renderInline('%%unclosed delimiter')).toBe('%%unclosed delimiter');
      expect(md.renderInline('%%text%%')).toBe('<span class="dimmed">text</span>');
      expect(md.renderInline('%%multi\nline\ntext%%')).toBe('<span class="dimmed">multi\nline\ntext</span>');
      expect(md.renderInline('%%text with & < > " \' characters%%'))
        .toBe('<span class="dimmed">text with &amp; &lt; &gt; &quot; \' characters</span>');
    });
  });
});
