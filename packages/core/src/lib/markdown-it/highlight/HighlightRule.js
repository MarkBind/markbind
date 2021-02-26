const { HighlightRuleComponent } = require('./HighlightRuleComponent.js');
const { splitCodeAndIndentation } = require('./helper');

class HighlightRule {
  constructor(ruleComponents) {
    /**
     * @type Array<HighlightRuleComponent>
     */
    this.ruleComponents = ruleComponents;
  }

  static parseRule(ruleString, lineOffset, lines) {
    const components = ruleString.split('-')
      .map(compString => HighlightRuleComponent.parseRuleComponent(compString, lineOffset, lines));

    if (components.some(c => !c)) {
      // Not all components are properly parsed, which means
      // the rule itself is not proper
      return null;
    }

    return new HighlightRule(components);
  }

  shouldApplyHighlight(lineNumber) {
    const compares = this.ruleComponents.map(comp => comp.compareLine(lineNumber));
    if (this.isLineRange()) {
      const withinRangeStart = compares[0] <= 0;
      const withinRangeEnd = compares[1] >= 0;
      return withinRangeStart && withinRangeEnd;
    }

    const atLineNumber = compares[0] === 0;
    return atLineNumber;
  }

  applyHighlight(line, lineNumber) {
    // Applied rule is the first component until deduced otherwise
    let [appliedRule] = this.ruleComponents;

    if (this.isLineRange()) {
      // For cases like 2[:]-3 (or 2-3[:]), the highlight would be line highlight
      // across all the ranges
      const shouldWholeLine = this.ruleComponents.some(comp => comp.isUnboundedSlice());
      if (shouldWholeLine) {
        return HighlightRule._highlightWholeLine(line);
      }

      const [startCompare, endCompare] = this.ruleComponents.map(comp => comp.compareLine(lineNumber));
      if (startCompare < 0 && endCompare > 0) {
        // In-between range
        return HighlightRule._highlightWholeText(line);
      }

      // At the range boundaries
      const [startRule, endRule] = this.ruleComponents;
      appliedRule = startCompare === 0 ? startRule : endRule;
    }

    if (appliedRule.isSlice) {
      return appliedRule.isUnboundedSlice()
        ? HighlightRule._highlightWholeLine(line)
        : HighlightRule._highlightPartOfText(line, appliedRule.bounds);
    }

    // Line number only
    return HighlightRule._highlightWholeText(line);
  }

  static _highlightWholeLine(codeStr) {
    return `<span class="highlighted">${codeStr}\n</span>`;
  }

  static _highlightWholeText(codeStr) {
    const [indents, content] = splitCodeAndIndentation(codeStr);
    return `<span>${indents}<span class="highlighted">${content}</span>\n</span>`;
  }

  static _highlightPartOfText(codeStr, bounds) {
    // Note: As part-of-text highlighting requires walking over the node of the generated
    // html by highlight.js, highlighting will be applied in NodeProcessor instead.
    // hl-data is used to pass over the bounds.
    const dataStr = bounds.map(bound => bound.join('-')).join(',');
    return `<span hl-data=${dataStr}>${codeStr}\n</span>`;
  }

  isLineRange() {
    return this.ruleComponents.length === 2;
  }
}

module.exports = {
  HighlightRule,
};
