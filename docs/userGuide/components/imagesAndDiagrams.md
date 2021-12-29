{% set title = "Image & Diagram Components" %}
{% set filename = "imagesAndDiagrams" %}
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

# Image & Diagram Components

<span id="overview" class="lead">

The image components here provide **convenient syntax & styling abstractions** on top of raw HTML and Markdown images.
Diagrams, in the form of **inline PlantUML components** are also supported.
</span>

{% from "userGuide/fullSyntaxReference.md" import syntax_topics as topics %}

{% macro show_topic(filename) %}
<include src="../syntax/{{ filename }}.mbdf" />
<hr>
{% endmacro %}

{% for k,v in topics %}
{% if 'images-diagrams' in v[1] %}
{{ show_topic(k) }}
{% endif %}
{% endfor %}

<br>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('presentation', 'popups') }}
