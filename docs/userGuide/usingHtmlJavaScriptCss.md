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

<div id="overview" class="lead">

**A MarkBind source file can contain a mixture of HTML, JavaScript, and CSS** as a normal web page would.
</div>

==Text within HTML tags are considered plain text unless the text is preceded by a blank line,== in which case the text is parsed as Markdown text.

<div class="indented">

{{ icon_example }} Here is an example of how text within an html tag is parsed as Markdown when preceded by a blank line.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<div>
Without preceding blank line: Apples **Bananas** Cherries
</div>

<div>

With preceding blank line: Apples **Bananas** Cherries
</div>
</variable>
</include>

</div>

Alternatively, you can use `<markdown>` (for _block_ Markdown elements such as headings) or `<md>` (for _inline_ Markdown elements such as bold/italic text) tags to indicate the text should be treated as Markdown.

<div class="indented">

{{ icon_example }} Here is an example of how text within an HTML tag can be treated as Markdown using `<markdown>`/`<md>` tags.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<div>
<md>Apples **Bananas** Cherries</md>
</div>

<div>
<markdown>##### Apples **Bananas** Cherries</markdown>
</div>
</variable>
</include>

</div>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('components/advanced', 'tweakingThePageStructure') }}
