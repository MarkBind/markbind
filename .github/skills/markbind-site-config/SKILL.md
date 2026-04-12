---
name: markbind-site-config
description: Use when configuring site.json, setting up layouts, frontmatter, site properties, themes, dark mode, plugins, page navigation, headers, footers, custom CSS/JS, or when users ask about site structure, site-wide settings, or page configuration
paths: site.json,*.md,*.html
---

# MarkBind Site Configuration

## Overview

MarkBind site behavior is configured through `site.json`, frontmatter, and layout files in `_markbind/layouts/`.

## Essential Rules

- Unless explicitly requested, DO NOT modify `main.css`
- Treat `site.json` as the source of truth for site-wide defaults and generation behavior.
- Use page frontmatter for page-local metadata; use `globalOverride` for cross-page overrides.
- Confirm `baseUrl` before deployment, especially for GitHub Pages project sites.
- Keep layout files in `_markbind/layouts/` and ensure each layout renders `{{ content }}`.
- Prefer explicit `pages`/`glob` configuration to avoid accidentally publishing draft or fragment files.

## Configuration References

- [reference/site-json.md](reference/site-json.md) - explains the main `site.json` structure, what each top-level property controls, and how property precedence works when multiple config sources set the same value.
- [reference/pages-and-globs.md](reference/pages-and-globs.md) - shows how to select pages with `src`/`glob`, exclude subsets with `globExclude`/`pagesExclude`, and apply page-level options like layout, title, scripts, and output extension.
- [reference/frontmatter.md](reference/frontmatter.md) - covers page-local configuration (`title`, `layout`, `pageNav`, `header`, `footer`, `keywords`) and how frontmatter interacts with `site.json` and `globalOverride`.
- [reference/layouts.md](reference/layouts.md) - documents authoring custom layouts in `_markbind/layouts/`, using `{{ content }}` correctly, and injecting assets/scripts with `<head-top>`, `<head-bottom>`, and `<script-bottom>`.
- [reference/style-and-theme.md](reference/style-and-theme.md) - details visual configuration in `style` (dark mode, Bootswatch theme, code theme, code line numbers) and when to use each option.
- [reference/plugins.md](reference/plugins.md) - explains enabling built-in/external plugins, configuring them through `pluginsContext`, and the expected shape of plugin config in `site.json`.
- [reference/search-and-indexing.md](reference/search-and-indexing.md) - describes search behavior controls such as `searchable`, `headingIndexingLevel`, and Pagefind selectors for excluding content from indexing.
- [reference/deploy-and-baseurl.md](reference/deploy-and-baseurl.md) - explains deployment-related `site.json` settings (`deploy.message`, `deploy.repo`, `deploy.branch`) and how to set `baseUrl` so links resolve correctly after deployment.
- [reference/custom-file-types.md](reference/custom-file-types.md) - shows how to generate non-HTML outputs via `fileExtension` (for example `.json`/`.txt`) and the limitations that apply to non-HTML pages.

## User Guide Entry

- <https://markbind.org/userGuide/settingSiteProperties.html>
