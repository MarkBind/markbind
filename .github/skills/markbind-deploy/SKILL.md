---
name: markbind-deploy
description: Use when deploying MarkBind sites to GitHub Pages, Netlify, or CI platforms, configuring deploy settings in site.json, setting up GitHub Actions workflows, PR previews, or when users ask about publishing, hosting, or deploying their MarkBind site
paths: *.yml,*.yaml,site.json,*.md
---

# MarkBind Deployment

## Overview

MarkBind sites are static HTML and can be deployed to any web server. MarkBind provides built-in deploy commands and CI integrations for GitHub Pages, Netlify, and more.

## Generic Deploy Steps

1. Set `baseUrl` in `site.json` to match deploy location.
2. Use `markbind serve` to verify locally.
3. Use `markbind build` to generate `_site/`.
4. Deploy `_site/` with one of the methods below.

## Deployment Methods

### GitHub Pages
- [reference/github-pages.md](reference/github-pages.md) - `markbind deploy`, `site.json` deploy config, `baseUrl`

### CI to GitHub Pages
- [reference/github-actions.md](reference/github-actions.md) - GitHub Actions workflows and cross-repo PAT setup
- [reference/travis-ci.md](reference/travis-ci.md) - Travis CI deployment workflow
- [reference/circle-ci.md](reference/circle-ci.md) - Circle CI deployment workflow
- [reference/appveyor-ci.md](reference/appveyor-ci.md) - AppVeyor CI deployment workflow

### Netlify
- [reference/netlify.md](reference/netlify.md) - Netlify build and deploy settings

### Pull Request Previews
- [reference/pr-previews-netlify.md](reference/pr-previews-netlify.md) - PR previews on Netlify
- [reference/pr-previews-surge.md](reference/pr-previews-surge.md) - PR previews via Surge + GitHub Actions

## Supporting Deployment Scenarios

- [reference/multiple-sites.md](reference/multiple-sites.md) - Deploying multiple MarkBind sites from one repo
- [reference/custom-404.md](reference/custom-404.md) - Custom `404.md` setup and behavior
- [reference/gitignore-and-ignore.md](reference/gitignore-and-ignore.md) - `.gitignore` and `site.json` ignore entries
- [reference/troubleshooting.md](reference/troubleshooting.md) - Common deploy issues and fixes
