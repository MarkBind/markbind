import katex from 'katex';
import texmath from 'markdown-it-texmath';
import { PluginContext } from './Plugin.js';
import { markdownIt as md } from '../lib/markdown-it/index.js';

let pluginAdded = false;

// see https://github.com/goessner/markdown-it-texmath#features for supported delimiters
// note that some of them may not work correctly due to conflicting syntax
function mathDelimiters(pluginContext: PluginContext) {
  if (!pluginAdded) {
    if (!pluginContext.delimiters) {
      throw new Error('No delimiters defined in the plugin context!');
    }
    md.use(texmath, { engine: katex, delimiters: pluginContext.delimiters });
    pluginAdded = true; // only need to add once
  }
}

const beforeSiteGenerate = (pluginContext: PluginContext) => mathDelimiters(pluginContext);

export {
  beforeSiteGenerate,
};
