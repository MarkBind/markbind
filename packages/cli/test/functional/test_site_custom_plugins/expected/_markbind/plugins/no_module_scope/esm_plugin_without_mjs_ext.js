import cheerio from 'cheerio';

function postRender(pluginContext, frontmatter, content) {
  const $ = cheerio.load(content);
  // Modify the page...
  $('#no_module_scope_esm_plugin_without_mjs_ext').append(
    'Should work! (ESM module without .mjs extension not in any module scope)',
  );
  return $.html();
}

export { postRender };
