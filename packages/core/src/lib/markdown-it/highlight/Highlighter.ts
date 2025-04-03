import { collateAllIntervalsWithColors, splitCodeAndIndentation } from './helper';

export class Highlighter {
  static highlightWholeLine(code: string, color?: string) {
    const style = color ? `style="background-color:${color};"` : 'class="highlighted"';
    return `<span ${style}>${code}\n</span>`;
  }

  static highlightWholeText(code: string, color?: string) {
    const style = color ? `style="background-color:${color};"` : 'class="highlighted"';
    const [indents, content] = splitCodeAndIndentation(code);
    return `<span>${indents}<span ${style}>${content}</span>\n</span>`;
  }

  static highlightPartOfText(
    code: string,
    boundsWithColors: Array<{ bounds: [number, number], color: string }>,
  ) {
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

    const formattedCode = code.replace(/\t/g, '    '); // Convert tabs to 4 spaces by default

    // Wrap the code in a span with the hl-data attribute
    return `<span hl-data="${dataStr}">${formattedCode}\n</span>`;
  }
}
