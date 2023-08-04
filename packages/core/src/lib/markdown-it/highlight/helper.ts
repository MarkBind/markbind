// Common helper functions to be used in HighlightRule or HighlightRuleComponent

export function splitCodeAndIndentation(codeStr: string) {
  const codeStartIdx = codeStr.search(/\S|$/);
  const indents = codeStr.substring(0, codeStartIdx);
  const content = codeStr.substring(codeStartIdx);
  return [indents, content];
}

export enum BOUNDARY_TYPE {
  Start,
  End
};

export interface Boundary {
  index: number;
  type: BOUNDARY_TYPE;
}

// Simplifies multiple bounds applied on a single line to an array of disjointed bounds
// boundaryCollection:
// e.g [{index: 1, type: BOUNDARY_TYPE.Start},
//      {index:3, type: BOUNDARY_TYPE.End},
//      {index: 5, type: BOUNDARY_TYPE.Start},
//      {index: 7, type: BOUNDARY_TYPE.End}]
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

// console.log(collateAllIntervals([
//   { index: 1, type: BOUNDARY_TYPE.Start },
//   { index: 3, type: BOUNDARY_TYPE.End },
//   { index: 5, type: BOUNDARY_TYPE.Start },
//   { index: 8, type: BOUNDARY_TYPE.End },
//   { index: 7, type: BOUNDARY_TYPE.Start },
//   { index: 13, type: BOUNDARY_TYPE.End },
// ]));
