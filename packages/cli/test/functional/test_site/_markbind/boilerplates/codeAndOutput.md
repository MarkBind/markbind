<!-- This boilerplate shows Markbind code and the rendered output of that code -->
<!-- Supports 3 variables. -->
<!-- `code` - The MarkBind code content in this variable will appear in a code block containing the code, -->
<!--          and as rendered output of the code. The code cannot start or end with empty lines due to `trim` -->
<!-- `highlightStyle` (optional) - Defines the syntax coloring for the code block-->
<!-- `heading` (optional) - Heading of the code block-->

%%CODE:%%
<div class="indented">

```{{ highlightStyle | safe }}{.no-line-numbers {% if heading %}heading="{{heading}}"{% endif %}}
{{ code | safe | trim }}
```
</div>

%%OUTPUT:%%
<div class="indented">

<box border-left-color="grey" background-color="white">

{{ code | safe }}
</box>
</div>
