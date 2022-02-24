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

1. **Node.js** ({{ node_version }} or higher) with<br>
   **npm** v7 or higher
1. **Java** 8 or later, and<br>
   **Graphviz** v2.38 or later<br>
   %%(The above two are required for one of the third-party library used by MarkBind)%%
1. **Verify** that all tools are accessible and the versions are as expected by running these commands in the console.
   * `node --version`
   * `npm --version`
   * `java --version`
   * `dot -V` (for Graphviz)

<box type="tip" seamless>

We recommend the **WebStorm IDE** for working with MarkBind code.
</box>

## Setting up the dev environment

1. **Fork and clone** the MarkBind repo.
1. **To bind your cloned version of MarkBind to your console** (instead of the released version of MarkBind), run `npm link` in the `packages/cli` folder of the cloned repo first.
1. **Install dependencies** by running <popover content="Under the hood, this calls `npm ci` and `lerna bootstrap`">`npm run setup`</popover> in the **root folder** of your cloned repo.

1. **Congratulations!** Now you ready to start modifying MarkBind code.

### Common setup questions

1. Does MarkBind work with all operating systems?

   Yes! We support all operating systems. However, windows 11 users might have to run `npm install` after the `npm run setup` as some packages may have incompatible versions.

1. How does Markbind manage dependencies?

   MarkBind uses [lerna](https://github.com/lerna/lerna), a popular multi-package development tool, to manage it's dependencies. It is essentially a high level wrapper over node and npm's functionalities.

1. How do I move back to the released version of MarkBind?

   To go back to the released version of MarkBind, run `npm run -g markbind-cli`, followed by `npm i -g markbind-cli`.

1. Some of my front-end components are not working as expected.

   Try running `npm run build:web` to rebuild the front-end components as these changes are only made when a new version of MarkBind is released.
