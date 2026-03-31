import cheerio from 'cheerio';

function postRender(pluginContext, frontmatter, content) {
  const $ = cheerio.load(content);
  // Modify the page...
  $('#cjs_module_scope_esm_plugin_with_mjs_ext').append(
    'Should work! (ESM module with .mjs extension in CJS module scope)',
  );
  return $.html();
}

export { postRender };
