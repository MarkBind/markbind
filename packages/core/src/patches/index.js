const htmlparser2patch = require('./htmlparser2');
const markdownItEscapeSpecialTags = require('../lib/markdown-it/markdown-it-escape-special-tags');

function ignoreTags(tagsToIgnore) {
  htmlparser2patch.injectIgnoreTags(tagsToIgnore);
  markdownItEscapeSpecialTags.injectTags(tagsToIgnore);
}

module.exports = {
  ignoreTags,
};
