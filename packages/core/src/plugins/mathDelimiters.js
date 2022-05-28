const katex = require('katex');
const texmath = require('markdown-it-texmath');
const md = require('../lib/markdown-it');

// see https://github.com/goessner/markdown-it-texmath#features for supported delimiters
// note that some of them may not work correctly due to conflicting syntax
function mathDelimiters(pluginContext) {
  if (!pluginContext.delimiters) {
    throw new Error('No delimiters defined in the plugin context!');
  }
  md.use(texmath, { engine: katex, delimiters: pluginContext.delimiters });
}

module.exports = {
  beforeSiteGenerate: pluginContext => mathDelimiters(pluginContext),
};
