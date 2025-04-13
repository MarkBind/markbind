import cheerio from 'cheerio';
import { PluginContext, FrontMatter } from '../../../../src/plugins/Plugin';
import mermaid from '../../../../src/plugins/mermaid';

test('postRender should replace mermaid tags with appropriate divs', () => {
  const content = `<mermaid>
  flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]
    </mermaid>`;

  const expected = `<pre class="mermaid">
  flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]
    </pre>`;

  const pluginContext: PluginContext = {};
  const frontmatter: FrontMatter = {};
  const renderedContent = mermaid.postRender(pluginContext, frontmatter, content);
  const $ = cheerio.load(renderedContent);

  expect($('pre.mermaid').length).toBe(1);
  expect($('pre.mermaid').html()).toEqual(cheerio.load(expected)('pre.mermaid').html());
});

test('getScripts should return the correct script tag', () => {
  const pluginContext: PluginContext = {
    address: 'https://unpkg.com/mermaid@8/dist/mermaid.esm.min.mjs',
  };

  const expectedScript = `<script type="module">
    window.mermaidPromise = null;
    
    const loadMermaid = () => {
      if (window.mermaidPromise === null) {
        window.mermaidPromise = import('${pluginContext.address}')
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

  const scripts = mermaid.getScripts(pluginContext);
  expect(scripts.length).toBe(1);
  expect(scripts[0]).toEqual(expectedScript);
});

test('getScripts should use the default CDN address if not provided', () => {
  const pluginContext: PluginContext = {};

  const expectedScript = `<script type="module">
    window.mermaidPromise = null;
    
    const loadMermaid = () => {
      if (window.mermaidPromise === null) {
        window.mermaidPromise = import('https://unpkg.com/mermaid@10/dist/mermaid.esm.min.mjs')
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

  const scripts = mermaid.getScripts(pluginContext);
  expect(scripts.length).toBe(1);
  expect(scripts[0]).toEqual(expectedScript);
});
