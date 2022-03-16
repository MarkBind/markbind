## Tree

**A `tree` component allows you to generate tree-like visualisations, suitable for displaying folder structure.**

Use indentation (2 spaces) to indicate the level of nesting.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<tree>
C:/course/
  textbook/
    index.md
  index.md
  reading.md
  site.json
</tree>
</variable>
</include>

Markdown unordered lists are also supported.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<tree>
C:/course/
  - textbook/
  - index.md
C:/course/
  * textbook/
  * index.md
C:/course/
  + textbook/
  + index.md
</tree>
</variable>
</include>

<box type="info">

Besides file system structures, you can use this for any lightweight tree-like structure.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<tree>
Enjoy MarkBind?
  You may want to:
    Like :heart:
    Share :speech_balloon:
    Contribute :pencil:
</tree>
</variable>
</include>
</box>

You can use Tree in combination with inline Markdown or inline HTML elements.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<tree>
Formatting is supported!
  textbook/
    `index.md`
  **index.md**
    ~~index.md~~
    %%dimmed%%
    Super^script^
    ****Super Bold****
    !!Underline!!
    !!Underline with {text=danger}!!{.text-danger}
    <span class="text-danger">RED</span>
  __reading.md__
  ++site.json++
  ==hello==
  :construction:
  :fas-file-code:
  :)
</tree>
</variable>
</include>

<box type="warning">

Currently, Pop-Ups(tooltip/trigger) are !!not!! supported within a `tree` component.
</box>

<div class="indented">

%%{{ icon_info }} You can refer to [Formatting Contents](../formattingContents.html) to find more information about text styles and other supported inline syntax.%%
</div>


<span id="short" class="d-none">

```html
<tree>
C:/course/
  textbook/
    index.md
  index.md
  reading.md
  site.json
</tree>
```
</span>

<span id="examples" class="d-none">
<tree>
C:/course/
  textbook/
    index.md
  index.md
  reading.md
  site.json
</tree>
</span>
