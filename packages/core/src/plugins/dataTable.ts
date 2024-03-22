import cheerio from 'cheerio';

import constant from 'lodash/constant';

import cloneDeep from 'lodash/cloneDeep';
import { FrontMatter, PluginContext } from './Plugin';

import md from '../lib/markdown-it';

const mdTableSortable = cloneDeep(md);
const mdTableSearchable = cloneDeep(md);
const mdTableSortableSearchable = cloneDeep(md);

const CSS_FILE_NAME = 'dataTableAssets/datatables.min.css';
const CSS_ADDITIONAL = 'dataTableAssets/datatables-additional.css';
const JS_FILE_NAME = 'dataTableAssets/datatables.min.js';

const initScript = `
      <script>
        Vue.directive('datatable', {
          inserted: function(el) {
            $(el).DataTable();
          }
        });
        document.addEventListener('DOMContentLoaded', function() {
          $('table.sortable-table').DataTable({
            searching: false,
            paging: false,
            info: false,
          });
          $('table.searchable-table').DataTable({
            ordering: false,
            paging: false,
            info: false,
            dom: '<"row"<"col-sm-12"f>>' + 
             '<"row"<"col-sm-12"t>>',
          });
          $('table.sortable-searchable-table').DataTable({
            paging: false,
            info: false,
            dom: '<"row"<"col-sm-12"f>>' + 
             '<"row"<"col-sm-12"t>>',
          });
        });
      </script>
    `;

mdTableSortable.renderer.rules.table_open
    = constant('<div class="table-responsive">'
    + '<table class="markbind-table table table-bordered table-striped sortable-table">');
mdTableSortable.renderer.rules.table_close = constant('</table></div>');

mdTableSearchable.renderer.rules.table_open
    = constant('<div class="table-responsive">'
    + '<table class="markbind-table table table-bordered table-striped searchable-table">');
mdTableSearchable.renderer.rules.table_close = constant('</table></div>');

mdTableSortableSearchable.renderer.rules.table_open
    = constant('<div class="table-responsive">'
    + '<table class="markbind-table table table-bordered table-striped sortable-searchable-table">');
mdTableSortableSearchable.renderer.rules.table_close = constant('</table></div>');

export = {
  getLinks: () => [
    `<link rel="stylesheet" href="${CSS_FILE_NAME}">`,
    `<link rel="stylesheet" href="${CSS_ADDITIONAL}">`,
  ],
  getScripts: () => [`<script src="${JS_FILE_NAME}"></script>`, initScript],
  postRender: (pluginContext: PluginContext, frontmatter: FrontMatter, content: string) => {
    const $ = cheerio.load(content);

    $('m-table[sortable]:not([searchable])').each((index: number, node: cheerio.Element) => {
      const $node = $(node);
      const html = $node.html();
      if (html != null) {
        $node.replaceWith(mdTableSortable.render(html));
      }
    });

    $('m-table[searchable]:not([sortable])').each((index: number, node: cheerio.Element) => {
      const $node = $(node);
      const html = $node.html();
      if (html != null) {
        $node.replaceWith(mdTableSearchable.render(html));
      }
    });

    $('m-table[sortable][searchable]').each((index: number, node: cheerio.Element) => {
      const $node = $(node);
      const html = $node.html();
      if (html != null) {
        $node.replaceWith(mdTableSortableSearchable.render(html));
      }
    });

    // Add DataTables attributes to tables with the corresponding classes
    $('table.sortable-table, table.searchable-table, table.sortable-searchable-table')
      .each((index: any, table: any) => {
        $(table).attr('id', `datatable-${index}`).attr('v-datatable', '');
      });

    return $.html();
  },
};
