import cheerio from 'cheerio';
import { PluginContext, FrontMatter } from './Plugin';

const DEFAULT_CDN_ADDRESS = 'https://unpkg.com/mermaid@10/dist/mermaid.esm.min.mjs';

function genScript(address: string) {
  return `<script type="module">
    window.mermaidPromise = null;
    
    const loadMermaid = () => {
      if (window.mermaidPromise === null) {
        window.mermaidPromise = import('${address || DEFAULT_CDN_ADDRESS}')
          .then(({ default: mermaid }) => {
            mermaid.initialize({
              startOnLoad: false,
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

    const renderMermaidDiagrams = (elements) => {
      if (!elements || elements.length === 0) {
        return Promise.resolve();
      }

      return loadMermaid().then(mermaid => {
        if (!mermaid) return;
        return mermaid.run({ nodes: Array.from(elements) })
          .catch(err => console.error('Error rendering mermaid diagrams:', err));
      });
    };

    const setupMermaidObserver = () => {
      const observer = new MutationObserver((mutations) => {
        let newMermaidElements = [];
        
        mutations.forEach(mutation => {
          if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1 && node.classList && 
                  node.classList.contains('mermaid')) {
                newMermaidElements.push(node);
              }
              
              if (node.nodeType === 1 && node.querySelectorAll) {
                const mermaidInNode = node.querySelectorAll('.mermaid');
                if (mermaidInNode.length) {
                  newMermaidElements = [...newMermaidElements, ...mermaidInNode];
                }
              }
            });
          }
        });
        
        if (newMermaidElements.length > 0) {
          renderMermaidDiagrams(newMermaidElements);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      return observer;
    };

    // Initialize on DOM content loaded
    document.addEventListener('DOMContentLoaded', () => {
      const existingDiagrams = document.querySelectorAll('.mermaid');
      if (existingDiagrams.length > 0) {
        renderMermaidDiagrams(existingDiagrams);
      }
      
      setupMermaidObserver();
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
    const mermaidTags = $('mermaid');
    if (mermaidTags.length > 0) {
      mermaidTags.each((index: number, node: cheerio.Element) => {
        const $node = $(node);
        $node.replaceWith(`<pre class="mermaid">${$node.html()}</pre>`);
      });
    }
    return $.html();
  },
};
