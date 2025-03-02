{% set title = "Exploring Codebase" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">
This page provides an overview of the MarkBind codebase and innovative methods to explore it as an onboarding developer.
</div>

## TL;DR

- [ ] Overarching structure of the MarkBind codebase
- [ ] Stepping through the codebase with a debugger
- [ ] Ingesting the codebase with LLMs

## Overarching Structure of the MarkBind Codebase

<panel src="{{baseUrl}}/devGuide/design/projectStructure.md#packages-overview" header="**Project Architecture**" type="info" no-close bottom-switch expanded></panel>

## Debugger Setup

After setting up an experimental MarkBind site, you can step through the codebase with a debugger to understand the flow of the codebase.

<tabs>
<tab header="Visual Studio Code">
</tab>
<tab header="JetBrains IDEs">
    <box type="info">
        <markdown>Tested on JetBrains IDEs version `2024.1.1` and above.</markdown>
    </box>
    <markdown>1. Navigate to `Run` > `Edit Configurations...`.</markdown>
    <markdown>2. Click the `+` icon and select `Node.js`.</markdown>
    <markdown>3. Set the `Working directory` to the root of the MarkBind test site.</markdown>
    <box type="tip"><markdown>Set the `Working directory` to `markbind/docs` to experiment with the MarkBind documentation site.</markdown></box>
    <markdown>4. Set the `File` to the <trigger for="pop:absolute_path">**ABSOLUTE PATH**</trigger> of `packages/cli/index.js`.</markdown>
    <popover id="pop:absolute_path" content="e.g. ~/Documents/markbind/packages/cli/index.js"></popover>
    <markdown>5. Set the `Application parameters` to <trigger for="modal:serve-arguments" trigger="click">`serve -d -o`</trigger>.</markdown>
    <modal id="modal:serve-arguments" center large>
        <include src="{{baseUrl}}/userGuide/cliCommands.md#serve-command"></include>
    </modal>
    <markdown>6. Name the configuration and click `OK`.</markdown>
    <markdown>7. Add breakpoints to the lines you want to inspect.</markdown>
    <markdown>8. Select the configuration from the dropdown next to the "run" button and click the "debug" button to start tracing.</markdown>
</tab>
</tabs>

## Ingesting the Codebase with LLMs

[//]: # (TODO: Add content)


