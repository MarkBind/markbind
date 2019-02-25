<frontmatter>
  title: "User Guide: Using MarkBind in the Project Workflow"
  footer: footer.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

# MarkBind in the Project Workflow

<span class="lead">

As **MarkBind is especially optimized as a project documentation tool**, it integrates well with the workflow of software project.
</span>

#### Authoring Workflow

While most IDEs provide previews for Markdown files, unless your MarkBind files are using basic Markdown syntax only, you are recommended to launch a {{ link_live_preview }} and check the rendering of the page as you modify the source file.

#### GitHub Project Workflow

If you use GitHub for your project, you can [deploy your site to GitHub pages]({{ baseUrl }}/userGuide/deployingTheSite.html#deploying-to-github-pages) easily. You can even set up Travis to automatically deploy your site to GitHub pages whenever a branch in your repo is updated.

If you are using GitHub Pull Requests as part of your workflow, you can [set up Netlify to show a preview of the site generated from the MarkBind code in the PR]({{ baseUrl }}/userGuide/deployingTheSite.html#deploying-to-netlify).

#### Using MarkBind for Project Documentation

Here is a example workflow for using MarkBind for both developer documentation and user documentation in a GitHub project:

<div class="indented">

Suppose the main development of the project is done in the `master` branch while product releases are done using the `release` branch.

You can keep the user docs in a separate directory (say `user-docs`) and set up a MarkBind project in that folder. When there is a new release, you can deploy the user-docs site to GitHub Pages for users to read.

Similarly, you can keep the dev docs in a separate directory (sey `dev-docs`) and set up Netlify to deploy the site when there is an update to the `master` branch; that way, developers can see the latest version of dev-docs via the Netlify site.
</div>
