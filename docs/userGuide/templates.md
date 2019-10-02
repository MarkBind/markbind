<variable name="title" id="title">Templates</variable>
<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide
</frontmatter>

# Templates

MarkBind allows you to start off your new project with different templates.

During initialization you can add a flag `--template <template-key>` to select a different template to initialize with. For example:

```
markbind init --template minimal
```

## Supported Templates

Name    | Template key | Description
----    | -------      | ------
Default | `default`    | Default template if `--template` is unspecified. Filled with Markbind features to guide you to author better content.
Minimal | `minimal`    | Minimalistic template that gets you started quickly
