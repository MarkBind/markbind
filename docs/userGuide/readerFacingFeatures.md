<frontmatter>
  title: "User Guide: Reader-Facing Features"
  layout: userGuide.md
</frontmatter>

<include src="components/advanced.md#slots-info" />

# Reader-Facing Features


{% from "userGuide/syntax/fullSyntaxSet.njk" import syntax_topics as topics %}

{% macro show_topic(filename, heading) %}

##### {{ heading }}
<box>
<include src="syntax/{{ filename }}.md#examples" />

<panel type="seamless" header="%%details...%%" >

<include src="syntax/{{ filename }}.md" />
</panel>
</box>

{% endmacro %}

{% for k,v in topics %}
  {% if 'reader-facing' in v[1] %}
{{ show_topic( k, v[0]) }}
  {% endif %}
{% endfor %}
