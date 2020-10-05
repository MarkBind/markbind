const { HighlightRuleComponent } = require('./HighlightRuleComponent.js');

class HighlightRule {
  constructor(rule) {
    /**
     * @type Array<HighlightRuleComponent>
     */
    this.rule = rule;
  }

  isLineNumber() {
    return this.rule.length === 1 && this.rule[0].isNumber()
  }
  
  isLineSlice() {
    return this.rule.length === 1 && this.rule[0].isSlice();
  }
  
  isLineRange() {
    if (this.rule.length !== 2) {
      return false;
    }

    const [isFirstNumber, isSecondNumber] = this.rule.map(comp => comp.isNumber());
    const [isFirstSlice, isSecondSlice] = this.rule.map(comp => comp.isSlice());

    return (isFirstNumber || isFirstSlice) && (isSecondNumber || isSecondSlice);
  }
  
  static parseRule(ruleString) {
    const components = ruleString.split('-').map(HighlightRuleComponent.parseRuleComponent);
    return new HighlightRule(components);
  }
  
  offsetLines(offset) {
    this.rule.map(comp => comp.offsetLines(offset));
  }
  
  shouldApplyHighlight(lineNumber) {
    const compares = this.rule.map(comp => comp.compareLine(lineNumber));
    if (this.isLineRange()) {
      return (compares[0] <= 0) && (compares[1] >= 0);
    }
    return compares[0] === 0;
  }
  
  applyHighlight(line) {
    if (this.isLineSlice()) {
      // TODO: Implement slice-index based highlighting
      return HighlightRule._highlightWholeLine(line);
    }
    
    if (this.isLineNumber()) {
      return HighlightRule._highlightTextOnly(line);
    }
    
    const shouldWholeLine = this.rule.some(comp => comp.isUnboundedSlice());
    return shouldWholeLine
      ? HighlightRule._highlightWholeLine(line)
      : HighlightRule._highlightTextOnly(line);
  }

  static _splitCodeAndIndentation(codeStr) {
    const codeStartIdx = codeStr.search(/\S|$/);
    const indents = codeStr.substr(0, codeStartIdx);
    const content = codeStr.substr(codeStartIdx);
    return [indents, content];
  }
  
  static _highlightWholeLine(codeStr) {
    return `<span class="highlighted">${codeStr}\n</span>`;
  }
  
  static _highlightTextOnly(codeStr) {
    const [indents, content] = HighlightRule._splitCodeAndIndentation(codeStr);
    return `<span>${indents}<span class="highlighted">${content}</span>\n</span>`
  }
}

module.exports = {
  HighlightRule
};
