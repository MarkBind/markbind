<variable name="layoutVar">Variable from layout</variable>
<import importedVar from="imported.md" as="imported" />

{{ layoutVar }}

{{ importedVar }}

<panel header="Expanded panel" alt="Minimized panel" type="success" minimized>
  Math formulas
</panel>

{{ MAIN_CONTENT_BODY }}

Bottom Content



<include src="imported.md" />

{% raw %}
**Test that {% raw %} and {% endraw %} tags work in the layouts file**
{% endraw %}
