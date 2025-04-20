/*
 * Patch for markdown-it-texmath to support amsmath environments with trailing asterisk,
 * e.g. \begin{equation*}\end{equation*}, \begin{align*}\end{align*}
 */

'use strict';

const texmath = require('markdown-it-texmath');

// Backup the original rules object
const originalRules = { ...texmath.rules };

// Modify the beg_end rule's regex to support more environment names with trailing asterisk
originalRules.beg_end.block[0].rex = /(\\(?:begin)\{([a-z]+\*?)\}[\s\S]+?\\(?:end)\{\2\})/gmy;

texmath.rules = originalRules;

module.exports = texmath;