const hljs = require('highlight.js');
const markdownIt = require('markdown-it')({
  html: true,
  linkify: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre><code class="hljs ' + lang + '">' +
          hljs.highlight(lang, str, true).value +
          '</code></pre>';
      } catch (__) {}
    }

    return '<pre class="hljs"><code>' + hljs.highlightAuto(str).value + '</code></pre>';
  }
});

// markdown-it plugins
markdownIt.use(require('markdown-it-mark'))
  .use(require('markdown-it-emoji'))
  .use(require('markdown-it-ins'))
  .use(require('markdown-it-anchor'))
  .use(require('markdown-it-imsize'), { autofill: false})
  .use(require('markdown-it-table-of-contents'))
  .use(require('markdown-it-task-lists'), {
    enabled: true
  })
  .use(require('./markdown-it-dimmed'))
  .use(require('./markdown-it-radio-button'))
  .use(require('./markdown-it-block-embed'));

// fix table style
markdownIt.renderer.rules.table_open = (tokens, idx) => {
  return '<table class="markbind-table table">';
};

module.exports = markdownIt;
