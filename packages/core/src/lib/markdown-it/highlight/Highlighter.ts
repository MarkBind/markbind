import { Boundary, collateAllIntervals, splitCodeAndIndentation } from './helper';

export class Highlighter {
  static highlightWholeLine(codeStr: string) {
    return `<span class="highlighted">${codeStr}\n</span>`;
  }

  static highlightWholeText(codeStr: string) {
    const [indents, content] = splitCodeAndIndentation(codeStr);
    return `<span>${indents}<span class="highlighted">${content}</span>\n</span>`;
  }

  static highlightPartOfText(codeStr: string, boundaries: Boundary[]) {
    /*
        * Note: As part-of-text highlighting requires walking over the node of the generated
        * html by highlight.js, highlighting will be applied in NodeProcessor instead.
        * hl-data is used to pass over the bounds.
        */
    const mergedBounds = collateAllIntervals(boundaries);
    const dataStr = mergedBounds.map(bound => bound.join('-')).join(',');
    return `<span hl-data=${dataStr}>${codeStr}\n</span>`;
  }
}
