import cheerio from 'cheerio';
import { PluginContext, FrontMatter } from './Plugin';

const DEFAULT_CDN_ADDRESS = 'https://unpkg.com/mermaid@10/dist/mermaid.esm.min.mjs';

function genScript(address: string) {
  return `<script type="module">
  let mermaidLoaded = false;

  // Register mermaid directive for Vue 2 outside event listener
  Vue.directive('mermaid', {
    inserted(el) {
      // Dynamically import mermaid only if not loaded
      if (!mermaidLoaded) {
        import('${address || DEFAULT_CDN_ADDRESS}')
          .then(({ default: mermaid }) => {
            mermaid.initialize({});
            mermaidLoaded = true; // Mark mermaid as loaded

            mermaid.run({
              nodes: [el]
            });
          })
          .catch((error) => {
            console.error("Mermaid failed to load:", error);
          });
      } else {
        // If already loaded, just run mermaid on the current element
        const { default: mermaid } = require('${address || DEFAULT_CDN_ADDRESS}');
        mermaid.run({
          nodes: [el]
        });
      }
    }
  });

  // Wait for the document to be ready
  document.addEventListener('DOMContentLoaded', () => {
    const mermaidElements = document.querySelectorAll('.mermaid');
    
    // If there are mermaid elements, apply the directive logic
    if (mermaidElements.length > 0) {
      mermaidElements.forEach(el => {
        // Trigger the inserted hook for each element to process it
        Vue.nextTick(() => {
          // We manually call the directive logic
          const directive = Vue.options.directives['mermaid'];
          if (directive && directive.inserted) {
            directive.inserted(el);
          }
        });
      });
    }
  });
</script>`;
}

export = {
  tagConfig: {
    mermaid: {
      isSpecial: true,
    },
  },
  getScripts: (pluginContext: PluginContext) => [genScript(pluginContext.address)],
  postRender: (pluginContext: PluginContext, frontmatter: FrontMatter, content: string) => {
    const $ = cheerio.load(content);

    $('mermaid').each((index: number, node: cheerio.Element) => {
      const $node = $(node);
      $node.replaceWith(`<div class="mermaid" v-mermaid>${$node.html()}</div>`);
    });

    return $.html();
  },
};
