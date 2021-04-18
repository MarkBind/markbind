In the CODE section, it should render exactly the content of the variable "code". In the OUTPUT section, it should render
the footnotes correctly.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
**Normal footnotes:**
Here is a footnote reference,[^1] and another.[^longnote]

[^1]: Here is the footnote. Footnotes will appear at the bottom of the page.

[^longnote]: Here's one with multiple blocks.

</variable>
</include>

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<div>
<p>This my paragraph

some newlines 


some more newlines
</p>

<h1>hello</h1>
</div>

<p>Must have newline before this</p>
</variable>
</include>