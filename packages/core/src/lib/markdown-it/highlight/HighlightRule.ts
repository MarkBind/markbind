import { HighlightRuleComponent } from './HighlightRuleComponent';

export enum HIGHLIGHT_TYPES {
  WholeLine,
  WholeText,
  PartialText,
}

// Define color mappings
const COLOR_MAPPING: { [key: string]: string } = {
  r: 'red',
  g: 'green',
  b: 'blue',
  c: 'cyan',
  m: 'magenta',
  y: 'yellow',
  k: 'black',
  w: 'white',
};

export class HighlightRule {
  ruleComponents: HighlightRuleComponent[];
  color?: string;
  constructor(ruleComponents: HighlightRuleComponent[], color?: string) {
    this.ruleComponents = ruleComponents;
    this.color = color;
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
    // Split by @ (e.g "1[:]@blue" -> ["1[:]", "blue"])
    const [rulePart, inputColor] = ruleString.split('@');

    const components = this.splitByChar(rulePart, '-')
      .map(compString => HighlightRuleComponent.parseRuleComponent(compString, lineOffset, lines));
    if (components.some(c => !c)) {
      // Not all components are properly parsed, which means
      // the rule itself is not proper
      return null;
    }

    const color: string = inputColor && COLOR_MAPPING[inputColor] ? COLOR_MAPPING[inputColor] : inputColor;
    return new HighlightRule(components as HighlightRuleComponent[], color);
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
    highlightType: HIGHLIGHT_TYPES;
    bounds: Array<[number, number]> | null;
    color?: string;
  }[] {
    const results: {
      highlightType: HIGHLIGHT_TYPES;
      bounds: Array<[number, number]> | null;
      color?: string;
    }[] = [];

    // Handle line range logic if this is a line range
    if (this.isLineRange()) {
      const lineRangeResults = this.handleLineRange(lineNumber);
      results.push(...lineRangeResults);
    }

    // Now, handle rule components
    const ruleComponentResults = this.handleRuleComponent(lineNumber);
    results.push(...ruleComponentResults);

    return results;
  }

  handleLineRange(lineNumber: number): {
    highlightType: HIGHLIGHT_TYPES;
    bounds: Array<[number, number]> | null;
    color?: string;
  }[] {
    const results: {
      highlightType: HIGHLIGHT_TYPES;
      bounds: Array<[number, number]> | null;
      color?: string;
    }[] = [];
    const [startRule, endRule] = this.ruleComponents;
    const startLine = startRule.lineNumber;
    const endLine = endRule.lineNumber;

    if (lineNumber >= startLine && lineNumber <= endLine) {
      // If any component is an unbounded slice, highlight the whole line
      if (startRule.isUnboundedSlice() || endRule.isUnboundedSlice()) {
        results.push({
          highlightType: HIGHLIGHT_TYPES.WholeLine,
          bounds: null,
          color: this.color,
        });
      } else if (lineNumber === startLine || lineNumber === endLine) {
        // Apply the rule component for the start or end line
        const appliedRule = lineNumber === startLine ? startRule : endRule;

        if (appliedRule.isSlice && appliedRule.bounds.length > 0) {
          // If the rule has bounds, it's a PartialText highlight
          results.push({
            highlightType: HIGHLIGHT_TYPES.PartialText,
            bounds: appliedRule.bounds,
            color: this.color,
          });
        } else {
          results.push({
            highlightType: HIGHLIGHT_TYPES.WholeText,
            bounds: null,
            color: this.color,
          });
        }
      } else {
        // For lines within the range (not at the boundaries), apply WholeText
        results.push({
          highlightType: HIGHLIGHT_TYPES.WholeText,
          bounds: null,
          color: this.color,
        });
      }
    }
    return results;
  }

  handleRuleComponent(lineNumber: number): {
    highlightType: HIGHLIGHT_TYPES;
    bounds: Array<[number, number]> | null;
    color?: string;
  }[] {
    const results: {
      highlightType: HIGHLIGHT_TYPES;
      bounds: Array<[number, number]> | null;
      color?: string;
    }[] = [];
    // Iterate over all rule components to find matches for the current line
    this.ruleComponents.forEach((ruleComponent) => {
      if (ruleComponent.compareLine(lineNumber) === 0) {
        if (ruleComponent.isSlice) {
          let highlightType;

          if (ruleComponent.isUnboundedSlice()) {
            highlightType = HIGHLIGHT_TYPES.WholeLine;
          } else if (ruleComponent.bounds.length > 0) {
            highlightType = HIGHLIGHT_TYPES.PartialText;
          } else {
            highlightType = HIGHLIGHT_TYPES.WholeText;
          }

          results.push({
            highlightType,
            bounds: ruleComponent.isUnboundedSlice() ? null : ruleComponent.bounds,
            color: this.color,
          });
        } else {
          results.push({
            highlightType: HIGHLIGHT_TYPES.WholeText,
            bounds: null,
            color: this.color,
          });
        }
      }
    });

    return results;
  }

  isLineRange() {
    return this.ruleComponents.length === 2;
  }
}
