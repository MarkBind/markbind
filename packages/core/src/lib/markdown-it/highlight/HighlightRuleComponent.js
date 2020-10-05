const LINESLICE_REGEX = new RegExp('(\\d+)\\[(\\d*):(\\d*)]');

class HighlightRuleComponent {
  constructor(components) {
    /**
     * @type Number | Array<Number>
     */
    this.components = components;
  }
  
  isNumber() {
    return Number.isInteger(this.components);
  }
  
  isSlice() {
    return Array.isArray(this.components)
      && this.components.length === 3
      && this.components.every(Number.isInteger);
  }
  
  isUnboundedSlice() {
    return this.isSlice()
      && this.components[1] === -1
      && this.components[2] === -1;
  }
  
  static parseRuleComponent(compString) {
    // tries to match with the line slice pattern
    const matches = compString.match(LINESLICE_REGEX);
    if (matches) {
      const numbers = matches.slice(1) // keep the capturing group matches only
        .map(x => x !== '' ? parseInt(x, 10) : -1);
      return new HighlightRuleComponent(numbers);
    }

    // match fails, so it is just line numbers
    const number = parseInt(compString, 10);
    return new HighlightRuleComponent(number);
  }
  
  offsetLines(offset) {
    if (this.isNumber()) {
      this.components += offset;
    } else {
      this.components[0] += offset;
    }
  }
  
  compareLine(lineNumber) {
    const lineRule = this.isSlice() ? this.components[0] : this.components;
    return lineRule - lineNumber;
  }
}

module.exports = {
  HighlightRuleComponent
};
