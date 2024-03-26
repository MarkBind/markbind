import cheerio from 'cheerio';
import { FrontMatter, PluginContext } from './Plugin';

const DEFAULT_CDN_ADDRESS = 'https://cdn.jsdelivr.net/npm/pagefind@1.0.4/+esm';
const DEFAULT_UI_ADDRESS = 'https://cdn.jsdelivr.net/npm/@pagefind/default-ui@1.0.4/+esm';

const initPagefind = `
  <script type="module">
    import pagefind from '${DEFAULT_CDN_ADDRESS}';
    const { index } = await pagefind.createIndex({
        keepIndexUrl: true,
        verbose: true,
        logfile: "debug.log"
    });
    const { errors, page_count } = await index.addDirectory({
        path: "_site",
    });
    await index.writeFiles({ outputPath: "_site/pagefind" });
    await pagefind.close();  
  </script>`;

function addPagefindUI(pluginContext: PluginContext) {
  return `<script type="module">
        import @pagefind/default-ui from '${DEFAULT_UI_ADDRESS}';
        window.addEventListener('DOMContentLoaded', (event) => {
            new PagefindUI({
                element: "#search",
                showImages: false,
                baseUrl: ${pluginContext.baseUrl},
             });
        });
    </script>`;
}

export = {
  postRender: (_pluginContext: PluginContext, _frontmatter: FrontMatter, content: string) => {
    const $ = cheerio.load(content);
    $('searchbar').replaceWith(addPagefindUI(_pluginContext));
    const updatedContent = $.html();

    return updatedContent;
  },
  getScripts: () => [initPagefind],
};
