const cheerio = require('cheerio');

const _ = {};
_.clone = require('lodash/clone');
_.cloneDeep = require('lodash/cloneDeep');
_.hasIn = require('lodash/hasIn');
_.isArray = require('lodash/isArray');
_.isEmpty = require('lodash/isEmpty');

cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

class Parser {
  static unwrapIncludeSrc(html) {
    const $ = cheerio.load(html);
    $('div[data-included-from], span[data-included-from]').each(function () {
      $(this).replaceWith($(this).contents());
    });
    return $.html();
  }
}

module.exports = Parser;
