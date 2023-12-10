import { collateAllIntervals, splitCodeAndIndentation } from './helper';

export class Highlighter {
  static highlightWholeLine(code: string) {
    return `<span class="highlighted">${code}\n</span>`;
  }

  static highlightWholeText(code: string) {
    const [indents, content] = splitCodeAndIndentation(code);
    return `<span>${indents}<span class="highlighted">${content}</span>\n</span>`;
  }

  static highlightPartOfText(code: string, bounds: Array<[number, number]>) {
    /*
      * Note: As part-of-text highlighting requires walking over the node of the generated
      * html by highlight.js, highlighting will be applied in NodeProcessor instead.
      * hl-data is used to pass over the bounds.
    */
    const mergedBounds = collateAllIntervals(bounds);
    const dataStr = mergedBounds.map(bound => bound.join('-')).join(',');
    return `<span hl-data=${dataStr}>${code}\n</span>`;
  }
}
