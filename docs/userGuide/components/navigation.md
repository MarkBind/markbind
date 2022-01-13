{% set title = "Navigation Components" %}
{% set filename = "navigation" %}
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

# Navigation Components

<div id="overview" class="lead">

The components in this page are used for scaffolding **site and page navigation**.
</div>

{% from "userGuide/fullSyntaxReference.md" import syntax_topics as topics %}

{% macro show_topic(filename) %}
<include src="../syntax/{{ filename }}.mbdf" />
<hr>
{% endmacro %}

{% for k,v in topics %}
{% if 'navigation' in v[1] %}
{{ show_topic(k) }}
{% endif %}
{% endfor %}

<br>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('popups', 'others') }}
