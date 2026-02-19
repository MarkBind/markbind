{% set title = "Subagents" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

Subagents are specialized AI agents designed to handle specific types of tasks autonomously. The MarkBind project maintains several subagents to assist with development workflows.

</div>

## Overview

Subagents extend the capabilities of AI assistants by providing focused expertise for common development tasks. They are located in the `.opencode/agents/` directory and can be invoked to handle specific workflows.

<box type="info">

**Memory Support**

Subagent memory is currently **enabled** and configured to use **local** storage. This allows subagents to retain context and build up institutional knowledge across sessions. This memory will **not** be committed to the repository. If you wish to change this behaviour, you can change the [`memory` field](https://code.claude.com/docs/en/sub-agents#enable-persistent-memory) in the subagent's frontmatter to `none | project`.

</box>

<box type="warning">

**Note:** Memory support is currently only available when using **Claude** as the AI provider.

</box>

## Available Subagents

The following subagents are available in the MarkBind project:

| Subagent Name       | Description                                                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `codebase-explorer` | Explores and maps the codebase structure dynamically. Use when you need to understand project organization, find where specific functionality is implemented, or discover directory structure and key files. |
| `pattern-reporter`  | Analyzes code patterns and implementation details. Use when you need to understand how specific features are implemented, identify coding patterns, or study similar functionality across the codebase. |
| `update-docs`       | Updates user or developer documentation when changes are relevant. Use when editing files within `docs/` folder or when code changes require documentation updates. |

## Using Subagents

Subagents can be invoked by the AI assistant automatically based on the task at hand. When a subagent is activated, it will operate independently to handle its designated workflow, leveraging its specialized knowledge and memory.

Subagents can also be manually triggered. Please refer to the documentation of your chosen AI tool (e.g., Claude, Opencode) for instructions on how to manually invoke subagents.

## Useful References

- [Claude documentation on creating subagents](https://code.claude.com/docs/en/sub-agents#write-subagent-files)
- [Opencode documentation on creating subagents](https://opencode.ai/docs/agents/)

{% from "njk/common.njk" import previous_next %}
{{ previous_next('skills', '../development/settingUp') }}
