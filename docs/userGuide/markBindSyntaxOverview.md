{% set title = "MarkBind Syntax Overview" %}
{% set filename = "markBindSyntaxOverview" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }} "
  layout: userGuide.md
</frontmatter>

<span id="link" class="d-none">
[_User Guide → {{ title }}_]({{ filename }}.html)
</span>

# {{ title }}


<span class="lead" id="overview">

**A MarkBind source file may contain a mix of several popular syntax schemes** used in creating web pages. MarkBind source file can be as simple as basic Markdown, and you can use progressively more complicated syntax to create progressively more sophisticated Web pages while optimizing other aspects such as content reuse.
</span>

Given below is an overview of the syntax schemes supported by MarkBind.

<box>

{{ icon_info }} Exact usage of various MarkBind syntax is described in separate sections such as <include src="formattingContents.md#link" inline trim />
</box>

#### {{ icon_check_blue }} Support for Markdown

MarkBind supports all basic Markdown syntax.

<panel type="seamless" header="Some examples ...">
<include src="syntax/headings.mbdf#main-example" />
<include src="syntax/textStyles.mbdf#main-example-markdown" />
<include src="syntax/links.mbdf#main-example" />
</panel>

<!-- ======================================================================================================= -->

#### {{ icon_check_blue }} Support for GFMD

MarkBind supports additional Markdown features provided by Github-Flavored Markdown (GFMD).

<panel type="seamless" header="Some examples ...">
<include src="syntax/code.mbdf#main-example" />
<include src="syntax/lists.mbdf#main-example-gfmd" />
<include src="syntax/emoji.mbdf#main-example" />
</panel>


<!-- ======================================================================================================= -->

#### {{ icon_check_blue }} MarkBind Extensions to Markdown

MarkBind adds several Markdown-like features on top of GFMD.

<panel type="seamless" header="Some examples ...">
<include src="syntax/textStyles.mbdf#main-example-markbind" />
<include src="syntax/lists.mbdf#main-example-markbind" />
<include src="syntax/footnotes.mbdf#main-example-markbind" />
</panel>

<!-- ======================================================================================================= -->

#### {{ icon_check_blue }} MarkBind Custom Syntax

Given below are some examples of custom syntax added by MarkBind.

{% macro quote_topic(filename) %}
<blockquote>
<include src="{{ filename }}#overview" inline />
</blockquote>

<div class="indented">
More info: <include src="{{ filename }}#link" inline trim/>
</div>
<br>
{% endmacro %}

{% for filename in ['syntax/variables.mbdf', 'syntax/includes.mbdf', 'usingComponents.md'] %}
{{ quote_topic(filename) }}
{% endfor %}

<!-- ======================================================================================================= -->

#### {{ icon_check_blue }} Support for HTML, JavaScript, CSS

{{ quote_topic('usingHtmlJavaScriptCss.md') }}

<!-- ======================================================================================================= -->

#### {{ icon_check_blue }} MarkBind Vue components and BootStrap

MarkBind has several core Vue.js components built on the popular [BootStrap](https://getbootstrap.com/docs/4.2/getting-started/introduction/) framework. Much of Bootstrap's features are supported in and out of these components as well.

<!-- ======================================================================================================= -->

#### {{ icon_check_blue }} Support for Nunjucks

[Nunjucks](https://mozilla.github.io/nunjucks/) is a JavaScript based templating tool. Here is a simple example:

{% raw %}
```html { .no-line-numbers }
<ul>
{% for item in [1, 2, 3, 4] %}
  <li>Item {{ item }}</li>
{% endfor %}
</ul>
```
{% endraw %}

{{ icon_arrow_down }}

<box>
<ul>
{% for item in [1, 2, 3, 4] %}
  <li>Item {{ item }}</li>
{% endfor %}
</ul>
</box>

As MarkBind uses Nunjucks behind the scene, **MarkBind is generally compatible with Nunjucks**, which means you can use Nunjucks templating in your source files. Note that ==the code is processed for Nunjucks syntax before the rest of the MarkBind syntax are processed==.

{% from "njk/common.njk" import previous_next %}
{{ previous_next('addingPages', 'formattingContents') }}
