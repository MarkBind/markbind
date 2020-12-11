{% set title = "Authoring Contents" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
</frontmatter>

# {{ title }}

{% set pages = [
  ['Adding Pages', 'addingPages'],
  ['MarkBind Syntax Overview', 'markBindSyntaxOverview'],
  ['Formatting Contents', 'formattingContents'],
  ['Using Components', 'usingComponents'],
  ['Using HTML, JavaScript, CSS', 'usingHtmlJavaScriptCss'],
  ['Tweaking the Page Structure', 'tweakingThePageStructure'],
  ['Reusing Contents', 'reusingContents']
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
