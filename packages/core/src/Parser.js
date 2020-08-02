const cheerio = require('cheerio');
const path = require('path');

const _ = {};
_.clone = require('lodash/clone');
_.cloneDeep = require('lodash/cloneDeep');
_.hasIn = require('lodash/hasIn');
_.isArray = require('lodash/isArray');
_.isEmpty = require('lodash/isEmpty');

const utils = require('./utils');

cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

class Parser {
  static processDynamicResources(context, html, config) {
    const $ = cheerio.load(html);

    function getAbsoluteResourcePath(elem, relativeResourcePath) {
      const firstParent = elem.closest('div[data-included-from], span[data-included-from]');
      const originalSrc = utils.ensurePosix(firstParent.attr('data-included-from') || context);
      const originalSrcFolder = path.posix.dirname(originalSrc);
      const fullResourcePath = path.posix.join(originalSrcFolder, relativeResourcePath);
      const resolvedResourcePath = path.posix.relative(utils.ensurePosix(config.rootPath), fullResourcePath);
      return path.posix.join(config.baseUrl || '/', resolvedResourcePath);
    }

    $('img, pic, thumbnail').each(function () {
      const elem = $(this);
      if (!elem.attr('src')) {
        return;
      }
      const resourcePath = utils.ensurePosix(elem.attr('src'));
      if (path.isAbsolute(resourcePath) || utils.isUrl(resourcePath)) {
        // Do not rewrite.
        return;
      }
      const absoluteResourcePath = getAbsoluteResourcePath(elem, resourcePath);
      $(this).attr('src', absoluteResourcePath);
    });
    $('a, link').each(function () {
      const elem = $(this);
      const resourcePath = elem.attr('href');
      if (resourcePath === undefined || resourcePath === '') {
        // Found empty href resource in resourcePath
        return;
      }
      if (path.isAbsolute(resourcePath) || utils.isUrl(resourcePath) || resourcePath.startsWith('#')) {
        // Do not rewrite.
        return;
      }
      const absoluteResourcePath = getAbsoluteResourcePath(elem, resourcePath);
      $(this).attr('href', absoluteResourcePath);
    });
    return $.html();
  }

  static unwrapIncludeSrc(html) {
    const $ = cheerio.load(html);
    $('div[data-included-from], span[data-included-from]').each(function () {
      $(this).replaceWith($(this).contents());
    });
    return $.html();
  }
}

module.exports = Parser;
