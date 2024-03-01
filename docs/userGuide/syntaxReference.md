<frontmatter>
  title: "User Guide: Syntax Reference"
  layout: userGuide.md
  pageNav: 5
</frontmatter>

# Syntax Reference

<box type="info">
Expand the panels for detailed explanations of the feature or click on the link in the header to go to the corresponding page!
</box>

{% from "userGuide/syntax/fullSyntaxSet.njk" import syntax_topics as topics %}

{% macro show_topic(filename, heading, url) %}
<panel type="seamless" no-close popup-url="{{ url }}">
  <div slot="header">
    <markdown>##### **{{ heading }}**</markdown>
    <include src="syntax/{{ filename }}.md#short" />
  </div>
  <div class="indented">
    <include src="syntax/{{ filename }}.md" />
  </div>
</panel>
{% endmacro %}


{% for k,v in topics | dictsort %}
  {% set url="/userGuide/" %}
  {% if v[2] is iterable %}
    {% if 'basic' in v[2] %}
      {% set url = url + "formattingContents.html#" + v[1] %}
    {% elif 'presentation' in v[2] %}
      {% set url = url + "components/presentation.html#" + v[1] %}
    {% elif 'images-diagrams' in v[2] %}
      {% set url = url + "components/imagesAndDiagrams.html#" + v[1] %}
    {% elif 'popups' in v[2] %}
      {% set url = url + "components/popups.html#" + v[1] %}
    {% elif 'navigation' in v[2] %}
      {% set url = url + "components/navigation.html#" + v[1] %}
    {% elif 'others' in v[2] %}
      {% set url = url + "components/others.html#" + v[1] %}
    {% else %}
      {% set url = url + v[2][0] + ".html#" + v[1] %}
    {% endif %}
  {% else %}
    {% set url = url %}
  {% endif %}
  {{ show_topic( k, v[0], url) }}
{% endfor %}
