import katex from 'katex';
import { PluginContext } from './Plugin';
import md from '../lib/markdown-it';

const texmath = require('markdown-it-texmath');

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

export = {
  beforeSiteGenerate: (pluginContext: PluginContext) => mathDelimiters(pluginContext),
};
