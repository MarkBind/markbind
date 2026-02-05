import { HighlightRule, HIGHLIGHT_TYPES } from '../../../../../src/lib/markdown-it/highlight/HighlightRule';
import { HighlightRuleComponent } from '../../../../../src/lib/markdown-it/highlight/HighlightRuleComponent';

describe('parseAllRules', () => {
  test('parses multiple rules correctly', () => {
    const allRules = '3,4-5';
    const rules = HighlightRule.parseAllRules(allRules, 0, 'line1\nline2\nline3\nline4\nline5\n');
    expect(rules).toHaveLength(2);
    expect(rules[0]).toBeInstanceOf(HighlightRule);
    expect(rules[0].getHighlightType(3)[0].highlightType).toBe(HIGHLIGHT_TYPES.WholeText);
    expect(rules[1]).toBeInstanceOf(HighlightRule);
    expect(rules[1].getHighlightType(4)[0].highlightType).toBe(HIGHLIGHT_TYPES.WholeText);
    expect(rules[1].getHighlightType(5)[0].highlightType).toBe(HIGHLIGHT_TYPES.WholeText);
  });

  test('ignores invalid rules', () => {
    const allRules = 'invalid,3-4';
    const rules = HighlightRule.parseAllRules(allRules, 0, 'line1\nline2\nline3\nline4\n');
    expect(rules).toHaveLength(1);
    expect(rules[0].getHighlightType(3)[0].highlightType).toBe(HIGHLIGHT_TYPES.WholeText);
    expect(rules[0].getHighlightType(4)[0].highlightType).toBe(HIGHLIGHT_TYPES.WholeText);
  });
});

describe('splitByChar', () => {
  test('splits string correctly', () => {
    const splitResult = HighlightRule.splitByChar('3-4,5', ',');
    expect(splitResult).toEqual(['3-4', '5']);
  });

  test('ignores commas inside quoted strings', () => {
    const splitResult = HighlightRule.splitByChar("3-4,'5,6',7", ',');
    expect(splitResult).toEqual(['3-4', "'5,6'", '7']);
  });

  test('handles escaped quotes in strings', () => {
    const splitResult = HighlightRule.splitByChar("3-4,'5\\',6',7", ',');
    expect(splitResult).toEqual(['3-4', "'5\\',6'", '7']);
  });
});

describe('parseRule', () => {
  test('parses a valid rule correctly', () => {
    const rule = HighlightRule.parseRule('3-4', 0, ['line1', 'line2', 'line3', 'line4']);
    expect(rule).toBeInstanceOf(HighlightRule);
    const castedRule = rule as HighlightRule;
    expect(castedRule.ruleComponents).toHaveLength(2);
  });

  test('returns null for an invalid rule', () => {
    const rule = HighlightRule.parseRule('invalid', 0, ['line1', 'line2']);
    expect(rule).toBeNull();
  });
});

describe('shouldApplyHighlight', () => {
  const rules = HighlightRule.parseAllRules('3-4', 0, 'line1\nline2\nline3\nline4\nline5\n');
  const rule = rules[0];

  const singleLineRules = HighlightRule.parseAllRules('3', 0, 'line1\nline2\nline3\nline4\n');
  const singleLineRule = singleLineRules[0];

  test('returns true within the line range', () => {
    expect(rule.shouldApplyHighlight(3)).toBeTruthy();
    expect(rule.shouldApplyHighlight(4)).toBeTruthy();
  });

  test('returns false outside the line range', () => {
    expect(rule.shouldApplyHighlight(2)).toBeFalsy();
    expect(rule.shouldApplyHighlight(5)).toBeFalsy();
  });

  test('returns true for exact line match', () => {
    expect(singleLineRule.shouldApplyHighlight(3)).toBeTruthy();
  });

  // Here we test boundary values
  test('returns false for other line numbers', () => {
    expect(singleLineRule.shouldApplyHighlight(2)).toBeFalsy();
    expect(singleLineRule.shouldApplyHighlight(4)).toBeFalsy();
  });
});

describe('getHighlightType', () => {
  const rules = HighlightRule.parseAllRules(
    '3,4[1:5],1[:]-2,6-8,9[:]', 0, 'line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\n',
  );
  const wholeTextRule = rules[0];
  const partialTextRule = rules[1];
  const wholeLinesRule = rules[2];
  const wholeTextsRule = rules[3];
  const wholeLineRule = rules[4];

  test('returns WholeLine for two lines', () => {
    expect(wholeLinesRule.getHighlightType(1)[0].highlightType).toBe(HIGHLIGHT_TYPES.WholeLine);
    expect(wholeLinesRule.getHighlightType(2)[0].highlightType).toBe(HIGHLIGHT_TYPES.WholeLine);
  });

  test('returns WholeText for in between lines', () => {
    expect(wholeTextsRule.getHighlightType(7)[0].highlightType).toBe(HIGHLIGHT_TYPES.WholeText);
  });

  test('returns WholeText for single line', () => {
    const { highlightType } = wholeTextRule.getHighlightType(3)[0];
    expect(highlightType).toBe(HIGHLIGHT_TYPES.WholeText);
  });

  test('returns WholeLine for single line', () => {
    expect(wholeLineRule.getHighlightType(9)[0].highlightType).toBe(HIGHLIGHT_TYPES.WholeLine);
  });

  test('returns PartialText for bounded slice', () => {
    const { highlightType, bounds } = partialTextRule.getHighlightType(4)[0];
    expect(highlightType).toBe(HIGHLIGHT_TYPES.PartialText);
    expect(bounds).toEqual([[1, 5]]);
  });

  test('returns WholeText with color mapping', () => {
    const rule = HighlightRule.parseRule('3@r', 0, ['line1', 'line2', 'line3']);
    const result = rule?.getHighlightType(3);
    expect(result?.[0]).toEqual({
      highlightType: HIGHLIGHT_TYPES.WholeText,
      bounds: null,
      color: 'var(--red)',
    });
  });

  test('returns WholeLine for unbounded slice', () => {
    const rule = HighlightRule.parseRule('3[:]', 0, ['line1', 'line2', 'line3']);
    const result = rule?.getHighlightType(3);
    expect(result?.[0]).toEqual({
      highlightType: HIGHLIGHT_TYPES.WholeLine,
      bounds: null,
      color: undefined,
    });
  });

  test('returns PartialText with bounds', () => {
    const rule = HighlightRule.parseRule('3[1:4]@b', 0, ['line1', 'line2', 'line3']);
    const result = rule?.getHighlightType(3);
    expect(result?.[0]).toEqual({
      highlightType: HIGHLIGHT_TYPES.PartialText,
      bounds: [[1, 4]],
      color: 'var(--blue)',
    });
  });
});

describe('handleLineRange', () => {
  test('returns empty array when lineNumber is outside range', () => {
    const rule = new HighlightRule([
      new HighlightRuleComponent(5),
      new HighlightRuleComponent(10),
    ]);
    // Before range
    expect(rule.handleLineRange(3)).toEqual([]);
    // After range
    expect(rule.handleLineRange(12)).toEqual([]);
  });

  test('any component is unbounded slice', () => {
    const startComponent = new HighlightRuleComponent(5);
    startComponent.isSlice = true;
    jest.spyOn(startComponent, 'isUnboundedSlice').mockReturnValue(true);

    const rule = new HighlightRule([
      startComponent,
      new HighlightRuleComponent(10),
    ]);

    // Within range
    const result = rule.handleLineRange(7);
    expect(result).toEqual([
      {
        highlightType: HIGHLIGHT_TYPES.WholeLine,
        bounds: null,
        color: undefined,
      },
    ]);
  });

  test('handles start and end line rules correctly', () => {
    const startComponent = new HighlightRuleComponent(5);
    startComponent.isSlice = true;
    startComponent.bounds = [[1, 3]];

    const endComponent = new HighlightRuleComponent(10);
    endComponent.isSlice = true;
    endComponent.bounds = [[4, 6]];

    const rule = new HighlightRule([startComponent, endComponent]);

    // Test start line
    expect(rule.handleLineRange(5)).toEqual([
      {
        highlightType: HIGHLIGHT_TYPES.PartialText,
        bounds: [[1, 3]],
        color: undefined,
      },
    ]);
  });

  test('returns WholeText for lines within range (not boundaries)', () => {
    const rule = new HighlightRule([
      new HighlightRuleComponent(5),
      new HighlightRuleComponent(10),
    ]);

    expect(rule.handleLineRange(7)).toEqual([
      {
        highlightType: HIGHLIGHT_TYPES.WholeText,
        bounds: null,
        color: undefined,
      },
    ]);
  });
});

describe('handleRuleComponent', () => {
  test('returns empty array when no rule matched lineNumber', () => {
    const component = new HighlightRuleComponent(5);
    jest.spyOn(component, 'compareLine').mockImplementation(n => n - 5);

    const rule = new HighlightRule([component]);

    expect(rule.handleRuleComponent(3)).toEqual([]);
  });

  test('returns WholeLine for unbounded slices', () => {
    const component = new HighlightRuleComponent(5);
    component.isSlice = true;
    jest.spyOn(component, 'isUnboundedSlice').mockReturnValue(true);
    jest.spyOn(component, 'compareLine').mockReturnValue(0);

    const rule = new HighlightRule([component]);

    expect(rule.handleRuleComponent(5)).toEqual([
      {
        highlightType: HIGHLIGHT_TYPES.WholeLine,
        bounds: null,
        color: undefined,
      },
    ]);
  });

  test('returns PartialText for slices with bounds', () => {
    const component = new HighlightRuleComponent(5);
    component.isSlice = true;
    component.bounds = [[1, 3]];
    jest.spyOn(component, 'compareLine').mockReturnValue(0);

    const rule = new HighlightRule([component]);

    expect(rule.handleRuleComponent(5)).toEqual([
      {
        highlightType: HIGHLIGHT_TYPES.PartialText,
        bounds: [[1, 3]],
        color: undefined,
      },
    ]);
  });

  test('returns WholeText for slice with no bounds', () => {
    const component = new HighlightRuleComponent(5);
    component.isSlice = true;
    jest.spyOn(component, 'compareLine').mockReturnValue(0);
    jest.spyOn(component, 'isUnboundedSlice').mockReturnValue(false);

    const rule = new HighlightRule([component]);

    const result = rule.handleRuleComponent(5);
    expect(result).toEqual([
      {
        highlightType: HIGHLIGHT_TYPES.WholeText, // This tests the else branch
        bounds: [],
        color: undefined,
      },
    ]);
  });

  test('returns WholeText for non-slice component', () => {
    const component = new HighlightRuleComponent(5);
    component.isSlice = false;
    jest.spyOn(component, 'compareLine').mockReturnValue(0);

    const rule = new HighlightRule([component]);

    const result = rule.handleRuleComponent(5);
    expect(result).toEqual([
      {
        highlightType: HIGHLIGHT_TYPES.WholeText,
        bounds: null,
        color: undefined,
      },
    ]);
  });
});

describe('isLineRange', () => {
  test('returns true for range', () => {
    const rule = new HighlightRule([new HighlightRuleComponent(3), new HighlightRuleComponent(4)]);
    expect(rule.isLineRange()).toBeTruthy();
  });

  test('returns false for single line', () => {
    const rule = new HighlightRule([new HighlightRuleComponent(3)]);
    expect(rule.isLineRange()).toBeFalsy();
  });
});
