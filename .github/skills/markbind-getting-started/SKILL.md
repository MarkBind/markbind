---
name: markbind-getting-started
description: Use when initializing a new MarkBind site, choosing templates, installing MarkBind, serving locally, or when a user asks how to get started with MarkBind, create a new documentation site, or scaffold a project
paths: *.md,*.html,*.json
---

# MarkBind Getting Started

## Overview

MarkBind is a static site generator optimized for content-heavy instructional websites (courses, tutorials, documentation). It converts Markdown-like syntax into rich, interactive HTML websites.

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

- [reference/templates.md](reference/templates.md) - Template comparison

### Commands

- [reference/cli.md](reference/cli.md) - Full CLI reference
- [reference/serve.md](reference/serve.md) - Serve command options

### Next Steps

- **Authoring**: Use `markbind-authoring` skill
- **Components**: Use `markbind-components` skill
- **Configuration**: Use `markbind-site-config` skill
- **Content Reuse**: Use `markbind-reuse` skill
- **Deployment**: Use `markbind-deploy` skill

