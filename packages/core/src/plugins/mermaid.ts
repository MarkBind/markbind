import cheerio from 'cheerio';
import { PluginContext, FrontMatter } from './Plugin';

const DEFAULT_CDN_ADDRESS = 'https://unpkg.com/mermaid@10/dist/mermaid.esm.min.mjs';

function genScript(address: string) {
  return `<script type="module">
    document.addEventListener('DOMContentLoaded', () => {
      const mermaidElements = document.querySelectorAll('pre.mermaid');

      if (mermaidElements.length === 0) {
        return;
      }

      (async () => {
        try {
          const { default: mermaid } = await import('${address || DEFAULT_CDN_ADDRESS}');
          mermaid.initialize();

          // Manually run, does not trigger as dynamically imported.
          mermaid.run();
        } catch (error) {
          console.error('Mermaid failed to load:', error);
        }
      })();
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
      $node.replaceWith(`<pre class="mermaid">${$node.html()}</pre>`);
    });

    return $.html();
  },
};
