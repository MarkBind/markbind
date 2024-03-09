import { PluginContext } from './Plugin';
import { MbNode } from '../utils/node';

const cheerio = require('cheerio');
const constant = require('lodash/constant');

const md = require('../lib/markdown-it');

// fix table style
md.renderer.rules.table_open = constant(
  '<div class="table-responsive">'
    + '<table class="markbind-table table table-bordered table-striped sortable-table">');
md.renderer.rules.table_close = constant('</table></div>');

const sortableTableCss = `
  .sortable-table th {
    cursor: pointer;
  }

  .sortable-table th::after {
    content: " \\2195"; /* Up/Down arrow */
  }

  .sortable-table th.th-sort-asc::after {
    content: " \\2191"; /* Ascending arrow */
  }
  .sortable-table th.th-sort-desc::after {
    content: " \\2193"; /* Descending arrow */
  }
`;

const sortableTableJs = `<script>
  function sortTable(table, column, asc = true) {
    const dirModifier = asc ? 1 : -1;
    const tBody = table.tBodies[0];
    const rows = Array.from(tBody.querySelectorAll('tr'));

    // Sort each row
    const sortedRows = rows.sort((a, b) => {
      const aColText = a.querySelector(\`td:nth-child(\${column + 1})\`).textContent.trim();
      const bColText = b.querySelector(\`td:nth-child(\${column + 1})\`).textContent.trim();

      return aColText > bColText ? (1 * dirModifier) : (-1 * dirModifier);
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
  });</script>
`;

export = {
  getScripts: () => [sortableTableJs],
  processNode: (pluginContext: PluginContext, node: MbNode) => {
    // Check if the node needs to be processed
    if (node.name !== 'sortable') {
      return;
    }
    const $ = cheerio(node);
    $.replaceWith(md.render($.text()));
    $.append(`<style>${sortableTableCss}</style>`);
  },
};
