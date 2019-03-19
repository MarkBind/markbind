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

- [`bootswatch-cerulean`](https://bootswatch.com/cerulean/)
- [`bootswatch-cosmo`](https://bootswatch.com/cosmo/)
- [`bootswatch-flatly`](https://bootswatch.com/flatly/)
- [`bootswatch-journal`](https://bootswatch.com/journal/)
- [`bootswatch-litera`](https://bootswatch.com/litera/)
- [`bootswatch-lumen`](https://bootswatch.com/lumen/)
- [`bootswatch-lux`](https://bootswatch.com/lux/)
- [`bootswatch-materia`](https://bootswatch.com/materia/)
- [`bootswatch-minty`](https://bootswatch.com/minty/)
- [`bootswatch-pulse`](https://bootswatch.com/pulse/)
- [`bootswatch-sandstone`](https://bootswatch.com/sandstone/)
- [`bootswatch-simplex`](https://bootswatch.com/simplex/)
- [`bootswatch-sketchy`](https://bootswatch.com/sketchy/)
- [`bootswatch-spacelab`](https://bootswatch.com/spacelab/)
- [`bootswatch-united`](https://bootswatch.com/united/)
- [`bootswatch-yeti`](https://bootswatch.com/yeti/)

{% from "njk/common.njk" import previous_next %}
{{ previous_next('markBindInTheProjectWorkflow', '') }}
