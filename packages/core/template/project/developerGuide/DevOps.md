---
  layout: default.md
  title: "DevOps guide"
  pageNav: 3
---

# DevOps guide

<box type="tip">
This page can be used to understand the DevOps practices adopted by the project.
</box>

## Build automation

This example project includes features for **build automation and dependency management**. You can walkthrough command scripts you have in your project, such as how to clean, test, and run the project.

<panel header="**Example Commands for Typical Projects**">
<box type="info">
The following commands are examples. You can customize them according to your project's needs.
</box>

* **`clean`**: Deletes the files created during the previous build tasks.<br>
  e.g. `npm run clean`

* **`run`**: Builds and runs the application.<br>

* **`test`**: Runs all tests.
  * `npm run test` — Runs all tests
  * `npm run cleantest` — Cleans the project and runs tests

</panel>
<br>

## Continuous integration (CI)

This project uses [GitHub Actions](https://github.com/features/actions) for CI. The project comes with the necessary GitHub Actions configurations files (in the `.github/workflows` folder). No further setting up required.

### Code coverage

As part of CI, this project tracks code coverage as well.

### Repository-wide checks

Your CI can include some repository-wide checks. These repository-wide checks cover all files in the repository. They check for repository rules which are hard to enforce on development machines such as line ending requirements.

--------------------------------------------------------------------------------------------------------------------

## Making a release

Here are the steps to create a new release.

<box type="warning">
Make sure you have the necessary permissions to create a release.
</box>
<popover id="pop:trigger_id" content="e.g. `v0.1`"></popover>

1. Update the version number.
1. Tag the repo with the <trigger for="pop:trigger_id">version number</trigger>. 
1. [Create a new release using GitHub](https://help.github.com/articles/creating-releases/).
