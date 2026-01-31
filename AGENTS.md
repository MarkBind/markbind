# AGENTS.MD: AI Collaboration Guide

## Project Overview & Purpose

* MarkBind is a static site generator optimized for content-heavy instructional websites (e.g., courses, tutorials, documentation). It converts Markdown-like syntax into rich, interactive HTML websites.
* Business Domain: Documentation, Education, Static Site Generation (SSG).

## Core Technologies & Stack

* Languages:
    * TypeScript (Backend/Core logic, `packages/core`)
    * JavaScript (Legacy scripts, CLI, Webpack configs)
    * Vue.js 3 (Frontend components, `packages/vue-components`, `packages/core-web`)
* Frameworks & Runtimes:
    * Node.js (Runtime)
    * Vue 3 (Frontend Framework)
    * Jest (Testing)
* Key Libraries/Dependencies:
    * `markdown-it` (Markdown parsing)
    * `nunjucks` (Templating)
    * `commander` (CLI interface)
    * `webpack` (Asset bundling)
* Package Manager(s):
    *   `npm` (Workspaces enabled)
    *   `lerna` (Monorepo orchestration)

## Architectural Patterns

* Overall Architecture: Monorepo structure managed by Lerna. Separates concerns into:
    *   CLI (`packages/cli`): Command-line interface and orchestration.
    *   Core (`packages/core`): Main logic for parsing and generating sites.
    *   Core-Web (`packages/core-web`): Client-side assets and build configuration.
    *   Vue Components (`packages/vue-components`): UI library for the generated sites.
* Directory Structure Philosophy:
    *   `packages/`: Contains all monorepo packages.
    *   `docs/`: Documentation site content (dogfooding MarkBind).
    *   `scripts/`: Maintainance and utility scripts.

## Coding Conventions & Style Guide

* Formatting:
    *   Indentation: 2 spaces.
    *   Style: Follows `airbnb-base` and `airbnb-typescript`.
    *   Enforced via ESLint (`.eslintrc.js`).
* Naming Conventions:
    *   Variables/Functions: camelCase (`processMarkdown`).
    *   Classes: PascalCase (`SiteDeployManager`).
    *   Files: kebab-case preferred for new files, though consistency with existing structure is paramount.

## Key Files & Entrypoints

* CLI Entry: `packages/cli/index.js`
* Core Entry: `packages/core/index.js`
* Monorepo Config: `lerna.json`
* Lint Config: `.eslintrc.js`

## Development & Testing Workflow

* Local Development Environment:
    *   Backend (Core): Run `npm run dev` in the root to watch/recompile TypeScript. Otherwise, run `npm run build:backend` to compile TypeScript.
    *   Frontend: Run `markbind serve -d` to enable hot reloading of client assets.
    *   Troubleshooting: Run `npm run clean` to remove compiled artifacts if you encounter "orphaned file" issues (e.g., after renaming `.ts` files).
    *   Warning: Do NOT build full release bundles (`npm run build:web`) manually unless releasing.
* Testing:
    *   Run `npm test` for all tests.
    *   Localized Testing: Run tests in specific package directories (`packages/core`, etc.) for efficiency.
* CI/CD Process: GitHub Actions (`.github/workflows`) handle testing and linting on PRs.

## Specific Instructions for AI Collaboration

* Contribution:
    *   Follow the "Do" and "Don't" lists in package-specific `AGENTS.md` files.
    *   Ensure small diffs and meaningful commit messages.
* Security:
    *   Do not hardcode secrets.
    *   Validate inputs in CLI and Core logic.
* Dependencies:
    *   Use `npm` workspaces.
    *   Do not add heavy dependencies without strong justification.

See each package's `AGENTS.md` for specific guidelines:
* [CLI](packages/cli/AGENTS.md)
* [Core](packages/core/AGENTS.md)
* [Core Web](packages/core-web/AGENTS.md)
* [Vue Components](packages/vue-components/AGENTS.md)
