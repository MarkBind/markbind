# AGENTS.MD: CLI Package Guide

The `markbind-cli` package handles command-line operations, argument parsing, and orchestrates the build process by invoking `@markbind/core`.

## Core Technologies
*   **Language:** TypeScript (Node.js)
*   **Module System:** ES Modules (`"type": "module"`)
*   **Libraries:** `commander` (CLI), `winston` (Logging).

## Key Files
*   `index.ts`: Main entry point (source).
*   `dist/index.js`: Compiled entry point (output).
*   `test/functional/`: Functional tests (crucial for CLI verification).

## Development Workflow
*   **Build:**
    *   `npm run build`: Compiles TypeScript to JavaScript.
    *   `npm run dev`: Watches and recompiles on changes.
*   **Testing:**
    *   `npm test`: Runs unit and functional tests (uses babel-jest).
    *   `npm run updatetest`: Updates functional test snapshots.
*   **Dependencies:** Relies on `@markbind/core` and `@markbind/core-web`.

## Coding & Contribution Rules
### Do
- Use `commander` for new CLI commands/options.
- Use ES Module syntax (`import`/`export`).
- Ensure `index.ts` remains the main entry point.
- Use `winston` for logging.
- Use `.js` extension in import paths (TypeScript ESM requirement).

### Don't
- Do not use CommonJS syntax (`require`/`module.exports`).
- Do not put core site generation logic here; delegate to `@markbind/core`.
