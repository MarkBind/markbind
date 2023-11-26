import { HighlightRuleComponent } from '../../../../../src/lib/markdown-it/highlight/HighlightRuleComponent';

describe('parseRuleComponent', () => {
  // Test for valid line-part syntax
  test('parses line-part syntax correctly', () => {
    const result = HighlightRuleComponent.parseRuleComponent(
      '3["some text"]', 0,
      ['line1', 'line2', 'some text'],
    );
    expect(result).toBeInstanceOf(HighlightRuleComponent);
    const castedResult = result as HighlightRuleComponent;
    expect(castedResult.lineNumber).toEqual(3);
    expect(castedResult.isSlice).toBe(true);
  });

  // Test for valid line-slice character syntax
  test('parses line-slice character syntax correctly', () => {
    const result = HighlightRuleComponent.parseRuleComponent(
      '2[1:4]', 0,
      ['line1', 'line2 is longer', 'line3'],
    );
    expect(result).toBeInstanceOf(HighlightRuleComponent);
    const castedResult = result as HighlightRuleComponent;
    expect(castedResult.lineNumber).toEqual(2);
    expect(castedResult.isSlice).toBe(true);
  });

  // Test for invalid line-part format
  test('returns null for invalid line-part format', () => {
    const result = HighlightRuleComponent.parseRuleComponent('invalid["text"]', 0, ['line1', 'line2']);
    expect(result).toBeNull();
  });

  // Test for non-existent line number in line-part syntax
  test('returns null for non-existent line number in line-part syntax', () => {
    const result = HighlightRuleComponent.parseRuleComponent('10["text"]', 0, ['line1', 'line2']);
    expect(result).toBeNull();
  });

  // Test for invalid line-slice format
  test('returns null for invalid line-slice format', () => {
    const result = HighlightRuleComponent.parseRuleComponent('2[abc:def]', 0, ['line1', 'line2']);
    expect(result).toBeNull();
  });

  // Test for invalid line number
  test('returns null for invalid line number', () => {
    const result = HighlightRuleComponent.parseRuleComponent('NaN', 0, ['line1', 'line2']);
    expect(result).toBeNull();
  });
});

describe('computeCharBounds', () => {
  // Test for normal bounds
  test('computes character bounds correctly', () => {
    const bounds = HighlightRuleComponent.computeCharBounds([2, 5], '  some text');
    expect(bounds).toEqual([4, 7]);
  });

  // Test for unbounded start
  test('handles unbounded start correctly', () => {
    const bounds = HighlightRuleComponent.computeCharBounds([-1, 4], '  some text');
    expect(bounds).toEqual([2, 6]);
  });

  // Test for unbounded end
  test('handles unbounded end correctly', () => {
    const bounds = HighlightRuleComponent.computeCharBounds([3, -1], '  some text');
    expect(bounds).toEqual([5, '  some text'.length]);
  });

  // Test for out-of-range bounds
  test('handles out-of-range bounds correctly', () => {
    const bounds = HighlightRuleComponent.computeCharBounds([30, 40], '  some text');
    expect(bounds).toEqual(['  some text'.length, '  some text'.length]);
  });

  // Additional tests...
});

describe('computeWordBounds', () => {
  // Test for normal word bounds
  test('computes word bounds correctly', () => {
    const bounds = HighlightRuleComponent.computeWordBounds([1, 2], '  some text here');
    expect(bounds).toEqual([7, 11]);
  });

  // Test for unbounded start
  test('handles unbounded start correctly', () => {
    const bounds = HighlightRuleComponent.computeWordBounds([-1, 2], '  some text here');
    expect(bounds).toEqual([2, 11]);
  });

  // Test for unbounded end
  test('handles unbounded end correctly', () => {
    const bounds = HighlightRuleComponent.computeWordBounds([1, -1], '  some text here');
    expect(bounds).toEqual([7, '  some text here'.length]);
  });

  // Test for non-existent words
  test('handles non-existent words correctly', () => {
    const bounds = HighlightRuleComponent.computeWordBounds([5, 7], '  some text here');
    expect(bounds).toEqual(['  some text here'.length, '  some text here'.length]);
  });
});

describe('computeWordBounds', () => {
  // Test for normal word bounds
  test('computes word bounds correctly', () => {
    const bounds = HighlightRuleComponent.computeWordBounds([1, 2], '  some text here');
    expect(bounds).toEqual([7, 11]);
  });

  // Test for unbounded start
  test('handles unbounded start correctly', () => {
    const bounds = HighlightRuleComponent.computeWordBounds([-1, 2], '  some text here');
    expect(bounds).toEqual([2, 11]);
  });

  // Test for unbounded end
  test('handles unbounded end correctly', () => {
    const bounds = HighlightRuleComponent.computeWordBounds([1, -1], '  some text here');
    expect(bounds).toEqual([7, '  some text here'.length]);
  });

  // Test for non-existent words
  test('handles non-existent words correctly', () => {
    const bounds = HighlightRuleComponent.computeWordBounds([5, 7], '  some text here');
    expect(bounds).toEqual(['  some text here'.length, '  some text here'.length]);
  });
});

describe('computeLinePartBounds', () => {
  // Test for normal line part
  test('computes line part bounds correctly', () => {
    const bounds = HighlightRuleComponent.computeLinePartBounds('text', '  some text here with text');
    expect(bounds).toEqual([[7, 11], [22, 26]]);
  });

  // Test for non-existent line part
  test('returns empty bounds for non-existent line part', () => {
    const bounds = HighlightRuleComponent.computeLinePartBounds('nonexistent', '  some text here');
    expect(bounds).toEqual([[0, 0]]);
  });

  // Test for empty line part
  test('handles empty line part correctly', () => {
    const bounds = HighlightRuleComponent.computeLinePartBounds('', '  some text here');
    expect(bounds).toEqual([[0, 0]]);
  });
});
