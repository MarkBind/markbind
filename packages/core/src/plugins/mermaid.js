const DEFAULT_CDN_ADDRESS = 'https://unpkg.com/mermaid@9/dist/mermaid.esm.min.mjs';
const DEFAULT_CONFIG = '{"startOnLoad":true}';

function genScript(address, config) {
  return `<script type="module">
import mermaid from '${address || DEFAULT_CDN_ADDRESS}';
mermaid.initialize(${JSON.stringify(config) || DEFAULT_CONFIG});
</script>`;
}

module.exports = {
  tagConfig: {
    mermaid: {
      isSpecial: true,
    },
  },
  getScripts: pluginContext => [genScript(pluginContext.address, pluginContext.config)],
  processNode: (_, node) => {
    if (node.name !== 'mermaid') {
      return;
    }
    node.name = 'div';
    node.attribs.class = 'mermaid';
  },
};
