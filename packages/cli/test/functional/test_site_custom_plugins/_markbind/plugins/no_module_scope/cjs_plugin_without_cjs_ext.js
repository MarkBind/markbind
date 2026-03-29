const cheerio = module.parent.require('cheerio');

module.exports = {
  postRender: (pluginContext, frontmatter, content) => {
    const $ = cheerio.load(content, { xmlMode: false });
    // Modify the page...
    $('#no_module_scope_cjs_plugin_without_cjs_ext').append(
      'Should work! (CJS module without .cjs extension not in any module scope)',
    );
    return $.html();
  },
};
