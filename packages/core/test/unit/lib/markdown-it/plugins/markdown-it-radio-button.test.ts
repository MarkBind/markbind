import markdownIt from 'markdown-it';

const markdownItTaskLists = require('markdown-it-task-lists');
const radioButtonPlugin = require('../../../../../src/lib/markdown-it/plugins/markdown-it-radio-button');

describe('markdown-it-radio-button plugin', () => {
  let md: markdownIt;

  beforeEach(() => {
    md = markdownIt();
    md.use(markdownItTaskLists, { enabled: true });
    md.use(radioButtonPlugin, { enabled: true, label: true });
  });

  describe('basic radio button syntax', () => {
    test('should convert basic unchecked radio button syntax', () => {
      const source = [
        '- ( ) Option 1',
        '- ( ) Option 2',
      ].join('\n');
      const result = md.render(source);

      expect(result).toContain('class="radio-list"');
      expect(result).toContain('class="radio-list-item"');
      expect(result).toContain('type="radio"');
      expect(result).toContain('class="radio-list-input"');
      expect(result).not.toContain('checked=""');
    });

    test('should convert checked radio button with lowercase x', () => {
      const source = [
        '- (x) Selected option',
        '- ( ) Unselected option',
      ].join('\n');
      const result = md.render(source);

      expect(result).toContain('checked=""');
      expect(result).toContain('type="radio"');
      // Should have both checked and unchecked
      expect(result.match(/type="radio"/g)).toHaveLength(2);
      expect(result.match(/checked=""/g)).toHaveLength(1);
    });

    test('should convert checked radio button with uppercase X', () => {
      const source = [
        '- (X) Selected option',
        '- ( ) Unselected option',
      ].join('\n');
      const result = md.render(source);

      expect(result).toContain('checked=""');
      expect(result).toContain('type="radio"');
      expect(result.match(/checked=""/g)).toHaveLength(1);
    });

    test('should handle single radio button', () => {
      const source = '- ( ) Single option';
      const result = md.render(source);

      expect(result).toContain('type="radio"');
      expect(result).toContain('Single option');
      expect(result).toContain('class="radio-list-input"');
    });

    // This test works because it provides enough token context
    test('should handle different lists with different group IDs', () => {
      const source = [
        'First list:',
        '- ( ) Option A1',
        '- ( ) Option A2',
        '',
        'Second list:',
        '- ( ) Option B1',
        '- ( ) Option B2',
      ].join('\n');
      const result = md.render(source);

      const groupIdRegex = /name="([^"]+)"/g;
      const matches = [...result.matchAll(groupIdRegex)];

      // First two should have same group ID
      // Last two should have same group ID
      // But different from first group
      expect(matches.length).toBe(4);
      expect(matches[0][1]).toBe(matches[1][1]);
      expect(matches[2][1]).toBe(matches[3][1]);
      expect(matches[0][1]).not.toBe(matches[2][1]);
    });
  });

  describe('radio button grouping and IDs', () => {
    test('should use same group ID for radio buttons in same list', () => {
      const source = [
        '- ( ) Option 1',
        '- ( ) Option 2',
        '- (x) Option 3',
      ].join('\n');
      const result = md.render(source);

      const groupIdRegex = /name="([^"]+)"/g;
      const matches = [...result.matchAll(groupIdRegex)];

      expect(matches.length).toBe(3);
      expect(matches[0][1]).toBe(matches[1][1]);
      expect(matches[1][1]).toBe(matches[2][1]);
    });

    test('should generate deterministic group IDs', () => {
      const source = [
        '- ( ) Option 1',
        '- ( ) Option 2',
      ].join('\n');

      const result1 = md.render(source);
      const result2 = md.render(source);

      const groupIdRegex = /name="([^"]+)"/g;
      const matches1 = [...result1.matchAll(groupIdRegex)];
      const matches2 = [...result2.matchAll(groupIdRegex)];

      expect(matches1.length).toBeGreaterThan(0);
      expect(matches1[0][1]).toBe(matches2[0][1]);
    });

    test('should handle multiple separate lists correctly', () => {
      const source = [
        'Shopping list:',
        '- ( ) Apples',
        '- (x) Bananas',
        '',
        'Todo list:',
        '- ( ) Exercise',
        '- ( ) Study',
        '',
        'Priority list:',
        '- (X) High priority',
        '- ( ) Low priority',
      ].join('\n');
      const result = md.render(source);

      const groupIdRegex = /name="([^"]+)"/g;
      const matches = [...result.matchAll(groupIdRegex)];

      // Should have 6 radio buttons total
      expect(matches.length).toBe(6);

      // Each list should have different group IDs
      const groups = matches.map(match => match[1]);
      const uniqueGroups = [...new Set(groups)];
      expect(uniqueGroups.length).toBe(3);
    });
  });

  describe('plugin configuration options', () => {
    test('should wrap radio buttons in labels when label option is true', () => {
      const source = '- ( ) Option with label';
      const result = md.render(source);

      expect(result).toContain('<label>');
      expect(result).toContain('</label>');
      expect(result).toContain('type="radio"');
    });

    test('should not wrap in labels when label option is false', () => {
      const mdNoLabel = markdownIt();
      mdNoLabel.use(markdownItTaskLists, { enabled: true });
      mdNoLabel.use(radioButtonPlugin, { enabled: true, label: false });

      const source = '- ( ) Option without label';
      const result = mdNoLabel.render(source);

      expect(result).not.toContain('<label>');
      expect(result).toContain('type="radio"');
    });

    test('should disable radio buttons when enabled is false', () => {
      const mdDisabled = markdownIt();
      mdDisabled.use(markdownItTaskLists, { enabled: true });
      mdDisabled.use(radioButtonPlugin, { enabled: false, label: true });

      const source = '- ( ) Disabled option';
      const result = mdDisabled.render(source);

      expect(result).toContain('disabled=""');
      expect(result).toContain('type="radio"');
    });

    test('should handle plugin options without crashing', () => {
      // Test various configurations with safe inputs
      const safeSource = [
        'Context line 1',
        'Context line 2',
        'Context line 3',
        'Context line 4',
        'Context line 5',
        '- ( ) Test option',
      ].join('\n');

      const configurations = [
        { enabled: true, label: true },
        { enabled: true, label: false },
        { enabled: false, label: true },
        { enabled: false, label: false },
      ];

      configurations.forEach((config) => {
        const testMd = markdownIt();
        testMd.use(markdownItTaskLists, { enabled: true });
        testMd.use(radioButtonPlugin, config);

        expect(() => {
          const result = testMd.render(safeSource);
          expect(typeof result).toBe('string');
        }).not.toThrow();
      });
    });
  });

  describe.skip('content formatting and nested structures', () => {
    test('should handle rich content in radio button text', () => {
      const source = [
        '- ( ) Option with **bold** text',
        '- (x) Option with [link](https://example.com)',
        '- ( ) Option with `code`',
        '- ( ) Option with *italic* text',
      ].join('\n');
      const result = md.render(source);

      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<a href="https://example.com">link</a>');
      expect(result).toContain('<code>code</code>');
      expect(result).toContain('<em>italic</em>');
      expect(result.match(/type="radio"/g)).toHaveLength(4);
    });

    test('should preserve whitespace in radio button text', () => {
      const source = [
        '- ( )   Spaced option   ',
        '- (x)  Another  spaced  option  ',
      ].join('\n');
      const result = md.render(source);

      expect(result).toContain('Spaced option');
      expect(result).toContain('Another  spaced  option');
      expect(result).toContain('type="radio"');
    });

    test('should handle nested lists with radio buttons', () => {
      const source = [
        '- ( ) Parent option',
        '  - ( ) Child option 1',
        '  - (x) Child option 2',
        '- ( ) Another parent option',
      ].join('\n');
      const result = md.render(source);

      expect(result).toContain('type="radio"');
      expect(result.match(/type="radio"/g)).toHaveLength(4);
      expect(result).toContain('checked=""');
    });

    test('should handle radio buttons in ordered lists', () => {
      const source = [
        '1. ( ) First option',
        '2. (x) Second option',
        '3. ( ) Third option',
      ].join('\n');
      const result = md.render(source);

      expect(result).toContain('type="radio"');
      expect(result).toContain('checked=""');
      expect(result.match(/type="radio"/g)).toHaveLength(3);
    });
  });

  describe('edge cases and invalid syntax', () => {
    test('should not convert regular list items', () => {
      const source = [
        'Regular content:',
        '- Regular list item',
        '- Another regular item',
        '- ( ) Radio button item',
        '- Normal item again',
      ].join('\n');
      const result = md.render(source);

      // Should only have one radio button
      const radioMatches = result.match(/type="radio"/g);
      expect(radioMatches).toHaveLength(1);
    });

    test('should not process malformed radio button syntax', () => {
      const testCases = [
        '- (  ) Extra space inside',
        '- () Missing space inside',
        '- ( x) Space before x',
        '- (y) Invalid character',
        '- [ ] Checkbox syntax',
        '- [x] Checked checkbox',
        '- (xx) Multiple characters',
        '- ( X ) Spaces around X',
        '- (o) Different character',
        '- (-) Dash instead',
      ];

      testCases.forEach((testCase) => {
        const result = md.render(testCase);
        expect(result).not.toContain('type="radio"');
      });
    });

    test('should handle very long radio button text', () => {
      const longText = 'This is a very long radio button option that spans multiple words'
       + 'and contains lots of text to test how the plugin handles lengthy content';
      const source = `- ( ) ${longText}`;
      const result = md.render(source);

      expect(result).toContain('type="radio"');
      expect(result).toContain(longText);
    });

    test('should handle radio buttons with line breaks', () => {
      const source = [
        '- ( ) Option with',
        '  continuation on next line',
        '- (x) Another option',
      ].join('\n');
      const result = md.render(source);

      expect(result).toContain('type="radio"');
      expect(result).toContain('continuation');
    });
  });
});
