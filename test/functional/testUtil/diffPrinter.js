const ANSI_RED = '\u001B[31m';
const ANSI_GREEN = '\u001B[32m';
const ANSI_GREY = '\u001B[90m';
const ANSI_RESET = '\u001B[0m';

class DiffPrinter {
  /**
   * Prints line of text in colour provided
   * @param {string} text text to print, default: no text
   * @param {string} colour colour of text, default: no colour
   */
  static printLine(text = '', colour = 'none') {
    let ansiEscCode = '';
    switch (colour) {
    case 'red':
      ansiEscCode = ANSI_RED;
      break;
    case 'green':
      ansiEscCode = ANSI_GREEN;
      break;
    case 'grey':
      ansiEscCode = ANSI_GREY;
      break;
    default:
      ansiEscCode = '';
      break;
    }
    process.stderr.write(`${ansiEscCode}${text}${ANSI_RESET}\n`);
  }

  /**
   * Splits and combines change objects such that their value contains a single line
   * Also adds ANSI Escape Codes for diffs and unchanged lines
   * @param {Array} parts array of change objects returned by jsdiff#diffWords
   * @returns {Array} change objects where their value contains a single line
   */
  static generateLineParts(parts) {
    let lineParts = [{ value: '' }];
    parts.forEach(({ value, added, removed }) => {
      let lines = value.split(/\n/);
      let asciEscCode = ANSI_GREY;
      if (added) asciEscCode = ANSI_GREEN;
      else if (removed) asciEscCode = ANSI_RED;
      lines = lines.map(line => ({
        value: asciEscCode + line + ANSI_RESET,
        diff: added || removed,
      }));

      if (lines.length) {
        const prevPart = lineParts.pop();
        lines[0] = {
          value: prevPart.value + lines[0].value,
          diff: lines[0].diff || prevPart.diff,
        };
      }
      lineParts = lineParts.concat(lines);
    });
    return lineParts;
  }

  /**
   * Set line objects which contain diffs for printing
   * Also sets top and bottom 3 lines for printing
   * @param {Array} lineParts array of line objects after being split
   *                          into lines by DiffPrinter#generateLineParts
   */
  static setPartsToPrint(lineParts) {
    lineParts.forEach((linePart, i) => {
      if (linePart.diff) {
        for (let j = -3; j <= 3; j += 1) {
          const partsToPrint = lineParts[i + j];
          if (partsToPrint) partsToPrint.toPrint = true;
        }
      }
    });
  }

  /**
   * Prints value in line objects that are set for printing
   * If there is a gap between lines, print ellipsis
   * @param {Array} lineParts array of line objects after being set for printing
   *                          in DiffPrinter#setPartsToPrint
   */
  static printLineParts(lineParts) {
    lineParts.forEach((linePart, i) => {
      const prevPart = lineParts[i - 1];
      if (linePart.toPrint) {
        if (prevPart && !prevPart.toPrint) {
          this.printLine();
          this.printLine('...', 'grey');
          this.printLine();
        }
        this.printLine(linePart.value, 'none'); // already has ANSI Escape Code
      }
    });
  }

  /**
   * Prints diff with ANSI Escape Codes for colour
   * @param {Array} parts array of change of objects as returned by jsdiff#diffWords
   */
  static printDiff(parts) {
    const lineParts = this.generateLineParts(parts);
    this.setPartsToPrint(lineParts);
    this.printLineParts(lineParts);
  }
}

module.exports = DiffPrinter;
