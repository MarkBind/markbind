# AGENTS.MD: CLI Package Guide

The `markbind-cli` package handles command-line operations, argument parsing, and orchestrates the build process by invoking `@markbind/core`.

## Core Technologies
*   **Language:** JavaScript (Node.js)
*   **Libraries:** `commander` (CLI), `winston` (Logging).

## Key Files
*   `index.js`: Main entry point.
*   `test/functional/`: Functional tests (crucial for CLI verification).

## Development Workflow
*   **Testing:**
    *   `npm test`: Runs unit and functional tests.
    *   `npm run updatetest`: Updates functional test snapshots.
*   **Dependencies:** Relies on `@markbind/core` and `@markbind/core-web`.

## Coding & Contribution Rules
### Do
- Use `commander` for new CLI commands/options.
- Ensure `index.js` remains the main entry point.
- Use `winston` for logging.

### Don't
- Do not put core site generation logic here; delegate to `@markbind/core`.
