# Preparation for TypeScript Migration

## Planning Your Migration

### Scope Selection

**Directory-based migration** (Recommended):
- Migrate entire logical units (e.g., `packages/core/src/html/`)
- Easier to track and review
- Maintains module cohesion

**File-based migration**:
- Cherry-pick specific files
- Useful for high-value targets
- May require more stand-in types

### Analyzing Dependencies

Before migrating, understand the dependency graph:

```bash
# Find what imports your target files
grep -r "require('./YourFile')" packages/core/src/
grep -r "from './YourFile'" packages/core/src/

# Find what your target files import
grep "require\|import" packages/core/src/path/YourFile.js
```

**Key questions**:
- What internal files will need stand-in types?
- Which TypeScript files already import this?
- Will this migration unblock other migrations?

### Migration Priority

**High Priority**:
1. Core processing logic (NodeProcessor, VariableProcessor)
2. Frequently modified files
3. Files that unblock other migrations
4. Complex logic that benefits from types

**Lower Priority**:
1. External library patches (keep matching upstream)
2. Files scheduled for refactoring
3. Simple utility files
4. Test files

## Installing Type Definitions

### Check if Types Needed

Your migration may need types for external dependencies:

```javascript
// If file imports external libraries:
const cheerio = require('cheerio');
const lodash = require('lodash');
```

### Finding Type Packages

1. **Search TypeScript DefinitelyTyped**:
   - Visit [https://www.typescriptlang.org/dt/search](https://www.typescriptlang.org/dt/search)
   - Search for library name

2. **Check package documentation**:
   - Some packages bundle types (look for `types` or `typings` in package.json)
   - Others have separate `@types/*` packages

### Installing Types

For packages needing `@types/*`:

```bash
# Navigate to core package
cd packages/core

# Install type definitions (example)
npm install -D @types/cheerio
npm install -D @types/lodash

# Delete the local package-lock.json
rm package-lock.json

# Return to root and update lockfile
cd ../..
npm run setup
```

### Version Matching

Match `@types/*` version with base library:

```json
{
  "dependencies": {
    "cheerio": "1.0.0"
  },
  "devDependencies": {
    "@types/cheerio": "1.0.0"  // Match major.minor
  }
}
```

**If exact match unavailable**: Use closest version (prioritize matching major version).

### Verifying Installation

```bash
# Check types are installed
ls node_modules/@types/

# Verify in package.json
cat packages/core/package.json | grep "@types"
```

## Preparing Your Environment

### Stop Auto-Compilation

If running, stop these processes:

**`npm run dev` in root**:
```bash
# Find and kill the process
ps aux | grep "npm run dev"
kill [PID]

# Or just Ctrl+C in the terminal
```

**IDE auto-compilation**:
- WebStorm: Settings → TypeScript → Disable "Recompile on changes"
- VS Code: Disable auto-build tasks

**Why**: Prevent compilation errors during rename phase.

### Stash Package Changes

After installing types, stash the changes:

```bash
git status
# Should show:
# modified: packages/core/package.json
# modified: package-lock.json

git stash push -m "TypeScript migration types"
```

**Why**: These belong in "Adapt" commit, not "Rename" commit.

### Clean Working Directory

```bash
git status
# Should show: "nothing to commit, working tree clean"
```

## Understanding Two-Commit Strategy

### The Problem

Git tracks file history using **similarity index**:
- Above 50% similar → Git shows as "renamed"
- Below 50% similar → Git shows as "deleted" + "added"
- Lost history: blame, log, etc. don't follow renames

**If you rename AND adapt in one commit**:
```javascript
// Before: myFile.js (100 lines)
module.exports = function() { /* ... */ };

// After: myFile.ts (100 lines, much changed)
export function myFunction(): void { /* ... */ }
```
Similarity drops below 50% → History lost.

### The Solution

**Commit 1: Rename Only**
```bash
# Just rename, no content changes
mv myFile.js myFile.ts
git add myFile.ts
# Similarity: 100% → Git tracks rename
```

**Commit 2: Adapt Content**
```typescript
// Now fix TypeScript errors
export function myFunction(): void { /* ... */ }
```

### Why Rebase-Merge?

**Normal PR flow**: Squash merge (single commit in master)
- Great for feature PRs
- Loses the two-commit structure
- History is lost

**TypeScript migration**: Rebase-merge (preserves both commits)
- "Rename" commit enters master
- "Adapt" commit enters master
- History is preserved

**Request in PR**: "Please use rebase-merge for this PR"

## Pre-Migration Checklist

Before starting, verify:

- [ ] **Scope identified**: Know which files to migrate
- [ ] **Dependencies analyzed**: Understand what's imported/exported
- [ ] **Types installed**: All `@types/*` packages added
- [ ] **Changes stashed**: package.json changes saved
- [ ] **Compilation stopped**: No auto-compile running
- [ ] **Clean working directory**: `git status` is clean
- [ ] **Understanding confirmed**: Read two-commit strategy

## Setting Up IDE (Optional but Recommended)

### VS Code

Create `.vscode/settings.json` (if not exists):
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### WebStorm

1. Settings → Languages & Frameworks → TypeScript
2. TypeScript version: Use project's TypeScript
3. Check "Enable TypeScript Compiler"
4. Options: `--noEmitOnError`

## Estimating Migration Time

**Small file** (< 100 lines):
- Preparation: 5 minutes
- Rename commit: 2 minutes
- Adapt commit: 10-20 minutes
- Testing: 5 minutes
- **Total**: ~30 minutes

**Medium directory** (5-10 files, 500 lines):
- Preparation: 10 minutes
- Rename commit: 5 minutes
- Adapt commit: 30-60 minutes
- Testing: 10 minutes
- **Total**: 1-2 hours

**Large directory** (20+ files, 2000+ lines):
- Preparation: 20 minutes
- Rename commit: 10 minutes
- Adapt commit: 2-4 hours
- Testing: 20 minutes
- **Total**: 3-5 hours

**First migration**: Add 50% more time for learning curve.

## Common Preparation Mistakes

### Mistake 1: Skipping Type Installation
```bash
# Migrate without installing @types/cheerio
# Result: TypeScript errors for cheerio usage
```
**Fix**: Install types before starting.

### Mistake 2: Not Stashing Package Changes
```bash
# Include package.json in rename commit
# Result: Confusing commit history
```
**Fix**: Stash and include in adapt commit.

### Mistake 3: Forgetting to Stop Compilation
```bash
# npm run dev still running
# Result: Compiler errors during rename phase
```
**Fix**: Stop all compilation processes.

### Mistake 4: Dirty Working Directory
```bash
# Unrelated changes present
# Result: Messy commits, hard to review
```
**Fix**: Commit or stash unrelated work first.

## Ready to Proceed?

Once preparation is complete:
1. Types are installed and stashed
2. Working directory is clean
3. Compilation is stopped
4. You understand the two-commit strategy

**Next step**: Proceed to [rename-commit.md](rename-commit.md) for creating the "Rename" commit.

## Getting Help

**If unsure about scope**:
- Start with a single small file
- Gain confidence before tackling directories
- Ask in PR for scope review

**If type packages unclear**:
- Check library's npm page for type info
- Search DefinitelyTyped
- Ask in issue/discussion

**If preparation seems complex**:
- It gets easier with practice
- First migration is always slowest
- Follow checklist step-by-step
