# Vue Integration and Server-Side Rendering

## Vue's Role in MarkBind

Vue provides:
1. **Component System** - Interactive UI components (panels, modals, tooltips)
2. **Server-Side Rendering** - Pre-render components to static HTML
3. **Client-Side Hydration** - Make static HTML interactive
4. **Reactive Updates** - Dynamic content loading and state management

## Component Integration

### Component Registration

All Vue components are registered in `packages/vue-components/src/index.js`:

```javascript
import Panel from './Panel.vue';
import Modal from './Modal.vue';
// ... other components

export default {
  install(app) {
    app.component('panel', Panel);
    app.component('modal', Modal);
    // ...
  }
};
```

This allows components to be used without imports in any Vue template.

### How MarkBind Attributes Become Vue Props

MarkBind syntax:
```html
<panel header="My Panel" type="info" expanded>
  Content here
</panel>
```

Becomes Vue component with props:
```javascript
{
  header: "My Panel",    // String prop
  type: "info",          // String prop
  expanded: ""           // Boolean attribute (empty string)
}
```

**Important**: All props receive String values from MarkBind attributes.

### How MarkBind Slots Work

MarkBind named slots:
```html
<panel>
  <div slot="header">Custom Header</div>
  Default content
</panel>
```

Accessed in Vue component:
```vue
<template>
  <div class="panel">
    <div class="panel-header">
      <slot name="header">{{ header }}</slot>
    </div>
    <div class="panel-body">
      <slot></slot>
    </div>
  </div>
</template>
```

## Server-Side Rendering Flow

### 1. Compilation Phase (Build Time)

Located in `packages/core/src/html/vueServerRenderer/PageVueServerRenderer.ts`

**Process**:
1. Take final HTML from content processing flow
2. Compile to Vue render function using `@vue/compiler-sfc`
3. Save as `<page-name>.page-vue-render.js`
4. This script is included in final HTML for client-side hydration

**Example**:
```javascript
// Compiled render function
export function render(_ctx) {
  return [
    _createElementVNode("div", { id: "app" }, [
      _createVNode(Panel, { header: "Title" })
    ])
  ];
}
```

### 2. Server-Side Rendering (Build Time)

**Process**:
1. Initialize Vue instance with SSR mode
2. Register all MarkBind components
3. Execute render function
4. Use `renderToString` from `@vue/server-renderer`
5. Output static HTML

**Key Code** (`PageVueServerRenderer.ts`):
```typescript
const app = createSSRApp({ render });
app.use(VueComponentsPlugin);
const html = await renderToString(app);
```

### 3. Client-Side Hydration (Browser)

Located in `packages/core-web/src/index.js`

**Process**:
1. Browser loads SSR HTML and render function script
2. `setup()` function creates Vue app with `createSSRApp()`
3. Vue app mounts to `#app` element
4. Hydrates static HTML (attaches event listeners, makes interactive)

**Key Code**:
```javascript
function setup() {
  const app = createSSRApp({
    render: window.markbindPageVueRenderFn
  });
  app.use(VueComponentsPlugin);
  app.mount('#app');
}
```

## Hydration Process

### What is Hydration?

Hydration is when Vue:
1. Takes server-rendered static HTML
2. Compares it with client-side virtual DOM
3. Attaches event listeners and reactivity
4. Makes the page interactive

### Hydration Mismatches

**Hydration fails when**:
- Server HTML differs from client virtual DOM
- Invalid HTML structure (e.g., `<div>` inside `<p>`)
- Different initial state between server/client
- Component behavior differs server vs client

**Consequences**:
- Vue abandons SSR HTML
- Performs full client-side render
- FOUC is avoided (SSR HTML still resembles final result)
- Performance penalty from wasted SSR + hydration check

### Common Hydration Issues

**Issue 1: Invalid HTML Nesting**
```html
<!-- BAD: div inside p -->
<p>
  <div>Block content</div>
</p>
```

Browsers auto-correct this, causing mismatch.

**Issue 2: Conditional Rendering Differences**
```vue
<!-- BAD: Different between server/client -->
<div v-if="isClient">
  Client only content
</div>
```

**Issue 3: Modifying DOM After SSR**
```javascript
// BAD: Modifying SSR HTML before hydration
document.querySelector('.panel').classList.add('modified');
```

**Issue 4: Unknown HTML Elements**
```html
<!-- BAD: Vue tries to resolve as component -->
<custom-web-component>
```

Solution: Add `v-pre` attribute or register as custom element.

## SSR Compatibility Requirements

### Server-Side Safe Code

**Lifecycle Hooks**:
- `setup()`, `created()` - Run on both server and client
- `mounted()`, `beforeMount()` - Client only
- `beforeDestroy()`, `destroyed()` - Client only

**DOM Access**:
```javascript
// BAD: DOM not available on server
mounted() {
  document.querySelector('.element');  // Errors on server
}

// GOOD: Only access DOM in client-only hooks
mounted() {
  // Safe - mounted only runs on client
  document.querySelector('.element');
}
```

**Browser APIs**:
```javascript
// BAD: Browser APIs on server
created() {
  window.addEventListener('resize', handler);
}

// GOOD: Check environment or use client-only hooks
mounted() {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handler);
  }
}
```

### State Consistency

Initial state must match between server and client:

```javascript
// BAD: Different initial state
data() {
  return {
    currentTime: Date.now()  // Different on server vs client
  };
}

// GOOD: Consistent initial state
data() {
  return {
    currentTime: null  // Set in mounted() on client
  };
},
mounted() {
  this.currentTime = Date.now();
}
```

### Conditional Rendering

`v-if` must evaluate identically on server and client:

```javascript
// BAD: Always false on server
<div v-if="typeof window !== 'undefined'">

// GOOD: Use v-show for client-only visibility
<div v-show="mounted">
```

## Client-Side Rendering (CSR) for External Content

Some content uses CSR exclusively (no SSR):

**Example**: `<panel src="content.md" preload="false">`

**Process**:
1. Panel rendered with empty content slot
2. On expansion, fetch `content._include_.html`
3. Mount as separate Vue app using CSR
4. No hydration (no SSR HTML to hydrate)

**Code Pattern**:
```javascript
// Load external content
const html = await fetch('content._include_.html');

// Mount as new Vue app
const app = createApp({ template: html });
app.mount(container);
```

## Vue Component Patterns in MarkBind

### Pattern 1: Wrapper Components

Wrap external libraries (e.g., Modal wraps vue-final-modal):

```vue
<template>
  <vue-final-modal v-bind="$props">
    <slot></slot>
  </vue-final-modal>
</template>

<script>
import { VueFinalModal } from 'vue-final-modal';

export default {
  components: { VueFinalModal },
  props: { /* ... */ }
};
</script>
```

### Pattern 2: Self-Contained Components

Implement custom behavior (e.g., Quiz component):

```vue
<template>
  <div class="quiz">
    <slot></slot>
    <button @click="checkAnswers">Check</button>
  </div>
</template>

<script>
export default {
  data() {
    return { answers: [] };
  },
  methods: {
    checkAnswers() { /* ... */ }
  }
};
</script>
```

### Pattern 3: Hybrid Processing

Some components use both node transformation and Vue:

1. NodeProcessor transforms MarkBind syntax to HTML
2. HTML includes Vue component
3. Vue component adds interactivity

## Debugging SSR Issues

### Development Mode

Use `-d` flag to enable SSR validation:
```bash
markbind serve -d
```

Shows hydration warnings in browser console.

### Common Error Messages

**"Hydration node mismatch"**:
- Server HTML differs from client virtual DOM
- Check for invalid HTML or state differences

**"Hydration children mismatch"**:
- Different number of children
- Usually from conditional rendering issues

**"Hydration attribute mismatch"**:
- Attribute values differ
- Check for dynamic attributes with server/client differences

### Validation

MarkBind validates HTML for common SSR issues in `packages/core/src/utils/htmlValidationUtils.ts`.

Add validation rules when new hydration causes are discovered.

## Best Practices

### ✅ Do

- Use client-only lifecycle hooks for DOM access
- Keep initial state consistent
- Use `v-show` for client-only visibility
- Test with SSR enabled (`-d` mode)
- Validate HTML structure

### ❌ Don't

- Access DOM in `setup()` or `created()`
- Use browser APIs on server
- Modify SSR HTML before hydration
- Create server/client state differences
- Use invalid HTML nesting

### Testing for SSR Compatibility

1. Serve with `-d` flag
2. Check browser console for hydration warnings
3. Verify no FOUC occurs
4. Test component interactivity after hydration
5. Check deployed preview (SSR warnings may differ)
