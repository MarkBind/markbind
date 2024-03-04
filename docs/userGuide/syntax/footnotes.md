## Footnotes

<div id="main-example-markbind">

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
**Normal footnotes:**
Here is a footnote reference,[^1] and another.[^longnote]

[^1]: Here is the footnote. Footnotes will appear at the bottom of the page.

[^longnote]: Here's one with multiple blocks.

    Subsequent paragraphs are indented to show that they
belong to the previous footnote.


**Inline footnotes:**
Here is an inline note.^[Inline notes are easier to write, since
you don't have to pick an identifier and move down to type the
note.]

</variable>
</include>
</div>

<box type="warning">

Normal footnotes won't work when used inside the attributes of MarkBind components!
<br>
For example, it won't work in the `header` attribute of [panels](../components/presentation.html#panels).
</box>

<div id="short" class="d-none">

```html
**Normal footnotes:**
Here is a footnote reference,[^1] and another.[^longnote]

[^1]: Here is the footnote. Footnotes will appear at the bottom of the page.

[^longnote]: Here's one with multiple blocks.
    Subsequent paragraphs are indented to show that they
belong to the previous footnote.
```
</div>
<div id="examples" class="d-none">

1 + 1 = 2 ^[Math]
</div>
