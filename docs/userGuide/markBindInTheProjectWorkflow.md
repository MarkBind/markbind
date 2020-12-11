{% set title = "MarkBind in the Project Workflow" %}
{% set filename = "markBindInTheProjectWorkflow" %}
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

As **MarkBind is especially optimized as a project documentation tool**, it integrates well with the workflow of software project.
</span>

#### Authoring Workflow

While most IDEs provide previews for Markdown files, unless your MarkBind files are using basic Markdown syntax only, you are recommended to launch a {{ link_live_preview }} and check the rendering of the page as you modify the source file.

#### GitHub Project Workflow

If you use GitHub for your project, you can [deploy your site to GitHub pages](deployingTheSite.html#deploying-to-github-pages) easily. You can even set up Travis to automatically deploy your site to GitHub pages whenever a branch in your repo is updated.

If you are using GitHub Pull Requests as part of your workflow, you can [set up Netlify to show a preview of the site generated from the MarkBind code in the PR](deployingTheSite.html#deploying-to-netlify).

#### Using MarkBind for Project Documentation

Here is a example workflow for using MarkBind for both developer documentation and user documentation in a GitHub project:

<div class="indented">

Suppose the main development of the project is done in the `master` branch while product releases are done using the `release` branch.

You can keep the user docs in a separate directory (say `user-docs`) and set up a MarkBind project in that folder. When there is a new release, you can deploy the user-docs site to GitHub Pages for users to read.

Similarly, you can keep the dev docs in a separate directory (say `dev-docs`) and set up Netlify to deploy the site when there is an update to the `master` branch; that way, developers can see the latest version of dev-docs via the Netlify site.
</div>

#### Converting existing project documentation/wiki

MarkBind supports the automatic conversion of an existing GitHub wiki or `docs` folder containing Markdown files.

A MarkBind conversion involves the following:
- Adding a Home page: If your project already has a `README.md` or `Home.md`, the content will be copied over to `index.md`. Otherwise, a default home page will be added.
- Adding an About Us page: If your project already has `about.md`, this will be used as the About page. Otherwise, a default About page will be added.
- Adding a top navigation bar.
- Adding a site navigation menu: If your project has a valid `_Sidebar.md` file, it will be used as the [site navigation menu](https://markbind.org/userGuide/tweakingThePageStructure.html#site-navigation-menus). Otherwise, the menu will be built from your project's directory structure and contain links to all addressable pages.   
- Adding a custom footer: If your project has a valid `_Footer.md` file, it will be used as the website footer. Otherwise, a default footer will be added.

<box type="warning">
    Conversion might not work if your project files have existing Nunjucks syntax. 
</box>

To convert your existing project, follow these steps:
1. Navigate into the project directory.
1. Run `markbind init --convert` to convert the project.
1. You can now preview the website using `markbind serve` to view your newly converted MarkBind website.

<box type="info">
    You only need to run the conversion once. Once you have converted your project, you can proceed to edit it as a normal MarkBind project.
</box> 

{% from "njk/common.njk" import previous_next %}
{{ previous_next('deployingTheSite', '') }}
