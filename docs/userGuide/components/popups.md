{% set title = "PopUp Components" %}
{% set filename = "popups" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
  pageNav: 3
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

<include src="advanced.md#slots-info" />

# PopUps

<div id="overview" class="lead">

The components in this page can be used to easily create **various forms of PopUps** that are activated on some user action (e.g., hovering over some text). This may be useful for showing additional information related to some specific area or span of content.
</div>

{% from "userGuide/syntax/fullSyntaxSet.njk" import syntax_topics as topics %}

{% macro show_topic(filename) %}
<include src="../syntax/{{ filename }}.md" />
<hr>
{% endmacro %}

{% for k,v in topics %}
{% if 'popups' in v[2] %}
{{ show_topic(k) }}
{% endif %}
{% endfor %}

<br>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('imagesAndDiagrams', 'navigation') }}
