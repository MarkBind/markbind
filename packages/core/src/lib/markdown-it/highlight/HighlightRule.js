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
    return new HighlightRule(components);
  }
  
  offsetLines(offset) {
    this.ruleComponents.forEach(comp => comp.offsetLineNumber(offset));
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
  
  applyHighlight(line) {
    const isLineSlice = this.ruleComponents.length === 1 && this.ruleComponents[0].isSlice;
    
    if (this.isLineRange()) {
      const shouldWholeLine = this.ruleComponents.some(comp => comp.isUnboundedSlice());
      return shouldWholeLine
        ? HighlightRule._highlightWholeLine(line)
        : HighlightRule._highlightTextOnly(line);
    }
    
    if (isLineSlice) {
      // TODO: Implement slice-index based highlighting
      return HighlightRule._highlightWholeLine(line);
    }
    
    return HighlightRule._highlightTextOnly(line);
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
  
  static _highlightTextOnly(codeStr) {
    const [indents, content] = HighlightRule._splitCodeAndIndentation(codeStr);
    return `<span>${indents}<span class="highlighted">${content}</span>\n</span>`
  }

  isLineRange() {
    return this.ruleComponents.length === 2;
  }
}

module.exports = {
  HighlightRule
};
