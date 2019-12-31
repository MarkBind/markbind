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
      } catch (__) {
      }
    }

    return '<pre><code class="hljs">' + markdownIt.utils.escapeHtml(str) + '</code></pre>';
  }
});
const slugify = require('@sindresorhus/slugify');

// markdown-it plugins
markdownIt.use(require('markdown-it-mark'))
  .use(require('markdown-it-ins'))
  .use(require('markdown-it-anchor'), {slugify: (str) => slugify(str, { decamelize: false })})
  .use(require('markdown-it-imsize'), {autofill: false})
  .use(require('markdown-it-table-of-contents'))
  .use(require('markdown-it-task-lists'), {enabled: true})
  .use(require('markdown-it-linkify-images'), {imgClass: 'img-fluid'})
  .use(require('markdown-it-attrs'))
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

// fix emoji numbers
const emojiData = require('markdown-it-emoji/lib/data/full.json');
// Extend emoji here
emojiData['zero'] = emojiData['0'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0030-20e3.png">';
emojiData['one'] = emojiData['1'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0031-20e3.png">';
emojiData['two'] = emojiData['2'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0032-20e3.png">';
emojiData['three'] = emojiData['3'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0033-20e3.png">';
emojiData['four'] = emojiData['4'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0034-20e3.png">';
emojiData['five'] = emojiData['5'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0035-20e3.png">';
emojiData['six'] = emojiData['6'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0036-20e3.png">';
emojiData['seven'] = emojiData['7'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0037-20e3.png">';
emojiData['eight'] = emojiData['8'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0038-20e3.png">';
emojiData['nine'] = emojiData['9'] = '<img style="height: 1em;width: 1em;margin: 0 .05em 0 .1em;vertical-align: -0.1em;" src="https://assets-cdn.github.com/images/icons/emoji/unicode/0039-20e3.png">';
markdownIt.use(require('markdown-it-emoji'), {
  defs: emojiData
});

module.exports = markdownIt;
