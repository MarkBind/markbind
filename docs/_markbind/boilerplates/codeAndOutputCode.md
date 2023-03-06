<!-- This boilerplate is simimlar to codeAndOuput.md but specific for fenced code syntax. -->
<!-- We need 4 backticks to make a fenced code block of fenced code block code -->
<!-- Syntax coloring is fixed to Markdown because it is Markdown fenced code syntax -->
<!-- Has 1 variable. -->
<!-- `code` - The MarkBind code content in this variable will appear in a code block containing the code, -->
<!--          and as rendered output of the code. The code cannot start or end with empty lines due to `trim` -->

{% macro codeBox() %}
%%CODE:%%
<div class="indented">

````markdown
{{ code | safe | trim }}
````
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
</div>

{% endif %}
