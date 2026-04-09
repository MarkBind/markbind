---
name: markbind-authoring
description: Refer to this skill MarkBind-specific features and formatting to
make beautiful MarkBind pages.
paths: *.md,*.html
---

# MarkBind Content Authoring

## Overview

Use this skill for MarkBind-specific authoring behavior and syntax extensions.

## Processing Order

MarkBind pages are not plain Markdown. The processing order matters:

1. **Nunjucks** (`{% ... %}`, `{{ ... }}`)
2. **MarkBind syntax** (components, include/variable tags, extensions)
3. **Markdown rendering**

This affects escaping and why some expressions need `{% raw %}`.

## MarkBind Text Extensions

Use these MarkBind-specific inline styles:

- `****text****` (super bold)
- `!!text!!` (underline)
- `==text==` (highlight)
- `%%text%%` (dim)
- `++text++` (large)
- `--text--` (small)
- `text^sup^` and `text~sub~`
- `->centered<-`
- `#r#text##` color syntax (`r/g/b/c/m/y/k/w`)

## Code Block Features (MarkBind)

MarkBind supports additional code block attributes beyond language tagging:

- Line numbers: ```` ```js {.line-numbers} ````
- Custom first line: `start-from=10`
- Highlight lines: `highlight-lines="1,3-5"`
- Heading label: `heading="example.js"`
- Inline code language class: `` `const x = 1`{.js} ``

## Search/Indexing Annotations

Use MarkBind search annotations while authoring content:

- `## Heading {.always-index}` to force indexing
- `## Heading {.no-index}` to exclude from indexing
- `<span class="keyword">term</span>` to add indexed keywords
- `<span class="keyword d-none">synonym</span>` for hidden keyword aliases

## Escaping and Literal Syntax

- Use `{% raw %}{{ literal_expression }}{% endraw %}` to show literal Nunjucks syntax.
- Because Nunjucks runs first, unresolved `{{ ... }}` is treated as a template expression, not plain text.

## Focused References

- [reference/textStyles.md](reference/textStyles.md)
- [reference/codeBlocks.md](reference/codeBlocks.md)
- [reference/headings.md](reference/headings.md)
- [reference/paragraphs.md](reference/paragraphs.md)
