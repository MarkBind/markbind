import { splitCodeAndIndentation } from './helper';

const LINESLICE_CHAR_REGEX = /(\+?)(\d+)\[(\d*):(\d*)]/;
const LINESLICE_WORD_REGEX = /(\d+)\[(\d*)::(\d*)]/;
const LINEPART_REGEX = /(\d+)\[(["'])((?:\\.|[^\\])*?)\2]/;
const UNBOUNDED = -1;

export class HighlightRuleComponent {
  lineNumber: number;
  isSlice: boolean;
  bounds: Array<[number, number]>;
  constructor(
    lineNumber: number,
    isSlice: boolean = false,
    bounds: Array<[number, number]> = [],
  ) {
    this.lineNumber = lineNumber;
    this.isSlice = isSlice;
    this.bounds = bounds;
  }

  static isValidLineNumber(lineNumStr: string, min: number, max: number, offset: number) {
    let lineNum = Number(lineNumStr);
    if (Number.isNaN(lineNum) || !Number.isInteger(lineNum)) return null;
    lineNum += offset;
    return lineNum >= min && lineNum <= max ? lineNum : null;
  }

  static parseRuleComponent(compString: string, lineNumberOffset: number, lines: string[]) {
    // Match line-part syntax
    const linepartMatch = compString.match(LINEPART_REGEX);
    if (linepartMatch) {
      // There are four capturing groups: [full match, line number, quote type, line part]
      const [, lineNumberString, , linePartWithQuotes] = linepartMatch;
      const lineNumber = HighlightRuleComponent
        .isValidLineNumber(lineNumberString, 1, lines.length, lineNumberOffset);
      if (!lineNumber) return null;

      const linePart = linePartWithQuotes.replace(/\\'/g, '\'').replace(/\\"/g, '"'); // unescape quotes
      const bounds = HighlightRuleComponent.computeLinePartBounds(linePart, lines[lineNumber - 1]);
      return new HighlightRuleComponent(lineNumber, true, bounds);
    }

    // Match line-slice (character and word variant) syntax
    const linesliceCharMatch = compString.match(LINESLICE_CHAR_REGEX);
    const linesliceWordMatch = compString.match(LINESLICE_WORD_REGEX);
    const sliceMatch = linesliceCharMatch || linesliceWordMatch;
    if (sliceMatch) {
      // There are four/five capturing groups: [full match, is absolute indexing (for char match),
      //                                        line number, start bound, end bound]
      const groups = sliceMatch.slice(1); // discard full match

      let isAbsoluteIndexing = false;
      if (sliceMatch === linesliceCharMatch) {
        isAbsoluteIndexing = groups.shift() === '+';
      }

      const lineNumber = HighlightRuleComponent
        .isValidLineNumber(groups.shift() ?? '', 1, lines.length, lineNumberOffset);
      if (!lineNumber) return null;

      const isUnbounded = groups.every(x => x === '');
      if (isUnbounded) {
        return new HighlightRuleComponent(lineNumber, true, []);
      }

      let bound = groups.map(x => (x !== '' ? parseInt(x, 10) : UNBOUNDED)) as [number, number];
      const isCharSlice = sliceMatch === linesliceCharMatch;
      bound = isCharSlice
        ? HighlightRuleComponent.computeCharBounds(bound, lines[lineNumber - 1], isAbsoluteIndexing)
        : HighlightRuleComponent.computeWordBounds(bound, lines[lineNumber - 1]);

      return new HighlightRuleComponent(lineNumber, true, [bound]);
    }

    // Match line-number syntax
    const lineNumber = HighlightRuleComponent
      .isValidLineNumber(compString, 1, lines.length, lineNumberOffset);
    if (lineNumber) {
      return new HighlightRuleComponent(lineNumber);
    }

    // the string is an improperly written rule
    return null;
  }

  /**
   * Compares the component's line number to a given line number.
   *
   * @param lineNumber The line number to compare
   * @returns {number} A negative number, zero, or a positive number when the given line number
   *  is after, at, or before the component's line number
   */
  compareLine(lineNumber: number): number {
    return this.lineNumber - lineNumber;
  }

  isUnboundedSlice() {
    return this.isSlice && this.bounds.length === 0;
  }

  /**
   * Computes the actual character bound given a user-defined character bound and a line,
   * comparing the bounds and the line's range.
   *
   * If the bound does not specify either the start or the end bound, the computed bound will default
   * to the start or end of line. The bound can be either absolute or relative to the indentation level.
   *
   * @param bound The user-defined bound
   * @param line The given line
   * @param isAbsoluteIndexing Whether the bound is absolute or relative to the indentation level
   * @returns {[number, number]} The actual bound computed
   */
  static computeCharBounds(bound: [number, number], line: string,
                           isAbsoluteIndexing: boolean): [number, number] {
    const [indents] = splitCodeAndIndentation(line);
    let [start, end] = bound;

    if (start === UNBOUNDED) {
      start = isAbsoluteIndexing ? 0 : indents.length;
    } else {
      start = isAbsoluteIndexing ? start : Math.max(start + indents.length, indents.length);
      start = Math.min(start, line.length);
    }

    if (end === UNBOUNDED) {
      end = line.length;
    } else {
      end = isAbsoluteIndexing ? end : Math.max(end + indents.length, indents.length);
      end = Math.min(end, line.length);
    }

    return [start, end];
  }

  /**
   * Computes the actual character bounds given a user-defined word bound and a line,
   * comparing the bounds and the line's range.
   *
   * If the bound does not specify either the start or the end bound, the computed bound will default
   * to the start or end of line, excluding leading whitespaces.
   *
   * @param bound The user-defined bound
   * @param line The given line
   * @returns {[number, number]} The actual bound computed
   */
  static computeWordBounds(bound: [number, number], line: string): [number, number] {
    const [indents, content] = splitCodeAndIndentation(line);
    const words = content.split(/\s+/);
    const wordPositions: number[][] = [];
    let contentRemaining = content;
    let curr = indents.length;
    words.forEach((word: string) => {
      const start = contentRemaining.indexOf(word);
      const end = start + word.length;
      wordPositions.push([curr + start, curr + end]);
      contentRemaining = contentRemaining.substring(end);
      curr += end;
    });

    let [start, end] = bound;

    if (start === UNBOUNDED || start < 0) {
      start = indents.length;
    } else if (start > words.length) {
      start = line.length;
    } else {
      const [wordStart] = wordPositions[start];
      start = wordStart;
    }

    if (end === UNBOUNDED || end > words.length) {
      end = line.length;
    } else if (end < 0) {
      end = indents.length;
    } else {
      const [, wordEnd] = wordPositions[end - 1];
      end = wordEnd;
    }

    return [start, end];
  }

  /**
   * Computes the actual bounds given a user-defined line part and a line.
   *
   * @param linePart The user-defined line part
   * @param line The given line
   * @returns {Array<[number, number]>} The bounds computed, each indicates the range of each
   * occurrences of the line part in the line
   */
  static computeLinePartBounds(linePart: string, line: string): Array<[number, number]> {
    const [indents, content] = splitCodeAndIndentation(line);
    let contentRemaining = content;
    let start = contentRemaining.indexOf(linePart);

    if (linePart === '' || start === -1) {
      return [[0, 0]];
    }

    const bounds: Array<[number, number]> = [];
    let curr = indents.length;
    while (start !== -1) {
      const end = start + linePart.length;
      bounds.push([curr + start, curr + end]);
      curr += end;
      contentRemaining = contentRemaining.substring(end);
      start = contentRemaining.indexOf(linePart);
    }

    return bounds;
  }
}
