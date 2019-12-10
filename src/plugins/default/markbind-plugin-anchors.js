const cheerio = module.parent.require('cheerio');
const md = require('./../../lib/markbind/src/lib/markdown-it');

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
    $('panel[header]').each((i, panel) => {
      const panelHeading = cheerio.load(md.render(panel.attribs.header), { xmlMode: false });
      if (panelHeading(HEADER_TAGS).length >= 1) {
        const headingId = $(panelHeading(HEADER_TAGS)[0]).attr('id');
        const anchorIcon = ANCHOR_HTML.replace(/"/g, "'").replace('#', `#${headingId}`);
        $(panel).attr('header', `${$(panel).attr('header')}${anchorIcon}`);
      }
    });
    return $.html();
  },
};
