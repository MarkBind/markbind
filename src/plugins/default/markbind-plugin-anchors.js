const cheerio = module.parent.require('cheerio');

const {
  ANCHOR_HTML,
  HEADER_TAGS,
} = require('../../constants');

/**
 * Adds anchor links to headers
 */
module.exports = {
  postRender: (content) => {
    const $ = cheerio.load(content, { xmlMode: false });
    $(HEADER_TAGS).each((i, heading) => {
      if ($(heading).attr('id')) {
        $(heading).append(ANCHOR_HTML.replace('#', `#${$(heading).attr('id')}`));
      }
    });
    return $.html();
  },
};
