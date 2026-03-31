const cheerio = module.parent.require('cheerio');

module.exports = {
  postRender: (pluginContext, frontmatter, content) => {
    const $ = cheerio.load(content, { xmlMode: false });
    // Modify the page...
    $('#esm_module_scope_cjs_plugin_with_cjs_ext').append(
      'Should work! (CJS module with .cjs extension in ESM module scope)',
    );
    return $.html();
  },
};
