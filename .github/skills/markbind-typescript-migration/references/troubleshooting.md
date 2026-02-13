# TypeScript Migration Troubleshooting

Common issues and solutions when migrating JavaScript files to TypeScript in MarkBind.

## Git Similarity Index Issues

### Problem: Git doesn't detect file renames
If `git diff --staged --stat` shows deletions and additions instead of renames:

```
src/old.js    | 200 -------------------------
src/old.ts    | 200 +++++++++++++++++++++++++
```

### Solutions

1. **Check similarity threshold**: Git requires >50% similarity by default
   ```bash
   # Lower threshold temporarily
   git config diff.renames true
   git config diff.renameLimit 999999
   ```

2. **Verify file is unchanged**: Make sure you ONLY renamed, no content changes
   ```bash
   # Compare contents (ignore extension)
   diff src/old.js src/old.ts
   ```

3. **Split into smaller commits**: If file is too large, Git may fail detection
   ```bash
   # Commit smaller batches of renames
   git add src/component1.ts
   git commit -m "Rename component1.js to .ts"
   git add src/component2.ts
   git commit -m "Rename component2.js to .ts"
   ```

4. **Use git mv**: Explicitly tell Git about the rename
   ```bash
   git mv src/old.js src/old.ts
   # Make no changes to content yet!
   git commit -m "Rename old.js to .ts"
   ```

## Import/Export Mismatch Errors

### Problem: "Cannot find module" or "has no default export"

```typescript
// Error: Module '"./foo"' has no default export
import foo from './foo';
```

### Solutions

1. **Check what the module actually exports**:
   ```bash
   # Look at the source file
   grep -E "module.exports|export" src/foo.ts
   ```

2. **Match import style to export style**:
   ```typescript
   // If source has: module.exports = { foo, bar }
   import * as fooModule from './foo';
   const { foo, bar } = fooModule;
   
   // If source has: module.exports.foo = ...
   import * as fooModule from './foo';
   const foo = fooModule.foo;
   
   // If source has: export default foo
   import foo from './foo';
   
   // If source has: export { foo, bar }
   import { foo, bar } from './foo';
   ```

3. **Add type assertion for problematic imports**:
   ```typescript
   // Temporary workaround
   const foo = require('./foo') as any;
   ```

## TypeScript Compilation Errors

### Problem: "Property does not exist on type"

```typescript
// Error: Property 'customField' does not exist on type 'Node'
node.customField = value;
```

### Solutions

1. **Add type assertion**:
   ```typescript
   (node as any).customField = value;
   ```

2. **Define interface extension** (better, but more work):
   ```typescript
   interface ExtendedNode extends Node {
     customField?: string;
   }
   const extNode = node as ExtendedNode;
   extNode.customField = value;
   ```

3. **Use index signature**:
   ```typescript
   interface NodeWithDynamicProps extends Node {
     [key: string]: any;
   }
   ```

### Problem: "Type 'X' is not assignable to type 'Y'"

```typescript
// Error: Type 'string | undefined' is not assignable to type 'string'
const name: string = obj.name;
```

### Solutions

1. **Use optional chaining and nullish coalescing**:
   ```typescript
   const name: string = obj.name ?? 'default';
   ```

2. **Add type guard**:
   ```typescript
   if (obj.name !== undefined) {
     const name: string = obj.name;
   }
   ```

3. **Use non-null assertion** (only if you're certain):
   ```typescript
   const name: string = obj.name!;
   ```

### Problem: "Cannot redeclare block-scoped variable"

```typescript
// Error in test files
const foo = require('./foo');
const foo = require('./foo'); // Different test
```

### Solution: Use different variable names or scoping

```typescript
// Option 1: Different names
const fooModule1 = require('./foo');
const fooModule2 = require('./foo');

// Option 2: Block scope
{
  const foo = require('./foo');
  // use foo
}
{
  const foo = require('./foo');
  // use foo again
}
```

## Test Failures After Migration

### Problem: Functional tests fail with import errors

```
Error: Cannot use import statement outside a module
```

### Solutions

1. **Check jest.config.js transform settings**:
   ```javascript
   module.exports = {
     transform: {
       '^.+\\.ts$': 'ts-jest',
       '^.+\\.js$': 'babel-jest',
     },
   };
   ```

2. **Verify tsconfig.json includes test files**:
   ```json
   {
     "include": ["src/**/*", "test/**/*"]
   }
   ```

3. **Check for mixed import styles in tests**:
   ```typescript
   // Don't mix CommonJS and ES6 in same file
   const foo = require('./foo'); // CommonJS
   import bar from './bar';       // ES6
   
   // Pick one style per file
   ```

### Problem: Snapshot tests fail after migration

### Solutions

1. **Update snapshots if only formatting changed**:
   ```bash
   npm run test -- -u
   ```

2. **Review snapshot diffs carefully**:
   ```bash
   git diff test/__snapshots__/
   ```

3. **If snapshots show real behavior changes, investigate**:
   - Check if TypeScript strict mode caught real bugs
   - Verify import/export conversions are correct
   - Look for accidental changes during rename/adapt

## Pre-commit Hook Failures

### Problem: Linting fails on migrated files

```
Error: Parsing error: "parserOptions.project" has been set for @typescript-eslint/parser
```

### Solutions

1. **Check .eslintrc.js includes TS files**:
   ```javascript
   module.exports = {
     overrides: [{
       files: ['*.ts'],
       parserOptions: {
         project: './tsconfig.json',
       },
     }],
   };
   ```

2. **Verify tsconfig.json includes the file**:
   ```json
   {
     "include": ["src/**/*", "packages/**/*"]
   }
   ```

3. **Temporarily disable for problematic files** (last resort):
   ```typescript
   /* eslint-disable */
   // problematic code
   /* eslint-enable */
   ```

### Problem: Prettier reformats migrated files

### Solution: This is expected, let it happen

```bash
# Prettier will auto-format on pre-commit
# Just re-stage the changes
git add .
git commit -m "Adapt foo.ts to TypeScript"
```

## CI/Build Failures

### Problem: GitHub Actions fails with "Cannot find module"

### Solutions

1. **Check package.json has all type definitions**:
   ```bash
   npm run build
   # If it fails locally, CI will fail too
   ```

2. **Verify TypeScript version matches CI**:
   ```bash
   # Check .github/workflows/*.yml
   # Ensure Node version and npm version match
   ```

3. **Check for missing dependencies**:
   ```bash
   npm ci
   npm run build
   ```

## Debugging Strategy

When migration issues occur, follow this systematic approach:

1. **Isolate the problem**:
   ```bash
   # Does it compile?
   npx tsc --noEmit
   
   # Does it lint?
   npm run lint
   
   # Do tests pass?
   npm run test
   ```

2. **Check the commit history**:
   ```bash
   # Did you truly only rename in the Rename commit?
   git show <rename-commit-sha>
   
   # Are there unexpected changes?
   git diff <rename-commit-sha>^..<rename-commit-sha> --stat
   ```

3. **Compare with original**:
   ```bash
   # Check out the original file
   git show HEAD^:src/old.js > /tmp/original.js
   
   # Compare logic (ignoring TS types)
   diff -u /tmp/original.js src/old.ts
   ```

4. **Test in isolation**:
   ```bash
   # Create minimal reproduction
   # Test just the migrated file
   npm run test -- --testPathPattern=migrated-file
   ```

5. **Revert if necessary**:
   ```bash
   # If you're stuck, revert and try again
   git revert HEAD
   # Or reset if not pushed yet
   git reset --hard HEAD^
   ```

## Common Anti-patterns

### Don't: Mix changes in Rename commit

```bash
# BAD: Changed import style during rename
git show
-const foo = require('./bar');
+import foo from './bar';
```

**Fix**: Revert, rename only, then adapt imports in separate commit.

### Don't: Use `any` everywhere to silence errors

```typescript
// BAD: Defeats purpose of TypeScript
const result: any = await someFunction();
const data: any = result.data;
return data as any;
```

**Fix**: Add proper types incrementally, use `unknown` if truly uncertain.

### Don't: Change behavior during migration

```typescript
// BAD: "Fixed" a bug while migrating
-if (value == null) {  // Original used ==
+if (value === null) { // Changed to strict equality
```

**Fix**: Migrate syntax only. File bugs separately, fix in later commits.

### Don't: Commit without running tests

```bash
# BAD: Skipping verification
git commit -m "Migrate to TypeScript" --no-verify
```

**Fix**: Always run full test suite before committing.

## Getting Help

If you're stuck after trying these solutions:

1. **Check similar migrations**: Look at other TypeScript migration commits in the repo
   ```bash
   git log --all --grep="TypeScript" --grep="Migrate" --oneline
   ```

2. **Review the dev guide**: Check `docs/devGuide/development/techStack.md` for TypeScript configuration

3. **Ask maintainers**: File an issue with:
   - File being migrated
   - Error message (full stack trace)
   - What you've tried already
   - Minimal reproduction if possible
