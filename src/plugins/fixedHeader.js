const cheerio = module.parent.require('cheerio');

module.exports = {
  // eslint-disable-next-line no-unused-vars
  preRender: (content, pluginContext, frontMatter) => content,
  // eslint-disable-next-line no-unused-vars
  postRender: (content, pluginContext, frontMatter) => {
    const $ = cheerio.load(content, { xmlMode: false });
    const isFixed = $('header')[0].attribs === undefined
      ? false : $('header')[0].attribs.class === 'header-fixed';
    if (isFixed) {
      $('h1, h2, h3, h4, h5, h6, .header-wrapper').each((index, heading) => {
        const spanId = heading.attribs.id;
        $(heading).prepend(`<span id="${spanId}" class="anchor"></span>`);
      });
    }
    return $.html();
  },
};
