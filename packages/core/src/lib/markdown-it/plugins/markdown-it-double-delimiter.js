'use strict';

/*
 Copyright (c) 2014-2015 Vitaly Puzrin, Alex Kocharin

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 Markdown-it 12.0.4 source 
 markdown-it/blob/master/lib/rules_inline/strikethrough.js adapted to fit MarkBind's needs, to:
 - create new inline rules dynamically for different delimiters 
 */

/**
 * Creates a new inline rule for markdown-it, specifically for rules that uses a 'double' delimiter.
 * Some examples are ++, --, !!, %%. 
 * @param delimiter Represents the double delimiter to be used to create tokens when parsing.
 * @param ruleName The name that represents the rule you are creating.
 * @param nextRule There is a precedence ordering for the rules in markdown-it. This parameter
 * lets you decide which rule to place your newly created rule before. You may refer to the following 
 * link for the existing inline rules in markdown-it.
 * https://github.com/markdown-it/markdown-it/blob/master/lib/parser_inline.js
 */
module.exports = function createDoubleDelimiterInlineRule(delimiter, ruleName, nextRule) {
  const doubleDelimiterPlugin = function double_delimiter_plugin(md) {
    // Insert each marker as a separate text token, and add it to delimiter list
    function tokenize(state, silent) {
      var i, scanned, token, len, ch,
        start = state.pos,
        marker = state.src.charCodeAt(start);

      if (silent) {
        return false;
      }

      if (marker !== delimiter.charCodeAt(0)) {
        return false;
      }

      scanned = state.scanDelims(state.pos, true);
      len = scanned.length;
      ch = String.fromCharCode(marker);

      if (len < 2) {
        return false;
      }

      if (len % 2) {
        token = state.push('text', '', 0);
        token.content = ch;
        len--;
      }

      for (i = 0; i < len; i += 2) {
        token = state.push('text', '', 0);
        token.content = ch + ch;

        state.delimiters.push({
          marker: marker,
          jump: i,
          token: state.tokens.length - 1,
          level: state.level,
          end: -1,
          open: scanned.can_open,
          close: scanned.can_close
        });
      }

      state.pos += scanned.length;

      return true;
    }


    // Walk through delimiter list and replace text tokens with tags
    function postProcess(state) {
      var i, j,
        startDelim,
        endDelim,
        token,
        loneMarkers = [],
        delimiters = state.delimiters,
        max = state.delimiters.length;

      for (i = 0; i < max; i++) {
        startDelim = delimiters[i];

        if (startDelim.marker !== delimiter.charCodeAt(0)) {
          continue;
        }

        if (startDelim.end === -1) {
          continue;
        }

        endDelim = delimiters[startDelim.end];

        token = state.tokens[startDelim.token];
        token.type = `${ruleName}_open` 
        token.tag = 'span';
        token.attrs = [['class', ruleName]];
        token.nesting = 1;
        token.markup = delimiter;
        token.content = '';

        token = state.tokens[endDelim.token];
        token.type = `${ruleName}_close` 
        token.tag = 'span';
        token.nesting = -1;
        token.markup = delimiter;
        token.content = '';

        if (state.tokens[endDelim.token - 1].type === 'text' &&
          state.tokens[endDelim.token - 1].content === delimiter.charAt(0)) {

          loneMarkers.push(endDelim.token - 1);
        }
      }

      // If a marker sequence has an odd number of characters, it's splitted
      // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
      // start of the sequence.
      //
      // So, we have to move all those markers after subsequent s_close tags.
      while (loneMarkers.length) {
        i = loneMarkers.pop();
        j = i + 1;

        while (j < state.tokens.length && state.tokens[j].type === `${ruleName}_close`) {
          j++;
        }

        j--;

        if (i !== j) {
          token = state.tokens[j];
          state.tokens[j] = state.tokens[i];
          state.tokens[i] = token;
        }
      }
    }

    md.inline.ruler.before(nextRule, ruleName, tokenize);
    md.inline.ruler2.before(nextRule, ruleName, postProcess);
  }

  return doubleDelimiterPlugin;
};
