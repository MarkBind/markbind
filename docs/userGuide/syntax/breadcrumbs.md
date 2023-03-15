## Breadcrumbs

Breadcrumb components provide an easy way for readers to navigate the hierarchy of the site.

#### Usage

Simply include the breadcrumb component (`<breadcrumb />`) into the page you want and breadcrumbs for that page will be automatically generated.

You can also insert the breadcrumb component into a layout file to generate breadcrumbs for all pages using that layout.

%%CODE:%%

<div class="indented">

```html
<breadcrumb />
```

</div>

%%OUTPUT:%%

<div class="indented">

> <breadcrumb />

</div>

<box type="tip" seamless>
  Breadcrumb components refer to the Site Navigation for the hierarchy of pages. <strong>Breadcrumbs will not appear if there is no Site Navigation present on the page!</strong>
</box>

<!-- Included in syntax cheat sheet -->
<div id="short" class="d-none">

```html
<breadcrumb />
```

</div>

<!-- Included in readerFacingFeatures.md -->
<div id="examples" class="d-none">
<breadcrumb />
</div>
