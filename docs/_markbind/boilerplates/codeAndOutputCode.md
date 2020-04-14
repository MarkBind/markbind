<!-- This boilerplate is simimlar to codeAndOuput.md but specific for fenced code syntax. -->
<!-- We need 4 backticks to make a fenced code block of fenced code block code -->
<!-- Syntax coloring is fixed to Markdown because it is Markdown fenced code syntax -->
<!-- Has 1 variable. -->
<!-- `code` - The MarkBind code content in this variable will appear in a code block containing the code, -->
<!--          and as rendered output of the code. The code cannot start or end with empty lines due to `trim` -->

%%CODE:%%
<div class="indented">

````markdown{.no-line-numbers}
{{ code | safe | trim }}
````
</div>

%%OUTPUT:%%
<div class="indented">

<box border-left-color="grey" background-color="white">

{{ code | safe }}
</box>
</div>
