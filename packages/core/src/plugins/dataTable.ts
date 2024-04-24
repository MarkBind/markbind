import cheerio from 'cheerio';
import { FrontMatter, PluginContext } from './Plugin';
import md from '../lib/markdown-it';

const CSS_FILE_NAME = 'dataTableAssets/datatables.min.css';
const CSS_ADDITIONAL = 'dataTableAssets/datatables-additional.css';
const JS_FILE_NAME = 'dataTableAssets/datatables.min.js';

const initScript = `
  <script>
    function getTableOptions(el) {
      const options = {};
      if ($(el).hasClass('sortable-table')) {
        options.searching = false;
        options.paging = false;
        options.info = false;
      } else if ($(el).hasClass('searchable-table')) {
        options.ordering = false;
        options.paging = false;
        options.info = false;
        options.dom = '<"row"<"col-sm-12"f>>' + '<"row"<"col-sm-12"t>>';
      } else if ($(el).hasClass('sortable-searchable-table')) {
        options.paging = false;
        options.info = false;
        options.dom = '<"row"<"col-sm-12"f>>' + '<"row"<"col-sm-12"t>>';
      }
      return options;
    }

    Vue.directive('datatable', {
      inserted: function(el, binding) {
        const options = binding.value || {};
        const tableOptions = getTableOptions(el);
        $(el).DataTable({ ...tableOptions, ...options });
      }
    });

    document.addEventListener('DOMContentLoaded', function() {
      $('table.sortable-table, table.searchable-table, table.sortable-searchable-table').each(function() {
        const options = getTableOptions(this);
        $(this).DataTable(options);
      });
    });
  </script>
`;

export = {
  getLinks: () => [
    `<link rel="stylesheet" href="${CSS_FILE_NAME}">`,
    `<link rel="stylesheet" href="${CSS_ADDITIONAL}">`,
  ],
  getScripts: () => [`<script src="${JS_FILE_NAME}"></script>`, initScript],
  postRender: (pluginContext: PluginContext, frontmatter: FrontMatter, content: string) => {
    const $ = cheerio.load(content);

    $('d-table').each((index: number, node: cheerio.Element) => {
      const $node = $(node);
      const html = $node.html();

      if (html == null) {
        return;
      }

      const isSortable = $node.attr('sortable') !== undefined;
      const isSearchable = $node.attr('searchable') !== undefined;

      let tableClass: string = '';
      if (isSortable && isSearchable) {
        tableClass = 'sortable-searchable-table';
      } else if (isSortable) {
        tableClass = 'sortable-table';
      } else if (isSearchable) {
        tableClass = 'searchable-table';
      }

      const renderedTable = md.render(html);
      const $renderedTable = $(renderedTable);
      $renderedTable.find('table')
        .addClass(tableClass)
        .attr('id', `datatable-${index}`)
        .attr('v-datatable', '');

      $node.replaceWith($renderedTable);
    });

    return $.html();
  },
};
