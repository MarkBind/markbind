<variable name="title" id="title">Authoring Contents</variable>
<frontmatter>
  title: "User Guide: {{ title }}"
  footer: footer.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

# {{ title }}

{% set pages = [
  ['Adding Pages', 'addingPages'],
  ['MarkBind Syntax Overview', 'markBindSyntaxOverview'],
  ['Formatting Contents', 'formattingContents'],
  ['Using Components', 'usingComponents'],
  ['Using HTML, JavaScript, CSS', 'usingHtmlJavaScriptCss'],
  ['Tweaking the Page Structure', 'tweakingThePageStructure'],
  ['Reusing Contents', 'reusingContents'],
  ['Making the Site Searchable', 'makingTheSiteSearchable']
] %}

{% for page in pages %}
<big>**{{ page[0] }}**</big>

<blockquote>

<include src="{{ page[1] }}.md#overview" inline />
</blockquote>

<span class="indented">More info in: <include src="{{ page[1] }}.md#link" inline trim /></span>

{% endfor %}

{% from "njk/common.njk" import previous_next %}
{{ previous_next('gettingStarted', 'addingPages') }}
