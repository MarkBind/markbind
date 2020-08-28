const hljs = require('highlight.js');
const markdownIt = require('markdown-it')({
  html: true,
  linkify: true
});
const slugify = require('@sindresorhus/slugify');

const LINESLICE_REGEX = new RegExp('(\\d+)\\[(\\d*):(\\d*)]', 'g')

// markdown-it plugins
markdownIt.use(require('markdown-it-mark'))
  .use(require('markdown-it-ins'))
  .use(require('markdown-it-sub'))
  .use(require('markdown-it-sup'))
  .use(require('markdown-it-imsize'), {autofill: false})
  .use(require('markdown-it-table-of-contents'))
  .use(require('markdown-it-task-lists'), {enabled: true})
  .use(require('markdown-it-linkify-images'), {imgClass: 'img-fluid'})
  .use(require('./patches/markdown-it-attrs-nunjucks'))
  .use(require('./markdown-it-dimmed'))
  .use(require('./markdown-it-radio-button'))
  .use(require('./markdown-it-block-embed'))
  .use(require('./markdown-it-icons'))
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

function getAttributeAndDelete(token, attr) {
  const index = token.attrIndex(attr);
  if (index === -1) {
    return undefined;
  }
  // tokens are stored as an array of two-element-arrays:
  // e.g. [ ['highlight-lines', '1,2,3'], ['start-from', '1'] ]
  const value = token.attrs[index][1];
  token.attrs.splice(index, 1);
  return value;
}

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

  const startFromOneBased = Math.max(1, parseInt(getAttributeAndDelete(token, 'start-from'), 10) || 1);
  const startFromZeroBased = startFromOneBased - 1;

  if (startFromOneBased > 1) {
    // counter is incremented on each span, so we need to subtract 1
    token.attrJoin('style', `counter-reset: line ${startFromZeroBased};`);
  }

  const highlightLinesInput = getAttributeAndDelete(token, 'highlight-lines');
  let highlightRules = [];
  if (highlightLinesInput) {
    // example input format: "1,4-7,8,11-55,2[5:7],4[:]"
    //               output: [[1],[4,7],[8],[11,55],[2,5,7],[4,-1,-1]]
    // the output is an array containing either single line numbers [lineNum], ranges [start, end]
    // or single line number with slice [lineNum, start, end]
    // ',' delimits either single line numbers (eg: 1), ranges (eg: 4-7), or line number with slice
    // (e.g. 2[5:7])
    const highlightLines = highlightLinesInput.split(',');
    // if it's a single number, it will just be parsed as an int, (eg: ['1'] --> [1] )
    // if it's a range, it will be parsed as as an array of two ints (eg: ['4-7'] --> [4,7])
    // if it's a single number with a slice, it will be parsed as an array of three ints, with the
    // latter two having a default of -1 if not specified (eg: ['2[5:7]'] --> [2, 5, 7])
    function parseAndZeroBaseLineNumber(numberString) {
      // authors provide line numbers to highlight based on the 'start-from' attribute if it exists
      // so we need to shift them all back down to start at 0
      return parseInt(numberString, 10) - startFromZeroBased;
    }
    highlightRules = highlightLines.map(elem => {
      // tries to match to the line slice pattern
      const matchGroups = [...elem.matchAll(LINESLICE_REGEX)];
      if (matchGroups.length > 0) {
        let numbers = matchGroups[0].slice(1); // keep the group matches only

        // only the first number is a line number, the rest are regular numbers
        numbers[0] = parseAndZeroBaseLineNumber(numbers[0]);
        numbers = numbers.map(x => x !== '' ? parseInt(x, 10) : -1);
        return numbers;
      }

      // match fails, either single number or line ranges
      return elem.split('-').map(parseAndZeroBaseLineNumber)
    });
  }

  lines.pop(); // last line is always a single '\n' newline, so we remove it
  // wrap all lines with <span> so we can number them
  str = lines.map((line, index) => {
    const currentLineNumber = index + 1;
    // check if there is at least one range or line number that matches the current line number
    // Note: The algorithm is based off markdown-it-highlight-lines (https://github.com/egoist/markdown-it-highlight-lines/blob/master/src/index.js)
    //       This is an O(n^2) solution wrt to the number of lines
    //       I opt to use this approach because it's simple, and it is unlikely that the number of elements in `lineNumbersAndRanges` will be large
    //       There is possible room for improvement for a more efficient algo that is O(n).
    // Edit (28/8/2020): I changed the approach from using some() to a simple for-loop. It is still O(n^2).
    //                   Reason: now with different highlighting methods (whole line/text only),
    //                   checks must be done to determine what method a particular rule follows.
    //                   As now checking has to be done at the rule-matching AND the return handling,
    //                   it's more succinct to write a for-loop so that we can do both without
    //                   being redundant (wrt. writing if-else conditions).
    for (let i = 0; i < highlightRules.length; i++) {
      const [a, b, c] = highlightRules[i];

      // "line slice" format
      if (a && b && c) {
        if (currentLineNumber === a) {
          const contentIdx = line.search(/\S|$/)
          const indents = line.substr(0, contentIdx)
          const content = line.substr(contentIdx)

          if (b === -1 && c === -1) {
            // whole text
            return `<span>${indents}<span class="highlighted">${content}</span>\n</span>`;
          }
        }
      }

      // "line range" format
      if (a && b) {
        if (currentLineNumber >= a && currentLineNumber <= b) {
          return `<span class="highlighted">${line}\n</span>`;
        }
      }

      // "line number" format
      if (currentLineNumber === a) {
        return `<span class="highlighted">${line}\n</span>`;
      }
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
    const headingStyle = (renderedHeading === heading) ? 'code-block-heading' : 'code-block-heading inline-markdown-heading';
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

const fixedNumberEmojiDefs = require('./markdown-it-emoji-fixed');
markdownIt.use(require('markdown-it-emoji'), {
  defs: fixedNumberEmojiDefs
});

module.exports = markdownIt;
