<frontmatter>
  title: "User Guide: Making the Site Searchable"
  footer: footer.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# Making the Site Searchable

<span class="lead" id="overview">

**MarkBind comes with with an in-built _site search_ facility**. You can add a [Search Bar]({{ baseUrl }}/userGuide/usingComponents.html#search-bar) component to your pages %%(e.g., into the top navigation bar)%% to allow readers to search your website for keywords.
</span>

**All headings of levels 1-3 are captured in the search index** by default. You can change this setting using the [`headingIndexLevel` property of the `site.json`]({{ baseUrl }}/userGuide/siteConfiguration.html#headingindexinglevel).

## Using Keywords

**You can also specify additional keywords to be indexed under a heading** by tagging the words with the `keyword` class. Those keywords will be linked to the heading immediately above it. If you want to index a keyword without rendering it in the page, add `d-none` as a class.

<div class="indented">

{{ icon_example }}

```html
#### Developer Testing
<span class="keyword d-none">regress</span>
<span class="keyword d-none">regression testing</span>

This is good for catching <span class="keyword">regressions</span>.
```
{{ icon_arrow_down }}

<box>

<big>**Developer Testing**</big><br>

This is good for catching <span class="keyword">regressions</span>.
</box>
</div>

**You can also set additional keywords to be indexed for an entire page** using the `keywords` attribute inside the `<frontmatter>` of that page.

<div class="indented">

{{ icon_example }}

```html
<frontmatter>
  keywords: regress, regression testing, regressions
</frontmatter>
...
```

</div>

</div>
