{% set title = "Formatting Contents" %}
{% set filename = "formattingContents" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
  pageNav: 2
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# {{ title }}

<span class="lead" id="overview">

**MarkBind supports a wide collection of Markdown-like basic content formatting syntax** such as text styling, tables, lists, images, links, etc.

</span>

{% from "userGuide/fullSyntaxReference.md" import syntax_topics as topics %}

{% macro show_topic(filename) %}
<include src="./syntax/{{ filename }}.mbdf" />
<hr>
{% endmacro %}

{% for k,v in topics %}
  {% if 'basic' in v[1] %}
{{ show_topic(k) }}
  {% endif %}
{% endfor %}

****Relevant Tips & Tricks****

<panel header="Escaping Characters">

<include src="tipsAndTricks.md#escapingCharacters" />

</panel>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('markBindSyntaxOverview', 'usingComponents') }}
