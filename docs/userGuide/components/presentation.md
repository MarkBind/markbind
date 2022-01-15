{% set title = "Presentational Components" %}
{% set filename = "presentation" %}
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

# Presentational Components

<span id="overview" class="lead">

The components in this page are the core **presentational** components you may want to use. Panels and tabs can be used to **organise content sections**, while badges and boxes can **highlight small, specific pieces of information**.
</span>

{% from "userGuide/fullSyntaxReference.md" import syntax_topics as topics %}

{% macro show_topic(filename) %}
<include src="../syntax/{{ filename }}.mbdf" />
<hr>
{% endmacro %}

{% for k,v in topics %}
{% if 'presentation' in v[1] %}
{{ show_topic(k) }}
{% endif %}
{% endfor %}

<br>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('../usingComponents', 'imagesAndDiagrams') }}
