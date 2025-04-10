export function splitCodeAndIndentation(code: string) {
  const codeStartIdx = code.search(/\S|$/);
  const indents = code.substring(0, codeStartIdx);
  const content = code.substring(codeStartIdx);
  return [indents, content];
}

export function collateAllIntervalsWithColors(
  boundsWithColors: Array<{ bounds: [number, number], color: string }>,
) {
  if (boundsWithColors.length === 0) {
    return [];
  }

  boundsWithColors.sort((a, b) => a.bounds[0] - b.bounds[0]);

  const merged: Array<{ bounds: [number, number], color: string }> = [];
  let current = boundsWithColors[0];

  for (let i = 1; i < boundsWithColors.length; i += 1) {
    const next = boundsWithColors[i];
    if (next.bounds[0] <= (current.bounds[1] - 1)) {
      // merge if overlap
      current.bounds[1] = Math.max(current.bounds[1], next.bounds[1]);
      current.color = next.color;
    } else {
      merged.push(current);
      current = next;
    }
  }

  // Add the last merged interval
  merged.push(current);

  return merged;
}
