import { collateAllIntervalsWithColors, splitCodeAndIndentation } from './helper';

export class Highlighter {
  static highlightWholeLine(code: string, color ?: string) {

    const style = color ? `style="background-color:${color}"` : 'style="background-color: #e6e6fa"';
    return `<span class="" ${style}>${code}\n</span>`;
  }

  static highlightWholeText(code: string, color ?: string) {

    const style = color ? `style="background-color:${color}"` : 'style="background-color: #e6e6fa"';
    const [indents, content] = splitCodeAndIndentation(code);
    return `<span>${indents}<span class="" ${style}>${content}</span>\n</span>`;
  }

  static highlightPartOfText(code: string, boundsWithColors: Array<{ bounds: [number, number], color: string }>) {
    /*
      * Note: As part-of-text highlighting requires walking over the node of the generated
      * html by highlight.js, highlighting will be applied in NodeProcessor instead.
      * hl-data is used to pass over the bounds and colors.
    */
    const mergedBoundsWithColors = collateAllIntervalsWithColors(boundsWithColors);
  
    // Generate the hl-data string for all bounds and colors
    const dataStr = mergedBoundsWithColors.map(({ bounds, color }) => {
      const [start, end] = bounds; // each bound is an array of 2 integers
      return `${start}-${end}:${color}`; // include color for each bound
    }).join(',');
  
    // Wrap the code in a span with the hl-data attribute
    return `<span hl-data="${dataStr}">${code}\n</span>`;
  }
}