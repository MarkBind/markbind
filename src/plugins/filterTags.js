const cheerio = module.parent.require('cheerio');

/**
 * Filters out elements on the page based on config tags
 * @param tags to filter
 * @param content of the page
 */
function filterTags(tags, content) {
  if (tags === undefined) {
    return content;
  }
  const tagsArray = Array.isArray(tags) ? tags : [tags];
  const $ = cheerio.load(content, { xmlMode: false });
  $('[tags]').each((i, element) => {
    $(element).attr('hidden', true);
  });
  tagsArray.forEach((tag) => {
    $(`[tags~="${tag}"]`).each((i, element) => {
      $(element).removeAttr('hidden');
    });
  });
  $('[hidden]').remove();
  return $.html();
}

module.exports = {
  postRender: (content, pluginContext, frontMatter) => {
    // Included tags specified in site.json will override included tags specified in front matter
    const tags = (pluginContext.tags || frontMatter.tags);
    return filterTags(tags, content);
  },
};
