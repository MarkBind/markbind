const markdownIt = require('markdown-it')({
  html: true,
  linkify: true
});

// markdown-it plugins
markdownIt.use(require('markdown-it-mark'))
  .use(require('markdown-it-emoji'))
  .use(require('markdown-it-ins'))
  .use(require('markdown-it-anchor'))
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
