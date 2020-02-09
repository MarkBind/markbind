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
  if (lang && hljs.getLanguage(lang)) {
    try {
      str = hljs.highlight(lang, str).value;
      highlighted = true;
    } catch (__) {}
  }
  if (!highlighted) {
    str = markdownIt.utils.escapeHtml(str);
  }
  const lines = str.split('\n');
  lines.pop(); // last line is always a single '\n' newline, so we remove it
  str =  lines.map(line => `<span>${line}</span>`).join(''); //wrap all lines with <span> so we can number them
  token.attrJoin('class', 'hljs');

  if (highlighted) {
    token.attrJoin('class', lang);
  }
  return `<pre><code ${slf.renderAttrs(token)}>${str}</code></pre>`;
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
