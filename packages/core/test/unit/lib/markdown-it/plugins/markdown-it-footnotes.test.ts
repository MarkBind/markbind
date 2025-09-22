import markdownIt from 'markdown-it';

const footnotesPlugin = require('../../../../../src/lib/markdown-it/plugins/markdown-it-footnotes');

describe('markdown-it-footnotes plugin', () => {
  let md: markdownIt;

  beforeEach(() => {
    md = markdownIt();
    md.use(footnotesPlugin);
  });

  describe('basic footnotes', () => {
    test('should render basic, named, and multiple footnotes', () => {
      const basicSource = [
        'This is text with footnote[^1].',
        '',
        '[^1]: This is the footnote content.',
      ].join('\n');
      const basicResult = md.render(basicSource);
      expect(basicResult).toContain('footnote-ref');
      expect(basicResult).toContain('footnote-item');
      expect(basicResult).toContain('This is the footnote content.');

      const multipleSource = [
        'Text with first footnote[^1] and second footnote[^2].',
        '[^1]: First footnote content.',
        '[^2]: Second footnote content.',
      ].join('\n');

      const multipleResult = md.render(multipleSource);
      expect(multipleResult).toContain('footnote-ref');
      expect(multipleResult).toContain('First footnote content');
      expect(multipleResult).toContain('Second footnote content');

      const namedSource = [
        'Text with footnote[^named-ref].',
        '',
        '[^named-ref]: This is a named footnote reference.',
      ].join('\n');
      const namedResult = md.render(namedSource);
      expect(namedResult).toContain('footnote-ref');
      expect(namedResult).toContain('named footnote reference');
    });
  });

  describe('complex content footnotes', () => {
    test('should handle rich content and formatting', () => {
      const complexSource = [
        'Text with footnote[^complex].',
        '',
        '[^complex]: This footnote has **bold** text and [a link](https://example.com).',
      ].join('\n');
      const complexResult = md.render(complexSource);
      expect(complexResult).toContain('<strong>bold</strong>');
      expect(complexResult).toContain('<a href="https://example.com">a link</a>');

      const multilineSource = [
        'Text with footnote[^multi].',
        '',
        '[^multi]: This is a multi-line footnote.',
        '',
        '    It has multiple paragraphs.',
        '',
        '    And even more content.',
      ].join('\n');
      const multilineResult = md.render(multilineSource);
      expect(multilineResult).toContain('footnote-item');
      expect(multilineResult).toContain('multi-line footnote');
      expect(multilineResult).toContain('multiple paragraphs');

      const codeSource = [
        'Text with footnote[^code].',
        '',
        '[^code]: This footnote contains code:',
        '',
        '    ```javascript',
        '    const x = 10;',
        '    ```',
      ].join('\n');
      const codeResult = md.render(codeSource);
      expect(codeResult).toContain('footnote-item');
      expect(codeResult).toContain('<code');
      expect(codeResult).toContain('const x = 10;');

      const listSource = [
        'Text with footnote[^list].',
        '',
        '[^list]: This footnote contains a list:',
        '',
        '    1. First item',
        '    2. Second item',
        '    3. Third item',
      ].join('\n');
      const listResult = md.render(listSource);
      expect(listResult).toContain('footnote-item');
      expect(listResult).toContain('<ol>');
      expect(listResult).toContain('First item');
      expect(listResult).toContain('Second item');
    });

    test('should handle inline code and images', () => {
      const inlineCodeSource = [
        'Text with footnote[^inline-code].',
        '',
        '[^inline-code]: This footnote has `inline code`.',
      ].join('\n');
      const inlineCodeResult = md.render(inlineCodeSource);
      expect(inlineCodeResult).toContain('footnote-item');
      expect(inlineCodeResult).toContain('<code>inline code</code>');

      const imageSource = [
        'Text with footnote[^image].',
        '',
        '[^image]: This footnote has an image: ![alt text](image.jpg)',
      ].join('\n');
      const imageResult = md.render(imageSource);
      expect(imageResult).toContain('footnote-item');
      expect(imageResult).toContain('<img');
      expect(imageResult).toContain('alt="alt text"');
      expect(imageResult).toContain('src="image.jpg"');
    });
  });

  describe('footnotes in different contexts', () => {
    test('should handle footnotes in various markdown structures', () => {
      const tableSource = [
        '| Column 1 | Column 2[^table] |',
        '|----------|------------------|',
        '| Data     | More data        |',
        '',
        '[^table]: Footnote in table header.',
      ].join('\n');
      const tableResult = md.render(tableSource);
      expect(tableResult).toContain('<table');
      expect(tableResult).toContain('footnote-ref');
      expect(tableResult).toContain('Footnote in table header');

      const blockquoteSource = [
        '> This is a quote with footnote[^quote].',
        '',
        '[^quote]: Footnote in blockquote.',
      ].join('\n');
      const blockquoteResult = md.render(blockquoteSource);
      expect(blockquoteResult).toContain('<blockquote');
      expect(blockquoteResult).toContain('footnote-ref');
      expect(blockquoteResult).toContain('Footnote in blockquote');

      const nestedSource = [
        '- List item with footnote[^nested]',
        '  - Nested item with footnote[^nested2]',
        '',
        '[^nested]: Footnote for list item.',
        '[^nested2]: Footnote for nested item.',
      ].join('\n');
      const nestedResult = md.render(nestedSource);
      expect(nestedResult).toContain('<ul>');
      expect(nestedResult).toContain('footnote-ref');
      expect(nestedResult).toContain('Footnote for list item');
      expect(nestedResult).toContain('Footnote for nested item');
    });
  });

  describe('edge cases and special handling', () => {
    test('should handle various edge cases gracefully', () => {
      const orderSource = [
        'Text with second footnote[^2] and first footnote[^1].',
        '',
        '[^1]: First footnote content.',
        '[^2]: Second footnote content.',
      ].join('\n');
      const orderResult = md.render(orderSource);
      expect(orderResult).toContain('footnote-ref');
      expect(orderResult).toContain('First footnote content');
      expect(orderResult).toContain('Second footnote content');

      const specialCharsSource = [
        'Text with footnote[^special].',
        '',
        '[^special]: Footnote with & < > " \' characters.',
      ].join('\n');
      const specialCharsResult = md.render(specialCharsSource);
      expect(specialCharsResult).toContain('&amp; &lt; &gt; &quot;');

      const undefinedSource = 'Text with undefined footnote[^undefined].';
      const undefinedResult = md.render(undefinedSource);
      expect(undefinedResult).toContain('<p>Text with undefined footnote[^undefined].</p>');

      const orphanSource = [
        'Some text without footnote references.',
        '',
        '[^orphan]: This footnote has no reference.',
      ].join('\n');
      const orphanResult = md.render(orphanSource);
      expect(orphanResult).toContain('Some text without footnote references');
      expect(orphanResult).not.toContain('footnote-ref');
      expect(orphanResult).not.toContain('footnote-item');

      const popoverSource = [
        'Text with footnote[^popover].',
        '',
        '[^popover]: This footnote should have popover functionality.',
      ].join('\n');
      const popoverResult = md.render(popoverSource);
      expect(popoverResult).toContain('footnote-ref');
      expect(popoverResult).toContain('footnote-item');
    });

    test('should handle docId environment and subId scenarios', () => {
      // Test with docId in environment (covers env.docId branch at line 48)
      const docIdMd = markdownIt();
      docIdMd.use(footnotesPlugin);
      const env = { docId: 'test-doc' };
      const docIdSource = [
        'Text with footnote[^1].',
        '',
        '[^1]: Footnote with docId.',
      ].join('\n');
      const docIdResult = docIdMd.render(docIdSource, env);
      expect(docIdResult).toContain('footnote-ref');
      expect(docIdResult).toContain('-test-doc-');

      // Test multiple references to same footnote (covers subId > 0 at lines 58, 70, 103, 117)
      const multiRefSource = [
        'First reference[^same] and second reference[^same].',
        '',
        '[^same]: Same footnote referenced twice.',
      ].join('\n');
      const multiRefResult = md.render(multiRefSource);
      expect(multiRefResult).toContain('footnote-ref');
      expect(multiRefResult).toContain('Same footnote referenced twice');
      // Should have multiple references to the same footnote
      const refMatches = (multiRefResult.match(/footnote-ref/g) || []).length;
      expect(refMatches).toBeGreaterThan(1);
    });

    test('should handle indented footnote content and tabs', () => {
      // Test footnote with tab indentation (covers line 193-196)
      const tabSource = [
        'Text with footnote[^tab].',
        '',
        '[^tab]: This footnote has content',
        '\t\twith tab indentation.',
        '\t\tMore tab-indented content.',
      ].join('\n');
      const tabResult = md.render(tabSource);
      expect(tabResult).toContain('footnote-item');
      expect(tabResult).toContain('tab indentation');
      expect(tabResult).toContain('More tab-indented content');

      // Test footnote with mixed spaces and content
      const mixedSource = [
        'Text with footnote[^mixed].',
        '',
        '[^mixed]: This footnote has mixed indentation',
        '    with spaces and content',
        '        even more indented content',
      ].join('\n');
      const mixedResult = md.render(mixedSource);
      expect(mixedResult).toContain('footnote-item');
      expect(mixedResult).toContain('mixed indentation');
      expect(mixedResult).toContain('even more indented');
    });

    test('should handle invalid footnote syntax', () => {
      // Test incomplete footnote reference (no closing bracket)
      const incompleteSource = 'Text with incomplete footnote[^incomplete and more text.';
      const incompleteResult = md.render(incompleteSource);
      expect(incompleteResult).toBe('<p>Text with incomplete footnote[^incomplete and more text.</p>\n');

      const endSource = 'Text [^';
      const endResult = md.render(endSource);
      expect(endResult).toBe('<p>Text [^</p>\n');

      const noCaretSource = 'Text with [normal-link].';
      const noCaretResult = md.render(noCaretSource);
      expect(noCaretResult).toBe('<p>Text with [normal-link].</p>\n');
    });

    test('should handle edge cases in footnote parsing', () => {
      // Test empty footnote content to cover more branches
      const emptyRefSource = [
        'Text with empty footnote[^].',
        '',
        '[^]: Empty footnote.',
      ].join('\n');
      const emptyRefResult = md.render(emptyRefSource);
      // Empty footnote references are not processed as valid footnotes
      expect(emptyRefResult).toBe('<p>Text with empty footnote[^].</p>\n<p>[^]: Empty footnote.</p>\n');

      // Test footnote with only whitespace content
      const whitespaceSource = [
        'Text with footnote[^ws].',
        '',
        '[^ws]:    ',
      ].join('\n');
      const whitespaceResult = md.render(whitespaceSource);
      expect(whitespaceResult).toContain('footnote-ref');

      // Test very short footnote reference to cover min length checks
      const shortSource = [
        'Text [^a].',
        '',
        '[^a]: Short.',
      ].join('\n');
      const shortResult = md.render(shortSource);
      expect(shortResult).toContain('footnote-ref');
      expect(shortResult).toContain('Short');
    });
  });
});
