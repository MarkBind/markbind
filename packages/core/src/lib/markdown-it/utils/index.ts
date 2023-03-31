/*
  Extra utility functions related to markdown-it.
  markdown-it library exposes a utility module in markdown-it/utils,
  below are additional functions that can be used as helpers alongside markdown-it/utils
 */

// This mapping is taken from markdown-it/utils, just flipped.
// Refer to the original file at markdown-it/lib/common/utils.js
const htmlUnescapedMapping = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': '\'',
};

// markdown-it/utils have an escapeHtml function, but not the
// complementary un-escaping function
export function unescapeHtml(str: string) {
  let unescaped = str;
  Object.entries(htmlUnescapedMapping).forEach(([key, value]) => {
    unescaped = unescaped.split(key).join(value);
  });
  return unescaped;
}
