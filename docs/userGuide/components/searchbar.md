## Search Bar

The searchbar allows users to search all headings within any page on the site.

<box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  Enter a search term (eg. 'search bar') to see the search result dropdown.
  <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback"></searchbar>
  <br>
  <searchbar :data="searchData" placeholder="Search (Right-aligned dropdown)" :on-hit="searchCallback" menu-align-right></searchbar>
</box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

``` html
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
</tip-box>
<br>

****Options****

Name | Type | Default | Description
---- | ---- | ------- | ------
data | `Array` || The local data source for suggestions. Expected to be a primitive array. To use MarkBind's search functionality, set this value to `"searchData"`.
menu-align-right | `Boolean` | `false` | Whether the search bar's dropdown list will be right-aligned.
on-hit | `Function` || A callback function when you click or hit return on an item. To use MarkBind's search functionality, set this value to `"searchCallback"`.
placeholder | `String` | `''` | The placeholder text shown when no keywords are entered in the search bar.

<box type="warning">

Note: If you are using MarkBind's search functionality, then `enableSearch` **must be set to `true` in `site.json`**.

See: [User Guide: Site Configuration → enableSearch]({{ baseUrl }}/userGuide/siteConfiguration.html#enable-search).

</box>

%%{{ icon_info }} Related topic: [User Guide: Making the Site Searchable]({{ baseUrl }}/userGuide/makingTheSiteSearchable.html).%%
