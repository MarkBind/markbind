<frontmatter>
  title: "User Guide: Syntax Cheat Sheet"
  layout: userGuide.md
</frontmatter>

# Syntax Cheat Sheet

{% from "userGuide/fullSyntaxReference.md" import syntax_topics as topics %}

{% macro show_topic(filename, heading) %}
<panel type="seamless">
  <div slot="header">
    <md>**{{ heading }}**</md>
    <include src="syntax/{{ filename }}.mbdf#short" />
  </div>
  <div class="indented">
    <include src="syntax/{{ filename }}.mbdf" />
  </div>
</panel>
{% endmacro %}


{% for k,v in topics | dictsort %}
{{ show_topic( k, v[0]) }}
{% endfor %}
