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

'use strict';

module.exports = function colourtext_plugin(md) {
  const acsiiCodeToTokenMap = new Map([
    [114, '#r#'],
    [103, '#g#'],
    [98, '#b#'],
    [99, '#c#'],
    [109, '#m#'],
    [121, '#y#'],
    [107, '#k#'],
    [119, '#w#'],
  ]);
  const delimMarkerToClassMap = new Map([
    ['#r#', 'mkb-text-red'],
    ['#g#', 'mkb-text-green'],
    ['#b#', 'mkb-text-blue'],
    ['#c#', 'mkb-text-cyan'],
    ['#m#', 'mkb-text-magenta'],
    ['#y#', 'mkb-text-yellow'],
    ['#k#', 'mkb-text-black'],
    ['#w#', 'mkb-text-white'],
  ]);

  function tokenize(state, silent) {
    var token,
        max = state.posMax,
        start = state.pos,
        marker = state.src.charCodeAt(start);
    if (start + 1 > max) { return false; }
    if (silent) { return false; } // don't run any pairs in validation mode

    if (marker === 35/* # */ &&
      acsiiCodeToTokenMap.has(state.src.charCodeAt(start + 1)) &&
      start + 2 <= max && 
      state.src.charCodeAt(start + 2) === 35/* # */
      ) {
      state.scanDelims(state.pos, true);
      token         = state.push('text', '', 0);
      token.content = acsiiCodeToTokenMap.get(state.src.charCodeAt(start + 1));
      state.delimiters.push({
        marker: token.content,
        jump:   0,
        token:  state.tokens.length - 1,
        level:  state.level,
        end:    -1,
        open:   true,
        close:  false
      });
      state.pos += 3;
    } else if (marker === 35/* # */ &&
      state.src.charCodeAt(start + 1) === 35/* # */
      ) {
      // found the close marker
      state.scanDelims(state.pos, true);
      token         = state.push('text', '', 0);
      token.content = '##';
      state.delimiters.push({
        marker: token.content,
        jump:   0,
        token:  state.tokens.length - 1,
        level:  state.level,
        end:    -1,
        open:   false,
        close:  true
      });
      state.pos += 2;
    } else {
      // neither
      return false;
    }

    return true;
  }


  // Walk through delimiter list and replace text tokens with tags
  function postProcess(state) {
    var i,
        foundStart = false,
        foundEnd = false,
        delim,
        token,
        delimiters = state.delimiters,
        max = state.delimiters.length;

    for (i = 0; i < max; i++) {
      delim = delimiters[i];
      if (delimMarkerToClassMap.has(delim.marker)) {
        foundStart = true;
      } else if (delim.marker === '##') {
        foundEnd = true;
      }
    }
    if (foundStart && foundEnd) {
      for (i = 0; i < max; i++) {
        delim = delimiters[i];

        if (delimMarkerToClassMap.has(delim.marker)) {
          foundStart = true;
          token         = state.tokens[delim.token];
          token.type    = 'colourtext_open';
          token.tag     = 'span';
          token.nesting = 1;
          token.markup  = delim.marker;
          token.content = '';
          token.attrs = [ [ 'class', delimMarkerToClassMap.get(delim.marker) ] ];
        } else if (delim.marker === '##') {
          if (foundStart) {
            token         = state.tokens[delim.token];
            token.type    = 'colourtext_close';
            token.tag     = 'span';
            token.nesting = -1;
            token.markup  = '##';
            token.content = '';
          }
        }
      }
    }
  }

  md.inline.ruler.before('strikethrough', 'colourtext', tokenize);
  md.inline.ruler2.before('strikethrough', 'colourtext', postProcess);
};
