import cheerio from 'cheerio';
import { MbNode } from '../../utils/node';
import { PluginContext } from '../Plugin';

const CSS_FILE_NAME = 'markbind-plugin-anchors.css';

const HEADER_REGEX = /^h[1-6]$/;

/**
 * Adds anchor links to headers
 */
export = {
  getLinks: () => [`<link rel="stylesheet" href="${CSS_FILE_NAME}">`],
  postProcessNode: (_pluginContext: PluginContext, node: MbNode) => {
    if (HEADER_REGEX.test(node.name) && node.attribs.id) {
      cheerio(node).append(
        `<a class="fa fa-anchor" href="#${node.attribs.id}" onclick="event.stopPropagation()"></a>`);
    }
  },
};
