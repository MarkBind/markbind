<frontmatter>
  title: "User Guide: Reader-Facing Features"
  layout: userGuide.md
</frontmatter>

# Reader-Facing Features

<include src="fullSyntaxReference.md#dummy" optional />

{% from "userGuide/fullSyntaxReference.md" import syntax_topics as topics %}

{% macro show_topic(filename, heading) %}

##### {{ heading }}
<box>
<include src="syntax/{{ filename }}.mbdf#examples" />

<panel type="seamless" header="%%details...%%" >

<include src="syntax/{{ filename }}.mbdf" />
</panel>
</box>

{% endmacro %}

{% for k,v in topics %}
  {% if 'reader-facing' in v[1] %}
{{ show_topic( k, v[0]) }}
  {% endif %}
{% endfor %}
