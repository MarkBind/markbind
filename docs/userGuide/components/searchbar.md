
# Searchbar
<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback"></searchbar>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

``` html
<searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback"></searchbar>
```
</tip-box>
<br>

## Searchbar Options

Name | Type | Default | Description
---- | ---- | ------- | ------
data | `Array` || The local data source for suggestions. Expected to be a primitive array.
on-hit | `Function` || A callback function when you click or hit return on an item.
placeholder | `String` || Default text shown in the searchbar.
