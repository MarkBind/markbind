{% set title = "Templates" %}
{% set filename = "templates" %}

<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# {{ title }}

<div class="lead" id="overview">

MarkBind allows you to start off your new project with different templates.
</div>

During initialization you can add a flag `--template <template-key>` to select a different template to initialize with. For example:

```
markbind init --template minimal
```

## Supported Templates

Name    | Template key | Description | Quick Deploy
----    | -------      | ----------- | ------------
Default | `default`    | Default template if `--template` is unspecified. Includes core features such as site and page navigation for a more convenient quick start. | <a href="https://app.netlify.com/start/deploy?repository=https://github.com/MarkBind/init-typical-netlify"><img src="https://www.netlify.com/img/deploy/button.svg" /></a>
Minimal | `minimal`    | Minimalistic template that gets you started quickly. | <a href="https://app.netlify.com/start/deploy?repository=https://github.com/MarkBind/init-minimal-netlify"><img src="https://www.netlify.com/img/deploy/button.svg" /></a>
AB3     | `ab3`        | [AB3](https://se-education.org/addressbook-level3) template which is under [SE-EDU](https://se-education.org) initiative. | <a href="https://65b4b64e61304e76b972f3cd--shimmering-douhua-d6ca81.netlify.app/"><img src="https://www.netlify.com/img/deploy/button.svg" /></a>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('addingNavigationButtons', '') }}