const LINESLICE_REGEX = new RegExp('(\\d+)\\[(\\d*):(\\d*)]');

class HighlightRuleComponent {
  constructor(lineNumber, isSlice, bounds) {
    this.lineNumber = lineNumber;
    this.isSlice = isSlice || false;
    this.bounds = bounds || [];
  }
  
  static parseRuleComponent(compString) {
    // tries to match with the line slice pattern
    const matches = compString.match(LINESLICE_REGEX);
    if (matches) {
      const groups = matches.slice(1); // keep the capturing group matches only
      const lineNumber = parseInt(groups.shift(), 10);
      
      const isUnbounded = groups.every(x => x === '');
      if (isUnbounded) {
        return new HighlightRuleComponent(lineNumber, true);
      }
      
      const bounds = groups.map(x => x !== '' ? parseInt(x, 10) : -1);
      return new HighlightRuleComponent(lineNumber, true, bounds);
    }

    // match fails, so it is just line numbers
    const lineNumber = parseInt(compString, 10);
    return new HighlightRuleComponent(lineNumber);
  }
  
  offsetLineNumber(offset) {
    this.lineNumber += offset;
  }

  /**
   * Compares the component's line number to a given line number.
   * 
   * @param lineNumber The line number to compare
   * @returns {number} A negative number, zero, or a positive number when the given line number
   *  is after, at, or before the component's line number
   */
  compareLine(lineNumber) {
    return this.lineNumber - lineNumber;
  }

  isUnboundedSlice() {
    return this.isSlice && this.bounds.length === 0;
  }
}

module.exports = {
  HighlightRuleComponent
};
