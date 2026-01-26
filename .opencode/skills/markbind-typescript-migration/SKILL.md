---
name: markbind-typescript-migration
description: Complete guide for migrating JavaScript files to TypeScript in the MarkBind project, including the two-commit strategy, import/export syntax conversion, and best practices. Use when migrating .js files to .ts in MarkBind's core package, preparing TypeScript migration pull requests, or understanding the Rename+Adapt commit workflow required for preserving git history.
---

# TypeScript Migration for MarkBind

MarkBind is progressively migrating backend code from JavaScript to TypeScript. This skill provides a complete guide for performing migrations that preserve git file history.

## Critical Requirements

**Two-Commit Strategy Required**: TypeScript migrations MUST use two separate commits:
1. **"Rename" commit** - Rename `.js` to `.ts` only
2. **"Adapt" commit** - Fix TypeScript errors and convert syntax

**Why**: Preserves git file history by keeping similarity index above 50%.

**PR Merge Strategy**: Use **rebase-merge** (not squash-merge) to keep both commits in target branch.

## Quick Start Checklist

Before starting migration:
- [ ] Identify files to migrate (directory or specific files)
- [ ] Stop auto-compilation (`npm run dev` or IDE)
- [ ] Install required `@types/*` packages
- [ ] Understand the two-commit workflow

## Migration Workflow Overview

### Phase 1: Preparation
1. Install type definitions for external dependencies
2. Stash package.json changes
3. Stop auto-compilation

### Phase 2: "Rename" Commit
1. Add compiled `.js` paths to `.gitignore` and `.eslintignore`
2. Rename `.js` files to `.ts`
3. Verify files show as "renamed" in git status
4. Commit with `--no-verify` (code doesn't compile yet)

### Phase 3: "Adapt" Commit
1. Start auto-compilation (`npm run dev`)
2. Convert import/export syntax
3. Fix TypeScript errors
4. Update dependent files
5. Run tests
6. Commit normally

## When to Migrate

### Good Candidates
- Files with complex logic that benefit from types
- Files with many internal dependencies
- Core processing files (NodeProcessor, VariableProcessor, etc.)
- Files that are actively maintained

### Avoid Migrating
- Files scheduled for deletion/major refactor
- External patches (keep matching upstream)
- Files with minimal logic
- Test files (can migrate later)

## Detailed Step-by-Step Guide

For complete instructions with examples and troubleshooting, see:

### Planning and Preparation
- [references/preparation.md](references/preparation.md) - Installing types, planning migration scope

### Rename Commit
- [references/rename-commit.md](references/rename-commit.md) - Creating the first commit with file renames

### Adapt Commit  
- [references/adapt-commit.md](references/adapt-commit.md) - Fixing TypeScript errors and converting syntax

### Import/Export Syntax
- [references/import-export-syntax.md](references/import-export-syntax.md) - Converting CommonJS to TypeScript/ES6

### Troubleshooting
- [references/troubleshooting.md](references/troubleshooting.md) - Common issues and solutions

## Import/Export Quick Reference

### Exports

| CommonJS | TypeScript Equivalent | ES6 |
|---|---|---|
| `module.exports = X` | `export = X` | ❌ `export default` (don't use) |
| `module.exports = { a, b }` | `export = { a, b }` | ✅ `export { a, b }` |

### Imports

| CommonJS | TypeScript Equivalent | ES6 |
|---|---|---|
| `const X = require('a')` | `import X = require('a')` | `import X from 'a'` |
| `const { a, b } = require('x')` | Import whole object | `import { a, b } from 'x'` |

**Rule**: Match import syntax with export syntax.

## Common Mistakes to Avoid

### ❌ Don't
- Combine rename and adapt in one commit
- Use `export default` during migration
- Skip type definitions installation
- Forget to add compiled files to ignore lists
- Use `any` type without justification
- Push "Rename" commit without `--no-verify`

### ✅ Do
- Separate rename from adapt commits
- Install `@types/*` packages before starting
- Verify files show as "renamed" in git status
- Document stand-in types with TODOs
- Test thoroughly before committing
- Use rebase-merge for PR

## Testing Your Migration

### Before Committing "Adapt"

```bash
# Full test suite
npm run test

# Core package only
cd packages/core && npm run test

# CLI package (uses compiled core)
cd packages/cli && npm run test
```

**Both must pass**: Core tests verify `.ts` compilation, CLI tests verify compiled `.js` output.

### What to Verify
- [ ] No TypeScript compilation errors
- [ ] All tests pass (core and cli)
- [ ] No `any` types (or justified with comments)
- [ ] Import/export syntax is consistent
- [ ] Dependent files are updated
- [ ] Stand-in types documented with TODOs

## PR Submission

### PR Title
```
Migrate [component/directory] to TypeScript
```

### PR Description Template
```markdown
## What
Migrates `packages/core/src/[component]` from JavaScript to TypeScript.

## Changes
- Renamed X files from .js to .ts
- Added type annotations
- Installed @types/[library] (if applicable)
- Updated dependent files: [list files]

## Testing
- [ ] Core tests pass
- [ ] CLI tests pass
- [ ] No new `any` types

## Notes
[Any stand-in types or temporary solutions]
```

### Important
- Ensure PR has exactly 2 commits: "Rename" and "Adapt"
- Request rebase-merge in PR description
- Link to this migration guide if needed

## Example Migrations

Reference these PRs for migration patterns:
- [#1877: Adopt TypeScript for core package](https://github.com/MarkBind/markbind/pull/1877)

## Post-Migration

After your migration is merged:

### Update Stand-in Types
If you created stand-in types for dependencies still in JavaScript:
- File issues to migrate those dependencies
- Update types when dependencies are migrated
- Remove TODOs

### Update Documentation
If you migrated a major component:
- Update architecture docs if needed
- Note TypeScript-specific patterns
- Document any type utilities created

## Quick Tips

### Finding Files to Migrate
```bash
# Find all .js files in core package
find packages/core/src -name "*.js" -type f

# Count .js vs .ts files
find packages/core/src -name "*.js" | wc -l
find packages/core/src -name "*.ts" | wc -l
```

### Checking Git Similarity
```bash
# After rename, before commit
git diff --cached --stat

# Should show "renamed" not "deleted/added"
```

### Batch Renaming
```bash
# Rename all .js files in a directory
find packages/core/src/html -name "*.js" -exec bash -c 'mv "$0" "${0%.js}.ts"' {} \;
```

## Getting Help

### If Stuck
1. Read the detailed guides in `references/`
2. Check example PR #1877
3. Search for similar migrations in git history
4. Ask in PR comments with specific error messages

### Common Questions
- "Do I need to migrate tests?" - No, focus on source files
- "What about external patches?" - Keep as JavaScript to match upstream
- "Can I migrate multiple directories?" - Yes, but keep PRs focused
- "Should I fix bugs while migrating?" - No, separate concerns

## Configuration

TypeScript configuration is in root `tsconfig.json`. Don't modify without team discussion.

Current settings:
- Target: ES2020
- Module: CommonJS
- Strict: true
- Output: In-place compilation

## Success Criteria

A successful migration:
- ✅ Two commits: "Rename" and "Adapt"
- ✅ Files show as renamed in first commit
- ✅ All tests pass
- ✅ No `any` types (or justified)
- ✅ Import/export syntax consistent
- ✅ Dependent files updated
- ✅ Stand-in types documented

Your migration is ready when you can confidently say: "This TypeScript code provides better type safety without changing runtime behavior."
