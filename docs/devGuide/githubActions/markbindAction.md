{% set title = "GitHub Actions: markbind-action" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

A GitHub Action that builds and deploys your MarkBind site. It helps users to streamline their workflow by:
* Making it easier to deploy without having to write their own actions from scratch
* Making the workflows consistent and up to date with any changes specific to MarkBind

The source code is at [MarkBind/markbind-action](https://github.com/MarkBind/markbind-action).
</div>

**Follow these steps to get started on development**

1. Fork the action repository and create a PR branch
1. Learn the workflow syntax in the repository's readme
1. Make necessary changes to the workflow files & update the readme
1. Set up a test repository that contains a MarkBind site
   1. Create a repository
   1. Set up MarkBind and run `markbind init` to populate with default content
   1. Push your repository to GitHub
      * [Example](https://github.com/MarkBind/init-typical)
1. Include a workflow file in the repository that uses your forked version of the action
   * Instead of using `uses: MarkBind/markbind-action@v2` in the workflow file, use `uses: yourGitHubName/markbind-action@yourBranch`
      * e.g. `uses: tlylt/markbind-action@master`
   * [Example](https://github.com/tlylt/mb-test/tree/main/.github/workflows)
1. Trigger the action as required, check and validate the run result in action logs
1. Submit PRs