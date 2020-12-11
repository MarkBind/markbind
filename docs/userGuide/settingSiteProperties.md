{% set title = "Setting Site Properties" %}
{% set filename = "settingSiteProperties" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
</frontmatter>
{% from "njk/common.njk" import embed, previous_next %}

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# {{ title }}

<div class="lead" id="overview">

Setting site-wide properties of a MarkBind site is done by updating the `site.json` file found and the project root. For example, it can be used to set the deploy destination, themes to apply, plugins to use etc.
</div>

<box type="tip">

While MarkBind uses `site.json` as the site config file by default, it is possible to specify a different config file when you build/serve/deploy a MarkBind site. This is particularly useful when you want to deploy slight variants of your site (e.g., one for users, one for developers).
</box>

More info about the `site.json` file can be found in the panel below.

{{ embed("References → **`site.json` File**", "siteJsonFile.md") }}

{{ previous_next('workingWithSites', 'usingPlugins') }}
