# Creating the "Adapt" Commit

This commit fixes TypeScript errors and converts syntax. The files are already renamed, now make them valid TypeScript.

## Step 1: Start Auto-Compilation

Enable TypeScript compilation to see errors in real-time:

```bash
# In project root
npm run dev
```

This starts the TypeScript compiler in watch mode. You'll see errors immediately:

```
packages/core/src/html/NodeProcessor.ts(5,10): error TS2304: Cannot find name 'require'.
packages/core/src/Page/index.ts(15,1): error TS2304: Cannot find name 'module'.
```

**Keep this running** in a terminal while you work.

## Step 2: Convert Import/Export Syntax

The main work of adaptation. See [import-export-syntax.md](import-export-syntax.md) for complete guide.

### Quick Syntax Conversion

**Exports**:
```javascript
// Before (CommonJS)
module.exports = MyClass;
module.exports = { a, b, c };

// After (TypeScript equivalent - for single export)
export = MyClass;

// After (ES6 - for multiple exports)
export { a, b, c };
```

**Imports**:
```javascript
// Before (CommonJS)
const MyClass = require('./MyClass');
const { a, b } = require('./utils');

// After (match the export style)
import MyClass = require('./MyClass');  // If using export =
import { a, b } from './utils';        // If using export { }
```

### Conversion Process

1. **Start with exports** in each file
2. **Convert imports** to match export style
3. **Update files that import these files**
4. **Verify compilation** after each file

### Common Patterns

**Pattern 1: Single class export**
```typescript
// MyClass.ts
class MyClass {
  constructor() { }
  method() { }
}

export = MyClass;
```

**Pattern 2: Multiple exports**
```typescript
// utils.ts
export function helperA() { }
export function helperB() { }
export const CONSTANT = 'value';
```

**Pattern 3: Type exports**
```typescript
// types.ts
export interface MyType {
  id: string;
  name: string;
}

export type Status = 'pending' | 'complete';
```

## Step 3: Fix TypeScript Errors

### Add Type Annotations

**Function parameters**:
```typescript
// Before
function process(data, options) {
  return data.map(item => item.value);
}

// After
function process(data: DataItem[], options: ProcessOptions): string[] {
  return data.map(item => item.value);
}
```

**Variables**:
```typescript
// Explicit type (when needed)
const config: Config = { port: 3000 };

// Type inference (preferred when obvious)
const port = 3000;  // inferred as number
```

**Class properties**:
```typescript
class MyClass {
  // Before (JavaScript)
  constructor() {
    this.name = '';
    this.count = 0;
  }
  
  // After (TypeScript)
  name: string;
  count: number;
  
  constructor() {
    this.name = '';
    this.count = 0;
  }
}
```

### Handle Missing Types

**For internal dependencies still in .js**:
```typescript
// Stand-in type until dependency is migrated
interface TemporaryPageType {
  content: string;
  title: string;
  // TODO: Replace when Page is migrated to TypeScript
}

// Use the stand-in
const page = require('./Page') as TemporaryPageType;
```

**For properties on objects**:
```typescript
// Before (JavaScript)
const obj = {};
obj.newProp = 'value';

// After (TypeScript) - Option 1: Interface
interface MyObject {
  newProp?: string;
}
const obj: MyObject = {};
obj.newProp = 'value';

// Option 2: Index signature
const obj: { [key: string]: string } = {};
obj.newProp = 'value';
```

### Avoid `any` Type

**❌ Bad**:
```typescript
function process(data: any): any {
  return data.value;
}
```

**✅ Better**:
```typescript
function process(data: { value: string }): string {
  return data.value;
}
```

**✅ Best** (with proper interface):
```typescript
interface DataItem {
  value: string;
  id: number;
}

function process(data: DataItem): string {
  return data.value;
}
```

**When `any` is acceptable**:
- External library with no types
- Complex dynamic behavior
- Temporary during migration

**If using `any`, document why**:
```typescript
// TODO: Type this properly after cheerio types are fixed
function parseHtml(html: string): any {
  return cheerio.load(html);
}
```

## Step 4: Update Dependent Files

Files that import your migrated files need updates.

### Find Dependent Files

```bash
# Find files importing yours
grep -r "require('./NodeProcessor')" packages/core/src/
grep -r "from './NodeProcessor'" packages/core/src/
```

### Update Imports

**If dependent is TypeScript**:
```typescript
// Update to match your export style
import NodeProcessor = require('./NodeProcessor');
// or
import { NodeProcessor } from './NodeProcessor';
```

**If dependent is still JavaScript**:
- No changes needed (compiled .js will work)
- Add to your TODO list for future migration

### Update Type References

**If you created better types**:
```typescript
// Before (in dependent file)
interface TempNodeType {
  name: string;
  // ... stand-in definition
}

// After (now that Node is migrated)
import { Node } from './Node';  // Use real type
```

## Step 5: Restore Stashed Changes

Remember the package.json changes from preparation?

```bash
# Check what's stashed
git stash list

# Restore the stash
git stash pop
```

This brings back:
- `packages/core/package.json` (with new @types/* packages)
- Root `package-lock.json` (with updated dependencies)

## Step 6: Run Tests

### Full Test Suite

```bash
# From project root
npm run test
```

This runs:
- ESLint (should pass now)
- Jest unit tests for core (tests .ts files directly)
- Jest unit tests for cli (tests compiled .js files)
- Functional tests (builds test sites)

**All must pass.**

### If Tests Fail

**Compilation errors**:
```bash
# Check TypeScript errors
npm run build:backend
```
Fix errors and retry.

**Unit test failures**:
```bash
# Run specific package tests
cd packages/core && npm run test
cd packages/cli && npm run test
```

**Common causes**:
- Import/export mismatch
- Missing type definitions
- Changed behavior (unintended)

### Verify Compilation Output

```bash
# Check compiled JavaScript exists
ls packages/core/src/html/NodeProcessor.js

# Verify it works
node packages/core/src/html/NodeProcessor.js
```

## Step 7: Final Review

### Check for Mistakes

**No `any` types** (or justified):
```bash
grep -n "any" packages/core/src/html/*.ts
```

**Import/export consistency**:
- All imports match their module's export style
- No mixing of `require` and `import from`

**Stand-in types documented**:
```bash
grep -n "TODO.*TypeScript" packages/core/src/html/*.ts
```

**Files compile**:
```bash
npm run build:backend
# Should succeed with no errors
```

### Compare Git Diff

```bash
git diff packages/core/src/html/NodeProcessor.ts
```

**Expected changes**:
- `require` → `import` 
- `module.exports` → `export`
- Type annotations added
- Interfaces defined

**Unexpected changes** (investigate):
- Logic changes
- Behavior modifications
- Deleted code

## Step 8: Commit

### Stage Changes

```bash
git add packages/core/src/
git add packages/core/package.json
git add package-lock.json
```

### Commit Message

```bash
git commit -m "Adapt [component/directory] to TypeScript"
```

**Examples**:
```bash
git commit -m "Adapt core/src/html to TypeScript"
git commit -m "Adapt NodeProcessor to TypeScript"
git commit -m "Adapt core/src/Page to TypeScript"
```

### Verify Commit

```bash
git log -1 --stat
```

**Should show**:
- Modified `.ts` files (with line changes)
- Modified `package.json` (if types added)
- Modified `package-lock.json` (if types added)

## Adapt Commit Checklist

- [ ] Auto-compilation started
- [ ] Import/export syntax converted
- [ ] TypeScript errors fixed
- [ ] No (or justified) `any` types
- [ ] Dependent files updated
- [ ] Stashed changes restored
- [ ] All tests pass (core and cli)
- [ ] Code review completed
- [ ] Changes committed

## What's in This Commit?

**Included**:
- ✅ Modified `.ts` files (syntax and types)
- ✅ Modified `package.json` (if types added)
- ✅ Modified `package-lock.json` (if types added)
- ✅ Type annotations and interfaces
- ✅ Import/export syntax changes

**Not included**:
- ❌ File renames (in previous commit)
- ❌ Ignore list changes (in previous commit)
- ❌ Logic changes (separate PR if needed)

## Next Steps

Your migration is complete! You now have:
1. ✅ "Rename" commit preserving history
2. ✅ "Adapt" commit with TypeScript

**Next**: Create PR with rebase-merge request.

## Common Adapt Issues

### Issue 1: Import/Export Mismatch

**Symptom**: `Cannot find module` errors

**Solution**: Ensure import syntax matches export syntax:
```typescript
// If file exports with: export = X
import X = require('./file');  // Not: import X from './file'
```

### Issue 2: Tests Pass Locally, Fail in CI

**Symptom**: CI fails but local passes

**Solution**:
```bash
# Clean and rebuild
npm run clean
npm run setup
npm run test
```

### Issue 3: Compiled JS Not Generated

**Symptom**: CLI tests fail, can't find compiled files

**Solution**:
```bash
npm run build:backend
# Check output
ls packages/core/src/html/NodeProcessor.js
```

### Issue 4: Type Errors in Test Files

**Symptom**: Test files show type errors

**Solution**: Test files can remain JavaScript (migrate later), but if type errors prevent compilation:
```typescript
// In test file
const NodeProcessor = require('../NodeProcessor');  // Keep as require
```

## Quick Reference

```bash
# Full adapt workflow
npm run dev  # Terminal 1: watch compilation
# ... edit files, fix errors ...
git stash pop  # Restore package.json
npm run test  # Verify everything works
git add packages/core/src/ packages/core/package.json package-lock.json
git commit -m "Adapt core/src/html to TypeScript"
```
