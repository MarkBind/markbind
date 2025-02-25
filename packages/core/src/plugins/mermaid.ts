import cheerio from 'cheerio';
import { PluginContext, FrontMatter } from './Plugin';

const DEFAULT_CDN_ADDRESS = 'https://unpkg.com/mermaid@10/dist/mermaid.esm.min.mjs';

function genScript(address: string) {
  return `<script type="module">
  // Global promise to track Mermaid loading state, ensure only loaded once
  if (!window.mermaidPromise) {
    window.mermaidPromise = import('${address || DEFAULT_CDN_ADDRESS}')
      .then(({ default: mermaid }) => {
        mermaid.initialize({});
        return mermaid;
      })
      .catch((error) => {
        console.error("Mermaid failed to load:", error);
        throw error;
      });
  }

  Vue.directive('mermaid', {
    inserted(el) {
      window.mermaidPromise.then((mermaid) => {
        mermaid.run({nodes: [el]});
      }).catch((error) => {
        console.error("Mermaid failed to process element:", error);
      });
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const mermaidElements = document.querySelectorAll('.mermaid');
    
    // Apply directive if there are mermaid elements.
    // Trigger inserted hook for each element
    if (mermaidElements.length > 0) {
      mermaidElements.forEach(el => {
        Vue.nextTick(() => {
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
