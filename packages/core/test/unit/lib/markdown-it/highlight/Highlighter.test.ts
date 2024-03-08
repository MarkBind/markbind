import { Highlighter } from '../../../../../src/lib/markdown-it/highlight/Highlighter';

describe('highlightWholeLine', () => {
  test('wraps code in highlighted span', () => {
    const code = 'const x = 10;';
    const result = Highlighter.highlightWholeLine(code);
    expect(result).toBe('<span class="highlighted">const x = 10;\n</span>');
  });
});

describe('highlightWholeText', () => {
  test('highlights non-indented part of code', () => {
    const code = '    const x = 10;';
    const result = Highlighter.highlightWholeText(code);
    expect(result).toBe('<span>    <span class="highlighted">const x = 10;</span>\n</span>');
  });

  test('handles code with no indentation correctly', () => {
    const code = 'const x = 10;';
    const result = Highlighter.highlightWholeText(code);
    expect(result).toBe('<span><span class="highlighted">const x = 10;</span>\n</span>');
  });
});

describe('highlightPartOfText', () => {
  test('sets hl-data attribute with merged bounds', () => {
    const code = 'const x = 10;';
    const bounds: Array<[number, number]> = [[0, 4], [8, 10]];
    const result = Highlighter.highlightPartOfText(code, bounds);
    expect(result).toBe('<span hl-data=0-4,8-10>const x = 10;\n</span>');
  });

  test('handles non-overlapping bounds correctly', () => {
    const code = 'const x = 10;';
    const bounds: Array<[number, number]> = [[0, 4], [10, 14]];
    const result = Highlighter.highlightPartOfText(code, bounds);
    expect(result).toBe('<span hl-data=0-4,10-14>const x = 10;\n</span>');
  });
});
