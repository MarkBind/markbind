---
name: markbind-authoring
description: Refer to this skill for MarkBind-specific authoring features and formatting when writing MarkBind pages.
paths: "*.md,*.html"
---

# MarkBind Content Authoring

## Overview

Use this skill for MarkBind-specific authoring behavior and syntax extensions.

## Essential Rules

MarkBind pages are not plain Markdown. The processing order matters:

1. **Nunjucks** (`{% ... %}`, `{{ ... }}`)
2. **MarkBind syntax** (components, include/variable tags, extensions)
3. **Markdown rendering**

- Escape literal template syntax with `{% raw %}...{% endraw %}` when needed.
- Use MarkBind text extensions only where they improve readability; avoid stacking too many styles.
- Use search/indexing annotations (`.always-index`, `.no-index`, `.keyword`) intentionally.

## Authoring References

- [reference/textStyles.md](reference/textStyles.md) - MarkBind inline style extensions (`==`, `!!`, `%%`, `++`, `--`, color syntax) and when to use them.
- [reference/codeBlocks.md](reference/codeBlocks.md) - MarkBind code block attributes (`.line-numbers`, `start-from`, `highlight-lines`, `heading`) and inline code language classes.
- [reference/headings.md](reference/headings.md) - heading anchors and search-indexing controls (`.always-index`, `.no-index`).
- [reference/paragraphs.md](reference/paragraphs.md) - MarkBind-safe line break and paragraph patterns.

## User Guide Entries

- <https://markbind.org/userGuide/authoringContents.html>
- <https://markbind.org/userGuide/markBindSyntaxOverview.html>
