import { HighlightRuleComponent } from './HighlightRuleComponent';

export enum HIGHLIGHT_TYPES {
  WholeLine,
  WholeText,
  PartialText,
}

export class HighlightRule {
  ruleComponents: HighlightRuleComponent[];
  constructor(ruleComponents: HighlightRuleComponent[]) {
    this.ruleComponents = ruleComponents;
  }

  static parseAllRules(allRules: string, lineOffset: number, tokenContent: string) {
    const highlightLines = this.splitByChar(allRules, ',');
    const strArray = tokenContent.split('\n');
    strArray.pop(); // removes the last empty string
    return highlightLines
      .map(ruleStr => HighlightRule.parseRule(ruleStr, lineOffset, strArray))
      .filter(rule => rule) as HighlightRule[]; // discards invalid rules
  }

  // this function splits allRules by a splitter while ignoring the splitter if it is within quotes
  static splitByChar(allRules: string, splitter: string) {
    const highlightRules = [];
    let isWithinQuote = false;
    let currentPosition = 0;
    for (let i = 0; i < allRules.length; i += 1) {
      if (allRules.charAt(i) === splitter && !isWithinQuote) {
        highlightRules.push(allRules.substring(currentPosition, i));
        currentPosition = i + 1;
      }
      // Checks if the current character is not an unescaped quotation mark
      if (allRules.charAt(i) === '\'' && (i === 0 || allRules.charAt(i - 1) !== '\\')) {
        isWithinQuote = !isWithinQuote;
      }
    }
    if (currentPosition !== allRules.length) {
      highlightRules.push(allRules.substring(currentPosition));
    }
    return highlightRules;
  }

  static parseRule(ruleString: string, lineOffset: number, lines: string[]) {
    const components = this.splitByChar(ruleString, '-')
      .map(compString => HighlightRuleComponent.parseRuleComponent(compString, lineOffset, lines));

    if (components.some(c => !c)) {
      // Not all components are properly parsed, which means
      // the rule itself is not proper
      return null;
    }

    return new HighlightRule(components as HighlightRuleComponent[]);
  }

  shouldApplyHighlight(lineNumber: number) {
    const compares = this.ruleComponents.map(comp => comp.compareLine(lineNumber));
    if (this.isLineRange()) {
      const withinRangeStart = compares[0] <= 0;
      const withinRangeEnd = compares[1] >= 0;
      return withinRangeStart && withinRangeEnd;
    }

    const atLineNumber = compares[0] === 0;
    return atLineNumber;
  }

  getHighlightType(lineNumber: number): {
    highlightType: HIGHLIGHT_TYPES,
    bounds: Array<[number, number]> | null
  } {
    // Applied rule is the first component until deduced otherwise
    let [appliedRule] = this.ruleComponents;
    if (this.isLineRange()) {
      // For cases like 2[:]-3 (or 2-3[:]), the highlight would be line highlight
      // across all the ranges
      if (this.ruleComponents.some(comp => comp.isUnboundedSlice())) {
        return { highlightType: HIGHLIGHT_TYPES.WholeLine, bounds: null };
      }

      const [startCompare, endCompare] = this.ruleComponents.map(comp => comp.compareLine(lineNumber));
      if (startCompare < 0 && endCompare > 0) {
        // In-between range
        return { highlightType: HIGHLIGHT_TYPES.WholeText, bounds: null };
      }

      const [startRule, endRule] = this.ruleComponents;
      // At the range boundaries
      appliedRule = startCompare === 0 ? startRule : endRule;
    }

    if (appliedRule.isSlice) {
      return appliedRule.isUnboundedSlice()
        ? { highlightType: HIGHLIGHT_TYPES.WholeLine, bounds: null }
        : { highlightType: HIGHLIGHT_TYPES.PartialText, bounds: appliedRule.bounds };
    }
    // Line number only
    return { highlightType: HIGHLIGHT_TYPES.WholeText, bounds: null };
  }

  isLineRange() {
    return this.ruleComponents.length === 2;
  }
}
