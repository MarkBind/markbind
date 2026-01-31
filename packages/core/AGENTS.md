# AGENTS.MD: Core Package Guide

## Package Overview
The `@markbind/core` package contains the core logic for processing Markdown, plugins, and generating the final HTML output.

## Core Technologies
*   **Language:** TypeScript
*   **Libraries:** `markdown-it`, `nunjucks`, `fs-extra`.

## Key Files
*   `src/index.ts`: Main entry point.
*   `src/plugins/`: Custom MarkBind plugins.

## Development Workflow
*   **Compilation:**
    *   `npm run dev` (in Root): Useful for watching changes.
    *   `npm run compile`: Manual TypeScript compilation.
*   **Testing:**
    *   `npm run test`: Runs Jest tests.

## Coding & Contribution Rules
### Do
- Use TypeScript for all new logic.
- Implement `markdown-it` plugins for new syntax features.
- Keep processing logic separate from UI generation where possible.

### Don't
- Do not mix pure markdown processing with file I/O if avoidable (make logic testable).
