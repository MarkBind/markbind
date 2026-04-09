# Variables for Reuse

## Page Variables

```html
{% set title = "Getting Started" %}
{% set version = "2.0.0" %}

# {{ title }}
Version: {{ version }}
```

## Global Variables

Define in `_markbind/variables.md`:

```html
<variable name="icon_info">:fas-info-circle:</variable>
<variable name="icon_tip">:fas-lightbulb:</variable>
```

Or in `_markbind/variables.json`.

## Built-in Global Variables

- `{{baseUrl}}`
- `{{timestamp}}`
- `{{MarkBind}}`

## External Data Variables

```html
{% ext myData = "data/file.json" %}
{% ext users = "data/users.csv" %}
```

## Escaping

```html
{% raw %}{{ notAVariable }}{% endraw %}
```

## User Guide Sources

- <https://markbind.org/userGuide/reusingContents.html#variables>
- <https://markbind.org/userGuide/syntax/variables.html>
