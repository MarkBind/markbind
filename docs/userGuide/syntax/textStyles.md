## Text Styles

Markdown text styles:

<div id="main-example-markdown">
<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
**Bold**, _Italic_, ___Bold and Italic___, `Inline Code`
</variable>
</include>
</div>

Additional syntax from GFMD:

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
~~Strike through~~
</variable>
</include>

Syntax added by MarkBind:

<div id="main-example-markbind">
<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
****Super Bold****, !!Underline!!, ==Highlight==, %%Dim%%, ++Large++, --Small--,
Super^script^, Sub~script~, #r#Coloured Text##
->Center-align<-
</variable>
</include>
</div>

Additional font colouring syntax:
<div id="main-example-markbind">
<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
#r#Coloured Text##
</variable>
</include>

Full list of colours:
Letter | Colour
--- | ---
r | red
g | green
b | blue
c | cyan
m | magenta
y | yellow
k | black
w | white

<box type="tip" seamless>
To escape the syntax, simply put a backslash in front of it (e.g. `\#b#`, `\##`).
</box>
</div>


<small>Alternative syntax: https://www.markdownguide.org/basic-syntax#emphasis</small>

<div id="short" class="d-none">

```markdown
**Bold**, _Italic_, ___Bold and Italic___, `Inline Code`
~~Strike through~~, ****Super Bold****, !!Underline!!, ==Highlight==, %%Dim%%, ++Large++, --Small--, Super^script^, Sub~script~
```
</div>
<div id="examples" class="d-none">

**Bold**, _Italic_, ___Bold and Italic___, `Inline Code`
~~Strike through~~, ****Super Bold****, !!Underline!!, ==Highlight==, %%Dim%%, ++Large++, --Small--, Super^script^, Sub~script~
</div>
