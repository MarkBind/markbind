{% set title = "Themes" %}
{% set filename = "themes" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# {{ title }}

<span class="lead" id="overview">

**MarkBind supports the ability to style your website with a variety of bootstrap themes.**

</span>

#### Specifying a Theme

You can specify a theme for your site by using the [`style.bootstrapTheme` property](siteJsonFile.html#style) of your `site.json` configuration file.

For example, to apply the Cerulean theme, add the following configuration:

```json {heading="site.json"}
{
  "style": {
    "bootstrapTheme": "bootswatch-cerulean"
  }
}
```

If no such property is specified, your site will be styled with default Bootstrap theme.

#### Supported Themes

Currently, MarkBind supports all light themes from [Bootswatch](https://bootswatch.com/). Visit each of the theme pages below to see how different visual components are styled.

{% set bootswatchThemes = [
  'cerulean',
  'cosmo',
  'flatly',
  'journal',
  'litera',
  'lumen',
  'lux',
  'materia',
  'minty',
  'pulse',
  'sandstone',
  'simplex',
  'sketchy',
  'spacelab',
  'united',
  'yeti'
] %}

<div class="container-fluid">
<div class="row">
  {% for theme in bootswatchThemes %}
  <div class="theme-card col-sm-6 col-xl-4">
    <box>
      <markdown>###### `bootswatch-{{ theme }}`</markdown>
      <a href="https://bootswatch.com/{{ theme }}/"><img src="../images/bootswatch/{{ theme }}.png" /></a>
    </box>
  </div>
  {% endfor %}
</div>
</div>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('makingTheSiteSearchable', 'deployingTheSite') }}
