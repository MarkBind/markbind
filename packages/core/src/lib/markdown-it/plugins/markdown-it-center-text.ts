/*
 Copyright (c) 2016-2018 Jay Hodgson

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

// Process -> center text <-

import MarkdownIt from 'markdown-it';
import StateInline from 'markdown-it/lib/rules_inline/state_inline';

/**
 * A markdown-it plugin to center text using the syntax ->text<-
 */
export function centertext_plugin(md: MarkdownIt): void {
  function tokenize(state: StateInline, silent: boolean): boolean {
    let token;
    const max = state.posMax;
    const start = state.pos;
    const marker = state.src.charCodeAt(start);

    if (start + 1 > max) { return false; }
    if (silent) { return false; } // don't run any pairs in validation mode

    if (marker === 45/* - */ &&
      state.src.charCodeAt(start + 1) === 62/* > */
    ) {
      state.scanDelims(state.pos, true);
      token = state.push('text', '', 0);
      token.content = '->';
      state.delimiters.push({
        marker: 45, // CHANGED: Use character code 45 instead of string '->'
        jump: 0,
        token: state.tokens.length - 1,
        length: 2,
        end: -1,
        open: true,
        close: false,
      });
    } else if (marker === 60/* < */ &&
      state.src.charCodeAt(start + 1) === 45/* - */
    ) {
      // found the close marker
      state.scanDelims(state.pos, true);
      token = state.push('text', '', 0);
      token.content = '<-';
      state.delimiters.push({
        marker: 60, // CHANGED: Use character code 60 instead of string '<-'
        jump: 0,
        token: state.tokens.length - 1,
        length: 2,
        end: -1,
        open: false,
        close: true,
      });
    } else {
      // neither
      return false;
    }

    state.pos += 2;

    return true;
  }

  // Walk through delimiter list and replace text tokens with tags
  function postProcess(state: StateInline): boolean {
    let i;
    let foundStart = false;
    let foundEnd = false;
    let delim;
    let token;
    const delimiters = state.delimiters;
    const max = state.delimiters.length;

    for (i = 0; i < max; i++) {
      delim = delimiters[i];
      if (delim.marker === 45/* - */) {
        foundStart = true;
      } else if (delim.marker === 60/* < */) {
        foundEnd = true;
      }
    }
    if (foundStart && foundEnd) {
      for (i = 0; i < max; i++) {
        delim = delimiters[i];

        if (delim.marker === 45/* - */) {
          foundStart = true;
          token = state.tokens[delim.token];
          token.type = 'centertext_open';
          token.tag = 'div';
          token.nesting = 1;
          token.markup = '->';
          token.content = '';
          token.attrs = [['class', 'text-center']];
        } else if (delim.marker === 60/* < */) {
          if (foundStart) {
            token = state.tokens[delim.token];
            token.type = 'centertext_close';
            token.tag = 'div';
            token.nesting = -1;
            token.markup = '<-';
            token.content = '';
          }
        }
      }
    }
    return true;
  }

  md.inline.ruler.before('emphasis', 'centertext', tokenize);
  md.inline.ruler2.before('emphasis', 'centertext', postProcess);
};
