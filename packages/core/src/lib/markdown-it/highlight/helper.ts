// Common helper functions to be used in HighlightRule or HighlightRuleComponent

export function splitCodeAndIndentation(code: string) {
  const codeStartIdx = code.search(/\S|$/);
  const indents = code.substring(0, codeStartIdx);
  const content = code.substring(codeStartIdx);
  return [indents, content];
}

// Simplifies and collates multiple bounds applied on a single line to an array of disjointed bounds
// e.g. [[0, 2], [1, 3], [8, 10]] -> [[0, 3], [8, 10]]
export function collateAllIntervals(bounds: Array<[number, number]>) {
  const output: Array<[number, number]> = [];
  bounds.sort((boundA, boundB) => boundA[0] - boundB[0]);
  let currStart = bounds[0][0];
  let currEnd = bounds[0][1];
  for (let i = 1; i < bounds.length; i += 1) {
    const [start, end] = bounds[i];
    if (start <= currEnd) {
      currEnd = Math.max(currEnd, end);
    } else {
      output.push([currStart, currEnd]);
      currStart = start;
      currEnd = end;
    }
  }
  output.push([currStart, currEnd]);
  return output;
}
