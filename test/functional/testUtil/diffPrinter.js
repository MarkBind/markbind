const chalk = require('chalk');

const EMPTY_LINE = '|-------------------empty-line-------------------|';
const CONSECUTIVE_NEWLINE_REGEX = new RegExp('\\n{2,}', 'g');
const WHITESPACE_REGEX = new RegExp('\\s+', 'g');

class DiffPrinter {
  /**
   * Replaces all newlines except the first with EMPTY_LINE.
   */
  static prependNewLines(match) {
    return `\n${match.replace('\n', '').split('\n').join(`${EMPTY_LINE}\n`)}`;
  }

  static formatNewLines(value, prevVal, nextVal) {
    let printValue;
    printValue = value.replace(CONSECUTIVE_NEWLINE_REGEX, this.prependNewLines);

    /**
     * Replace consecutive newlines between current value and adjacent values
     */

    const currentValStartsWithNewLine = printValue.startsWith('\n');
    const prevValEndsWithNewLine = prevVal && prevVal.endsWith('\n');
    if (currentValStartsWithNewLine && prevValEndsWithNewLine) {
      printValue = EMPTY_LINE + printValue;
    }

    const currentValEndsWithNewLine = printValue.endsWith('\n');
    const nextValStartsWithNewLine = nextVal && nextVal.startsWith('\n');
    if (currentValEndsWithNewLine && nextValStartsWithNewLine) {
      printValue += EMPTY_LINE;
    }

    return printValue;
  }

  /**
   * Splits and combines change objects such that their value contains a single line
   * Also adds ANSI Escape Codes for diffs and unchanged lines
   * @param {Array} diffObjects array of change objects returned by jsdiff#diffWords
   * @returns {Array} change objects where their value contains a single line
   */
  static generateLineParts(diffObjects) {
    const parts = [];
    diffObjects.forEach(({ value, added, removed }, i) => {
      let printValue = value;
      if (added || removed) {
        printValue = this.formatNewLines(printValue,
                                         diffObjects[i - 1] && diffObjects[i - 1].value,
                                         diffObjects[i + 1] && diffObjects[i - 1].value);
        printValue = added
          ? chalk.green(printValue.replace(WHITESPACE_REGEX,
                                           match => chalk.bgGreenBright(match)))
          : chalk.red(printValue.replace(WHITESPACE_REGEX,
                                         match => chalk.bgRedBright(match)));
        parts.push({
          value: printValue,
          diff: true,
        });
      } else {
        // Split into lines only when it is untouched to avoid printing too much of the untouched areas
        const lineParts = printValue.split('\n').map((line, index, lines) => ({
          value: (index === lines.length - 1) ? chalk.grey(line) : `${chalk.grey(line)}\n`,
          diff: false,
        }));
        parts.push(...lineParts);
      }
    });
    return parts;
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

  static printDiffFoundMessage(filePath) {
    const message = chalk.grey(`\n-------------------------------------\nDiff found in ${filePath}\n\n`);
    process.stderr.write(message);
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
          process.stderr.write(chalk.grey('\n...\n'));
        }
        process.stderr.write(linePart.value);
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
