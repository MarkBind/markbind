<!-- This boilerplate shows MarkBind code block side by side -->
<!-- Supports 5 variables. -->
<!-- `highlightStyle` (optional) - Defines the syntax coloring for the code block-->
<!-- `headingLeft` - Heading of the left code block -->
<!-- `headingRight` - Heading of the right code block -->
<!-- `codeLeft` - The MarkBind code content in this variable will appear in a code block on LHS -->
<!-- `codeRight` - The MarkBind code content in this variable will appear in a code block on RHS -->

<table style="width: 100%;">
<tr>
<th style="width: 45%; padding-right: 5%">{{ headingLeft }}</th>
<th style="width: 45%; padding-left: 5%;">{{ headingRight }}</th>
</tr>
<tr>
<td style="padding-right: 5%">

```{{ highlightStyle | safe }}
{{ codeLeft | safe | trim }}
```
</td>
<td style="padding-left: 5%;">

```{{ highlightStyle | safe }}
{{ codeRight | safe | trim }}
```
</td>
</tr>
</table>
