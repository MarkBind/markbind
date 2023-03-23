// Common helper functions to be used in HighlightRule or HighlightRuleComponent

export function splitCodeAndIndentation(codeStr: string) {
  const codeStartIdx = codeStr.search(/\S|$/);
  const indents = codeStr.substring(0, codeStartIdx);
  const content = codeStr.substring(codeStartIdx);
  return [indents, content];
}
