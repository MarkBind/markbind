# Navigation Components

## Navbar

**Navbar** provides top navigation with link highlighting.

<box type="warning">
Navbars should be placed within a [header file](tweakingThePageStructure.html#sticking-the-header-to-the-top) to ensure correct positioning at the top of the page.
</box>

### Basic Navbar

```html
<navbar type="primary">
  <a slot="brand" href="/" title="Home" class="navbar-brand">MarkBind</a>
  <li><a href="{{baseUrl}}/guide/index.html" class="nav-link">Guide</a></li>
  <li slot="right">
    <a href="https://github.com" target="_blank" class="nav-link">GitHub</a>
  </li>
</navbar>
```

### Navbar Types

```html
<navbar type="primary">...</navbar>
<navbar type="dark">...</navbar>
<navbar type="light">...</navbar>
<navbar type="none" add-class="bg-warning">Custom</navbar>
```

### Link Highlighting

```html
<navbar type="dark" default-highlight-on="sibling-or-child">
  <a slot="brand" href="/" title="Home" class="navbar-brand">MarkBind</a>
  <li><a href="{{baseUrl}}/guide/index.html" class="nav-link">Guide</a></li>
</navbar>
```

### Highlight Options

| Option | Description |
|--------|-------------|
| `child` | Highlights if current URL is child of link |
| `sibling` | Highlights if current URL is sibling of link |
| `sibling-or-child` | Highlights if sibling or child (default) |
| `exact` | Highlights only exact match |
| `none` | No highlighting |

### Custom Styling with Bootstrap

```html
<navbar type="none" add-class="bg-danger">
  ...
</navbar>

<navbar type="none" add-class="bg-info">
  ...
</navbar>
```

## Dropdown

**Dropdown** creates dropdown menus, standalone or within navbars.

### Basic Dropdown

```html
<dropdown header="Menu">
  <li><a href="#">Action 1</a></li>
  <li><a href="#">Action 2</a></li>
  <li class="dropdown-divider"></li>
  <li><a href="#">Action 3</a></li>
</dropdown>
```

### Dropdown Types

```html
<dropdown header="Default" type="default">...</dropdown>
<dropdown header="Primary" type="primary">...</dropdown>
<dropdown header="Danger" type="danger">...</dropdown>
<dropdown header="Info" type="info">...</dropdown>
<dropdown header="Warning" type="warning">...</dropdown>
<dropdown header="Success" type="success">...</dropdown>
```

### Nested Dropdowns

```html
<dropdown header="Parent Menu" type="primary">
  <li>
    <a href="#">Parent Item</a>
    <ul class="dropdown-menu">
      <li><a href="#">Child 1</a></li>
      <li><a href="#">Child 2</a></li>
    </ul>
  </li>
</dropdown>
```

### Disabled State

```html
<dropdown header="Disabled" disabled>
  <li>...</li>
</dropdown>
```

### Right-aligned Menu

```html
<dropdown header="Right Menu" menu-align-right>
  <li>...</li>
</dropdown>
```

## Breadcrumbs

**Breadcrumb** generates hierarchical navigation path automatically based on Site Navigation.

```html
<breadcrumb />
```

No attributes needed.

## Site Navigation

**Site-nav** provides sidebar navigation of main site pages.

### Basic Site Nav

```html
<site-nav>
* [Home]({{baseUrl}}/index.html)
* [User Guide]({{baseUrl}}/ug/index.html)
  * [Getting Started]({{baseUrl}}/ug/gettingStarted.html)
  * [Authoring]({{baseUrl}}/ug/authoring.html)
</site-nav>
```

### Expand by Default

```html
<site-nav>
* [Home]({{baseUrl}}/index.html)
* [User Guide]({{baseUrl}}/ug/index.html) :expanded:
  * [Getting Started]({{baseUrl}}/ug/gettingStarted.html)
  * [Authoring]({{baseUrl}}/ug/authoring.html)
</site-nav>
```

### Markdown Formatting

```html
<site-nav>
* [**Home**]({{baseUrl}}/index.html)
* **User Guide** :expanded:
  * *Getting Started* - Introduction
  * [Authoring]({{baseUrl}}/ug/authoring.html)
</site-nav>
```

Supports up to 4 nesting levels.

## Page Navigation

**Page-nav** shows table of contents for current page's headings.

### Basic Page Nav

```html
<page-nav />
<page-nav-print />
```

### Configuration

In frontmatter:
```html
<frontmatter>
  pageNav: 3
  pageNavTitle: "Contents"
</frontmatter>
```

- `pageNav`: Max heading level (default: 3)
- `pageNavTitle`: Custom title

## Navbar Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `type` | String | `primary` | `primary`, `dark`, `light`, `none` |
| `default-highlight-on` | String | `sibling-or-child` | Highlight rule |

## Dropdown Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `header` | slot | - | Button text |
| `type` | String | `default` | Style type |
| `disabled` | Boolean | false | Disable dropdown |
| `menu-align-right` | Boolean | false | Right-align menu |