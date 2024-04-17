import cheerio from 'cheerio';
import { PluginContext, FrontMatter } from './Plugin';

const DEFAULT_CDN_ADDRESS = 'https://unpkg.com/mermaid@10/dist/mermaid.esm.min.mjs';

function genScript(address: string) {
  return `<script type="module" async>
    import('${address || DEFAULT_CDN_ADDRESS}').then((module) => {
      const mermaid = module.default;
      mermaid.initialize({});
      Vue.directive('mermaid', {
        inserted: function(el) {
          mermaid.run({
            nodes: [el]
          });
        }
      });
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
