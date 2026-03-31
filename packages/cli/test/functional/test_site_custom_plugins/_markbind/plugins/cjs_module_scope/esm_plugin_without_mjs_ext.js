import cheerio from 'cheerio';

function postRender(pluginContext, frontmatter, content) {
  const $ = cheerio.load(content);
  // Modify the page...
  $('#cjs_module_scope_esm_plugin_without_mjs_ext').append(
    '**SHOULD SKIP** (ESM module without .mjs extension in CJS module scope)',
  );
  return $.html();
}

export { postRender };
