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

1. **Node.js** (LTS or higher) with<br>
   **npm** v6.12.1 or higher
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

   <box type="tip" seamless>

   To go back to the released version of MarkBind, run `npm unlink` in the same directory, followed by `npm i -g markbind-cli`
   </box>
1. **Install dependencies** by running <popover content="Under the hood, this calls `npm ci` and `lerna bootstrap`">`npm run setup`</popover> in the **root folder** of your cloned repo.
  <box type="info" seamless>
  MarkBind uses <md>[lerna](https://github.com/lerna/lerna)</md>, a popular multi-package development tool, to manage it's dependencies. It is essentially a high level wrapper over node and npm's functionalities
  </box>

1. **Congratulations!** Now you ready to start modifying MarkBind code.
