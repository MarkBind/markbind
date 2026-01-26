---
name: markbind-dev-workflow
description: Development workflows for the MarkBind project including environment setup, building backend/frontend, testing procedures, and git workflows. Use when setting up MarkBind for development, making code changes to MarkBind's backend (TypeScript/JavaScript) or frontend (Vue components), running tests, updating test sites, or preparing pull requests for MarkBind itself.
---

# MarkBind Development Workflow

## Environment Setup

### Prerequisites
- Node.js (v18 or higher) with npm
- Java 8+ (for PlantUML)
- Graphviz (optional on Windows, required for PlantUML diagrams)
- Python 3+ (for git hooks)

### Initial Setup

1. **Fork and clone** the repository
2. **Bind CLI to console** by navigating to `packages/cli` and running `npm link`
3. **Install dependencies** by running `npm run setup` in the root folder
4. **Install git hooks (optional but recommended)** by running:
   ```bash
   python3 ./pre-commit/pre-commit-2.20.0.pyz install
   ```

### Project Structure
MarkBind uses a **monorepo** with 4 packages managed by lerna:
- `packages/cli` - Command-line interface
- `packages/core` - Core processing library (TypeScript + JavaScript)
- `packages/core-web` - Client-side bundles and Vue setup
- `packages/vue-components` - UI components library

## Backend Development

Backend code in `packages/core` includes TypeScript files that must be compiled to JavaScript.

### Compilation Options

**Option 1: Watch mode (Recommended for active development)**
```bash
npm run dev
```
Starts file watcher that rebuilds on changes.

**Option 2: Manual compilation**
```bash
npm run build:backend
```
Compiles once. Re-run after each change.

**Option 3: IDE automatic compilation**
Configure your IDE to compile TypeScript on save (see WebStorm/VS Code guides in workflow docs).

### Important Notes
- Always compile before testing backend changes
- `packages/cli` depends on compiled output from `packages/core`
- Git hooks automatically build backend on commit/push

## Frontend Development

Frontend changes in `packages/core-web` or `packages/vue-components` require special handling since bundles are only updated during releases.

### Development Options

**Option 1: Developer mode (Recommended)**
```bash
markbind serve -d
```
Adds webpack middlewares for live compilation and hot reloading of frontend sources.

**Option 2: Manual bundle build**
```bash
npm run build:web
```
Builds `markbind.min.js` and `markbind.min.css` bundles, then use normal `markbind` commands.

### Bundle Files
- `markbind.min.js` - Main client-side bundle
- `markbind.min.css` - Minified styles
- `vuecommonappfactory.min.js` - Server-side rendering bundle
- `vuecommonappfactory.min.css` - SSR styles

## Testing Workflow

### Running Tests

**All tests** (linting + unit tests + functional tests):
```bash
npm run test
```

**Package-specific tests**:
```bash
cd packages/cli && npm run test
cd packages/core && npm run test
```

### Test Components

1. **Linting**: ESLint for code, StyleLint for CSS
2. **Unit tests**: Jest-based tests in `test/unit` directories
3. **Functional tests**: Builds test sites and compares output with expected files

### Updating Test Files

After making changes that affect test output:

```bash
npm run updatetest
```

This updates:
- Expected HTML files in test sites' `expected/` folders
- Snapshot files in `__snapshots__/` folders

**Critical**: Always verify generated output is correct before committing. Some binary files (images, fonts) may show as changed but should be discarded if not directly modified.

### Expected Errors in Tests

Some errors logged during tests are intentional. Check test logs for messages like:
```
info: The following 2 errors are expected to be thrown during the test run:
info: 1: No such segment '#doesNotExist' in file
info: 2: Cyclic reference detected.
```

### Adding Test Site Content

For detailed procedures on adding new test pages and configuring test sites, see [references/test-patterns.md](references/test-patterns.md).

## Git Workflow

### Keeping Fork Updated

1. Sync fork on GitHub using "Sync fork" button
2. Update local master: `git checkout master && git pull`
3. Rebase or merge into feature branch:
   - `git rebase master` (preferred for clean history)
   - `git merge master` (alternative)

### Commit Strategy

- **Default**: Squash merge (maintainers will squash on merge)
- No need for elaborate commit messages or strict organization
- Exception: TypeScript migrations require separate "Rename" and "Adapt" commits

### Git Hooks

Three hooks are available (installed via pre-commit tool):
- `post-checkout`: Runs clean + build backend when switching branches
- `pre-commit`: Runs clean + build backend + lintfix
- `pre-push`: Runs clean + build backend + all tests

Skip hooks with `--no-verify` flag if needed.

For more details, see [references/git-hooks.md](references/git-hooks.md).

## Debugging

### WebStorm Configuration
1. Using docs as dev environment with `-o` (lazy reload) and `-d` (developer mode)
2. Debugging all tests
3. Debugging specific package tests

### VS Code Configuration
Add to `.vscode/launch.json`:
```json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Dev Docs",
      "cwd": "${workspaceFolder}/docs",
      "program": "${workspaceFolder}/packages/cli/index.js",
      "args": ["serve", "-o", "-d"]
    }
  ]
}
```

## Linting

### Manual Linting
```bash
# Lint all files
npm run lint

# Auto-fix issues
npm run lintfix

# Lint specific file
eslint path/to/file.js
```

### IDE Integration
Install ESLint extensions in WebStorm or VS Code for real-time feedback and auto-fix on save.

## Common Issues

### Frontend components not working
Run `markbind serve -d` or `npm run build:web` to view latest frontend changes.

### TypeScript compilation errors
Ensure automatic compilation is running or manually run `npm run build:backend`.

### Test failures after pulling updates
Run `npm run setup` to ensure dependencies are up to date.

### Merge conflicts in expected test files
1. Sync fork with upstream
2. Merge master into PR branch
3. Accept all changes to expected test files (they'll be regenerated)
4. Run `npm run updatetest`
