{% set title = "GitHub Actions: markbind-action" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

A GitHub Action that builds and deploys your MarkBind site. The source code is at [MarkBind/markbind-action](https://github.com/MarkBind/markbind-action).
</div>

**Follow these steps to get started on development**

1. Fork the action repository and create a PR branch
2. Learn the workflow syntax in the repository's readme
3. Make necessary changes to the workflow files & update the readme
4. Set up a test repository that contains a MarkBind site
   1. Create a repository
   2. Set up MarkBind and run `markbind init` to populate with default content
   3. Push your repository to GitHub
   4. [Example](https://github.com/tlylt/mb-test)
5. Include a workflow file in the repository that uses your forked version of the action
   1. Instead of using `uses: MarkBind/markbind-action@v2` in the workflow file, use `uses: yourGitHubName/markbind-action@yourBranch`
      1. e.g. `uses: tlylt/markbind-action@master`
   2. [Example](https://github.com/tlylt/mb-test/tree/main/.github/workflows)
6. Trigger the action as required, check and validate the run result in action logs
7. Submit PRs

