### Plugin: DataTable

The [DataTable](https://datatables.net) plugin enhances the functionality of tables in your MarkBind site by integrating the DataTables library. It allows you to add searching and sorting capabilities to your tables with minimal configuration. The necessary CSS and JavaScript files are already included in the project, so no additional CDN or plugin context configuration is required.

To enable this plugin, simply add `dataTable` to your site's plugins:

```js {heading="site.json"}
{
  ...
  "plugins": [
    "dataTable"
  ]
}
```

To create a table with DataTable features, use one of the following syntaxes:

{{ icon_example }} Sortable Table:

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<d-table sortable>
| Product   | Price | Quantity |
|-----------|-------|----------|
| Apple     | $0.50 | 100      |
| Banana    | $0.75 | 50       |
| Orange    | $0.60 | 75       |
</d-table>
</variable>
</include>

{{ icon_example }} Searchable Table:

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<d-table searchable>
| Book Title                | Author           | Year Published |
|---------------------------|------------------|----------------|
| To Kill a Mockingbird     | Harper Lee       | 1960           |
| 1984                      | George Orwell    | 1949           |
| Pride and Prejudice       | Jane Austen      | 1813           |
| The Great Gatsby          | F. Scott Fitzgerald | 1925        |
</d-table>
</variable>
</include>

{{ icon_example }} Sortable and Searchable Table:

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<d-table sortable searchable>
| City        | Country   | Population |
|-------------|-----------|------------|
| New York    | USA       | 8,336,817  |
| London      | UK        | 9,002,488  |
| Paris       | France    | 2,161,063  |
| Tokyo       | Japan     | 13,960,236 |
| Sydney      | Australia | 5,367,206  |
</d-table>
</variable>
</include>

The DataTable plugin automatically renders the table with the specified features based on the presence of the `sortable` and `searchable` attributes in the `<d-table>` tag. You can use either one or both attributes to control the desired functionality for each table.
