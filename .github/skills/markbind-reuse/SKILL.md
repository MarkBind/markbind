---
name: markbind-reuse
description: Use when reusing content across pages with includes, defining variables, creating boilerplate templates, sharing content between sites, creating content variations, or when users ask about content reuse, DRY patterns, includes, variables, or templates in MarkBind
paths: "*.md,*.html"
---

# MarkBind Content Reuse

## Overview

MarkBind is optimized for content reuse through includes, boilerplates, variables, and page-variation features.

## Essential Rules

- Include paths are resolved relative to the included file's original location, not the caller page.
- Boilerplates in `_markbind/boilerplates/` are interpreted relative to where they are applied.
- Global variables in `_markbind/variables.md` / `_markbind/variables.json` are available site-wide.
- Global variables take precedence over include-scoped variables; outer include variables override inner ones.
- If fragments are meant only for reuse, exclude them from rendering via `pagesExclude`.

## Reuse References

- [reference/includes.md](reference/includes.md) - how to use `<include>` with fragments and attributes (`inline`, `optional`, `trim`, `omitFrontmatter`), pass include-scoped variables, and avoid path-resolution surprises.
- [reference/boilerplates.md](reference/boilerplates.md) - how to author reusable templates in `_markbind/boilerplates/`, apply them in different directories, and pass values into boilerplate placeholders.
- [reference/variables.md](reference/variables.md) - page-scoped variables, global variables, built-in variables (`baseUrl`, `timestamp`, `MarkBind`), external JSON/CSV data via `{% ext %}`, and escaping raw Nunjucks syntax.
- [reference/reuse-patterns.md](reference/reuse-patterns.md) - practical patterns for sharing content across pages/sites and keeping reusable fragments out of generated page lists.
- [reference/content-variations.md](reference/content-variations.md) - reader-facing variation techniques using tags, tabs, closeable sections, hidden fragments, and print-friendly controls.
- [reference/search-indexing.md](reference/search-indexing.md) - search-targeting techniques using keyword spans, page-level keywords, and heading index controls (`.always-index`, `.no-index`).

## User Guide Entry

- <https://markbind.org/userGuide/reusingContents.html>
