<variable name="title">Making the Site Searchable</variable>
<variable name="filename">makingTheSiteSearchable</variable>

<frontmatter>
  title: "User Guide: {{ title }}"
  footer: footer.md
  siteNav: userGuideSections.md
  pageNav: 2
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ baseUrl }}/userGuide/{{ filename }}.html)</md>
</span>

<include src="../common/header.md" />

# {{ title }}

<span class="lead" id="overview">

**MarkBind comes with with an in-built _site search_ facility**. You can add a [Search Bar]({{ baseUrl }}/userGuide/usingComponents.html#search-bar) component to your pages %%(e.g., into the top navigation bar)%% to allow readers to search your website for keywords.
</span>

**All headings of levels 1-3 are captured in the search index** by default. You can change this setting using the [`headingIndexLevel` property of the `site.json`]({{ baseUrl }}/userGuide/siteConfiguration.html#headingindexinglevel).

<include src="syntax/searchBars.mbdf" />
<include src="syntax/keywords.mbdf" />

<box type="warning">

If you do not wish to use MarkBind's searchbar (e.g. you have an external service provider), it may be helpful to include the option `enableSearch: false` in your `site.json`. This stops MarkBind from indexing search headings and speeds up building.
</box>
