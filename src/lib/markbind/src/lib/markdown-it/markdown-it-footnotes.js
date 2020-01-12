/**
 * Modified from https://github.com/revin/markdown-it-task-lists/blob/master/index.js, 3.0.1
 */

/*!https://github.com//markdown-it/markdown-it-footnote @license MIT */(function (f) { if (typeof exports === 'object' && typeof module !== 'undefined') { module.exports = f(); } else if (typeof define === 'function' && define.amd) { define([], f); } else { let g; if (typeof window !== 'undefined') { g = window; } else if (typeof global !== 'undefined') { g = global; } else if (typeof self !== 'undefined') { g = self; } else { g = this; }g.markdownitFootnote = f(); } }(() => {
  let define; let module; let exports; return (function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { const a = typeof require === 'function' && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); const f = new Error(`Cannot find module '${o}'`); throw f.code = 'MODULE_NOT_FOUND', f; } const l = n[o] = { exports: {} }; t[o][0].call(l.exports, (e) => { const n = t[o][1][e]; return s(n || e); }, l, l.exports, e, t, n, r); } return n[o].exports; } var i = typeof require === 'function' && require; for (let o = 0; o < r.length; o++)s(r[o]); return s; }({
    1: [
      function (require, module, exports) {
        // Process footnotes
        //


        // //////////////////////////////////////////////////////////////////////////////
        // Renderer partials

        function render_footnote_anchor_name(tokens, idx, options, env/* , slf */) {
          const n = Number(tokens[idx].meta.id + 1).toString();
          let prefix = '';

          if (typeof env.docId === 'string') {
            prefix = `-${env.docId}-`;
          }

          return prefix + n;
        }

        function render_footnote_caption(tokens, idx/* , options, env, slf */) {
          let n = Number(tokens[idx].meta.id + 1).toString();

          return `[${n}]`;
        }

        function render_footnote_ref(tokens, idx, options, env, slf) {
          const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
          const caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
          let refid = id;

          if (tokens[idx].meta.subId > 0) {
            refid += `:${tokens[idx].meta.subId}`;
          }

          return `<trigger for="pop:footnote${id}"><sup class="footnote-ref"><a aria-describedby="footnote-label" href="#footnote${id}" id="footnoteref${refid}">${caption}</a></sup></trigger>`;
        }

        function render_footnote_block_open(tokens, idx, options) {
          return `${options.xhtmlOut ? '<hr class="footnotes-sep" />\n' : '<hr class="footnotes-sep">\n'
              }<section class="footnotes">\n`
            + '<ol class="footnotes-list">\n';
        }

        function render_footnote_block_close() {
          return '</ol>\n</section>\n';
        }

        function render_footnote_open(tokens, idx, options, env, slf) {
          let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

          if (tokens[idx].meta.subId > 0) {
            id += `:${tokens[idx].meta.subId}`;
          }

          return `<li id="footnote${id}" class="footnote-item">`;
        }

        function render_footnote_close() {
          return '</li>\n';
        }

        function render_footnote_anchor(tokens, idx, options, env, slf) {
          let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

          if (tokens[idx].meta.subId > 0) {
            id += `:${tokens[idx].meta.subId}`;
          }

          return '';
          // Below line adds backreferences, but doesn't work well with panels, so disabled for now.
          /* â†© with escape code to prevent display as Apple Emoji on iOS */
          // return ` <a aria-label='Back to content' href='#footnoteref${id}' class='footnote-backref'>[${id}]</a>`;
        }


        module.exports = function footnote_plugin(md) {
          const { parseLinkLabel } = md.helpers;
          const { isSpace } = md.utils;

          md.renderer.rules.footnote_ref = render_footnote_ref;
          md.renderer.rules.footnote_block_open = render_footnote_block_open;
          md.renderer.rules.footnote_block_close = render_footnote_block_close;
          md.renderer.rules.footnote_open = render_footnote_open;
          md.renderer.rules.footnote_close = render_footnote_close;
          md.renderer.rules.footnote_anchor = render_footnote_anchor;

          // helpers (only used in other rules, no tokens are attached to those)
          md.renderer.rules.footnote_caption = render_footnote_caption;
          md.renderer.rules.footnote_anchor_name = render_footnote_anchor_name;

          // Process footnote block definition
          function footnote_def(state, startLine, endLine, silent) {
            let oldBMark; let oldTShift; let oldSCount; let oldParentType; let pos; let label; let token;
            let initial; let offset; let ch; let posAfterColon;
            const start = state.bMarks[startLine] + state.tShift[startLine];
            const max = state.eMarks[startLine];

            // line should be at least 5 chars - "[^x]:"
            if (start + 4 > max) { return false; }

            if (state.src.charCodeAt(start) !== 0x5B/* [ */) { return false; }
            if (state.src.charCodeAt(start + 1) !== 0x5E/* ^ */) { return false; }

            for (pos = start + 2; pos < max; pos++) {
              if (state.src.charCodeAt(pos) === 0x20) { return false; }
              if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
                break;
              }
            }

            if (pos === start + 2) { return false; } // no empty footnote labels
            if (pos + 1 >= max || state.src.charCodeAt(++pos) !== 0x3A /* : */) { return false; }
            if (silent) { return true; }
            pos++;

            if (!state.env.footnotes) { state.env.footnotes = {}; }
            if (!state.env.footnotes.refs) { state.env.footnotes.refs = {}; }
            label = state.src.slice(start + 2, pos - 2);
            state.env.footnotes.refs[`:${label}`] = -1;

            token = new state.Token('footnote_reference_open', '', 1);
            token.meta = { label };
            token.level = state.level++;
            state.tokens.push(token);

            oldBMark = state.bMarks[startLine];
            oldTShift = state.tShift[startLine];
            oldSCount = state.sCount[startLine];
            oldParentType = state.parentType;

            posAfterColon = pos;
            initial = offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);

            while (pos < max) {
              ch = state.src.charCodeAt(pos);

              if (isSpace(ch)) {
                if (ch === 0x09) {
                  offset += 4 - offset % 4;
                } else {
                  offset++;
                }
              } else {
                break;
              }

              pos++;
            }

            state.tShift[startLine] = pos - posAfterColon;
            state.sCount[startLine] = offset - initial;

            state.bMarks[startLine] = posAfterColon;
            state.blkIndent += 4;
            state.parentType = 'footnote';

            if (state.sCount[startLine] < state.blkIndent) {
              state.sCount[startLine] += state.blkIndent;
            }

            state.md.block.tokenize(state, startLine, endLine, true);

            state.parentType = oldParentType;
            state.blkIndent -= 4;
            state.tShift[startLine] = oldTShift;
            state.sCount[startLine] = oldSCount;
            state.bMarks[startLine] = oldBMark;

            token = new state.Token('footnote_reference_close', '', -1);
            token.level = --state.level;
            state.tokens.push(token);

            return true;
          }

          // Process inline footnotes (^[...])
          function footnote_inline(state, silent) {
            let labelStart;
            let labelEnd;
            let footnoteId;
            let token;
            let tokens;
            const max = state.posMax;
            const start = state.pos;

            if (start + 2 >= max) { return false; }
            if (state.src.charCodeAt(start) !== 0x5E/* ^ */) { return false; }
            if (state.src.charCodeAt(start + 1) !== 0x5B/* [ */) { return false; }

            labelStart = start + 2;
            labelEnd = parseLinkLabel(state, start + 1);

            // parser failed to find ']', so it's not a valid note
            if (labelEnd < 0) { return false; }

            // We found the end of the link, and know for a fact it's a valid link;
            // so all that's left to do is to call tokenizer.
            //
            if (!silent) {
              if (!state.env.footnotes) { state.env.footnotes = {}; }
              if (!state.env.footnotes.list) { state.env.footnotes.list = []; }
              footnoteId = state.env.footnotes.list.length;

              state.md.inline.parse(
                state.src.slice(labelStart, labelEnd),
                state.md,
                state.env,
                tokens = [],
              );

              token = state.push('footnote_ref', '', 0);
              token.meta = { id: footnoteId };

              state.env.footnotes.list[footnoteId] = { tokens };
            }

            state.pos = labelEnd + 1;
            state.posMax = max;
            return true;
          }

          // Process footnote references ([^...])
          function footnote_ref(state, silent) {
            let label;
            let pos;
            let footnoteId;
            let footnoteSubId;
            let token;
            const max = state.posMax;
            const start = state.pos;

            // should be at least 4 chars - "[^x]"
            if (start + 3 > max) { return false; }

            if (!state.env.footnotes || !state.env.footnotes.refs) { return false; }
            if (state.src.charCodeAt(start) !== 0x5B/* [ */) { return false; }
            if (state.src.charCodeAt(start + 1) !== 0x5E/* ^ */) { return false; }

            for (pos = start + 2; pos < max; pos++) {
              if (state.src.charCodeAt(pos) === 0x20) { return false; }
              if (state.src.charCodeAt(pos) === 0x0A) { return false; }
              if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
                break;
              }
            }

            if (pos === start + 2) { return false; } // no empty footnote labels
            if (pos >= max) { return false; }
            pos++;

            label = state.src.slice(start + 2, pos - 1);
            if (typeof state.env.footnotes.refs[`:${label}`] === 'undefined') { return false; }

            if (!silent) {
              if (!state.env.footnotes.list) { state.env.footnotes.list = []; }

              if (state.env.footnotes.refs[`:${label}`] < 0) {
                footnoteId = state.env.footnotes.list.length;
                state.env.footnotes.list[footnoteId] = { label, count: 0 };
                state.env.footnotes.refs[`:${label}`] = footnoteId;
              } else {
                footnoteId = state.env.footnotes.refs[`:${label}`];
              }

              footnoteSubId = state.env.footnotes.list[footnoteId].count;
              state.env.footnotes.list[footnoteId].count++;

              token = state.push('footnote_ref', '', 0);
              token.meta = { id: footnoteId, subId: footnoteSubId, label };
            }

            state.pos = pos;
            state.posMax = max;
            return true;
          }

          // Glue footnote tokens to end of token stream
          function footnote_tail(state) {
            let i; let l; let j; let t; let lastParagraph; let list; let token; let tokens; let current; let currentLabel;
            let insideRef = false;
            const refTokens = {};

            if (!state.env.footnotes) { return; }
            state.tokens = state.tokens.filter((tok) => {
              //console.log("(" + JSON.stringify(tok) + ");")
              if (tok.type === 'footnote_reference_open') {
                insideRef = true;
                current = [];
                currentLabel = tok.meta.label;
                return false;
              }
              if (tok.type === 'footnote_reference_close') {
                insideRef = false;
                // prepend ':' to avoid conflict with Object.prototype members
                refTokens[`:${currentLabel}`] = current;
                return false;
              }
              if (insideRef) { current.push(tok); }
              return !insideRef;
            });

            if (!state.env.footnotes.list) { return; }
            list = state.env.footnotes.list;

            token = new state.Token('footnote_block_open', '', 1);
            state.tokens.push(token);

            for (i = 0, l = list.length; i < l; i++) {
              token = new state.Token('footnote_open', '', 1);
              token.meta = { id: i, label: list[i].label };
              state.tokens.push(token);

              if (list[i].tokens) {
                tokens = [];

                token = new state.Token('paragraph_open', 'p', 1);
                token.block = true;
                tokens.push(token);

                token = new state.Token('inline', '', 0);
                token.children = list[i].tokens;
                token.content = '';
                tokens.push(token);

                token = new state.Token('paragraph_close', 'p', -1);
                token.block = true;
                tokens.push(token);
              } else if (list[i].label) {
                tokens = refTokens[`:${list[i].label}`];
              }

              state.tokens = state.tokens.concat(tokens);
              if (state.tokens[state.tokens.length - 1].type === 'paragraph_close') {
                lastParagraph = state.tokens.pop();
              } else {
                lastParagraph = null;
              }

              t = list[i].count > 0 ? list[i].count : 1;
              for (j = 0; j < t; j++) {
                token = new state.Token('footnote_anchor', '', 0);
                token.meta = { id: i, subId: j, label: list[i].label };
                state.tokens.push(token);
              }

              if (lastParagraph) {
                state.tokens.push(lastParagraph);
              }

              token = new state.Token('footnote_close', '', -1);
              state.tokens.push(token);
            }

            token = new state.Token('footnote_block_close', '', -1);
            state.tokens.push(token);
          }

          md.block.ruler.before('reference', 'footnote_def', footnote_def, { alt: ['paragraph', 'reference'] });
          md.inline.ruler.after('image', 'footnote_inline', footnote_inline);
          md.inline.ruler.after('footnote_inline', 'footnote_ref', footnote_ref);
          md.core.ruler.after('inline', 'footnote_tail', footnote_tail);
        };
      }, {},
    ],
  }, {}, [1]))(1);
}));
