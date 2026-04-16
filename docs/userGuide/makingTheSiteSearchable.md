{% set title = "Making the Site Searchable" %}
{% set filename = "makingTheSiteSearchable" %}
<span id="title" class="d-none">{{ title }}</span>

{% from "njk/common.njk" import embed with context %}

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
  pageNav: 2
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# {{ title }}

<div class="lead" id="overview">

**MarkBind comes with an in-built _site search_ facility** with the option to use third-party search services as well.
</div>

**All markdown and HTML headings of levels 1-3 are captured in the search index** by default. You can change this setting using the [`headingIndexLevel` property of the `site.json`](siteJsonFile.html#headingindexinglevel).

<box type="warning">

If you do not wish to use MarkBind's searchbar (e.g. you have an external service provider), it may be helpful to include the option `enableSearch: false` in your `site.json`. This stops MarkBind from indexing search headings and speeds up building.
</box>

## Search Bars

You can add a search bar component to your website to allow users to search the site.

{{ embed("Using components → **Search bars**", "syntax/searchBars.md#body") }}
<p/>
<include src="syntax/keywords.md" />
<include src="syntax/indexing.md" />





## Using Pagefind (Beta)


MarkBind now supports [Pagefind](https://pagefind.app/), a static low-bandwidth search library, as a built-in feature. This provides full-text search capabilities without external services.

<box type="info">
This is a <strong>beta</strong> feature and will be refined in future updates. To use it, you explicitly enable it in your <code>site.json</code>. Add the <code>pagefind</code> configuration with <code>enablePagefind: true</code>.

<panel header="Example of `site.json`">

```json
{
  "pagefind": {
    "enablePagefind": true
  }
}
```
</panel>

</box>

<box type="warning">
The Pagefind index is currently only generated during a full site build (e.g., <code>markbind build</code>). It will <strong>not</strong> repeatedly update during live reload (<code>markbind serve</code>) when you modify pages. You must restart the server (re-run <code>markbind serve</code>) or rebuild to refresh the search index.
</box>

To add the Pagefind search bar to your page, simply insert the following element where you want it to appear:

```md
<search />
```

The following UI will be rendered, which is provided by Pagefind:

<search />

<br>

### Ignoring Individual Elements from Pagefind Search

You can exclude specific elements from the search index by adding the `data-pagefind-ignore` attribute to them:

```html
<div>
    <h1>This content will be in your search index.</h1>
    <div data-pagefind-ignore>
        This content and all its children will be excluded from search.
    </div>
</div>
```

For more details, see the [Pagefind documentation on removing individual elements](https://pagefind.app/docs/indexing/#removing-individual-elements-from-the-index).

### Using Pagefind Configuration

You can customize Pagefind's indexing behavior by adding a `pagefind` configuration in your `site.json`. This allows you to control which content is indexed and how search works.

#### Excluding Content from Search Index

You can use the `exclude_selectors` option to exclude specific elements from the search index. This is useful if you are migrating from Algolia and want to reuse your existing CSS class selectors.

In your `site.json`:

```json
{
  "pagefind": {
    "enablePagefind": true,
    "exclude_selectors": [".algolia-no-index", "[class*='algolia-no-index']"]
  }
}
```

This tells Pagefind to exclude any element with the `algolia-no-index` class (or containing it in a space-separated list) from the search index, similar to using `data-pagefind-ignore`.

For more details, see the [Pagefind documentation on exclude selector configuration option](https://pagefind.app/docs/config-options/#exclude-selectors).

#### Limiting Which Pages Are Searchable

Pagefind uses the existing `searchable` property in your `pages` configuration to determine which pages should be indexed. This provides a seamless way to control search indexing without additional configuration.

In your `site.json`:

```json
{
  "pages": [
    {
      "src": "index.md"
    },
    {
      "src": "internal/notes.md",
      "searchable": "no"
    },
    {
      "glob": "devGuide/**/*.md",
      "searchable": "no"
    }
  ]
}
```

- Pages with `searchable: "no"` (or `false`) will not appear in search results
- By default, all pages are searchable (`searchable: "yes"`)

For more details on the `searchable` property, see [site.json file documentation](siteJsonFile.html#pages).

<panel header="Interaction with Pagefind Attributes">

MarkBind controls page indexing through the `searchable` property, which determines whether pages are passed to Pagefind for indexing. However, Pagefind also provides native attributes that can affect indexing:

- [**`data-pagefind-body`**](https://pagefind.app/docs/indexing/#limiting-what-sections-of-a-page-are-indexed): Marks a specific element as the search content container. When this attribute exists on ANY page of your site, pages WITHOUT this attribute will not be indexed.
- [**`data-pagefind-ignore`**](https://pagefind.app/docs/indexing/#removing-individual-elements-from-the-index): Excludes specific elements from the search index.

**How MarkBind handles this:**

1. Pages with `searchable: "no"` are NOT passed to Pagefind at all (they are never indexed).
2. Pages with `searchable: "yes"` (default) ARE passed to Pagefind for indexing.

**Interactions to be aware of:**

- If you add `data-pagefind-body` to a searchable page, it works as expected - the page is indexed. However, only pages with this attribute will be searchable.
- If you add `data-pagefind-body` to a non-searchable page, MarkBind will still NOT index it (because it's filtered before being passed to Pagefind).
- Adding `data-pagefind-ignore` to a searchable page will NOT prevent it from being indexed - the page is still added via MarkBind's indexing, but the content within that element will be ignored by Pagefind.

**Recommendation:** Use MarkBind's `searchable` property in site.json to control which pages are indexed & use `data-pagefind-body` attribute to exlcude specific elements within a page from being searchable. Avoid using `data-pagefind-body` as it is redundant and may lead to confusion.

</panel>

<panel header="Potential Future Enhancements">

Additional Pagefind configuration options may be supported in future releases:

- **`root_selector`**: Allows specifying a custom root element for indexing (default: `html`). Useful for sites with specific content containers.
- **`force_language`**: Forces a specific language for indexing (e.g., `"en"`, `"pt"`). Improves search accuracy for multilingual sites.

</panel>



<br>

## Using External Search Services

MarkBind sites can use Algolia Doc Search services easily via the Algolia plugin. Unlike the built-in search, Algolia provides full-text search. See the panel below for more info.

{{ embed("Using plugins → **Algolia**", "plugins/algolia.md") }}

{% from "njk/common.njk" import previous_next %}
{{ previous_next('usingPlugins', 'themes') }}
