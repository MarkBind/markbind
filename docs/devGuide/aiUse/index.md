{% set title = "AI use" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">

The MarkBind project has configurations that facilitate AI use. We currently make use of skills and subagents to enhance AI capabilities for specific tasks.

</div>

## Using External Resources

Do not use Skills or Agents found online without auditing them first due to security concerns. It is also strongly recommended to create a separate pull request to review the addition before proper use.

## Setting Up AI Use

To keep the directory structure clean, all AI Skills and Subagents are located in the `.github/` directory. It is suggested to set up symlinks for the specific directory structure required.

For example, if configuring opencode:

```
ln -s .github/ .opencode
```

Directories used for common AI tools has been added to `.gitignore` to prevent accidental commits. If you are using a different directory structure, please ensure that these directories are also ignored.

## Using Skills

Skills are structured instructions and tools that help AI agents perform specific tasks more effectively. For detailed information about available skills and how to use them, see the [Skills](skills.html) page.

## Subagents

Subagents are specialized AI agents designed to handle specific types of tasks autonomously. For detailed information about available subagents and how to use them, see the [Subagents](subagents.html) page.

{% from "njk/common.njk" import previous_next %}
{{ previous_next('../devGuide', 'skills') }}
