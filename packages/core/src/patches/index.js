const htmlparser2patch = require('./htmlparser2');
const markdownItCustomComponent
  = require('../lib/markdown-it/patches/custom-component/customComponentPlugin');

function ignoreTags(tagsToIgnore) {
  htmlparser2patch.injectIgnoreTags(tagsToIgnore);
  markdownItCustomComponent.injectTags(tagsToIgnore);
}

module.exports = {
  ignoreTags,
};
