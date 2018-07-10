# Searchbar

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback"></searchbar>
  <br>
  <searchbar :data="searchData" placeholder="Search (Right-aligned)" :on-hit="searchCallback" menu-align-right></searchbar>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

``` html
<searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback"></searchbar>
<searchbar :data="searchData" placeholder="Search (Right-aligned)" :on-hit="searchCallback" menu-align-right></searchbar>
```
</tip-box>
<br>

## Searchbar Options

Name | Type | Default | Description
---- | ---- | ------- | ------
data | `Array` || The local data source for suggestions. Expected to be a primitive array.
menu-align-right | `Boolean` | `false` | Whether the search bar's dropdown list will be right-aligned.
on-hit | `Function` || A callback function when you click or hit return on an item.
placeholder | `String` || 
