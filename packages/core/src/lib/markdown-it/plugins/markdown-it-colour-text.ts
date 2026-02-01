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

// Process #(char)# coloured text ##

import MarkdownIt from 'markdown-it';
import StateInline from 'markdown-it/lib/rules_inline/state_inline';

export function colourTextPlugin(md: MarkdownIt): void {
  const asciiCodeToTokenMap = new Map<number, string>([
    [114, '#r#'],
    [103, '#g#'],
    [98, '#b#'],
    [99, '#c#'],
    [109, '#m#'],
    [121, '#y#'],
    [107, '#k#'],
    [119, '#w#'],
  ]);

  const delimMarkerToClassMap = new Map<string, string>([
    ['#r#', 'mkb-text-red'],
    ['#g#', 'mkb-text-green'],
    ['#b#', 'mkb-text-blue'],
    ['#c#', 'mkb-text-cyan'],
    ['#m#', 'mkb-text-magenta'],
    ['#y#', 'mkb-text-yellow'],
    ['#k#', 'mkb-text-black'],
    ['#w#', 'mkb-text-white'],
  ]);

  function tokenize(state: StateInline, silent: boolean): boolean {
    let token;
    const max = state.posMax;
    const start = state.pos;
    const marker = state.src.charCodeAt(start);

    if (start + 1 > max) { return false; }
    if (silent) { return false; } // don't run any pairs in validation mode

    const nextChar = state.src.charCodeAt(start + 1);

    // Check for opening: #x#
    if (marker === 35/* # */ &&
      asciiCodeToTokenMap.has(nextChar) &&
      start + 2 <= max &&
      state.src.charCodeAt(start + 2) === 35/* # */
    ) {
      state.scanDelims(state.pos, true);
      token = state.push('text', '', 0);
      const tokenContent = asciiCodeToTokenMap.get(nextChar)!;
      token.content = tokenContent;
      
      state.delimiters.push({
        marker: 35, // Use # as the marker code
        length: 3,  // length of #x# is 3
        jump: 0,
        token: state.tokens.length - 1,
        end: -1,
        open: true,
        close: false,
      });
      state.pos += 3;
    } 
    // Check for closing: ##
    else if (marker === 35/* # */ && nextChar === 35/* # */) {
      state.scanDelims(state.pos, true);
      token = state.push('text', '', 0);
      token.content = '##';
      
      state.delimiters.push({
        marker: 35,
        length: 2, // length of ## is 2
        jump: 0,
        token: state.tokens.length - 1,
        end: -1,
        open: false,
        close: true,
      });
      state.pos += 2;
    } else {
      return false;
    }

    return true;
  }

  function postProcess(state: StateInline): boolean {
    let foundStart = false;
    let foundEnd = false;
    const { delimiters, tokens } = state;

    for (let i = 0; i < delimiters.length; i++) {
      const delim = delimiters[i];
      if (delim.marker === 35 && delim.open) {
        foundStart = true;
      } else if (delim.marker === 35 && delim.close) {
        foundEnd = true;
      }
    }

    if (foundStart && foundEnd) {
      foundStart = false; 
      for (let i = 0; i < delimiters.length; i++) {
        const delim = delimiters[i];
        const token = tokens[delim.token];

        if (delim.marker === 35 && delim.open) {
          // Check if the content is one of our color tokens
          const className = delimMarkerToClassMap.get(token.content);
          if (className) {
            foundStart = true;
            token.type = 'colourtext_open';
            token.tag = 'span';
            token.nesting = 1;
            token.markup = token.content;
            token.content = '';
            token.attrs = [['class', className]];
          }
        } else if (delim.marker === 35 && delim.close) {
          if (foundStart) {
            token.type = 'colourtext_close';
            token.tag = 'span';
            token.nesting = -1;
            token.markup = '##';
            token.content = '';
          }
        }
      }
    }
    return true;
  }

  md.inline.ruler.before('strikethrough', 'colourtext', tokenize);
  md.inline.ruler2.before('strikethrough', 'colourtext', postProcess);
}