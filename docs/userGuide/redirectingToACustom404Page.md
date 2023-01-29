{% set title = "Redirecting to a Custom 404 Page" %}
{% set filename = "redirectingToACustom404Page" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# {{ title }}

<div class="lead" id="overview">

Many popular static hosting services, such as [Netlify](https://www.netlify.com/), support custom routing to a custom 404 HTML page.
A default `404.md` file is provided, and you can customize it to create your own 404 page.
The `404.html` file will be created at the root of the `_site` folder.
</div>

<br>

#### Modifying the default 404 page
After a project is created with `markbind init`, the `404.md` file will be generated in the root of the project.
You can click [here](/404.html) to view the default 404 page.
To edit the 404 page, you can simply edit this `404.md` file.

{% from "njk/common.njk" import previous_next %}
{{ previous_next('markBindInTheProjectWorkflow', 'addingNavigationButtons') }}