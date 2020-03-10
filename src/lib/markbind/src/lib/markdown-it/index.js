const hljs = require('highlight.js');
const markdownIt = require('markdown-it')({
  html: true,
  linkify: true
});
const slugify = require('@sindresorhus/slugify');

// markdown-it plugins
markdownIt.use(require('markdown-it-mark'))
  .use(require('markdown-it-ins'))
  .use(require('markdown-it-imsize'), {autofill: false})
  .use(require('markdown-it-table-of-contents'))
  .use(require('markdown-it-task-lists'), {enabled: true})
  .use(require('markdown-it-linkify-images'), {imgClass: 'img-fluid'})
  .use(require('markdown-it-attrs'))
  .use(require('../markdown-it-shared/markdown-it-dimmed'))
  .use(require('./markdown-it-radio-button'))
  .use(require('./markdown-it-block-embed'))
  .use(require('../markdown-it-shared/markdown-it-icons'))
  .use(require('./markdown-it-footnotes'));

// fix link
markdownIt.normalizeLink = require('./normalizeLink');

// fix table style
markdownIt.renderer.rules.table_open = (tokens, idx) => {
  return '<div class="table-responsive"><table class="markbind-table table table-bordered table-striped">';
};
markdownIt.renderer.rules.table_close = (tokens, idx) => {
  return '</table></div>';
};

// syntax highlight code fences and add line numbers
markdownIt.renderer.rules.fence = (tokens, idx, options, env, slf) => {
  const token = tokens[idx];
  const lang = token.info || '';
  let str = token.content;
  let highlighted = false;
  let lines;
  if (lang && hljs.getLanguage(lang)) {
    try {
      /* We cannot syntax highlight THEN split by lines. For eg:
      ```markdown
      *****
      -----
      ```

      becomes

      <span class="hljs-section">*****
      -----</span>
      Note the line break contained inside a <span> element.
      So we have to split by lines THEN syntax highlight.
       */
      let state = null; // state stores the current parse state of hljs, so that we can pass it on line by line
      lines = str.split('\n').map((line) => {
        const highlightedLine = hljs.highlight(lang, line, true, state);
        state = highlightedLine.top;
        return highlightedLine.value;
      });
      highlighted = true;
    } catch (_) {}
  }
  if (!highlighted) {
    lines = markdownIt.utils.escapeHtml(str).split('\n');
  }

  const startFrom = Number(token.attrGet('start-from'));

  if (startFrom) {
    // counter is incremented on each span, so we need to subtract 1
    token.attrJoin('style', `counter-set: line ${startFrom - 1};`);
  }
  
  const highlightLinesInput = token.attrGet('highlight-lines');
  let lineNumbersAndRanges = [];
  if (highlightLinesInput) {
    // example input format: "1,4-7,8,11-55"
    //               output: [[1],[4,7],[8],[11,55]]
    // the output is an array contaning either single line numbers [lineNum] or ranges [start, end]
    // ',' delimits either single line numbers (eg: 1) or ranges (eg: 4-7)
    highlightLines = highlightLinesInput.split(',');
    // if it's the single number, it will just be parsed as an int, (eg: ['1'] --> [1] )
    // if it's a range, it will be parsed as as an array of two ints (eg: ['4-7'] --> [4,6])
    lineNumbersAndRanges = highlightLines.map(elem => elem.split('-').map(lineNumber => parseInt(lineNumber, 10)));
  }
  
  lines.pop(); // last line is always a single '\n' newline, so we remove it
  // wrap all lines with <span> so we can number them
  str = lines.map((line, index) => {
    // if a line is empty we put a 0 width non breaking space
    const content = line || '&#x200B;';
    const currentLineNumber = index + 1;
    // check if there is at least one range or line number that matches the current line number
    // Note: The algorithm is based off markdown-it-highlight-lines (https://github.com/egoist/markdown-it-highlight-lines/blob/master/src/index.js) 
    //       This is an O(n^2) solution wrt to the number of lines
    //       I opt to use this approach because it's simple, and it is unlikely that the number of elements in `lineNumbersAndRanges` will be large
    //       There is possible room for improvement for a more efficient algo that is O(n).
    const inRange = lineNumbersAndRanges.some(([start, end]) => {
      if (start && end) {
        return currentLineNumber >= start && currentLineNumber <= end;
      }
      return currentLineNumber === start;
    });
    if (inRange) {
      return `<span class="highlighted">${content}</span>`;
    }
    return `<span>${content}</span>`;
  }).join('');

  token.attrJoin('class', 'hljs');
  if (highlighted) {
    token.attrJoin('class', lang);
  }

  const heading = token.attrGet('heading');
  const codeBlockContent = `<pre><code ${slf.renderAttrs(token)}>${str}</code></pre>`;
  if (heading) {
    return '<div class="code-block">'
      + `<div class="code-block-heading"><span>${heading}</span></div>`
      + `<div class="code-block-content">${codeBlockContent}</div>`
      + '</div>';
  }
  return codeBlockContent;
};

// highlight inline code
markdownIt.renderer.rules.code_inline = (tokens, idx, options, env, slf) => {
  const token = tokens[idx];
  const lang = token.attrGet('class');

  if (lang && hljs.getLanguage(lang)) {
    token.attrSet('class', `hljs inline ${lang}`);
    return '<code' + slf.renderAttrs(token) + '>'
      + hljs.highlight(lang, token.content, true).value
      + '</code>';
  } else {
    return '<code' + slf.renderAttrs(token) + '>'
      + markdownIt.utils.escapeHtml(token.content)
      + '</code>';
  }
};

const fixedNumberEmojiDefs = require('../markdown-it-shared/markdown-it-emoji-fixed');
markdownIt.use(require('markdown-it-emoji'), {
  defs: fixedNumberEmojiDefs
});

module.exports = markdownIt;
