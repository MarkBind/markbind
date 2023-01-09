{% set title = "GitHub Actions: Overview" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

A GitHub Action can perform a variety of tasks, including automating the build and deployment of a MarkBind site.

* [markbind-action](https://github.com/MarkBind/markbind-action) is a [published action](https://github.com/marketplace/actions/markbind-action) that builds and deploys your MarkBind site.
* [markbind-reusable-workflows](https://github.com/MarkBind/markbind-action/tree/master/.github/workflows) is a list of reusable workflows that help improve your CI/CD with a MarkBind site.

</div>

**Before any development, ensure you have a basic knowledge of GitHub Actions**
* [Official GitHub Actions documentation](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions)
  * [Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
  * [Creating a composite action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)
  * [Releasing and maintaining actions](https://docs.github.com/en/actions/creating-actions/releasing-and-maintaining-actions)
  * [Reusing workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)

{% from "njk/common.njk" import previous_next %}
{{ previous_next('../design/serverSideRendering', 'markbindAction') }}
