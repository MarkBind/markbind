<frontmatter>
  title: "User Guide: Syntax Cheat Sheet"
  footer: footer.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

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


{% for k,v in topics %}
{{ show_topic( k, v[0]) }}
{% endfor %}

</div>