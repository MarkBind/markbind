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

# Presentation

<div id="overview" class="lead">

The components in this page are the core **presentational** components you may want to use. Panels and tabs can be used to **organise content sections**, while badges and boxes can **highlight small, specific pieces of information**.
</div>
<box type = "warning" header = "#### Use of markdown in content" >

As presentational components are HTML-based, you need to follow the HTML syntax when using markdown in the content of the components.
More specifically, you should use either:
- add a line break with no indentation beforethe markdown content
- use the `<markdown>` or `<md>`
  tag to wrap the markdown content.
For more information, please refer to this [section]({{baseUrl}}/userGuide/usingHtmlJavaScriptCss.html#markdown-in-html).
</box>

{% from "userGuide/fullSyntaxReference.md" import syntax_topics as topics %}

{% macro show_topic(filename) %}
<include src="../syntax/{{ filename }}.md" />
<hr>
{% endmacro %}

{% for k,v in topics %}
{% if 'presentation' in v[1] %}
{{ show_topic(k) }}
{% endif %}
{% endfor %}

<br>

# Relevant Tips & Tricks

<panel header="Indent components">

<include src="../tipsAndTricks.md#indentComponents" />

</panel>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('../usingComponents', 'imagesAndDiagrams') }}
