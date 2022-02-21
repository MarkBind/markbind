## Including or Excluding Headings

**You can specify headings which are to be included or excluded from the index built by MarkBind's built-in search feature** using the `.always-index` or `.no-index` classes.

If you wish to index a specific heading outside the specified `headingIndexLevel`, you may add the `.always-index` attribute to the heading. Similarly, if you wish for a specific heading inside the specified `headingIndexLevel` not to be indexed, you may add the `.no-index` attribute to the heading.

<div class="indented">

{{ icon_example }}

```md
###### Heading outside heading index level that will be indexed {.always-index}

# Heading inside heading index level that will not be indexed {.no-index}
```

Equivalently,
```html
<h6 class="always-index"> Heading outside heading index level that will be indexed </h6>

<h1 class="no-index"> Heading inside heading index level that will not be indexed </h1>
```
</div>
