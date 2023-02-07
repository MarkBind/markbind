'use strict';

// Process "---" => "<frontmatter>

module.exports = function centertext_plugin(md) {
  function alt_frontmatter(state, startLine, endLine, silent) {
    var marker, len, nextLine, token,
      haveEndMarker = false,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];
    const keyValueRegex = new RegExp("^\\w+:\\s.*");

    if (pos + 3 > max) { return false; }
    marker = state.src.slice(pos, pos + 3);
    if (marker !== '---') { return false; }

    // Since we found the marker, we can now search for the end marker
    // starting from the next line
    nextLine = startLine;
    for (;;) {
      nextLine++;
      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break;
      }

      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (pos < max && state.sCount[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        // - ```
        //  test
        break;
      }

      if (state.src.slice(pos, max).trim() === '---') {
        haveEndMarker = true;
        break;
      }

      if (!keyValueRegex.test(state.src.slice(pos, max).trim())) {
        return false;
      }
    }
    if (!haveEndMarker) { return false; }
    // If a fence has heading spaces, they should be removed from its inner block
    len = state.sCount[startLine];
    state.line = nextLine + (haveEndMarker ? 1 : 0);

    token = state.push('alt_frontmatter', '', 0);
    token.info = "---";
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

