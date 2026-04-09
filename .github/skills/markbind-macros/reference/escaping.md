# Escaping Nunjucks

## Show Literal Nunjucks Expressions

```html
{% raw %}{{ notAVariable }}{% endraw %}
{% raw %}{% if true %}{% endraw %}
```

## `v-pre` for Literal Braces in Rendered HTML

```html
<div v-pre>
  <p>{{ literal content }}</p>
</div>
```

## Why This Matters

Nunjucks runs before MarkBind rendering. Literal template syntax must be escaped when you want it to appear as text.

## User Guide Sources

- <https://markbind.org/userGuide/markBindSyntaxOverview.html>
- <https://markbind.org/userGuide/syntax/variables.html>
