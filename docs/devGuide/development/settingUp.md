{% set title = "Setting up" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
</frontmatter>

# {{ title }}

<div class="lead">

This page explains how to set up your development environment to start contributing to MarkBind.
</div>

## Prerequisites

1. **Node.js** ({{ node_dev_version }} or higher) with<br>
   a recent version of **npm**

1. **Java** 8 or higher, and<br>
   **Graphviz** ({{ graphviz_version }} or higher, _installation is optional on Windows_) <br>
   %%(The above two are required for one of the third-party libraries used by MarkBind)%%

1. **Python** 3 or later, and<br>
   %%(Required if using python pre-commit hooks)%%

1. **Verify** that all tools are accessible and the versions are as expected by running these commands in the console.
   * `node --version`
   * `npm --version`
   * `java --version`
   * `dot -V` (for Graphviz - optional on Windows)
   * `python3 -V`

<box type="tip" seamless>

We recommend the **WebStorm IDE** or **VS Code** for working with MarkBind code.
</box>

## Setting up the dev environment

1. **Fork and clone** the MarkBind repo.

1. **Install dependencies** by running
   <popover content="Under the hood, this calls `npm ci` and `npm run build:backend`">`npm run setup`</popover>
   in the **root folder** of your cloned repo.

1. **Bind your cloned version of MarkBind to your console** by navigating to the cloned `packages/cli` folder and running `npm link`

<box type="warning" class="ms-4" seamless>

If the `markbind` command fails to execute with permission issues in the console, add execute permissions to the generated file in `packages/cli/dist/index.js`

To prevent this from occurring, it is recommended to use the `dev`/`build:backend` scripts as described in [the workflow](workflow.md#editing-backend-features)
</box>

1. **Congratulations!** Now you are ready to start modifying MarkBind code.


## Setting up the git hooks (optional but recommended)

There are a few [Git hooks](./workflow.md#git-hooks) implemented using the [pre-commit](https://pre-commit.com/) tool that runs common tasks like linting, automated tests and compiling typescript files.

**Install the hooks** by running `python3 ./pre-commit/pre-commit-2.20.0.pyz install` in the **root folder** of your cloned repo.

If you ever need to uninstall the hooks, simply run `uninstall` instead of `install`.

### Common setup questions

1. Does MarkBind work with all operating systems?

   Yes! We support all operating systems.

1. How does MarkBind manage dependencies?

   MarkBind uses [lerna](https://github.com/lerna/lerna), a popular
   multi-package development tool, to manage its dependencies. It is
   essentially a high level wrapper over node and npm's functionalities.

1. How do I move back to the released version of MarkBind?

   To go back to the released version of MarkBind, run
   `npm un -g markbind-cli`, followed by `npm i -g markbind-cli`.

1. Some of my front-end components are not working as expected when running `markbind serve`.

   Try running either `markbind serve -d` or `npm run build:web` to view frontend changes (especially after pulling a frontend update that someone else may have pushed). You can see more details [here](workflow.md#editing-frontend-features).

{% from "njk/common.njk" import previous_next %}
{{ previous_next('../aiUse/subagents', 'workflow') }}
