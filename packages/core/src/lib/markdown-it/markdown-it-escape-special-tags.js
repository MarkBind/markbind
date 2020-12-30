const markdownIt = require('./index');

/*
 Custom patch for the api to escape content in certain special tags
 Adapted from the default markdown-it html_block rule and replaces it.
 */

function escape_plugin(md, tagsToIgnore) {
  const block_names = require('markdown-it/lib/common/html_blocks');
  const HTML_OPEN_CLOSE_TAG_RE = require('markdown-it/lib/common/html_re').HTML_OPEN_CLOSE_TAG_RE;

  const specialTagsRegex = Array.from(tagsToIgnore)
    .concat(['script|pre|style|variable|site-nav|markdown|md'])
    .join('|');

  // attr_name, unquoted ... attribute patterns adapted from markdown-it/lib/common/html_re
  // Construct self-closing negative lookahead for special tags,
  // because if matched, the endingSpecialTagRegex will roll down to find a non-existent closing tag
  const attr_name = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
  const unquoted      = '[^"\'=<>`\\x00-\\x20]+';
  const single_quoted = "'[^']*'";
  const double_quoted = '"[^"]*"';
  const attr_value  = '(?:' + unquoted + '|' + single_quoted + '|' + double_quoted + ')';
  const attribute   = '(?:\\s+' + attr_name + '(?:\\s*=\\s*' + attr_value + ')?)';
  const selfClosingNegativeLookahead = `(?!${attribute}*\\s*\/>)`;

  const startingSpecialTagRegex = new RegExp(
    `^<(${specialTagsRegex})${selfClosingNegativeLookahead}(?=(\\s|>|$))`, 'i');
  const endingSpecialTagRegex = new RegExp(`<\\/(${specialTagsRegex})>`, 'i');

  const HTML_SEQUENCES = [
    [ startingSpecialTagRegex, endingSpecialTagRegex, true ],
    [ /^<!--/,        /-->/,   true ],
    [ /^<\?/,         /\?>/,   true ],
    [ /^<![A-Z]/,     />/,     true ],
    [ /^<!\[CDATA\[/, /\]\]>/, true ],
    [ new RegExp('^</?(' + block_names.join('|') + ')(?=(\\s|/?>|$))', 'i'), /^$/, true ],
    [ new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + '\\s*$'),  /^$/, false ]
  ];


  function escape_special_tags(state, startLine, endLine, silent) {
    let i, nextLine, token, lineText,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

    if (!state.md.options.html) { return false; }

    if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

    lineText = state.src.slice(pos, max);

    for (i = 0; i < HTML_SEQUENCES.length; i++) {
      if (HTML_SEQUENCES[i][0].test(lineText)) { break; }
    }

    if (i === HTML_SEQUENCES.length) { return false; }

    if (silent) {
      // true if this sequence can be a terminator, false otherwise
      return HTML_SEQUENCES[i][2];
    }

    nextLine = startLine + 1;

    // If we are here - we detected HTML block.
    // Let's roll down till block end.
    if (!HTML_SEQUENCES[i][1].test(lineText)) {
      for (; nextLine < endLine; nextLine++) {
        if (state.sCount[nextLine] < state.blkIndent) { break; }

        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];
        lineText = state.src.slice(pos, max);

        if (HTML_SEQUENCES[i][1].test(lineText)) {
          if (lineText.length !== 0) { nextLine++; }
          break;
        }
      }
    }

    state.line = nextLine;

    token         = state.push('html_block', '', 0);
    token.map     = [ startLine, nextLine ];
    token.content = state.getLines(startLine, nextLine, state.blkIndent, true);

    return true;
  }

  md.block.ruler.at('html_block', escape_special_tags, {
    alt: [ 'paragraph', 'reference', 'blockquote' ]
  });
}

/**
 * Sets up the plugin with the provided tag names to ignore.
 * Replaces any previously injected tags.
 */
function injectTags(tagsToIgnore) {
  markdownIt.use(escape_plugin, tagsToIgnore);
}

module.exports = {
  injectTags,
};
