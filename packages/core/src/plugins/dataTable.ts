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

    function initializeTables(tables) {
      if (!tables || tables.length === 0) return;
      tables.forEach(table => {
        const options = getTableOptions(table);
        $(table).DataTable(options);
        $(table).addClass('dt-processed');
      });
    }

    function setupTableObserver() {
      const observer = new MutationObserver((mutations) => {
        let newTables = [];
        
        mutations.forEach(mutation => {
          if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach(node => {

              if (node.nodeType === 1 && node.tagName === 'TABLE' && 
                  !$(node).hasClass('dt-processed') &&
                  ($(node).hasClass('sortable-table') || 
                   $(node).hasClass('searchable-table') || 
                   $(node).hasClass('sortable-searchable-table'))) {
                newTables.push(node);
              }
              
              if (node.nodeType === 1 && node.querySelectorAll) {
                const tablesInNode = node.querySelectorAll(
                'table.sortable-table:not(.dt-processed), ' +
                'table.searchable-table:not(.dt-processed), ' +
                'table.sortable-searchable-table:not(.dt-processed)');
                if (tablesInNode.length) {
                  newTables = [...newTables, ...tablesInNode];
                }
              }
            });
          }
        });

        if (newTables.length > 0) {
          initializeTables(newTables);
        }
      });
      
      // Start observing the entire document for changes
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      return observer;
    }

    document.addEventListener('DOMContentLoaded', function() {
      // Process any existing tables
      const existingTables = document.querySelectorAll(
        'table.sortable-table:not(.dt-processed), ' +
        'table.searchable-table:not(.dt-processed), ' +
        'table.sortable-searchable-table:not(.dt-processed)'
      );
      if (existingTables.length > 0) {
        initializeTables(existingTables);
      }
      
      setupTableObserver();
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
        .attr('id', `datatable-${index}`);

      $node.replaceWith($renderedTable);
    });

    return $.html();
  },
};
