import { MbNode } from '../../utils/node';
import { PluginContext } from '../Plugin';

/**
 * Converts shorthand syntax to proper MarkBind syntax
 * @param content of the page
 */
export = {
  processNode: (_pluginContext: PluginContext, node: MbNode) => {
    // panel>span[heading]
    if (node.name === 'span'
      && node.attribs.heading !== undefined
      && node.parent
      && node.parent.name === 'panel') {
      node.attribs.slot = 'header';
      node.attribs.class = node.attribs.class ? `${node.attribs.class} card-title` : 'card-title';
      delete node.attribs.heading;
    }
  },
};
