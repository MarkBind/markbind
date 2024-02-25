<frontmatter>
  title: "User Guide: Syntax Reference"
  layout: userGuide.md
  pageNav: 5
</frontmatter>

# Syntax Reference

<box type="info">
  Expand the panels for detailed explanations of the corresponding feature!
</box>

{% from "userGuide/syntax/fullSyntaxSet.njk" import syntax_topics as topics %}

{% macro show_topic(filename, heading) %}
<panel type="seamless" no-close popup-url="{{ filename }}.html">
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
{{ show_topic( k, v[0]) }}
{% endfor %}
