const cheerio = module.parent.require('cheerio');

module.exports = {
  preRender: (_, pluginContext, frontMatter) => {},
  postRender: (content, pluginContext, frontMatter) => {
    const $ = cheerio.load(content, { xmlMode: false });
    // Modify the page...
    $('h2').addClass('haha');
    return $.html();
  },
};
