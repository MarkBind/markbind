import { PluginContext } from './Plugin';
import { NodeOrText } from '../utils/node';

const DEFAULT_CDN_ADDRESS = 'https://unpkg.com/mermaid@9/dist/mermaid.esm.min.mjs';
const DEFAULT_CONFIG = '{"startOnLoad":true}';

function genScript(address: string, config: string) {
  return `<script type="module">
Vue.directive('mermaid', {
  inserted: function(el) {
    mermaid.init(undefined, el);
  }});
import mermaid from '${address || DEFAULT_CDN_ADDRESS}';
mermaid.initialize(${JSON.stringify(config) || DEFAULT_CONFIG});
</script>`;
}

export = {
  tagConfig: {
    mermaid: {
      isSpecial: true,
    },
  },
  getScripts: (pluginContext: PluginContext) => [genScript(pluginContext.address, pluginContext.config)],
  processNode: (_: PluginContext, node: NodeOrText) => {
    if (node.name !== 'mermaid') {
      return;
    }
    node.name = 'div';
    if (!node.attribs) {
      node.attribs = {};
    } else {
      node.attribs.class = 'mermaid';
      node.attribs['v-mermaid'] = '';
    }
  },
};
