const cheerio = module.parent.require('cheerio');
const md = require('./../../lib/markbind/src/lib/markdown-it');

const ANCHOR_HTML = '<a class="fa fa-anchor" href="#"></a>';

/**
 * Generates a heading selector based on the indexing level
 * @param headingIndexingLevel to generate
 */
function generateHeadingSelector(headingIndexingLevel) {
  let headingsSelector = 'h1';
  for (let i = 2; i <= headingIndexingLevel; i += 1) {
    headingsSelector += `, h${i}`;
  }
  return headingsSelector;
}

/**
 * Adds anchor links to headers
 */
module.exports = {
  postRender: (content, pluginContext, frontMatter, pageConfig) => {
    const $ = cheerio.load(content, { xmlMode: false });
    if (pageConfig.headingIndexingLevel > 0) {
      const headingsSelector = generateHeadingSelector(pageConfig.headingIndexingLevel);
      $(headingsSelector).each((i, heading) => {
        $(heading).append(ANCHOR_HTML.replace('#', `#${$(heading).attr('id')}`));
      });
      $('panel[header]').each((i, panel) => {
        const panelHeading = cheerio.load(md.render(panel.attribs.header), { xmlMode: false });
        if (panelHeading(headingsSelector).length >= 1) {
          const headingId = $(panelHeading(headingsSelector)[0]).attr('id');
          const anchorIcon = ANCHOR_HTML.replace(/"/g, "'").replace('#', `#${headingId}`);
          $(panel).attr('header', `${$(panel).attr('header')}${anchorIcon}`);
        }
      });
    }
    return $.html();
  },
};
