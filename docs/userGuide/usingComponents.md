{% set title = "Using Components" %}
{% set filename = "usingComponents" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
  pageNav: 3
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# Using Components

<span id="overview" class="lead">

**MarkBind provides a number of components** (e.g., expandable panels, tabbed displays, navigation bars, etc.) that you can use to enhance the appearance/behavior of your pages.
</span>

To use a component, just use the corresponding markup in your file. For example, to create a Panel, you just need to use the markup:

```html
<panel header="Click to expand" type="seamless">
  Panel Content.
</panel>
```

{% from "userGuide/fullSyntaxReference.md" import syntax_topics as topics %}

{% macro show_topic(filename) %}
<include src="./syntax/{{ filename }}.mbdf" />
<hr>
{% endmacro %}

{% for k,v in topics %}
  {% if 'component' in v[1] %}
{{ show_topic(k) }}
  {% endif %}
{% endfor %}

<include src="./components/advanced.md" />
<br>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('formattingContents', 'usingHtmlJavaScriptCss') }}
