import cheerio from 'cheerio';
import { PluginContext, FrontMatter } from './Plugin';

const DEFAULT_CDN_ADDRESS = 'https://unpkg.com/mermaid@10/dist/mermaid.esm.min.mjs';

function genScript(address: string) {
  return `<script type="module">
    // Only initialize mermaidPromise when needed
    window.mermaidPromise = null;
    
    // Function to load mermaid if not already loaded
    const loadMermaid = () => {
      if (window.mermaidPromise === null) {
        window.mermaidPromise = import('${address || DEFAULT_CDN_ADDRESS}')
          .then(({ default: mermaid }) => {
            mermaid.initialize({
              startOnLoad: false,
              securityLevel: 'loose'
            });
            console.log('Mermaid loaded successfully');
            return mermaid;
          })
          .catch((error) => {
            console.error('Mermaid failed to load:', error);
            window.mermaidPromise = false;
            return null;
          });
      }
      return window.mermaidPromise;
    };

    // Function to render mermaid diagrams
    const renderMermaidDiagrams = () => {
      const mermaidElements = document.querySelectorAll('.mermaid:not(.processed)');

      if (mermaidElements.length === 0) {
        return Promise.resolve();
      }
      
      return loadMermaid().then(mermaid => {
        if (!mermaid) return;
        
        return mermaid.run({ nodes: Array.from(mermaidElements) })
          .then(() => {
            mermaidElements.forEach(el => {
              el.classList.add('processed');
            });
          })
          .catch(err => console.error('Error rendering mermaid diagrams:', err));
      });
    };

    document.addEventListener('DOMContentLoaded', () => {
      const hasMermaidDiagrams = document.querySelectorAll('.mermaid').length > 0;
      
      if (hasMermaidDiagrams) {
        renderMermaidDiagrams();
      }
      
      // Setup Vue directive for dynamically added diagrams
      if (typeof Vue !== 'undefined') {
        Vue.directive('mermaid', {
          inserted: function(el) {
            if (!el.classList.contains('processed')) {
              loadMermaid().then(mermaid => {
                if (!mermaid) return;
                
                return mermaid.run({ nodes: [el] })
                  .then(() => {el.classList.add('processed');})
                  .catch(err => console.error('Error rendering dynamic mermaid diagram:', err));
              });
            }
          }
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
