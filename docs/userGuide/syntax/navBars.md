## Navbars

**Navbar allows visitors of your website to navigate through pages easily.**

**Navbars support link highlighting; link highlighting can be customised by specifying rules.**
- Define `default-highlight-on` in `<navbar>` to specify fallback highlight rules.
- Define `data-highlight` in `<a>` tags with the class `nav-link` or `dropdown-item` to specify individual highlight rules.

<box type="warning">
  <markdown>
Note: **Navbars** should be placed within a [header file]({{ baseUrl }}/userGuide/tweakingThePageStructure.html#headers) to ensure that they are correctly positioned at the top of the page, above the [site navigation]({{ baseUrl }}/userGuide/tweakingThePageStructure.html#site-navigation-menus) and [page navigation]({{ baseUrl }}/userGuide/tweakingThePageStructure.html#page-navigation-menus) menus.
  </markdown>
</box>

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<navbar type="primary">
  <!-- Brand as slot -->
  <a slot="brand" href="/" title="Home" class="navbar-brand">MarkBind</a>
  <li><a href="{{baseUrl}}/userGuide/components/navigation.html#navbars" class="nav-link">Highlighted Link</a></li>
  <!-- You can use dropdown component -->
  <dropdown header="Dropdown" class="nav-link">
    <li><a href="#navbars" class="dropdown-item">Option</a></li>
  </dropdown>
  <!-- For right positioning use slot -->
  <li slot="right">
    <a href="https://github.com/MarkBind/markbind" target="_blank" class="nav-link">Fork...</a>
  </li>
</navbar>

<navbar type="dark">
  <!-- Brand as slot -->
  <a slot="brand" href="/" title="Home" class="navbar-brand">MarkBind</a>
  <li><a href="{{baseUrl}}/userGuide/components/navigation.html#navbars" class="nav-link">Highlighted Link</a></li>
  <!-- You can use dropdown component -->
  <dropdown header="Dropdown" class="nav-link">
    <li><a href="#navbars" class="dropdown-item">Option</a></li>
  </dropdown>
  <!-- For right positioning use slot -->
  <li slot="right">
    <a href="https://github.com/MarkBind/markbind" target="_blank" class="nav-link">Fork...</a>
  </li>
</navbar>

<navbar type="light">
  <!-- Brand as slot -->
  <a slot="brand" href="/" title="Home" class="navbar-brand">MarkBind</a>
  <li><a href="{{baseUrl}}/userGuide/components/navigation.html#navbars" class="nav-link">Highlighted Link</a></li>
  <!-- You can use dropdown component -->
  <dropdown header="Dropdown" class="nav-link">
    <li><a href="#navbars" class="dropdown-item">Option</a></li>
  </dropdown>
  <!-- For right positioning use slot -->
  <li slot="right">
    <a href="https://github.com/MarkBind/markbind" target="_blank" class="nav-link">Fork...</a>
  </li>
</navbar>
</variable>
</include>

****Options****

Name | Type | Default | Description
--- | --- | --- | ---
type | `String` | `primary` | Supports: `primary`, `dark`, `light`, `none`.
default-highlight-on | `String` | `sibling-or-child` | Supports: `sibling-or-child`, `sibling`, `child`, `exact`, `none`. Specifies link highlight rules for navbars.

<box type="tip">

If you wish to further customize your navbar beyond the primary, dark, and light theme colors, specify the `type="none"` attribute and [insert your own custom styles](#inserting-custom-classes-into-components) or <trigger trigger="click" for="modal:built-in-bg">use built-in background styles</trigger> via the `add-class` attribute.

</box>

<modal header="Built-in background styles" id="modal:built-in-bg">
<md>For instance, Bootstrap supports `.bg-danger`, `bg-info`, `bg-primary`, `bg-success`, `bg-warning` as background colors.</md>
<md>In `{your-site}/_markbind/headers/header.md`, you can change `<navbar type="dark/primary/light">` to `<navbar type="none" add-class="bg-warning/danger/info/primary/success">` to apply Bootstrap background styles.</md>
</modal>

****Navbar Link Highlighting****

```html
{% include "_markbind/layouts/headers/header.md" %}
```

****Highlight Options****

Name | Description
--- | ---
`child` | Highlights link if URL in address bar is a child of the link. E.g `foo/bar` is a child of `foo`.
`sibling` | Highlights link if URL in address bar is a sibling of the link. E.g `foo/bar` and `foo/bear` are siblings.
`sibling-or-child` | Highlights link if URL in address bar is a sibling or child of the link.
`exact` | Highlights link if URL in address bar exactly matches link.
`none` | No highlighting.

<span id="short" class="d-none">

```html
<navbar type="primary">
  <!-- Brand as slot -->
  <a slot="brand" href="/" title="Home" class="navbar-brand">MarkBind</a>
  <li><a href="{{baseUrl}}/userGuide/components/navigation.html#navbars" class="nav-link">Highlighted Link</a></li>
  <!-- You can use dropdown component -->
  <dropdown header="Dropdown" class="nav-link">
    <li><a href="#navbars" class="dropdown-item">Option</a></li>
  </dropdown>
  <!-- For right positioning use slot -->
  <li slot="right">
    <a href="https://github.com/MarkBind/markbind" target="_blank" class="nav-link">Fork...</a>
  </li>
</navbar>
```

</span>

<span id="examples" class="d-none">

<navbar type="primary">
  <!-- Brand as slot -->
  <a slot="brand" href="/" title="Home" class="navbar-brand">MarkBind</a>
  <li><a href="{{baseUrl}}/userGuide/components/navigation.html#navbars" class="nav-link">Highlighted Link</a></li>
  <!-- You can use dropdown component -->
  <dropdown header="Dropdown" class="nav-link">
    <li><a href="#navbars" class="dropdown-item">Option</a></li>
  </dropdown>
  <!-- For right positioning use slot -->
  <li slot="right">
    <a href="https://github.com/MarkBind/markbind" target="_blank" class="nav-link">Fork...</a>
  </li>
</navbar>

<navbar type="dark">
  <!-- Brand as slot -->
  <a slot="brand" href="/" title="Home" class="navbar-brand">MarkBind</a>
  <li><a href="{{baseUrl}}/userGuide/components/navigation.html#navbars" class="nav-link">Highlighted Link</a></li>
  <!-- You can use dropdown component -->
  <dropdown header="Dropdown" class="nav-link">
    <li><a href="#navbars" class="dropdown-item">Option</a></li>
  </dropdown>
  <!-- For right positioning use slot -->
  <li slot="right">
    <a href="https://github.com/MarkBind/markbind" target="_blank" class="nav-link">Fork...</a>
  </li>
</navbar>

<navbar type="light">
  <!-- Brand as slot -->
  <a slot="brand" href="/" title="Home" class="navbar-brand">MarkBind</a>
  <li><a href="{{baseUrl}}/userGuide/components/navigation.html#navbars" class="nav-link">Highlighted Link</a></li>
  <!-- You can use dropdown component -->
  <dropdown header="Dropdown" class="nav-link">
    <li><a href="#navbars" class="dropdown-item">Option</a></li>
  </dropdown>
  <!-- For right positioning use slot -->
  <li slot="right">
    <a href="https://github.com/MarkBind/markbind" target="_blank" class="nav-link">Fork...</a>
  </li>
</navbar>

</span>

****Mobile page and site navigation menus****

The navbar component also provides access to MarkBind's [site navigation]({{ baseUrl }}/userGuide/components/navigation.html#site-navigation-menus) and [page navigation]({{ baseUrl }}/userGuide/components/navigation.html#page-navigation-menus) menu **components** if used in the page's [layout](../tweakingThePageStructure.md#layouts). No additional setup is required!

If you are viewing the documentation on a larger device, resize the window to see what it looks like.

Alternatively, if you want to display <tooltip content="e.g. adding an image to the site nav">additional content</tooltip> in these navigation menus, the navbar is also able to "pull in" any **container element** with a html `id` of `"site-nav"` or `"page-nav"`. You may refer to the [layouts](../tweakingThePageStructure.md#layouts) section for an example.

<box type="tip" seamless>

The navbar component auto-detects if the MarkBind's navigation components or your element containers has any <tooltip content="`<a>` tags in particular">links</tooltip>.<br>
If absent, the navigation buttons to open the menus are _automatically hidden_.
</box>

****Mobile navigation menu button placement****

If you wish to alter the button placement on the navbar, you may use the `<site-nav-button />` and `<page-nav-button />` components in the `lower-navbar` slot.

By default, if the `lower-navbar` slot is not specified, the site and page navigation buttons are simply placed as such.

```html
<navbar>
  <!-- Any normal navbar items -->
  <a slot="brand" href="/" title="Home" class="navbar-brand">MarkBind</a>
  <li><a href="/userGuide/components/navigation.html#navbars" class="nav-link">Highlighted Link</a></li>
  <!-- Use slot to wrap the buttons in the lower navbar -->
  <div slot="lower-navbar" class="nav-menu-container">
    <site-nav-button />
    <page-nav-button />
  </div>
</navbar>
```

Component | Description
--- | ---
`page-nav-button` | Pulls any element with an identifier, `id=page-nav` into the menu. If no such element exists, it pulls any [page navigation menu]({{ baseUrl }}/userGuide/components/navigation.html#page-navigation-menus) used in the layout.
`site-nav-button` | Pulls any element with an identifier, `id=site-nav` into the menu. If no such element exists, it pulls all [site navigation menu components]({{ baseUrl }}/userGuide/components/navigation.html#site-navigation-menus) used in the layout.

****Styling the mobile page and site navigation menus****

You may also wish to style your navigation content differently on mobile view.
By default, MarkBind already provides some reasonable overrides for smaller screens, applied over any styles you might have for the mobile navigation content identified above.

```css {heading="Css class attached to the root navigation element"}
.mb-mobile-nav {
    display: block !important;
    margin: 0 !important;
    border: none !important;
    padding: 10px !important;
    width: 100% !important;
    max-width: 100% !important;
}
```

If you require greater customisation, you may simply compose the respective selectors with the `.mb-mobile-nav` element.

{{ icon_example }}

```css {heading=""}
#site-nav.mb-mobile-nav {
  /* Be sure to add the !important css rule when overriding .mb-mobile-nav's properties! */
  border: 1px solid black !important;
  /* For other properties, there is no need. */
  color: red;
}
```

<box type="tip" seamless>

Refer to the [layouts](../tweakingThePageStructure.md) section to find out how to add custom css files to a page!
</box>
