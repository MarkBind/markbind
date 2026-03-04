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
This is a <strong>beta</strong> feature and will be refined in future updates. To use it, you must have <code>enableSearch: true</code> in your <code>site.json</code> (this is the default).
</box>

<box type="warning">
The Pagefind index is currently only generated during a full site build (e.g., <code>markbind build</code>). It will <strong>not</strong> repeatedly update during live reload (<code>markbind serve</code>) when you modify pages. You must restart the server (re-run <code>markbind serve</code>) or rebuild to refresh the search index.
</box>

To add the Pagefind search bar to your page, simply insert the following `div` where you want it to appear:

```html
<div id="pagefind-search-input"></div>
```

MarkBind will automatically inject the necessary scripts and styles to render the search UI.

The following UI will be rendered, which is provided by Pagefind:

<div id="pagefind-search-input"></div>


<br>

## Using External Search Services

MarkBind sites can use Algolia Doc Search services easily via the Algolia plugin. Unlike the built-in search, Algolia provides full-text search. See the panel below for more info.

{{ embed("Using plugins → **Algolia**", "plugins/algolia.md") }}

{% from "njk/common.njk" import previous_next %}
{{ previous_next('usingPlugins', 'themes') }}
