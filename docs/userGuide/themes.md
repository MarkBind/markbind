<variable name="title" id="title">Themes</variable>
<frontmatter>
  title: "User Guide: {{ title }}"
  footer: footer.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

# {{ title }}

<span class="lead">

**MarkBind supports the ability to style your website with a variety of themes.**

</span>

#### Specifying a Theme

You can specify a theme for your site by using the [`theme` property of the `site.json`](siteConfiguration.html#theme). For example, to apply the Cerulean theme, add `"theme": "bootswatch-cerulean"` to your `site.json`.

If no `theme` property is specified, your site will be styled with default Bootstrap theme.

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
    <markdown>###### `bootswatch-{{ theme }}`</markdown>
    <a href="https://bootswatch.com/{{ theme }}/"><img src="../images/bootswatch/{{ theme }}.png" /></a>
  </div>
  {% endfor %}
</div>
</div>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('markBindInTheProjectWorkflow', '') }}
