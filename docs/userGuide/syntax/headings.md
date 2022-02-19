## Headings

You can prepend the heading text with 1-6 `#` characters to indicate headings of levels 1-6.

<div id="main-example">
<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
### Heading level 3
...
###### Heading level 6
</variable>
</include>
</div>

{{ icon_info }} **MarkBind auto-generates anchors for all headings.**<br>
If the heading text is `Foo Bar (Goo)`, the ID of the generated anchor will be `foo-bar-goo` (all lower case, special characters omitted, joined by `-`).

<small>Alternative syntax, more info: https://www.markdownguide.org/basic-syntax#headings

<span id="short" class="d-none">

```markdown
### Heading level 3
...
###### Heading level 6
```
</span>
<span id="examples" class="d-none">

### Heading level 3
...
###### Heading level 6
</span>