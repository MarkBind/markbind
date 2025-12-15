/**
 * Higher-level unit tests for MarkBind's markdown-it instance.
 *
 * This test suite validates the complete markdown-it configuration used by MarkBind,
 * including all plugins, custom renderers, and syntax extensions. It tests the full
 * pipeline from markdown input to HTML output.
 *
 * Plugins tested include:
 * - Core markdown-it features (html, linkify)
 * - MarkBind custom plugins (radio buttons, footnotes, icons, etc.)
 * - Third-party plugins (task lists, math, tables, etc.)
 * - Custom syntax highlighting and code rendering
 * - Table enhancements and styling
 */
import markdownIt from '../../../../src/lib/markdown-it';

describe('MarkBind markdown-it integration', () => {
  describe('core configuration and basic rendering', () => {
    test('should have correct core configuration and render basic markdown', () => {
      // Test core options
      expect(markdownIt.options.html).toBe(true);
      expect(markdownIt.options.linkify).toBe(true);
      expect(markdownIt.linkify.test('example.com')).toBe(false); // fuzzy links disabled

      // Test basic markdown rendering
      const basicSource = [
        '# Main Heading',
        '',
        'This is a **bold** and *italic* text with `inline code`.',
        '',
        'Visit https://example.com for more info.',
        '',
        'Text with <span class="custom">HTML</span> tags.',
      ].join('\n');

      const result = markdownIt.render(basicSource);

      expect(result).toContain('<h1>Main Heading</h1>');
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
      expect(result).toContain('<code class="hljs inline no-lang">inline code</code>');
      expect(result).toContain('<a href="https://example.com">https://example.com</a>');
      expect(result).toContain('<span class="custom">HTML</span>');
    });
  });

  describe('enhanced table rendering', () => {
    test('should render tables with MarkBind custom styling and responsive wrapper', () => {
      const tableSource = [
        '| Header 1 | Header 2 | Header 3 |',
        '|----------|----------|----------|',
        '| Cell 1   | Cell 2   | Cell 3   |',
        '| **Bold** | *Italic* | `Code`   |',
      ].join('\n');

      const result = markdownIt.render(tableSource);

      expect(result).toContain('<div class="table-responsive">');
      expect(result).toContain('<table class="markbind-table table table-bordered table-striped">');
      expect(result).toContain('<strong>Bold</strong>');
      expect(result).toContain('<em>Italic</em>');
      expect(result).toContain('<code class="hljs inline no-lang">Code</code>');
      expect(result).toContain('</table></div>');
    });
  });

  describe('advanced code rendering with syntax highlighting', () => {
    test('should render code fences with comprehensive syntax highlighting and attributes', () => {
      // Test basic syntax highlighting
      const basicCode = '```javascript\nconst x = 10;\nfunction test() { return x; }\n```';
      const basicResult = markdownIt.render(basicCode);

      expect(basicResult).toContain('class="hljs javascript"');
      expect(basicResult).toContain('const</span> x = <span class="hljs-number">10</span>');

      // Test code without language
      const plainCode = '```\nplain text content\n```';
      const plainResult = markdownIt.render(plainCode);

      expect(plainResult).toContain('class="hljs"');
      expect(plainResult).toContain('plain text content');

      // Test advanced attributes
      const advancedCode = '```javascript {start-from=5 highlight-lines="1,3" '
        + 'heading="**Advanced** Example"}\nconst x = 10;\nconsole.log(x);'
        + '\nfunction test() { return x; }\n```';
      const advancedResult = markdownIt.render(advancedCode);

      expect(advancedResult).toContain('class="line-numbers hljs javascript"');
      expect(advancedResult).toContain('counter-reset: line 4');
      expect(advancedResult).toContain('<div class="code-block">');
      expect(advancedResult).toContain('<div class="code-block-heading inline-markdown-heading">');
      expect(advancedResult).toContain('<strong>Advanced</strong>');
      expect(advancedResult).toContain('<div class="code-block-content">');
    });
  });

  describe('inline code and advanced features', () => {
    test('should render inline code with and without syntax highlighting', () => {
      const inlineSource = [
        'Here is `const x = 10;`{.javascript} with highlighting.',
        'And here is `plain code` without highlighting.',
        'Also supports `function test() { return true; }`{.typescript} syntax.',
      ].join('\n');

      const result = markdownIt.render(inlineSource);

      expect(result).toContain('<code class="hljs inline javascript">');
      expect(result).toContain('<code class="hljs inline no-lang">plain code</code>');
      expect(result).toContain('<code class="hljs inline typescript">');
    });
  });

  describe('plugin integration and MarkBind extensions', () => {
    test('should integrate MarkBind custom plugins with core markdown features', () => {
      const extensiveSource = [
        '# MarkBind Feature Integration Test',
        '',
        '## Text Styling',
        'Text with %%dimmed%% and !!underlined!! and ++large++ and --small-- text.',
        '',
        '## Colors and Icons',
        '#r#Red text## and #g#green text## with :fab-github: icon.',
        '',
        '## Lists and Tasks',
        '- [x] Completed task',
        '- [ ] Pending task',
        '- Regular list item',
        '',
        '## Mathematics',
        'Inline math: $E = mc^2$ and block math:',
        '$$\\sum_{i=1}^{n} x_i = \\text{total}$$',
        '',
        '## Links and Images',
        'Visit [MarkBind](https://markbind.org) and see ![image](test.jpg).',
      ].join('\n');

      const result = markdownIt.render(extensiveSource);

      // Test double delimiter plugins
      expect(result).toContain('<span class="dimmed">dimmed</span>');
      expect(result).toContain('<span class="underline">underlined</span>');
      expect(result).toContain('<span class="large">large</span>');
      expect(result).toContain('<span class="small">small</span>');

      // Test color text plugin
      expect(result).toContain('<span class="mkb-text-red">Red text</span>');
      expect(result).toContain('<span class="mkb-text-green">green text</span>');

      // Test icons plugin
      expect(result).toContain('class="fab fa-github"');

      // Test task lists (note: actual HTML structure may have spaces)
      expect(result).toContain('type="checkbox"');
      expect(result).toContain('checked=""');

      // Test math rendering
      expect(result).toContain('class="katex"');

      // Test links and images
      expect(result).toContain('<a href="https://markbind.org">MarkBind</a>');
      expect(result).toContain('<img src="test.jpg" alt="image" class="img-fluid">');
    });
  });
});
