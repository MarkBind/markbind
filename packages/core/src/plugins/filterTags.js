const cheerio = module.parent.require('cheerio');
const escapeRegExp = module.parent.require('lodash/escapeRegExp');

/**
 * Filters out elements on the page based on config tags
 * @param tags to filter
 * @param content of the page
 */
function filterTags(tags, content) {
  if (!tags) {
    return content;
  }
  const $ = cheerio.load(content);
  const tagOperations = tags.map(tag => ({
    // Trim leading + or -, replace * with .*, add ^ and $
    tagExp: `^${escapeRegExp(tag.replace(/^(\+|-)/g, '')).replace(/\\\*/, '.*')}$`,
    // Whether it is makes tags visible or hides them
    isHidden: tag.startsWith('-'),
  }));
  $('[tags]').each((i, element) => {
    $(element).attr('hidden', true);
    $(element).attr('tags').split(' ').forEach((tag) => {
      tagOperations.forEach((tagOperation) => {
        if (!tag.match(tagOperation.tagExp)) {
          return;
        }
        if (tagOperation.isHidden) {
          $(element).attr('hidden', true);
        } else {
          $(element).removeAttr('hidden');
        }
      });
    });
  });
  $('[hidden]').remove();
  return $.html();
}

module.exports = {
  postRender: (pluginContext, frontMatter, content) => {
    // Tags specified in site.json will be merged with tags specified in front matter
    const mergedTags = (frontMatter.tags || []).concat(pluginContext.tags || []);
    return filterTags(mergedTags, content);
  },
};
