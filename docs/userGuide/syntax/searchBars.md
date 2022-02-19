## Search Bars

The `searchbar` component allows users to search all headings within any page on the site.

<span id="body">

<include src="outputBox.md" boilerplate >
<span id="code">

```html
<searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback"></searchbar>
<searchbar :data="searchData" placeholder="Search (Right-aligned dropdown)" :on-hit="searchCallback" menu-align-right></searchbar>
```

To use the searchbar within a navbar, add the following markup to your file. The searchbar can be positioned using the slot attribute for the list. The following markup adds a searchbar to the right side of the navbar with appropriate styling.

```html
<li slot="right">
  <form class="navbar-form">
    <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback"></searchbar>
  </form>
</li>
```
</span>
<span id="output">

Enter a search term (eg. 'search bar') to see the search result dropdown.
<searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback"></searchbar>
<br>
<searchbar :data="searchData" placeholder="Search (Right-aligned dropdown)" :on-hit="searchCallback" menu-align-right></searchbar>
</span>
</include>

****Options****

Name | Type | Default | Description
---- | ---- | ------- | ------
algolia | `Boolean` | `false` | Whether the searchbar should be connected to [Algolia DocSearch]({{ baseUrl }}/userGuide/usingPlugins.html#algolia-enabling-algolia-docsearch).
data | `Array` || The local data source for suggestions. Expected to be a primitive array. To use MarkBind's search functionality, set this value to `"searchData"`.
menu-align-right | `Boolean` | `false` | Whether the search bar's dropdown list will be right-aligned.
on-hit | `Function` || A callback function when you click or hit return on an item. To use MarkBind's search functionality, set this value to `"searchCallback"`.
placeholder | `String` | `''` | The placeholder text shown when no keywords are entered in the search bar.

<box type="warning">

Note: If you are using MarkBind's search functionality, then `enableSearch` **must be set to `true` in `site.json`**.

See: [User Guide: Site Configuration → enableSearch]({{ baseUrl }}/userGuide/siteJsonFile.html#enable-search).

</box>

%%{{ icon_info }} Related topic: [User Guide: Making the Site Searchable]({{ baseUrl }}/userGuide/makingTheSiteSearchable.html).%%

%%{{ icon_info }} Related topic: [User Guide: Using Plugins → Algolia: Enabling Algolia DocSearch]({{ baseUrl }}/userGuide/usingPlugins.html#algolia-enabling-algolia-docsearch).%%

</span> <!-- end of body -->

<span id="short" class="d-none">

```html
<searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback" menu-align-right></searchbar>
```

```html
<li slot="right">
  <form class="navbar-form">
    <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback"></searchbar>
  </form>
</li>
```
</span>

<span id="examples" class="d-none">

<searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback"></searchbar>
</span>
