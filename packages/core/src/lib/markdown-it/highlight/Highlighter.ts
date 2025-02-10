import { collateAllIntervals, splitCodeAndIndentation } from './helper';

export class Highlighter {
  static highlightWholeLine(code: string, color ?: string) {

    const style = color ? `style="background-color:${color}"` : '';
    return `<span class="highlighted" ${style}>${code}\n</span>`;
  }

  static highlightWholeText(code: string, color ?: string) {

    const style = color ? `style="background-color:${color}"` : '';
    const [indents, content] = splitCodeAndIndentation(code);
    return `<span>${indents}<span class="highlighted" ${style}>${content}</span>\n</span>`;
  }

  static highlightPartOfText(code: string, bounds: Array<[number, number]>, color?: string) {
    /*
      * Note: As part-of-text highlighting requires walking over the node of the generated
      * html by highlight.js, highlighting will be applied in NodeProcessor instead.
      * hl-data is used to pass over the bounds.
    */
    const mergedBounds = collateAllIntervals(bounds);
    const dataStr = mergedBounds.map(bound => bound.join('-')).join(',');

    const style = color ? `style="background-color:${color}"` : '';
    return `<span hl-data=${dataStr} ${style}>${code}\n</span>`;
  }
}
