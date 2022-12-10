const mermaidScript = `<script type="module">
import mermaid from 'https://unpkg.com/mermaid@9/dist/mermaid.esm.min.mjs';
mermaid.initialize({ startOnLoad: true });
</script>`;

module.exports = {
  tagConfig: {
    mermaid: {
      isSpecial: true,
    },
  },
  getScripts: () => [mermaidScript],
  processNode: (pluginContext, node) => {
    if (node.name !== 'mermaid') {
      return;
    }
    node.name = 'pre';
    node.attribs.class = 'mermaid';
  },
};
