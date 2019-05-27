const cheerio = module.parent.require('cheerio');
const md = require('./../../lib/markbind/src/lib/markdown-it');

const ANCHOR_HTML = '<a class="fa fa-anchor" href="#"></a>';
const HEADER_TAGS = 'h1, h2, h3, h4, h5, h6';
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
