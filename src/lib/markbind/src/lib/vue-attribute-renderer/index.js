/*
 * markdownIt instance using a different set of plugins for parsing and rendering
 * markdown in vue components' attributes.
 *
 * Todo standardise this with the main markdown parser
 */

const markdownIt = require('markdown-it')({
  html: true,
  linkify: true,
});

markdownIt.use(require('markdown-it-mark'))
  .use(require('markdown-it-ins'))
  .use(require('markdown-it-sub'))
  .use(require('markdown-it-sup'))
  .use(require('../markdown-it-shared/markdown-it-dimmed'))
  .use(require('../markdown-it-shared/markdown-it-icons'))
  .use(require('markdown-it-imsize'), {
    autofill: false,
  });

const fixedNumberEmojiDefs = require('../markdown-it-shared/markdown-it-emoji-fixed');
markdownIt.use(require('markdown-it-emoji'), {
  defs: fixedNumberEmojiDefs,
});

module.exports = markdownIt;
