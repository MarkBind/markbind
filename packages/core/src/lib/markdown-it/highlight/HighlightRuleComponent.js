const LINESLICE_REGEX = new RegExp('(\\d+)\\[(\\d*):(\\d*)]');
const LINEPART_REGEX = new RegExp('(\\d+)\\[(["\'])((?:\\\\.|[^\\\\])*?)\\2]');

class HighlightRuleComponent {
  constructor(lineNumber, isSlice = false, bounds = [], linePart = '') {
    /**
     * @type {number}
     */
    this.lineNumber = lineNumber;
    /**
     * @type {boolean}
     */
    this.isSlice = isSlice;
    /**
     * @type {Array<[number, number]>}
     */
    this.bounds = bounds;
    /**
     * @type {string}
     */
    this.linePart = linePart;
  }

  static parseRuleComponent(compString) {
    // tries to match with the line slice pattern
    const linesliceMatch = compString.match(LINESLICE_REGEX);
    if (linesliceMatch) {
      const groups = linesliceMatch.slice(1); // discard full match
      const lineNumber = parseInt(groups.shift(), 10);

      const isUnbounded = groups.every(x => x === '');
      if (isUnbounded) {
        return new HighlightRuleComponent(lineNumber, true);
      }

      const bound = groups.map(x => (x !== '' ? parseInt(x, 10) : -1));
      return new HighlightRuleComponent(lineNumber, true, [bound]);
    }

    const linepartMatch = compString.match(LINEPART_REGEX);
    if (linepartMatch) {
      const groups = linepartMatch.slice(1); // discard full match
      const lineNumber = parseInt(groups.shift(), 10);
      groups.shift(); // discard quote group match
      const part = groups.shift().replace(/\\'/g, '\'').replace(/\\"/g, '"'); // unescape quotes

      return new HighlightRuleComponent(lineNumber, false, [], part);
    }

    if (!Number.isNaN(compString)) { // ensure the whole string can be converted to number
      const lineNumber = parseInt(compString, 10);
      return new HighlightRuleComponent(lineNumber);
    }

    // the string is an improperly written rule
    return null;
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

  /**
   * Computes the actual bounds of the highlight rule given a line,
   * comparing the rule's bounds and the line's range.
   *
   * If the rule does not specify a start/end bound, the computed bound will default
   * to the start/end of the line.
   *
   * @param line The line to be checked
   * @returns {Array<[number, number]>} The actual bounds computed
   */
  computeLineBounds(line) {
    if (!this.isSlice) {
      return [[0, 0]];
    }

    const [lineStart, lineEnd] = [0, line.length - 1];
    if (this.isUnboundedSlice()) {
      return [[lineStart, lineEnd]];
    }

    const lineBounds = this.bounds.map(([boundStart, boundEnd]) => {
      const start = (lineStart <= boundStart) && (boundStart <= lineEnd) ? boundStart : lineStart;
      const end = (lineStart <= boundEnd) && (boundEnd <= lineEnd) ? boundEnd : lineEnd;
      return [start, end];
    });
    return lineBounds;
  }

  convertPartToSlice(content) {
    if (!this.linePart) {
      return;
    }

    let contentRemaining = content;
    let start = contentRemaining.indexOf(this.linePart);
    const bounds = [];

    if (start === -1) {
      bounds.push([0, 0]);
    }

    let curr = 0;
    while (start !== -1) {
      const end = start + this.linePart.length;
      bounds.push([curr + start, curr + end]);
      curr += end;
      contentRemaining = contentRemaining.substring(end);
      start = contentRemaining.indexOf(this.linePart);
    }

    this.isSlice = true;
    this.bounds = bounds;
    this.linePart = '';
  }
}

module.exports = {
  HighlightRuleComponent,
};
