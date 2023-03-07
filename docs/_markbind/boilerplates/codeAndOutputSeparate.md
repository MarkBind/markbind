<!-- This boilerplate shows MarkBind code and the rendered output of that code -->
<!-- Supports 5 variables. -->
<!-- `code` - The MarkBind code content in this variable will appear in a code block containing the code, -->
<!-- `output` - rendered output in the output box. -->
<!-- `highlightStyle` (optional) - Defines the syntax coloring for the code block-->
<!-- `heading` (optional) - Heading of the code block-->
<!-- `horizontal` (optional) - If the code and output is horizontally laid out. A non-empty input of `horizontal` will result in a horizontal layout-->

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

{{ output | safe }}
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
