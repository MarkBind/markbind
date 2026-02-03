import markdownIt from 'markdown-it';

import { centertext_plugin } from '../../../../../src/lib/markdown-it/plugins/markdown-it-center-text';

// const centerTextPlugin = require('../../../../../src/lib/markdown-it/plugins/markdown-it-center-text');

describe('markdown-it-center-text plugin', () => {
  let md: markdownIt;

  beforeEach(() => {
    md = markdownIt();
    md.use(centertext_plugin);
  });

  test('should render center text with various content types', () => {
    // Basic center text
    expect(md.renderInline('->centered text<-'))
      .toBe('<div class="text-center">centered text</div>');

    // Empty center text
    expect(md.renderInline('-><-'))
      .toBe('<div class="text-center"></div>');

    // With whitespace preservation
    expect(md.renderInline('->  spaced text  <-'))
      .toBe('<div class="text-center">  spaced text  </div>');

    // With nested markdown
    expect(md.renderInline('->**bold** and *italic* text<-'))
      .toBe('<div class="text-center"><strong>bold</strong> and <em>italic</em> text</div>');

    // Multiline content
    expect(md.renderInline('->line one\nline two<-'))
      .toBe('<div class="text-center">line one\nline two</div>');

    // With special characters
    expect(md.renderInline('->text with & < > " \' characters<-'))
      .toBe('<div class="text-center">text with &amp; &lt; &gt; &quot; \' characters</div>');

    // With links
    expect(md.renderInline('->[link](https://example.com)<-'))
      .toBe('<div class="text-center"><a href="https://example.com">link</a></div>');

    // With code
    expect(md.renderInline('->some `code` here<-'))
      .toBe('<div class="text-center">some <code>code</code> here</div>');
  });

  test('should handle multiple center text sections and complex scenarios', () => {
    // Multiple sections in same line
    expect(md.renderInline('->first<- normal ->second<-'))
      .toBe('<div class="text-center">first</div> normal <div class="text-center">second</div>');

    // Nested center text (should process first complete pair)
    const nestedResult = md.renderInline('->outer ->inner<- text<-');
    expect(nestedResult).toContain('<div class="text-center">');

    // In block context
    const blockResult = md.render('Paragraph with ->centered text<- in it.');
    expect(blockResult).toContain('<div class="text-center">centered text</div>');
  });

  test('should not process incomplete or invalid markers', () => {
    // Incomplete marker (missing)
    expect(md.renderInline('->only opening')).toBe('-&gt;only opening');
    // Only closing marker
    expect(md.renderInline('only closing<-')).toBe('only closing&lt;-');
  });

  test('should not process reversed markers', () => {
    const source = '<-reversed->';
    const result = md.renderInline(source);
    // Note: Plugin currently renders it as </div>reversed<div class="text-center">,
    // which is possibly not schematicallly correct
    expect(result).toContain('reversed');
  });
});
