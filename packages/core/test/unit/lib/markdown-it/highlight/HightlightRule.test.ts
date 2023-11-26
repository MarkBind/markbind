import { HighlightRule, HIGHLIGHT_TYPES } from '../../../../../src/lib/markdown-it/highlight/HighlightRule';
import { HighlightRuleComponent } from '../../../../../src/lib/markdown-it/highlight/HighlightRuleComponent';

describe('parseAllRules', () => {
  test('parses multiple rules correctly', () => {
    const allRules = '3,4-5';
    const rules = HighlightRule.parseAllRules(allRules, 0, 'line1\nline2\nline3\nline4\nline5');
    expect(rules).toHaveLength(2);
    expect(rules[0]).toBeInstanceOf(HighlightRule);
    expect(rules[1]).toBeInstanceOf(HighlightRule);
  });

  test('ignores invalid rules', () => {
    const allRules = 'invalid,3-4';
    const rules = HighlightRule.parseAllRules(allRules, 0, 'line1\nline2\nline3\nline4');
    expect(rules).toHaveLength(1); // Only one valid rule
  });
});

describe('splitByChar', () => {
  test('splits string correctly', () => {
    const splitResult = HighlightRule.splitByChar('3-4,5', ',');
    expect(splitResult).toEqual(['3-4', '5']);
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
  const rules = HighlightRule.parseAllRules('3-4', 0, 'line1\nline2\nline3\nline4\nline5');
  const rule = rules[0];

  test('returns true within the line range', () => {
    expect(rule.shouldApplyHighlight(3)).toBeTruthy();
    expect(rule.shouldApplyHighlight(4)).toBeTruthy();
  });

  test('returns false outside the line range', () => {
    expect(rule.shouldApplyHighlight(2)).toBeFalsy();
    expect(rule.shouldApplyHighlight(5)).toBeFalsy();
  });
});

describe('getHighlightType', () => {
  // Assuming rules are parsed correctly in these tests
  const rules = HighlightRule.parseAllRules('3,4[1:5]', 0, 'line1\nline2\nline3\nline4\nline5');
  const wholeLineRule = rules[0];
  const partialTextRule = rules[1];

  test('returns WholeText for single line', () => {
    const { highlightType } = wholeLineRule.getHighlightType(3);
    expect(highlightType).toBe(HIGHLIGHT_TYPES.WholeText);
  });

  test('returns PartialText for bounded slice', () => {
    const { highlightType, bounds } = partialTextRule.getHighlightType(4);
    expect(highlightType).toBe(HIGHLIGHT_TYPES.PartialText);
    expect(bounds).toEqual([[1, 5]]);
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
