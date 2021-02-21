const { HighlightRuleComponent } = require('./HighlightRuleComponent.js');

class HighlightRule {
  constructor(ruleComponents) {
    /**
     * @type Array<HighlightRuleComponent>
     */
    this.ruleComponents = ruleComponents;
  }

  static parseRule(ruleString) {
    const components = ruleString.split('-').map(HighlightRuleComponent.parseRuleComponent);
    if (components.some(c => !c)) {
      // Not all components are properly parsed, which means
      // the rule itself is not proper
      return null;
    }

    return new HighlightRule(components);
  }

  offsetLines(offset) {
    this.ruleComponents.forEach(comp => comp.offsetLineNumber(offset));
  }

  convertPartsToSlices(lines) {
    if (!this.hasLinePart()) {
      return;
    }

    this.ruleComponents.forEach((comp) => {
      if (!comp.linePart) {
        return;
      }

      const line = lines[comp.lineNumber - 1]; // line numbers are 1-based
      const { 1: content } = HighlightRule._splitCodeAndIndentation(line);
      comp.convertPartToSlice(content);
    });
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
    if (this.isLineRange()) {
      const [startCompare, endCompare] = this.ruleComponents.map(comp => comp.compareLine(lineNumber));

      // For cases like 2[:]-3 (or 2-3[:]), the highlight would be line highlight
      // across all the ranges
      const shouldWholeLine = this.ruleComponents.some(comp => comp.isUnboundedSlice());
      if (shouldWholeLine) {
        return HighlightRule._highlightWholeLine(line);
      }

      if (startCompare < 0 && endCompare > 0) {
        // In-between range
        return HighlightRule._highlightWholeText(line);
      }

      // At the range boundaries
      const [start, end] = this.ruleComponents;
      const appliedRule = startCompare === 0 ? start : end;

      // Instead of redefining how to highlight according to the rule (which is already laid
      // out on the next few cases), we create a new HighlightRule consisting of only the applied
      // rule and call apply again
      return new HighlightRule([appliedRule]).applyHighlight(line, lineNumber);
    }

    const isLineSlice = this.ruleComponents.length === 1 && this.ruleComponents[0].isSlice;
    if (isLineSlice) {
      const [slice] = this.ruleComponents;
      return slice.isUnboundedSlice()
        ? HighlightRule._highlightWholeLine(line)
        : HighlightRule._highlightPartOfText(line, slice.computeLineBounds(line));
    }

    // Line number only
    return HighlightRule._highlightWholeText(line);
  }

  static _highlightWholeLine(codeStr) {
    return `<span class="highlighted">${codeStr}\n</span>`;
  }

  static _splitCodeAndIndentation(codeStr) {
    const codeStartIdx = codeStr.search(/\S|$/);
    const indents = codeStr.substr(0, codeStartIdx);
    const content = codeStr.substr(codeStartIdx);
    return [indents, content];
  }

  static _highlightWholeText(codeStr) {
    const [indents, content] = HighlightRule._splitCodeAndIndentation(codeStr);
    return `<span>${indents}<span class="highlighted">${content}</span>\n</span>`;
  }

  static _highlightPartOfText(codeStr, bounds) {
    const { 0: indents } = HighlightRule._splitCodeAndIndentation(codeStr);
    const correctedBounds = bounds.map(bound => bound.map(x => x + indents.length));
    // Note: As part-of-text highlighting requires walking over the node of the generated
    // html by highlight.js, highlighting will be applied in NodeProcessor instead.
    // hl-data is used to pass over the bounds.
    const dataStr = correctedBounds.map(bound => bound.join('-')).join(',');
    return `<span hl-data=${dataStr}>${codeStr}\n</span>`;
  }

  isLineRange() {
    return this.ruleComponents.length === 2;
  }

  hasLinePart() {
    return this.ruleComponents.some(rule => rule.linePart);
  }
}

module.exports = {
  HighlightRule,
};
