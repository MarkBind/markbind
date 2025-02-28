import cheerio from 'cheerio';
import { PluginContext, FrontMatter } from '../../../../src/plugins/Plugin';
import mermaid from '../../../../src/plugins/mermaid';

test.skip('postRender should replace mermaid tags with appropriate divs', () => {
  const content = `
    <mermaid>
    flowchart TD
        A[Start] --> B{Is it?}
        B -->|Yes| C[OK]
        C --> D[Rethink]
        D --> B
        B ---->|No| E[End]
    </mermaid>
  `;

  const expected = `
    <div class="mermaid" v-mermaid>
    flowchart TD
        A[Start] --> B{Is it?}
        B -->|Yes| C[OK]
        C --> D[Rethink]
        D --> B
        B ---->|No| E[End]
    </div>
  `;

  const pluginContext: PluginContext = {};
  const frontmatter: FrontMatter = {};
  const renderedContent = mermaid.postRender(pluginContext, frontmatter, content);
  const $ = cheerio.load(renderedContent);

  expect($('div.mermaid').length).toBe(1);
  expect($('div.mermaid').attr('v-mermaid')).toBeDefined();
  expect($('div.mermaid').html()).toEqual(cheerio.load(expected)('div.mermaid').html());
});

test.skip('getScripts should return the correct script tag', () => {
  const pluginContext: PluginContext = {
    address: 'https://unpkg.com/mermaid@8/dist/mermaid.esm.min.mjs',
  };

  const expectedScript = `<script type="module">
    import mermaid from '${pluginContext.address}';
    document.addEventListener('DOMContentLoaded', () => {
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

  const scripts = mermaid.getScripts(pluginContext);
  expect(scripts.length).toBe(1);
  expect(scripts[0]).toEqual(expectedScript);
});

test.skip('getScripts should use the default CDN address if not provided', () => {
  const pluginContext: PluginContext = {};

  const expectedScript = `<script type="module">
    import mermaid from 'https://unpkg.com/mermaid@10/dist/mermaid.esm.min.mjs';
    document.addEventListener('DOMContentLoaded', () => {
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

  const scripts = mermaid.getScripts(pluginContext);
  expect(scripts.length).toBe(1);
  expect(scripts[0]).toEqual(expectedScript);
});
