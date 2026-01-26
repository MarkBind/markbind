---
name: markbind-component-patterns
description: Implementation patterns for creating MarkBind components and features including Vue components, node transformations, plugins, SSR compatibility, and TypeScript migration. Use when adding new MarkBind components, modifying existing components, implementing features, migrating JavaScript to TypeScript, or ensuring SSR compatibility.
---

# MarkBind Component Patterns

## Component Implementation Approaches

MarkBind provides three main ways to implement components. Choose based on complexity and requirements.

### Approach 1: Node Transformation

**When to Use**:
- Simple modifications to existing HTML
- Adding/modifying attributes
- No complex interactivity needed

**How It Works**:
- Transform nodes directly during HTML processing
- Occurs in `processNode()`, `preProcessNode()`, or `postProcessNode()`
- Attributes automatically converted to HTML attributes

**Example - Adding Line Numbers to Code Blocks**:
```javascript
// In NodeProcessor.ts
processNode(node) {
  if (node.name === 'pre' && node.attribs['line-numbers']) {
    cheerio(node).addClass('line-numbers');
  }
}
```

**Location**: Typically in `packages/core/src/html/NodeProcessor.ts`

### Approach 2: Vue Component

**When to Use**:
- Complex interactivity required
- State management needed
- Wrapping external libraries
- Dynamic content loading

**How It Works**:
- Create `.vue` file in `packages/vue-components/src/`
- Register in `packages/vue-components/src/index.js`
- MarkBind attributes become Vue props (as strings)
- MarkBind slots become Vue named slots

**Example - Panel Component**:
```vue
<!-- packages/vue-components/src/Panel.vue -->
<template>
  <div class="panel" :class="type">
    <div class="panel-header">
      <slot name="header">{{ header }}</slot>
    </div>
    <div class="panel-body" v-show="isExpanded">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Panel',
  props: {
    header: String,
    type: String,
    expanded: String  // MarkBind attributes are always strings
  },
  data() {
    return {
      isExpanded: this.expanded !== undefined
    };
  }
};
</script>
```

**Registration** (`packages/vue-components/src/index.js`):
```javascript
import Panel from './Panel.vue';

export default {
  install(app) {
    app.component('panel', Panel);
  }
};
```

### Approach 3: Plugin

**When to Use**:
- Self-contained feature (e.g., diagram generation)
- Needs custom tag behavior
- Operates on full page content
- Adds external assets

**How It Works**:
- Create plugin file in `packages/core/src/plugins/default/`
- Implement plugin interface methods
- Export plugin configuration

**Example - Tree Component Plugin**:
```javascript
// packages/core/src/plugins/default/markbind-plugin-tree.ts
module.exports = {
  processNode: (pluginContext, node) => {
    if (node.name === 'tree') {
      // Transform node to tree visualization
    }
  },
  
  tagConfig: {
    tree: {
      isSpecial: true  // Content treated as raw text
    }
  }
};
```

**Location**: `packages/core/src/plugins/default/`

For detailed plugin authoring, see MarkBind plugin documentation.

## Vue Component Guidelines

### Props from MarkBind Attributes

All attributes are passed as **string props**:

```html
<!-- MarkBind usage -->
<panel header="Title" expanded type="info">
```

```javascript
// Vue component receives
{
  header: "Title",    // String
  expanded: "",       // Empty string (boolean attribute)
  type: "info"        // String
}
```

**Handling Boolean Attributes**:
```javascript
computed: {
  isExpanded() {
    return this.expanded !== undefined;  // Check presence, not value
  }
}
```

### Slots from MarkBind

Named slots work identically to Vue:

```html
<!-- MarkBind usage -->
<panel>
  <div slot="header">Custom Header</div>
  Default content
</panel>
```

```vue
<!-- Vue component -->
<template>
  <div class="panel-header">
    <slot name="header">{{ header }}</slot>
  </div>
  <div class="panel-body">
    <slot></slot>
  </div>
</template>
```

### Attribute vs Slot Priority

When both attribute and slot provided, **slot should override attribute**.

```javascript
computed: {
  hasHeaderSlot() {
    return !!this.$slots.header;
  }
}
```

```vue
<template>
  <div class="header">
    <slot name="header" v-if="hasHeaderSlot"></slot>
    <span v-else>{{ header }}</span>
  </div>
</template>
```

**Important**: Log a warning when both are provided:
```javascript
mounted() {
  if (this.header && this.$slots.header) {
    console.warn('Both header attribute and slot provided. Using slot.');
  }
}
```

### SSR Compatibility

All Vue components **must be SSR-compatible**. See [references/ssr-patterns.md](references/ssr-patterns.md) for detailed rules.

**Key Requirements**:
- No DOM access in `setup()` or `created()`
- Use `mounted()` for browser-only code
- Consistent initial state between server and client
- Valid HTML structure (no `<div>` in `<p>`)

### Component Testing

Add snapshot tests in `packages/vue-components/src/__tests__/`:

```javascript
import { mount } from '@vue/test-utils';
import Panel from '../Panel.vue';

test('renders panel with header', () => {
  const wrapper = mount(Panel, {
    props: { header: 'Test' },
    slots: { default: 'Content' }
  });
  expect(wrapper.html()).toMatchSnapshot();
});
```

Run `npm run updatetest` after adding tests.

## TypeScript Migration

MarkBind is migrating backend code from JavaScript to TypeScript using a "Rename + Adapt" two-commit strategy.

For complete TypeScript migration guidance, see the dedicated **markbind-typescript-migration** skill, which covers:
- Migration planning and preparation
- Creating the "Rename" commit (preserving git history)
- Creating the "Adapt" commit (fixing TypeScript errors)
- Import/export syntax conversion
- Troubleshooting common issues

This skill focuses on component implementation patterns. Use **markbind-typescript-migration** for the migration process itself.

## Dependency Management

For detailed dependency strategies, see [references/dependency-management.md](references/dependency-management.md).

### Adding a New Dependency

1. Add to appropriate `package.json` in `packages/*`
2. Run `npm run setup` in root directory
3. Document why the dependency is needed

### Updating a Dependency

1. Check changelog for breaking changes
2. Update in `package.json`
3. Run `npm run setup`
4. Update ALL packages using the dependency
5. Run full test suite

### Choosing: Install vs Fork vs Patch

**Install** when:
- Library works as-is
- No custom behavior needed

**Fork** when:
- Need significant changes
- Want to contribute upstream
- Changes benefit broader community

**Patch** when:
- Small, focused changes
- Changes specific to MarkBind
- Want quick iteration

**MarkBind prefers patching** for core dependencies.

## Common Component Patterns

### Pattern 1: Expandable/Collapsible

```vue
<template>
  <div>
    <button @click="toggle">{{ isExpanded ? 'Collapse' : 'Expand' }}</button>
    <div v-show="isExpanded">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { isExpanded: false };
  },
  methods: {
    toggle() {
      this.isExpanded = !this.isExpanded;
    }
  }
};
</script>
```

### Pattern 2: External Content Loading

```vue
<script>
export default {
  data() {
    return {
      content: '',
      loaded: false
    };
  },
  methods: {
    async loadContent() {
      if (!this.loaded) {
        const response = await fetch(this.src);
        this.content = await response.text();
        this.loaded = true;
      }
    }
  }
};
</script>
```

### Pattern 3: Wrapping External Libraries

```vue
<template>
  <ExternalComponent v-bind="$props">
    <slot></slot>
  </ExternalComponent>
</template>

<script>
import ExternalComponent from 'external-library';

export default {
  components: { ExternalComponent },
  props: {
    // Define props that match external component
  }
};
</script>
```

## Testing Patterns

### Unit Tests
Located in `packages/*/test/unit/`

Test individual functions and classes:
```javascript
describe('MyFunction', () => {
  test('handles edge case', () => {
    expect(myFunction(input)).toBe(expected);
  });
});
```

### Functional Tests
Located in `packages/cli/test/functional/`

Add test site content demonstrating the feature, then run `npm run updatetest`.

### Snapshot Tests
Located in `packages/vue-components/src/__tests__/`

Test Vue component rendering:
```javascript
test('renders correctly', () => {
  const wrapper = mount(Component, { props });
  expect(wrapper.html()).toMatchSnapshot();
});
```

## Code Style Guidelines

### JavaScript/TypeScript
- Use ES6+ features (arrow functions, destructuring, async/await)
- Prefer `const` over `let`, never `var`
- Use async/await over callbacks
- Follow ESLint rules

### Vue Components
- Use composition API for new components (Vue 3)
- Single-file components (.vue)
- PascalCase for component names
- Props with types and defaults

### Import/Export
- ES6 syntax for new code: `import X from 'Y'`
- TypeScript equivalent for compatibility: `import X = require('Y')`
- See TypeScript migration guide for details

## Additional Considerations

### Bundle Size
- Check bundlephobia.com for package sizes
- Avoid large dependencies for small features
- Code-split when possible

### Browser Compatibility
- Test in major browsers (Chrome, Firefox, Safari, Edge)
- Avoid bleeding-edge JavaScript features
- Polyfills when necessary

### Performance
- Lazy-load heavy components
- Minimize DOM operations
- Use virtual scrolling for long lists
- Optimize images and assets

### Accessibility
- Use semantic HTML
- Add ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
