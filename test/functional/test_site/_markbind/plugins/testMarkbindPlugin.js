const cheerio = module.parent.require('cheerio');

module.exports = {
  preRender: (content, pluginContext) =>
    content.replace('Markbind Plugin Pre-render Placeholder', `${pluginContext.pre}`),
  postRender: (content, pluginContext) => {
    const $ = cheerio.load(content, { xmlMode: false });
    $('#test-markbind-plugin').append(`${pluginContext.post}`);
    return $.html();
  },
  getLinks: (content, pluginContext, frontMatter, utils) => [utils.buildStylesheet('STYLESHEET_LINK')],
  getScripts: (content, pluginContext, frontMatter, utils) => [utils.buildScript('SCRIPT_LINK')],
};
