{% set title = "Using HTML, JavaScript, CSS" %}
{% set filename = "usingHtmlJavaScriptCss" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# {{ title }}

<span id="overview" class="lead">

**A MarkBind source file can contain a mixture of HTML, JavaScript, and CSS** as a normal web page would.
</span>

==Text within HTML tags are considered plain text unless the text is preceded by a blank line,== in which case the text is parsed as Markdown text.

<div class="indented">

{{ icon_example }} Here is an example of how text within an html tag is parsed as Markdown when preceded by a blank line.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<span>
Without preceding blank line: Apples **Bananas** Cherries
</span>

<span>

With preceding blank line: Apples **Bananas** Cherries
</span>
</variable>
</include>

</div>

Alternatively, you can use `<markdown>` (for _block_ Markdown elements such as headings) or `<md>` (for _inline_ Markdown elements such as bold/italic text) tags to indicate the text should be treated as Markdown.

<div class="indented">

{{ icon_example }} Here is an example of how text within an HTML tag can be treated as Markdown using `<markdown>`/`<md>` tags.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<span>
<md>Apples **Bananas** Cherries</md>
</span>

<span>
<markdown>##### Apples **Bananas** Cherries</markdown>
</span>
</variable>
</include>

</div>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('components/advanced', 'tweakingThePageStructure') }}
