// Common helper functions to be used in HighlightRule or HighlightRuleComponent

function splitCodeAndIndentation(codeStr) {
  const codeStartIdx = codeStr.search(/\S|$/);
  const indents = codeStr.substring(0, codeStartIdx);
  const content = codeStr.substring(codeStartIdx);
  return [indents, content];
}

module.exports = {
  splitCodeAndIndentation,
};
