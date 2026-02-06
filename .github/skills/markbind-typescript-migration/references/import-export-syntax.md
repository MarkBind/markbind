# Import/Export Syntax Conversion

Converting from CommonJS (`require`/`module.exports`) to TypeScript/ES6 syntax.

## Core Principle

**Match import syntax with export syntax**. TypeScript supports two styles:

1. **TypeScript equivalent** (`export =` / `import = require()`)
2. **ES6** (`export { }` / `import { } from`)

**Never mix styles** - causes compilation errors.

## Export Syntax

### Exporting Single Thing

**CommonJS**:
```javascript
class MyClass { }
module.exports = MyClass;
```

**TypeScript Equivalent** (Recommended for compatibility):
```typescript
class MyClass { }
export = MyClass;
```

**ES6** (❌ Don't use during migration):
```typescript
class MyClass { }
export default MyClass;  // AVOID - breaks JS imports
```

**Why avoid `export default`**: Compiled differently, breaks imports from files still in JavaScript.

### Exporting Multiple Things

**CommonJS**:
```javascript
function foo() { }
function bar() { }
module.exports = { foo, bar };
```

**TypeScript Equivalent**:
```typescript
function foo() { }
function bar() { }
export = { foo, bar };
```

**ES6** (Preferred):
```typescript
export function foo() { }
export function bar() { }
// or
function foo() { }
function bar() { }
export { foo, bar };
```

**When to use ES6**: When exporting multiple things that shouldn't be wrapped in an object.

## Import Syntax

### Importing Single Thing

**Match the export style**:

**If module uses `export =`**:
```typescript
// MyClass.ts uses: export = MyClass
import MyClass = require('./MyClass');
```

**If module uses `export default`**:
```typescript
// MyClass.ts uses: export default MyClass
import MyClass from './MyClass';
```

**Common mistake**:
```typescript
// MyClass.ts uses: export = MyClass
import MyClass from './MyClass';  // ❌ WRONG - won't work
```

### Importing Multiple Things

**If module uses `export = { a, b }`**:
```typescript
// utils.ts uses: export = { foo, bar }
import utils = require('./utils');
const { foo, bar } = utils;

// or import whole object
import utils = require('./utils');
utils.foo();
```

**If module uses `export { a, b }`**:
```typescript
// utils.ts uses: export { foo, bar }
import { foo, bar } from './utils';

// or import everything
import * as utils from './utils';
utils.foo();
```

## Decision Tree

### Choosing Export Style for Your File

```
How many things to export?
├─ One thing only
│  └─ Use: export = X
│     (TypeScript equivalent)
│
└─ Multiple things
   ├─ Related utilities/functions?
   │  └─ Use: export { a, b, c }
   │     (ES6)
   │
   └─ Should be wrapped in object?
      └─ Use: export = { a, b, c }
         (TypeScript equivalent)
```

### Updating Existing Imports

When you migrate a file, other TypeScript files that import it may need updates:

**Before migration** (dependency was .js):
```typescript
// YourFile.ts importing from dependency.js
const Dep = require('./dependency');
```

**After migration** (dependency is now .ts with `export =`):
```typescript
// YourFile.ts importing from dependency.ts
import Dep = require('./dependency');  // Update to match export style
```

## Complete Examples

### Example 1: Class Export

**File: NodeProcessor.ts**
```typescript
class NodeProcessor {
  constructor(config: Config) { }
  process(node: Node): void { }
}

// Export single class
export = NodeProcessor;
```

**File: Site.ts** (imports NodeProcessor)
```typescript
// Import matches export style
import NodeProcessor = require('./html/NodeProcessor');

class Site {
  processor: NodeProcessor;
  
  constructor() {
    this.processor = new NodeProcessor(config);
  }
}

export = Site;
```

### Example 2: Utility Functions

**File: utils.ts**
```typescript
// Export multiple functions
export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-');
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const CONSTANT = 'value';
```

**File: Page.ts** (imports utils)
```typescript
// Import specific functions
import { slugify, capitalize } from './utils';

class Page {
  generateSlug(title: string): string {
    return slugify(title);
  }
}

export = Page;
```

### Example 3: Mixed Exports

**File: Plugin.ts**
```typescript
// Main class
class Plugin {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

// Helper functions
function loadPlugins(): Plugin[] {
  return [];
}

// Export main as default, helpers as named
export = Plugin;
export { loadPlugins };  // ❌ Can't do this - choose one style!
```

**Correct approach**:
```typescript
class Plugin {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

function loadPlugins(): Plugin[] {
  return [];
}

// Option 1: ES6 style
export { Plugin, loadPlugins };
export { Plugin as default };  // If you need default

// Option 2: TypeScript equivalent style
export = {
  Plugin,
  loadPlugins
};
```

## Type-Only Imports

Import types without importing values:

```typescript
// Import only the type (zero runtime cost)
import type { MyType } from './types';

// Use in type annotation
const data: MyType = { };

// Can't use as value
const instance = new MyType();  // ❌ Error
```

**When to use**:
- Importing only types/interfaces
- Avoiding circular dependencies
- Reducing bundle size

## External Library Imports

### Libraries with Types

**Built-in types**:
```typescript
import cheerio from 'cheerio';  // Types bundled
```

**Separate @types package**:
```typescript
import lodash from 'lodash';  // Uses @types/lodash
```

### Libraries without Types

**Create declaration file** (`declarations.d.ts` in same directory):
```typescript
declare module 'old-library' {
  export function doSomething(x: string): void;
}
```

**Then import**:
```typescript
import { doSomething } from 'old-library';
```

## Common Patterns in MarkBind

### Pattern 1: Core Class

```typescript
// NodeProcessor.ts
class NodeProcessor {
  // ... implementation
}
export = NodeProcessor;

// Import in other files
import NodeProcessor = require('./NodeProcessor');
```

### Pattern 2: Utilities

```typescript
// urlUtils.ts
export function resolveUrl(base: string, rel: string): string { }
export function isAbsolute(url: string): boolean { }

// Import in other files
import { resolveUrl, isAbsolute } from './urlUtils';
```

### Pattern 3: Constants and Types

```typescript
// constants.ts
export const DEFAULT_PORT = 8080;
export const TEMPLATE_DIR = '_markbind/layouts';

export interface Config {
  port: number;
  baseUrl: string;
}

// Import in other files
import { DEFAULT_PORT, Config } from './constants';
```

### Pattern 4: Plugin Interface

```typescript
// Plugin.ts
export interface PluginContext {
  config: any;
}

export interface PluginInterface {
  processNode?(context: PluginContext, node: Node): void;
  postRender?(context: PluginContext, content: string): string;
}

// Import in other files
import { PluginInterface, PluginContext } from './Plugin';
```

## Syntax Conversion Cheat Sheet

| Scenario | CommonJS | TypeScript Equivalent | ES6 |
|---|---|---|---|
| **Export single class** | `module.exports = C` | `export = C` | ~~`export default C`~~ |
| **Export multiple** | `module.exports = {a,b}` | `export = {a,b}` | `export {a,b}` |
| **Import single** | `const C = require('x')` | `import C = require('x')` | `import C from 'x'` |
| **Import multiple** | `const {a,b} = require('x')` | Import whole object | `import {a,b} from 'x'` |
| **Import all** | `const x = require('x')` | `import x = require('x')` | `import * as x from 'x'` |

## Checking Your Syntax

### Verify Compilation

```bash
npm run build:backend
```

**If success**: Syntax is correct.
**If errors**: Check import/export mismatch.

### Common Errors

**Error: `Cannot find module`**
```typescript
// File uses: export = X
import X from './file';  // ❌ Wrong
import X = require('./file');  // ✅ Correct
```

**Error: `X is not a function`**
```typescript
// File uses: export { foo }
import utils = require('./utils');
utils.foo();  // ❌ Wrong - utils is not an object

import { foo } from './utils';  // ✅ Correct
foo();
```

**Error: `Module has no default export`**
```typescript
// File uses: export { a, b }
import utils from './utils';  // ❌ Wrong - no default

import { a, b } from './utils';  // ✅ Correct
```

## Best Practices

### ✅ Do

- Match import syntax with export syntax
- Use TypeScript equivalent (`export =`) for single exports
- Use ES6 (`export { }`) for multiple exports
- Be consistent within a file
- Update all imports when changing export style

### ❌ Don't

- Use `export default` during migration
- Mix `export =` and `export { }` in same file
- Leave mismatched imports after changing exports
- Use different styles for similar files

## Quick Reference

**When migrating a file**:
1. Decide export style (one thing = `export =`, multiple = `export { }`)
2. Convert exports
3. Update imports in this file to match external exports
4. Update imports in other files that import this file
5. Verify compilation

**If unsure**: Use TypeScript equivalent style (`export =` / `import = require()`) - more compatible during migration.
