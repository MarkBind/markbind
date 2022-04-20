{% set title = "GitHub Actions: markbind-reusable-workflows" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

A list of reusable workflows that help to improve the CI/CD pipelines of MarkBind sites. It helps users to streamline their workflow by:

* Making it easier to setup PR preview for a MarkBind site, including PRs from forks.
* Making it easier to unpublish a PR preview site after merge/close.

The source code is hosted alongside [MarkBind/markbind-action](https://github.com/MarkBind/markbind-action/tree/master/.github/workflows).
</div>

**Development guide**

Refer to the [development guide of markbind-action](./markbindAction.html) for the general approach. Take note of the following differences:

* Understand the strength and limitations of [reusable workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows).
* Find out the details of the existing reusable workflows in its [README.md](https://github.com/MarkBind/markbind-action/blob/master/.github/workflows/README.md).
* As there is no need to release the reusable workflows in order for others to use, the workflows will be updated and maintained in the master branch (without doing a release).
