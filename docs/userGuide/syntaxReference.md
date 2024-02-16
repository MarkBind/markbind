<frontmatter>
  title: "User Guide: Syntax Reference"
  layout: userGuide.md
  pageNav: 4
</frontmatter>

# Syntax Reference

<box type="info">
  Expand the panels for detailed explanations of the corresponding feature!
</box>

{% from "userGuide/fullSyntaxReference.md" import syntax_topics as topics %}

{% macro show_topic(filename, heading) %}
<div class="syntax-topic">
  <md>**{{heading}}**</md>
  <include src="syntax/{{ filename }}.md#short" />
  <panel type="seamless" minimized>
    <div slot="header">
      <md>:light-bulb: **More on {{ heading }}**</md>
    </div>
    <div class="indented">
      <include src="syntax/{{ filename }}.md" />
    </div>
  </panel>
</div>
<br/>
{% endmacro %}


{% for k,v in topics | dictsort %}
{{ show_topic( k, v[0]) }}
{% endfor %}
