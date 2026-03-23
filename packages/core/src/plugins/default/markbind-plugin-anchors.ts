import cheerio from 'cheerio';
import { MbNode } from '../../utils/node.js';
import { PluginContext } from '../Plugin.js';

const CSS_FILE_NAME = 'markbind-plugin-anchors.css';

const HEADER_REGEX = /^h[1-6]$/;

const getLinks = () => [`<link rel="stylesheet" href="${CSS_FILE_NAME}">`];

/**
 * Adds anchor links to headers
 */
const postProcessNode = (_pluginContext: PluginContext, node: MbNode) => {
  if (HEADER_REGEX.test(node.name) && node.attribs.id) {
    cheerio(node).append(
      `<a class="fa fa-anchor" href="#${node.attribs.id}" onclick="event.stopPropagation()"></a>`);
  }
};

export {
  getLinks,
  postProcessNode,
};
