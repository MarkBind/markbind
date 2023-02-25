import { DomElement } from 'htmlparser2';
import cheerio from 'cheerio';
import { PluginContext } from './Plugin';

function createWeb3Form(pluginContext: PluginContext, node: cheerio.Element & DomElement) {
  const $node = cheerio(node);
  const children = $node.children();
  const $replaceNode = cheerio('<form action="https://api.web3forms.com/submit" method="POST"></form>');
  $replaceNode.append(`<input type="hidden" name="access_key" value=${pluginContext.accessKey}>`);
  $replaceNode.append(children);
  $node.replaceWith($replaceNode);
}

export = {
  processNode: (pluginContext: PluginContext, node: cheerio.Element & DomElement) => {
    if (node.name === 'web-3-form') {
      createWeb3Form(pluginContext, node);
    }
  },
};
