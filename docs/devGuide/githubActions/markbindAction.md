{% set title = "GitHub Actions: markbind-action" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

A GitHub Action that builds and deploys a MarkBind site. It helps users to streamline their workflow by:
* Making it easier to deploy without having to write their own actions from scratch.
* Making the workflows consistent and up to date with any changes specific to MarkBind.

The source code is at [MarkBind/markbind-action](https://github.com/MarkBind/markbind-action).
</div>

**Follow the steps below to get started on modifying the source code.**
## Setting Up
1. Fork the [action repository](https://github.com/MarkBind/markbind-action).
1. Familiarise with the existing workflow syntax/options provided in the repository's [README.md](https://github.com/MarkBind/markbind-action#readme).
1. Set up a repository that contains a MarkBind site to test the action:
   1. Create a repository.
   1. Set up MarkBind and run `markbind init` to populate with default content.
   1. Push your repository to GitHub.
      * [Example](https://github.com/MarkBind/init-typical)

## Modifying the action
1. Create a new branch from master to work on your changes.
1. Make necessary modifications to the workflow files.
1. Update the repository's README.md to reflect the changes.

## Testing the action
1. Include a workflow file in your <tooltip content="Which includes a sample MarkBind site">test repository</tooltip> to test your modified version of the action.
   * Instead of using `uses: MarkBind/markbind-action@v2` in the workflow file, use `uses: yourGitHubName/markbind-action@yourBranch` to reference the unpublished version of the action that you are currently developing.
      * e.g. `uses: tlylt/markbind-action@main`
1.  Trigger the action as needed, check and validate the results in the action logs.

You can now submit PRs to improve MarkBind's Github actions! 🎉

## Release Management
Based on the [Github Actions documentation](https://docs.github.com/en/actions/creating-actions/about-custom-actions#using-release-management-for-actions), we are using tags for release management.

> * Create and validate a release on a release branch (such as `release/v1`) before creating the release tag (for example, `v1.0.2`).
> * Create a release using semantic versioning. For more information, see "[Creating releases](https://docs.github.com/en/articles/creating-releases)."
> * Move the major version tag (such as `v1`, `v2`) to point to the Git ref of the current release. For more information, see "[Git basics - tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging)."
> * Introduce a new major version tag (`v2`) for changes that will break existing workflows. For example, changing an action's inputs would be a breaking change.