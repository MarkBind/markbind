<variable name="title" id="title">Making the Site Searchable</variable>
<variable name="filename">makingTheSiteSearchable</variable>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide
  pageNav: 2
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# {{ title }}

<span class="lead" id="overview">

**MarkBind comes with with an in-built _site search_ facility**. You can add a [Search Bar](usingComponents.html#search-bar) component to your pages %%(e.g., into the top navigation bar)%% to allow readers to search your website for keywords.
</span>

**All markdown and html headings of levels 1-3 are captured in the search index** by default. You can change this setting using the [`headingIndexLevel` property of the `site.json`](siteConfiguration.html#headingindexinglevel).

<box type="info">

MarkBind also provides a plugin for Algolia DocSearch, which provides full text search for your site.

See: [User Guide: Using Plugins → Algolia: Enabling Algolia DocSearch]({{ baseUrl }}/userGuide/usingPlugins.html#algolia-enabling-algolia-docsearch).
</box>

<box type="warning">

If you do not wish to use MarkBind's searchbar (e.g. you have an external service provider), it may be helpful to include the option `enableSearch: false` in your `site.json`. This stops MarkBind from indexing search headings and speeds up building.
</box>

<include src="syntax/searchBars.mbdf" />
<include src="syntax/keywords.mbdf" />
<include src="syntax/indexing.mbdf" />

{% from "njk/common.njk" import previous_next %}
{{ previous_next('reusingContents', 'deployingTheSite') }}
