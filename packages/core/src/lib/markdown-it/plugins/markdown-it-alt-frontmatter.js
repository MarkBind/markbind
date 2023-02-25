'use strict';

// Process "---" => "<frontmatter>

module.exports = function alt_frontmatter_plugin(md) {
  function alt_frontmatter(state, startLine, endLine, silent) {
    const fmSymbol = "---";
    const keyValueRegex = new RegExp("^\\w+:\\s+.*");

    let lineStart = state.bMarks[startLine] + state.tShift[startLine];
    let lineEnd = state.eMarks[startLine];
    let marker = state.src.slice(lineStart, lineEnd);
    if (marker !== fmSymbol) { return false; }

    let haveEndMarker = false;
    let nextLine = startLine + 1;
    for (; nextLine < endLine; nextLine++) {
      lineStart = state.bMarks[nextLine] + state.tShift[nextLine];
      lineEnd = state.eMarks[nextLine];

      let currLine = state.src.slice(lineStart, lineEnd).trim();
      if (currLine === fmSymbol) {
        haveEndMarker = true;
        break;
      }
      if (!(keyValueRegex.test(currLine) || currLine.length === 0)) {
        // terminates if not key value or blank line.
        return false;
      }
    }

    if (!haveEndMarker) { return false; }
    // If a fence has heading spaces, they should be removed from its inner block
    let len = state.sCount[startLine];
    state.line = nextLine + (haveEndMarker ? 1 : 0);

    let token = state.push('alt_frontmatter', '', 0);
    token.info = fmSymbol;
    token.content = state.getLines(startLine + 1, nextLine, len, true);
    token.markup = marker;
    token.map = [ startLine, state.line ];
    return true;
  }

  md.block.ruler.before('fence', 'alt_frontmatter', alt_frontmatter);
  md.renderer.rules.alt_frontmatter = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    if (token.type === 'alt_frontmatter' && token.info === '---') {
      return '<frontmatter>\n' + token.content + '</frontmatter>\n';
    }
    return slf.renderToken(tokens, idx, options, env, slf);
  };
}

