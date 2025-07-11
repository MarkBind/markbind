import katex from 'katex';
import md from '../../lib/markdown-it';

const texmath = require('markdown-it-texmath');

let pluginAdded = false;

function applyBegEndDelimiters() {
  if (!pluginAdded) {
    // Always use 'beg_end' delimiter regardless of site.json config
    md.use(texmath, {
      engine: katex,
      delimiters: ['beg_end'], // force beg_end delimiter
    });
    pluginAdded = true;
  }
}

export = {
  beforeSiteGenerate: () => {
    applyBegEndDelimiters();
  },
};
