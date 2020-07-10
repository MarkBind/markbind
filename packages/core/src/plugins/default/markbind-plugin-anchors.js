const cheerio = module.parent.require('cheerio');

const CSS_FILE_NAME = 'markbind-plugin-anchors.css';

/**
 * Adds anchor links to headers
 */
module.exports = {
  getLinks: (content, pluginContext, frontMatter, utils) => [utils.buildStylesheet(CSS_FILE_NAME)],
  postRender: (content) => {
    const $ = cheerio.load(content);
    $(':header').each((i, heading) => {
      if ($(heading).attr('id')) {
        $(heading).append(
          `<a class="fa fa-anchor" href="#${$(heading).attr('id')}" onclick="event.stopPropagation()"></a>`);
      }
    });
    return $.html();
  },
};
