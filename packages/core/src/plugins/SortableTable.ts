import { FrontMatter, PluginContext } from './Plugin';

const cheerio = require('cheerio');
const constant = require('lodash/constant');
const cloneDeep = require('lodash/cloneDeep');

const md = require('../lib/markdown-it');

const mdTable = cloneDeep(md);

const CSS_FILE_NAME = 'sortableTableAssets/sortable-table.css';

mdTable.renderer.rules.table_open
    = constant('<table class="markbind-table table table-bordered table-striped sortable-table">');
mdTable.renderer.rules.table_close = constant('</table>');

const sortableTableJs = `<script>
  function sortTable(table, column, asc = true) {
    const dirModifier = asc ? 1 : -1;
    const tBody = table.tBodies[0];
    const rows = Array.from(tBody.querySelectorAll('tr'));

    // Sort each row
    const sortedRows = rows.sort((a, b) => {
      const aColText = a.querySelector(\`td:nth-child(\${column + 1})\`).textContent.trim();
      const bColText = b.querySelector(\`td:nth-child(\${column + 1})\`).textContent.trim();

      // Check if the cell values are numeric
      const aNum = Number(aColText);
      const bNum = Number(bColText);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        // If both values are numeric, compare them as numbers
        return (aNum - bNum) * dirModifier;
      } else {
        // If either value is non-numeric, compare them as strings
        return aColText.localeCompare(bColText) * dirModifier;
      }
    });

    // Remove all existing TRs from the table
    while (tBody.firstChild) {
      tBody.removeChild(tBody.firstChild);
    }

    // Re-add the newly sorted rows
    tBody.append(...sortedRows);

    // Update the sorting direction
    table.querySelectorAll('th').forEach(th => th.classList.remove('th-sort-asc', 'th-sort-desc'));
    table.querySelector(\`th:nth-child(\${column + 1})\`).classList.add(asc ? 'th-sort-asc' : 'th-sort-desc');
  }

  document.querySelectorAll('.sortable-table').forEach(table => {
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
      header.addEventListener('click', () => {
        const currentIsAscending = header.classList.contains('th-sort-asc');
        sortTable(table, index, !currentIsAscending);
      });
    });
  });
</script>`;

export = {
  getLinks: () => [`<link rel="stylesheet" href="${CSS_FILE_NAME}">`],
  getScripts: () => [sortableTableJs],
  postRender: (pluginContext: PluginContext, frontmatter: FrontMatter, content: string) => {
    const $ = cheerio.load(content);
    $('sortable').each((index: any, node: any) => {
      const $node = $(node);
      $node.replaceWith(mdTable.render($node.html()));
    });
    return $.html();
  },
};
