const cheerio = module.parent.require('cheerio');

// Convert panel headings: <span heading>
function convertPanelHeadings($) {
  $('panel>span[heading]').each((i, element) => {
    $(element).attr('slot', 'header');
    $(element).addClass('card-title');
    $(element).removeAttr('heading');
  });
}

/**
 * Converts shorthand syntax to proper Markbind syntax
 * @param content of the page
 */
module.exports = {
  postRender: (content) => {
    const $ = cheerio.load(content, { xmlMode: false });
    convertPanelHeadings($);
    return $.html();
  },
};
