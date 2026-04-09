# Importing Macros

## Import Specific Macros

```html
{% from "_markbind/macros.njk" import warningBox, successBox %}
```

## Import as Namespace

```html
{% import "_markbind/macros.njk" as m %}
{{ m.warningBox("Warning!") }}
```

## Import with Context

```html
{% from "macros.njk" import myMacro with context %}
```

## Import from npm Package

```html
{% from "njk/common.njk" import previous_next %}
```

## User Guide Sources

- <https://markbind.org/userGuide/markBindSyntaxOverview.html>
- <https://mozilla.github.io/nunjucks/templating.html#import>
