import * as cheerio from 'cheerio';
import dataTable from '../../../../src/plugins/dataTable';

test('postRender should add appropriate classes and attributes to m-table elements', () => {
  const content = `
    <m-table sortable>
    | Name | Age |
    |------|-----|
    | John | 28  |
    | Jane | 32  |
    </m-table>

    <m-table searchable>
    | City     | Country |
    |----------|---------|
    | New York | USA     |
    | London   | UK      |
    </m-table>

    <m-table sortable searchable>
    | Product | Price |
    |---------|-------|
    | Apple   | $0.50 |
    | Banana  | $0.75 |
    </m-table>
  `;

  const expectedClasses = [
    'markbind-table table table-bordered table-striped sortable-table',
    'markbind-table table table-bordered table-striped searchable-table',
    'markbind-table table table-bordered table-striped sortable-searchable-table',
  ];

  const renderedContent = dataTable.postRender({}, {}, content);
  const $ = cheerio.load(renderedContent);

  $('table').each((index, el) => {
    expect($(el).attr('class')).toEqual(expectedClasses[index]);
    expect($(el).attr('id')).toEqual(`datatable-${index}`);
    expect($(el).attr('v-datatable')).toBeDefined();
  });
});

test('getLinks should return the correct CSS links', () => {
  const expectedLinks = [
    '<link rel="stylesheet" href="dataTableAssets/datatables.min.css">',
    '<link rel="stylesheet" href="dataTableAssets/datatables-additional.css">',
  ];

  const links = dataTable.getLinks();
  expect(links).toEqual(expectedLinks);
});

test('getScripts should return the correct script tags', () => {
  const expectedScripts = '<script src="dataTableAssets/datatables.min.js"></script>';

  const scripts = dataTable.getScripts();
  expect(scripts.length).toBe(2);
  expect(scripts[0]).toEqual(expectedScripts);
});
