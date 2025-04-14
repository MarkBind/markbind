import { Highlighter } from '../../../../../src/lib/markdown-it/highlight/Highlighter';

describe('highlightWholeLine', () => {
  test('wraps code in highlighted span', () => {
    const code = 'const x = 10;';
    const result = Highlighter.highlightWholeLine(code);
    expect(result).toBe('<span class="highlighted">const x = 10;\n</span>');
  });

  test('wrap code with custom color', () => {
    const code = 'const x = 10;';
    const result = Highlighter.highlightWholeLine(code, '#ff0000');
    expect(result).toBe('<span style="background-color:#ff0000;">const x = 10;\n</span>');
  });

  test('handles empty string', () => {
    const code = '';
    const result = Highlighter.highlightWholeLine(code);
    expect(result).toBe('<span class="highlighted">\n</span>');
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

  test('preserves mixed whitespace in indentation', () => {
    const code = '\t  \tconst x = 10;';
    const result = Highlighter.highlightWholeText(code);
    expect(result).toBe('<span>\t  \t<span class="highlighted">const x = 10;</span>\n</span>');
  });

  test('uses custom color when provided', () => {
    const code = 'const x = 10;';
    const result = Highlighter.highlightWholeText(code, '#00ff00');
    expect(result).toBe('<span><span style="background-color:#00ff00;">const x = 10;</span>\n</span>');
  });
});

type ColoredInterval = { bounds: [number, number ], color: string };

describe('highlightPartOfText', () => {
  test('sets hl-data attribute with merged bounds', () => {
    const code = 'const x = 10;';
    const bounds: ColoredInterval[] = [{ bounds: [0, 4], color: 'red' }, { bounds: [8, 10], color: 'blue' }];
    const result = Highlighter.highlightPartOfText(code, bounds);
    expect(result).toBe('<span hl-data="0-4:red,8-10:blue">const x = 10;\n</span>');
  });

  test('handles non-overlapping bounds correctly', () => {
    const code = 'const x = 10;';
    const bounds: ColoredInterval[] = [{ bounds: [0, 4], color: 'red' }, { bounds: [10, 14], color: 'blue' }];
    const result = Highlighter.highlightPartOfText(code, bounds);
    expect(result).toBe('<span hl-data="0-4:red,10-14:blue">const x = 10;\n</span>');
  });

  test('handles tabs in code correctly', () => {
    const code = '\tconst x = 10;';
    const bounds: ColoredInterval[] = [{ bounds: [0, 4], color: 'red' }, { bounds: [8, 10], color: 'blue' }];
    const result = Highlighter.highlightPartOfText(code, bounds);
    expect(result).toBe('<span hl-data="0-4:red,8-10:blue">    const x = 10;\n</span>');
  });

  test('merges overlapping bounds and takes last color', () => {
    const code = 'const x = 10;';
    const bounds: ColoredInterval[] = [
      { bounds: [0, 5], color: 'red' },
      { bounds: [3, 8], color: 'blue' },
      { bounds: [7, 10], color: 'green' },
    ];
    const result = Highlighter.highlightPartOfText(code, bounds);
    expect(result).toBe('<span hl-data="0-10:green">const x = 10;\n</span>');
  });

  test('handles empty bounds array', () => {
    const code = 'const x = 10;';
    const bounds: Array<{ bounds: [number, number], color: string }> = [];
    const result = Highlighter.highlightPartOfText(code, bounds);
    expect(result).toBe('<span hl-data="">const x = 10;\n</span>');
  });

  test('handles multi-line code', () => {
    const code = 'const x = 10;\nconst y = 20;';
    const bounds: ColoredInterval[] = [
      { bounds: [0, 4], color: 'red' },
      { bounds: [15, 19], color: 'blue' },
    ];
    const result = Highlighter.highlightPartOfText(code, bounds);
    const expected = '<span hl-data="0-4:red,15-19:blue">const x = 10;\nconst y = 20;\n</span>';
    expect(result).toBe(expected);
  });

  test('handles empty string', () => {
    const code = '';
    const bounds: ColoredInterval[] = [{ bounds: [0, 4], color: 'red' }];
    const result = Highlighter.highlightPartOfText(code, bounds);
    expect(result).toBe('<span hl-data="0-4:red">\n</span>');
  });
});
