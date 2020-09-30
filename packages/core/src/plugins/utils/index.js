const cryptoJS = require('crypto-js');
const fs = require('fs-extra');
const path = require('path');
const fsUtil = require('../../utils/fsUtil');
const logger = require('../../utils/logger');

const {
  ERR_READING,
} = require('../../constants');

module.exports = {
  /**
   * Returns the file name of the tag, based on (in decreasing priority):
   * - the name attribute
   * - the base file name of the 'src' attribute
   * - a md5 hash of the content
   * @param tagAttribs object containing the attributes of the tag
   * @param content of the tag, which can be it's html content or content pointed to by 'src'
   */
  getPngFileName: (tagAttribs, content) => {
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
   * Returns the string content of a tag pointed to by the 'src' attribute,
   * or simply it's html text content if there is none.
   */
  getSrcOrTextContent: ($, element, cwf) => {
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
