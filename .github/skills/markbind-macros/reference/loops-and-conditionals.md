# Loops and Conditionals

## Loops

```html
{% for item in items %}
  {{ loop.index }}. {{ item }}
{% endfor %}
```

- `loop.index` is 1-based
- `loop.index0` is 0-based

## Conditional Output

```html
{% if showAdvanced %}
<panel header="Advanced">Advanced content</panel>
{% else %}
<p>Enable advanced mode to see more options.</p>
{% endif %}
```

## Common Pattern

Generate site content from arrays/objects (`nav`, cards, toc, repeated components) using `for` + template fragments.

## User Guide Sources

- <https://markbind.org/userGuide/markBindSyntaxOverview.html>
- <https://mozilla.github.io/nunjucks/templating.html#for>
