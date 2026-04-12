---
name: markbind-getting-started
description: Use when initializing a new MarkBind site, choosing templates, installing MarkBind, serving locally, or when a user asks how to get started with MarkBind, create a new documentation site, or scaffold a project
paths: "*.md,*.html,*.json"
---

# MarkBind Getting Started

## Overview

MarkBind is a static site generator optimized for content-heavy instructional websites (courses, tutorials, documentation). It converts Markdown-like syntax into rich, interactive HTML websites.

## Essential Rules

- Pick one installation mode and use it consistently in the project (`global`, local `devDependency`, or `npx`).
- Keep `site.json` at project root; it is required for build/serve/deploy workflows.
- Use `markbind serve` during authoring; use `markbind build` for publish output.
- Set `baseUrl` correctly before deployment to avoid broken deployed links.

## Quick Start

### 1. Serve Locally

```bash
markbind serve                         # Live preview (port 8080)
markbind serve -p 3000                 # Custom port
markbind serve -o guide/index.md       # Single-page mode
markbind serve -b                      # Background build (beta)
```

### 2. Build & Deploy

```bash
markbind build                         # Generate to _site/
markbind build ./src ./output          # Custom dirs
markbind deploy                        # Deploy to GitHub Pages
```

## Project Structure

```
my-site/
├── index.md              # Landing page
├── site.json             # Site configuration
├── _markbind/
│   ├── layouts/
│   │   └── default.md    # Page layout
│   ├── variables.md      # Global variables
│   └── variables.json    # Global variables (JSON)
└── contents/             # Content pages (optional)
```

## Reference Files

### Installation & Setup

- [reference/templates.md](reference/templates.md) - template keys (`default`, `minimal`, `project`, `portfolio`) and how to choose a starter.

### Commands

- [reference/cli.md](reference/cli.md) - command overview for `init`, `serve`, `build`, `deploy`, and shared options.
- [reference/serve.md](reference/serve.md) - detailed serve workflow (`--one-page`, `--background-build`, host/port/site-config options).

## User Guide Entries

- <https://markbind.org/userGuide/gettingStarted.html>
- <https://markbind.org/userGuide/templates.html>
- <https://markbind.org/userGuide/cliCommands.html>

### Next Steps

- **Authoring**: Use `markbind-authoring` skill
- **Components**: Use `markbind-components` skill
- **Configuration**: Use `markbind-site-config` skill
- **Content Reuse**: Use `markbind-reuse` skill
- **Deployment**: Use `markbind-deploy` skill
