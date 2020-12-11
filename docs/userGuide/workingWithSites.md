{% set title = "Working with Sites" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
</frontmatter>

# {{ title }}

{% set pages = [
  ['Setting Site Properties', 'settingSiteProperties'],
  ['Using Plugins', 'usingPlugins'],
  ['Making the site searchable', 'makingTheSiteSearchable'],
  ['Applying Themes', 'themes'],
  ['Deploying the Site', 'deployingTheSite'],
  ['MarkBind in the Project Workflow', 'markBindInTheProjectWorkflow']
] %}

{% for page in pages %}
<big>**{{ page[0] }}**</big>

<blockquote>

<include src="{{ page[1] }}.md#overview" inline />
</blockquote>

<span class="indented">More info in: <include src="{{ page[1] }}.md#link" inline trim /></span>

{% endfor %}

{% from "njk/common.njk" import previous_next %}
{{ previous_next('reusingContents', 'settingSiteProperties') }}
