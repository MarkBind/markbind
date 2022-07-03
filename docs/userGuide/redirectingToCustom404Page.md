{% set title = "Redirecting to Custom 404 Page" %}
{% set filename = "redirectingToCustom404Page" %}

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# {{ title }}

<div class="lead" id="overview">
Most popular static hosting service such as Netlify supports custom routing to a custom 404 html page. A default 404.md page is provided, and you can customise it to create your own 404 page.
</div>

<br>

#### Modifying the default 404 page

After a project is created with `markbind init`, the `404.md` file will be generated in the root of the project. To edit the 404 page, you can simply edit this `404.md` file.
