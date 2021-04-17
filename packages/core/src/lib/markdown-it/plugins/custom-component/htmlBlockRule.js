const blockNames = require('markdown-it/lib/common/html_blocks');
const { HTML_OPEN_CLOSE_TAG_RE } = require('./htmlRe');
const inlineTags = require('./inlineTags');
const vueReservedTags = require('./vueReservedTags');

/*
 * In MarkBind, We consider panel components of minimal type to be inline element.
 * Thus, we have to ensure that markdown-it parses minimal panel as inline element
 * by using the regex below. 
 */
const minimalPanelStringRegex = '(panel.*minimized.*)';

// Forked and modified from 'markdown-it/lib/rules_block/html_block.js'

// An array of opening and corresponding closing sequences for html tags,
// last argument defines whether it can terminate a paragraph or not
const HTML_SEQUENCES = [
  [/^<(script|pre|style)(?=(\s|>|$))/i, /<\/(script|pre|style)>/i, true],
  [/^<!--/, /-->/, true],
  [/^<\?/, /\?>/, true],
  [/^<![A-Z]/, />/, true],
  [/^<!\[CDATA\[/, /\]\]>/, true],
  // MODIFIED HERE: Treat vue reserved tags as block tags
  [
    new RegExp('^</?(' + vueReservedTags.join('|') + ')(?=(\\s|/?>|$))', 'i'),
    /^$/,
    true,
  ],
  // MODIFIED HERE: Treat unknown tags as block tags (custom components), excluding known inline tags
  [
    new RegExp(
      '^</?(?!(' + inlineTags.join('|') + `|${minimalPanelStringRegex}` + ')(?![\\w-]))\\w[\\w-]*[\\s/>]'
    ),
    /^$/,
    true,
  ],
  [
    new RegExp('^</?(' + blockNames.join('|') + ')(?=(\\s|/?>|$))', 'i'),
    /^$/,
    true,
  ],
  [new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + '\\s*$'), /^$/, false],
]

function customComponentHtmlBlockRule(state, startLine, endLine, silent) {
  let i;
  let nextLine;
  let lineText;
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false
  }

  if (!state.md.options.html) {
    return false
  }

  if (state.src.charCodeAt(pos) !== 0x3c /* < */) {
    return false
  }

  lineText = state.src.slice(pos, max)

  for (i = 0; i < HTML_SEQUENCES.length; i++) {
    if (HTML_SEQUENCES[i][0].test(lineText)) {
      break
    }
  }

  if (i === HTML_SEQUENCES.length) {
    return false
  }

  if (silent) {
    // true if this sequence can be a terminator, false otherwise
    return HTML_SEQUENCES[i][2]
  }

  nextLine = startLine + 1

  // If we are here - we detected HTML block.
  // Let's roll down till block end.
  if (!HTML_SEQUENCES[i][1].test(lineText)) {
    for (; nextLine < endLine; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) {
        break
      }

      pos = state.bMarks[nextLine] + state.tShift[nextLine]
      max = state.eMarks[nextLine]
      lineText = state.src.slice(pos, max)

      if (HTML_SEQUENCES[i][1].test(lineText)) {
        if (lineText.length !== 0) {
          nextLine++
        }
        break
      }
    }
  }

  state.line = nextLine

  const token = state.push('html_block', '', 0)
  token.map = [startLine, nextLine]
  token.content = state.getLines(startLine, nextLine, state.blkIndent, true)

  return true
}

module.exports = customComponentHtmlBlockRule;
