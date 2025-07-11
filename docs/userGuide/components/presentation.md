{% set title = "Presentational Components" %}
{% set filename = "presentation" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
  pageNav: 3
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

<include src="advanced.md#slots-info" />

# Presentation

<div id="overview" class="lead">

The components in this page are the core **presentational** components you may want to use. Panels and tabs can be used to **organise content sections**, while badges and boxes can **highlight small, specific pieces of information**.
</div>
<box type = "warning" header = "#### Use of markdown in content" >

As presentational components are HTML-based, you need to follow the HTML syntax when using markdown in the content of the components.
More specifically, you should use either:
- add a line break with no indentation before the markdown content
- use the `<markdown>` (block level elements) or `<md>` (inline level elements) tags to wrap the markdown content.

For more information, please refer to this [section]({{baseUrl}}/userGuide/usingHtmlJavaScriptCss.html#markdown-in-html).
</box>

{% from "userGuide/syntax/fullSyntaxSet.njk" import syntax_topics as topics %}

{% macro show_topic(filename) %}
<include src="../syntax/{{ filename }}.md" />
<hr>
{% endmacro %}

{% for k,v in topics %}
{% if 'presentation' in v[2] %}
{{ show_topic(k) }}
{% endif %}
{% endfor %}

<br>

## Card Component

The `<Card>` component is used to present content in a styled card layout, often within a `<CardStack>` for grid-based alignment.

You can now assign a custom `id` to a `<Card>` element. This helps:
- Link directly to the card via anchor tags (`#card-id`)
- Target cards using custom CSS or JavaScript

### Example

```html
<Card id="overview-card">
  <template #header>Overview</template>
  This is the content of a card with a custom ID.
</Card>


# Relevant Tips & Tricks

<panel header="Indent components">

<include src="../tipsAndTricks.md#indentComponents" />

</panel>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('../usingComponents', 'imagesAndDiagrams') }}
