const cryptoJS = require('crypto-js');
const fs = require('fs-extra-promise');
const path = require('path');
const fsUtil = require('./fsUtil');
const logger = require('./logger');

const {
  ERR_READING,
} = require('../constants');

module.exports = {
  /**
   * Returns the file path for the plugin tag.
   * Return based on given name if provided, or it will be based on src.
   * If both are not provided, a md5 generated hash is provided for consistency.
   */
  getFilePathForPlugin: (tagAttribs, content) => {
    if (tagAttribs.name !== undefined) {
      return `${fsUtil.removeExtension(tagAttribs.name)}.png`;
    }

    if (tagAttribs.src !== undefined) {
      const filePath = fsUtil.removeExtension(tagAttribs.src);
      return `${filePath}.png`;
    }

    // This is to keep the hash consistent across windows / unix systems
    const normalizedContent = content.replace(/\r\n/g, '\n');
    const hashedContent = cryptoJS.MD5(normalizedContent).toString();
    return `${hashedContent}.png`;
  },

  /**
   * Returns the string content of the plugin.
   */
  getPluginContent: ($, element, cwf) => {
    if (element.attribs.src !== undefined) {
      // Path of the plugin content
      const rawPath = path.resolve(path.dirname(cwf), element.attribs.src);
      try {
        return fs.readFileSync(rawPath, 'utf8');
      } catch (err) {
        logger.debug(err);
        logger.error(`${ERR_READING} ${rawPath}`);
        return '';
      }
    }

    return $(element).text();
  },
};
