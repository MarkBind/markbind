{% set title = "AI use" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}
<div class="lead">

The MarkBind project has configurations that facilitate AI use.
</div>

## AI Skills

Skills are designed to improve AI agent performance by providing structured instructions and resources for specific tasks. This is applicable to any AI agent with skill support, and developers can point AI agents to the skills directory for structured task handling.

### Skills Directory

Skills are located in the `.github/skills/` directory. You can point AI agents to this directory to leverage the structured instructions and resources provided by the skills.

### List of Skills

The following skills are available in the MarkBind project:

| Skill Name | Description |
|------------|-------------|
| `update-docs` | Update user or developer documentation only if the change is relevant to the specific purpose of the documentation. Use when editing files within the `docs/` folder. |

### Adding New Skills

If you find yourself performing similar structured tasks with an AI agent, consider adding a new skill to the `.github/skills/` directory. Each skill should include:

1. A `SKILL.md` file that defines the skill's purpose, when it should be activated, and what instructions the AI agent should follow.
2. Any necessary scripts or resources to support the skill's functionality.
3. Clear documentation on how to use the skill.

### Using Skills

Skills relevant to particular tasks should be invoked automatically by AI agents. You may opt to directly point the agent to a skill.

### Useful Links
- [Skill.sh skill repository](https://skills.sh/)
- [Cline reference on skills & writing them](https://docs.cline.bot/features/skills)
- [Claude reference on skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)

{% from "njk/common.njk" import previous_next %}
{{ previous_next('workflow', 'writingComponents') }}
