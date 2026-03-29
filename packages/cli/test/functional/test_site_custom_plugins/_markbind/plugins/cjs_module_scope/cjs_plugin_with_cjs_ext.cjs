const cheerio = module.parent.require('cheerio');

module.exports = {
  postRender: (pluginContext, frontmatter, content) => {
    const $ = cheerio.load(content, { xmlMode: false });
    // Modify the page...
    $('#cjs_module_scope_cjs_plugin_with_cjs_ext').append(
      'Should work! (CJS module with .cjs extension in CJS module scope)',
    );
    return $.html();
  },
};
