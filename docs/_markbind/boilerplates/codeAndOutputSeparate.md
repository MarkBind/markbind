<!-- This boilerplate shows Markbind code and the rendered output of that code -->
<!-- Supports 4 variables. -->
<!-- `code` - The MarkBind code content in this variable will appear in a code block containing the code, -->
<!-- `output` - rendered output in the output box. -->
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

{{ output | safe }}
</box>
</div>
