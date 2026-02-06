# Creating the "Rename" Commit

This commit renames `.js` files to `.ts` without changing content. Goal: Preserve git file history.

## Step 1: Update Ignore Lists

Add compiled JavaScript paths to both `.gitignore` and `.eslintignore`.

### Understanding Why

When you rename `File.ts`, TypeScript compiles to `File.js`. We need git and ESLint to ignore the compiled output.

### Adding to .gitignore

Edit `.gitignore` in project root:

```gitignore
# Before migration (example)
packages/core/dist/
*.log

# Add your files
packages/core/src/html/NodeProcessor.js
packages/core/src/html/HtmlProcessor.js
packages/core/src/Page/index.js

# Or use patterns for directories
packages/core/src/html/*.js
packages/core/src/Page/*.js
```

**Pattern tips**:
- Specific paths for few files: `packages/core/src/File.js`
- Patterns for directories: `packages/core/src/html/*.js`
- Avoid too broad patterns: Don't use `**/*.js` (would ignore everything)

### Adding to .eslintignore

Edit `.eslintignore` in project root:

```
# Add same paths as .gitignore
packages/core/src/html/NodeProcessor.js
packages/core/src/html/HtmlProcessor.js
packages/core/src/Page/index.js
```

**Important**: Keep in sync with `.gitignore`.

### Verify Ignore Lists

```bash
# Check what will be ignored
git status --ignored

# Should show your paths in ignored section
```

## Step 2: Rename Files

### Single File

```bash
mv packages/core/src/html/NodeProcessor.js packages/core/src/html/NodeProcessor.ts
```

### Multiple Files in Directory

```bash
# All .js files in a directory
cd packages/core/src/html
for file in *.js; do 
  mv "$file" "${file%.js}.ts"
done
cd ../../../..
```

### Using find (for nested directories)

```bash
# Rename all .js files recursively in html/ directory
find packages/core/src/html -name "*.js" -type f -exec bash -c 'mv "$0" "${0%.js}.ts"' {} \;
```

### Verify Renames

```bash
# Check that .ts files exist
ls packages/core/src/html/*.ts

# Check that .js files are gone (might show compiled ones, that's OK)
ls packages/core/src/html/*.js
```

## Step 3: Stage Changes

### Add Renamed Files

```bash
# Stage all changes
git add .gitignore .eslintignore
git add packages/core/src/
```

### Critical: Verify Git Shows "Renamed"

```bash
git status
```

**You must see**:
```
Changes to be committed:
  modified:   .eslintignore
  modified:   .gitignore
  renamed:    packages/core/src/html/NodeProcessor.js -> packages/core/src/html/NodeProcessor.ts
  renamed:    packages/core/src/html/HtmlProcessor.js -> packages/core/src/html/HtmlProcessor.ts
```

**If you see this instead** (❌ WRONG):
```
  deleted:    packages/core/src/html/NodeProcessor.js
  new file:   packages/core/src/html/NodeProcessor.ts
```

**Problem**: Files changed too much, or git is confused.

**Solution**:
```bash
# Reset and try again
git reset
git add packages/core/src/html/NodeProcessor.ts
git status
# Should now show "renamed"
```

## Step 4: Commit with --no-verify

### Commit Message Format

```bash
git commit --no-verify -m "Rename [component/directory] to TypeScript"
```

**Examples**:
```bash
git commit --no-verify -m "Rename core/src/html to TypeScript"
git commit --no-verify -m "Rename NodeProcessor to TypeScript"
git commit --no-verify -m "Rename core/src/Page to TypeScript"
```

### Why --no-verify?

**Git hooks will fail** because:
- TypeScript files don't compile yet (wrong import/export syntax)
- Pre-commit hook tries to build and lint
- Build fails → Commit blocked

`--no-verify` skips hooks for this commit only.

### Verify Commit

```bash
# Check commit was created
git log -1 --stat

# Should show renames:
# packages/core/src/html/NodeProcessor.js => packages/core/src/html/NodeProcessor.ts | 0
```

The `| 0` means zero lines changed (perfect for rename commit).

## Step 5: Verify Git History Is Preserved

```bash
# Check file history follows the rename
git log --follow packages/core/src/html/NodeProcessor.ts

# Should show history from when it was .js
```

**What you should see**:
- Commits from before the rename
- Full file history
- Blame information intact

## Common Rename Issues

### Issue 1: Git Shows Deleted + Added

**Symptom**:
```
deleted:    File.js
new file:   File.ts
```

**Cause**: Files too different, or content was modified during rename.

**Solution**:
```bash
# Reset
git reset

# Check if file was accidentally modified
diff packages/core/src/File.js packages/core/src/File.ts

# If different, undo changes and rename again
git checkout packages/core/src/File.js
mv packages/core/src/File.js packages/core/src/File.ts
```

### Issue 2: Pre-commit Hook Runs Despite --no-verify

**Symptom**: Hook still runs and fails.

**Cause**: Using `git commit --no-verify` in wrong order.

**Solution**:
```bash
# Correct order
git commit --no-verify -m "Message"

# Not this
git commit -m "Message" --no-verify
```

### Issue 3: Forgot to Update Ignore Lists

**Symptom**: Git wants to stage compiled `.js` files.

**Cause**: Didn't add to `.gitignore` first.

**Solution**:
```bash
# Reset commit
git reset HEAD~1

# Update ignore lists
echo "packages/core/src/html/*.js" >> .gitignore
echo "packages/core/src/html/*.js" >> .eslintignore

# Stage changes again
git add .
git commit --no-verify -m "Rename core/src/html to TypeScript"
```

### Issue 4: Mixed Renamed and Modified

**Symptom**:
```
renamed:    File.js -> File.ts
modified:   File.ts
```

**Cause**: Accidentally edited content after rename.

**Solution**:
```bash
# Reset
git reset

# Restore original
git checkout packages/core/src/File.js
mv packages/core/src/File.js packages/core/src/File.ts

# Stage only the rename
git add packages/core/src/File.ts
```

## Rename Commit Checklist

Before proceeding to adapt commit:

- [ ] `.gitignore` includes compiled `.js` paths
- [ ] `.eslintignore` includes compiled `.js` paths
- [ ] All `.js` files renamed to `.ts`
- [ ] `git status` shows files as "renamed"
- [ ] Commit created with `--no-verify`
- [ ] Commit message follows format
- [ ] `git log --follow` shows preserved history
- [ ] Commit shows `| 0` (zero lines changed)

## What's in This Commit?

**Included**:
- ✅ Modified `.gitignore`
- ✅ Modified `.eslintignore`
- ✅ Renamed files (.js → .ts)

**Not included**:
- ❌ Content changes
- ❌ Import/export syntax changes
- ❌ Type annotations
- ❌ Package.json changes

## Next Steps

Your "Rename" commit is complete. The files are now `.ts` but with JavaScript syntax.

**Next**: Proceed to [adapt-commit.md](adapt-commit.md) to fix TypeScript errors and convert syntax.

## Quick Reference

```bash
# Full rename workflow
echo "path/to/file.js" >> .gitignore
echo "path/to/file.js" >> .eslintignore
mv packages/core/src/File.js packages/core/src/File.ts
git add .
git status  # Verify shows "renamed"
git commit --no-verify -m "Rename File to TypeScript"
git log -1 --stat  # Verify | 0 lines changed
```
