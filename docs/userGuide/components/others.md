{% set title = "Other Components" %}
{% set filename = "others" %}
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

# Other Components

<span id="overview" class="lead">

This page lists some other components that may be useful in creating education websites. For now, there are only question and quiz components.
</span>

{% from "userGuide/fullSyntaxReference.md" import syntax_topics as topics %}

{% macro show_topic(filename) %}
<include src="../syntax/{{ filename }}.mbdf" />
<hr>
{% endmacro %}

{% for k,v in topics %}
{% if 'others' in v[1] %}
{{ show_topic(k) }}
{% endif %}
{% endfor %}

<br>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('navigation', 'advanced') }}
