{% set title = "Templates" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
</frontmatter>

# Templates

MarkBind allows you to start off your new project with different templates.

During initialization you can add a flag `--template <template-key>` to select a different template to initialize with. For example:

```
markbind init --template minimal
```

## Supported Templates

Name    | Template key | Description | Quick Deploy
----    | -------      | ----------- | ------------
Default | `default`    | Default template if `--template` is unspecified. Includes core features such as site and page navigation for a more convenient quick start. | <a href="https://app.netlify.com/start/deploy?repository=https://github.com/MarkBind/init-typical-netlify"><img src="https://www.netlify.com/img/deploy/button.svg" /></a>
Minimal | `minimal` | Minimalistic template that gets you started quickly. | <a href="https://app.netlify.com/start/deploy?repository=https://github.com/MarkBind/init-minimal-netlify"><img src="https://www.netlify.com/img/deploy/button.svg" /></a>