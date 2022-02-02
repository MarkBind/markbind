const katex = require('katex');
const hljs = require('highlight.js');
const markdownIt = require('markdown-it')({
  html: true,
  linkify: true,
});

const _ = {};
_.constant = require('lodash/constant');

const logger = require('../../utils/logger');

const { HighlightRule } = require('./highlight/HighlightRule');

const HIGHLIGHT_LINES_DELIMITER_REGEX = new RegExp(',(?![^\\[\\]]*])');

const createDoubleDelimiterInlineRule = require('./plugins/markdown-it-double-delimiter');

// markdown-it plugins

markdownIt.use(createDoubleDelimiterInlineRule('%%', 'dimmed', 'emphasis'))
  .use(createDoubleDelimiterInlineRule('!!', 'underline', 'dimmed'))
  .use(createDoubleDelimiterInlineRule('++', 'large', 'underline'))
  .use(createDoubleDelimiterInlineRule('--', 'small', 'large'));

markdownIt.use(require('markdown-it-mark'))
  .use(require('markdown-it-sub'))
  .use(require('markdown-it-sup'))
  .use(require('markdown-it-imsize'), { autofill: false })
  .use(require('markdown-it-table-of-contents'))
  .use(require('markdown-it-task-lists'), { enabled: true })
  .use(require('markdown-it-linkify-images'), { imgClass: 'img-fluid' })
  .use(require('markdown-it-texmath'), { engine: katex, delimiters: 'brackets' })
  .use(require('markdown-it-attrs'))
  .use(require('./plugins/markdown-it-radio-button'))
  .use(require('./plugins/markdown-it-block-embed'))
  .use(require('./plugins/markdown-it-icons'))
  .use(require('./plugins/markdown-it-footnotes'))
  .use(require('./plugins/markdown-it-center-text'));

// fix table style
markdownIt.renderer.rules.table_open = _.constant(
  '<div class="table-responsive"><table class="markbind-table table table-bordered table-striped">');
markdownIt.renderer.rules.table_close = _.constant('</table></div>');

function getAttribute(token, attr, deleteAttribute = false) {
  const index = token.attrIndex(attr);
  if (index === -1) {
    return undefined;
  }
  // tokens are stored as an array of two-element-arrays:
  // e.g. [ ['highlight-lines', '1,2,3'], ['start-from', '1'] ]
  const value = token.attrs[index][1];
  if (deleteAttribute) {
    token.attrs.splice(index, 1);
  }
  return value;
}

// syntax highlight code fences and add line numbers
markdownIt.renderer.rules.fence = (tokens, idx, options, env, slf) => {
  const token = tokens[idx];
  const lang = token.info || '';
  let str = token.content;
  const strArray = str.split('\n');
  let highlighted = false;
  let lines;

  const startFromRawValue = getAttribute(token, 'start-from', true);
  const startFromOneBased = Math.max(1, parseInt(startFromRawValue, 10) || 1);
  const startFromZeroBased = startFromOneBased - 1;

  if (startFromRawValue) {
    const existingClass = getAttribute(token, 'class') || '';

    const noLineNumbersRegex = /^no-line-numbers\s|\sno-line-numbers\s|\sno-line-numbers$|^no-line-numbers$/;
    const hasNoLineNumbers = existingClass.match(noLineNumbersRegex);
    if (!hasNoLineNumbers) {
      if (startFromOneBased > 1) {
        // counter is incremented on each span, so we need to subtract 1
        token.attrJoin('style', `counter-reset: line ${startFromZeroBased};`);
      }

      const lineNumbersRegex = /^line-numbers\s|\sline-numbers\s|\sline-numbers$|^line-numbers$/;
      const hasLineNumbers = existingClass.match(lineNumbersRegex);
      if (!hasLineNumbers) {
        token.attrJoin('class', 'line-numbers');
      }
    }
  }

  const highlightLinesInput = getAttribute(token, 'highlight-lines', true);
  let highlightRules = [];
  if (highlightLinesInput) {
    const highlightLines = highlightLinesInput.split(HIGHLIGHT_LINES_DELIMITER_REGEX);
    highlightRules = highlightLines
      .map(ruleStr => HighlightRule.parseRule(ruleStr, -startFromZeroBased, strArray))
      .filter(rule => rule); // discards invalid rules
  }

  if (lang && hljs.getLanguage(lang)) {
    try {
      /* With highlightjs version >= v10.7.0, usage of continuation is deprecated

      For the purposes of line-by-line highlighting, we have to first highlight the
      whole block, then split the resulting html string according to '\n', and add
      the corresponding opening and closing tags for the html string to be well-formed and
      maintain the correct state per line.

      Ref: https://github.com/MarkBind/markbind/pull/1521
      */
      lines = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value.split('\n');
      const tokenStack = [];

      lines = lines.map((line) => {
        const prepend = tokenStack.map(tok => `<span class="${tok}">`).join('');
        const re = /<span class="(.*?)">|<\/span>/g; // match all (<span class="xyz"> and </span>)
        let matchArr = re.exec(line);
        while (matchArr !== null) {
          const [match, captureGrp] = matchArr;
          if (match === '</span>') {
            // pop from stack
            tokenStack.shift();
          } else {
            // push to stack
            tokenStack.unshift(captureGrp);
          }
          matchArr = re.exec(line);
        }
        const append = '</span>'.repeat(tokenStack.length);
        return prepend + line + append;
      });
      highlighted = true;
    } catch (ex) {
      logger.error(`Error processing code block line ${ex}`);
    }
  }
  if (!highlighted) {
    lines = markdownIt.utils.escapeHtml(str).split('\n');
  }

  lines.pop(); // last line is always a single '\n' newline, so we remove it
  // wrap all lines with <span> so we can number them
  str = lines.map((line, index) => {
    const currentLineNumber = index + 1;
    const rule = highlightRules.find(highlightRule => highlightRule.shouldApplyHighlight(currentLineNumber));
    if (rule) {
      return rule.applyHighlight(line, currentLineNumber);
    }

    // not highlighted
    return `<span>${line}\n</span>`;
  }).join('');

  token.attrJoin('class', 'hljs');
  if (highlighted) {
    token.attrJoin('class', lang);
  }

  const heading = token.attrGet('heading');
  const codeBlockContent = `<pre><code ${slf.renderAttrs(token)}>${str}</code></pre>`;
  if (heading) {
    const renderedHeading = markdownIt.renderInline(heading);
    const headingStyle = (renderedHeading === heading)
      ? 'code-block-heading'
      : 'code-block-heading inline-markdown-heading';
    return '<div class="code-block">'
      + `<div class="${headingStyle}"><span>${renderedHeading}</span></div>`
      + `<div class="code-block-content">${codeBlockContent}</div>`
      + '</div>';
  }
  return codeBlockContent;
};

// highlight inline code
markdownIt.renderer.rules.code_inline = (tokens, idx, options, env, slf) => {
  const token = tokens[idx];
  const lang = token.attrGet('class');
  const inlineClass = 'hljs inline';

  if (lang && hljs.getLanguage(lang)) {
    token.attrSet('class', `${inlineClass} ${lang}`);
    return `<code${slf.renderAttrs(token)}>${
      hljs.highlight(token.content, { language: lang, ignoreIllegals: true }).value
    }</code>`;
  }
  token.attrSet('class', `${inlineClass} no-lang`);
  return `<code${slf.renderAttrs(token)}>${
    markdownIt.utils.escapeHtml(token.content)
  }</code>`;
};

const fixedNumberEmojiDefs = require('./patches/markdown-it-emoji-fixed');
markdownIt.use(require('markdown-it-emoji'), {
  defs: fixedNumberEmojiDefs,
});

module.exports = markdownIt;
