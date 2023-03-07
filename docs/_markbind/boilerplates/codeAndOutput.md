<!-- This boilerplate shows MarkBind code and the rendered output of that code -->
<!-- Supports 4 variables. -->
<!-- `code` - The MarkBind code content in this variable will appear in a code block containing the code, -->
<!--          and as rendered output of the code. The code cannot start or end with empty lines due to `trim` -->
<!-- `highlightStyle` (optional) - Defines the syntax coloring for the code block-->
<!-- `heading` (optional) - Heading of the code block-->
<!-- `horizontal` (optional) - If the code and output is horizontally laid out. A non-empty input will result in a horizontal layout-->

{% macro codeBox() %}
%%CODE:%%
<div class="indented">

```{{ highlightStyle | safe }}{ {% if heading %}heading="{{heading}}"{% endif %}}
{{ code | safe | trim }}
```
</div>
{% endmacro %}

{% macro outputBox() %}
%%OUTPUT:%%
<div class="indented">

<box border-left-color="grey" background-color="white">

{{ code | safe }}
</box>
</div>
{% endmacro %}

{% if horizontal != null %}
<div style="overflow-x: auto">
<table style="width: 100%">
<tbody>
<tr>
<td style="width: 50%">
{{ codeBox() }}
</td>
<td style="width: 50%">
{{ outputBox() }}
</td>
</tr>
</tbody>
</table>
</div>

{% else %}

{{ codeBox() }}

{{ outputBox() }}

{% endif %}
