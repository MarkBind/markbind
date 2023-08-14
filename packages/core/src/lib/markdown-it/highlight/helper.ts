// Common helper functions to be used in HighlightRule or HighlightRuleComponent

export function splitCodeAndIndentation(code: string) {
  const codeStartIdx = code.search(/\S|$/);
  const indents = code.substring(0, codeStartIdx);
  const content = code.substring(codeStartIdx);
  return [indents, content];
}

export enum BOUNDARY_TYPE {
  Start,
  End,
}

export interface Boundary {
  index: number;
  type: BOUNDARY_TYPE;
}

// Simplifies and collates multiple bounds applied on a single line to an array of disjointed bounds
// e.g. [[0, 2], [1, 3], [8, 10]] -> [[0, 3], [8, 10]]
export function collateAllIntervals(boundaryCollection: Boundary[]) {
  let startCount = 0;
  let endCount = 0;
  let boundStart;
  let boundEnd;
  const output = [];
  boundaryCollection.sort((boundaryA, boundaryB) => boundaryA.index - boundaryB.index);
  for (let i = 0; i < boundaryCollection.length; i += 1) {
    const currBoundary = boundaryCollection[i];

    if (currBoundary.type === BOUNDARY_TYPE.Start) {
      startCount += 1;
      if (startCount === 1) {
        // First start point that will anchor this interval
        boundStart = currBoundary.index;
      }
    } else {
      endCount += 1;
      if (endCount === startCount) {
        // Last end point that will conclude this interval
        boundEnd = currBoundary.index;
        if (boundEnd !== boundStart) {
          // boundEnd should not be equal to boundStart
          output.push([boundStart, boundEnd]);
        }
        endCount = 0;
        startCount = 0;
      }
    }
  }
  return output;
}
