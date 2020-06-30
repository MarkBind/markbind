const htmlparser2patch = require('./src/patches/htmlparser2');
const markdownItEscapeSpecialTags = require('./src/lib/markdown-it/markdown-it-escape-special-tags');
const Parser = require('./src/Parser');

function ignoreTags(tagsToIgnore) {
  htmlparser2patch.injectIgnoreTags(tagsToIgnore);
  markdownItEscapeSpecialTags.injectTags(tagsToIgnore);
}

module.exports = {
  Parser,
  ignoreTags,
};
