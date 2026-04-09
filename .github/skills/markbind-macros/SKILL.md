---
name: markbind-macros
description: Use when creating Nunjucks macros, advanced templating patterns, dynamic content generation, loops, conditionals, custom macros for repeated component patterns, or when users ask about automating content, creating reusable component templates, or advanced Nunjucks features in MarkBind
paths: *.md,*.html,*.njk
---

# MarkBind Macros & Advanced Templating

## Overview

MarkBind processes Nunjucks before MarkBind syntax, enabling macros and templating patterns for reusable authoring workflows.

## Macros Basics

### Processing Order

Nunjucks is processed before MarkBind syntax. Macro output is then processed as MarkBind content.

### Basic Macro

```html
{% macro infoBox(content) %}
<box type="info">
  {{ content }}
</box>
{% endmacro %}

{{ infoBox("This is important information.") }}
```

### Parameters and Defaults

```html
{% macro badge(text, color="primary") %}
<span class="badge bg-{{ color }}">{{ text }}</span>
{% endmacro %}
```

### Caller Blocks

```html
{% macro tipBox() %}
<box type="tip" light>{{ caller() }}</box>
{% endmacro %}

{% call tipBox() %}
**Pro tip:** Use `markbind serve -o` for large sites.
{% endcall %}
```

## Macro Organization

### Recommended Structure

```text
_markbind/
  macros/
    boxes.njk
    links.njk
    components.njk
  macros.njk
```

### Aggregator File

In `_markbind/macros.njk`, re-export commonly used macros from sub-files so pages import from one place.

### Usage Pattern

```html
{% from "_markbind/macros.njk" import infoBox, warningBox %}
```

### Practical Tips

- Group macros by concern (layout, links, callouts, navigation).
- Keep macro names predictable and stable.
- Avoid over-abstracting one-off snippets.

## Macro References

- [reference/imports.md](reference/imports.md) - importing local/npm macros and context usage
- [reference/loops-and-conditionals.md](reference/loops-and-conditionals.md) - dynamic generation patterns
- [reference/external-data.md](reference/external-data.md) - `{% ext %}` usage with JSON/CSV data
- [reference/escaping.md](reference/escaping.md) - raw blocks and literal templating syntax

## User Guide Entry

- <https://markbind.org/userGuide/markBindSyntaxOverview.html>
