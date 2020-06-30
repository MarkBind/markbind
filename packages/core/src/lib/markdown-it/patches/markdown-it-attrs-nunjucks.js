/*
 Patch for markdown-it-attrs and nunjuck's usage of {% ... %}
 */

const mdAttrsUtils = require('markdown-it-attrs/utils');

mdAttrsUtils.hasDelimiters = function (where, options) {

  if (!where) {
    throw new Error('Parameter `where` not passed. Should be "start", "middle", "end" or "only".');
  }

  /**
   * @param {string} str
   * @return {boolean}
   */
  return function (str) {
    // we need minimum three chars, for example {b}
    let minCurlyLength = options.leftDelimiter.length + 1 + options.rightDelimiter.length;
    if (!str || typeof str !== 'string' || str.length < minCurlyLength) {
      return false;
    }

    function validCurlyLength (curly) {
      let isClass = curly.charAt(options.leftDelimiter.length) === '.';
      let isId = curly.charAt(options.leftDelimiter.length) === '#';
      return (isClass || isId)
        ? curly.length >= (minCurlyLength + 1)
        : curly.length >= minCurlyLength;
    }

    let start, end, slice, nextChar;
    let rightDelimiterMinimumShift = minCurlyLength - options.rightDelimiter.length;
    switch (where) {
    case 'start':
      // first char should be {, } found in char 2 or more
      slice = str.slice(0, options.leftDelimiter.length);
      start = slice === options.leftDelimiter ? 0 : -1;
      end = start === -1 ? -1 : str.indexOf(options.rightDelimiter, rightDelimiterMinimumShift);
      // check if next character is not one of the delimiters
      nextChar = str.charAt(end + options.rightDelimiter.length);
      if (nextChar && options.rightDelimiter.indexOf(nextChar) !== -1) {
        end = -1;
      }
      break;

    case 'end':
      // last char should be }
      start = str.lastIndexOf(options.leftDelimiter);
      end = start === -1 ? -1 : str.indexOf(options.rightDelimiter, start + rightDelimiterMinimumShift);
      end = end === str.length - options.rightDelimiter.length ? end : -1;
      break;

    case 'only':
      // '{.a}'
      slice = str.slice(0, options.leftDelimiter.length);
      start = slice === options.leftDelimiter ? 0 : -1;
      slice = str.slice(str.length - options.rightDelimiter.length);
      end = slice === options.rightDelimiter ? str.length - options.rightDelimiter.length : -1;
      break;
    }

    /*
     Simple patch here - abort if the delimiters wrap around % %
     */
    const isCharAfterStartPercent = str.charAt(start + 1) === '%';
    const isCharBeforeEndPercent = str.charAt(end - 1) === '%';
    if (isCharAfterStartPercent && isCharBeforeEndPercent) {
      return false;
    }

    return start !== -1
      && end !== -1
      && validCurlyLength(str.substring(start, end + options.rightDelimiter.length));
  };
};

module.exports = require('markdown-it-attrs');
