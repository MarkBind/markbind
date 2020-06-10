const cryptoJS = require('crypto-js');
const fs = require('fs-extra-promise');
const path = require('path');
const fsUtil = require('./fsUtil');
const utils = require('../lib/markbind/src/utils');
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
  getFileNameForPlugin: (tagAttribs, content) => {
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
   * Returns the content of a node from a file pointed to by its 'src' attribute
   * or the text it contains otherwise.
   * This is only to be used during the preRender stage, where nodes have their 'cwf'
   * attribute tagged to them.
   */
  getNodeSrcOrTextContent: (node) => {
    if (node.attribs.src !== undefined) {
      // Path of the plugin content
      const rawPath = path.resolve(path.dirname(node.attribs.cwf), node.attribs.src);
      try {
        return fs.readFileSync(rawPath, 'utf8');
      } catch (err) {
        logger.debug(err);
        logger.error(`${ERR_READING} ${rawPath}`);
        return '';
      }
    }

    return utils.getTextContent(node);
  },
};
