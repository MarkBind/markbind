# SSR Compatibility Patterns

## Server-Side Rendering Overview

MarkBind uses Vue's SSR to pre-render components into static HTML during build. The browser then hydrates this HTML to make it interactive.

## Critical SSR Rules

### Rule 1: No DOM Access Before Mount

**Problem**: DOM doesn't exist on server.

```javascript
// ❌ BAD: Crashes on server
export default {
  created() {
    document.querySelector('.element');  // Error: document not defined
  }
}

// ✅ GOOD: Only access DOM in mounted()
export default {
  mounted() {
    // Safe - mounted() only runs in browser
    document.querySelector('.element');
  }
}
```

### Rule 2: No Browser APIs on Server

**Problem**: Browser APIs (`window`, `localStorage`, etc.) don't exist on server.

```javascript
// ❌ BAD: window undefined on server
export default {
  data() {
    return {
      width: window.innerWidth  // Error on server
    };
  }
}

// ✅ GOOD: Initialize in mounted()
export default {
  data() {
    return {
      width: 0  // Safe default
    };
  },
  mounted() {
    this.width = window.innerWidth;
  }
}
```

### Rule 3: Consistent Initial State

**Problem**: Server and client must start with identical state.

```javascript
// ❌ BAD: Different on server vs client
export default {
  data() {
    return {
      timestamp: Date.now(),  // Different times
      random: Math.random()   // Different values
    };
  }
}

// ✅ GOOD: Same initial state, update on client
export default {
  data() {
    return {
      timestamp: null,
      random: null
    };
  },
  mounted() {
    this.timestamp = Date.now();
    this.random = Math.random();
  }
}
```

### Rule 4: Valid HTML Structure

**Problem**: Browsers auto-correct invalid HTML, causing hydration mismatch.

```html
<!-- ❌ BAD: div not allowed in p -->
<p>
  <div>Block content</div>
</p>

<!-- ✅ GOOD: Use appropriate tags -->
<div>
  <p>Paragraph text</p>
  <div>Block content</div>
</div>
```

**Common Invalid Nesting**:
- `<div>` inside `<p>`
- `<block>` inside `<span>`
- Table elements outside `<table>`

**Reference**: [MDN HTML Element Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element)

## Vue Lifecycle Hooks

### Server + Client Hooks
These run on **both** server and client:
- `setup()`
- `created()`
- `beforeCreate()`

**Rules**:
- No DOM access
- No browser APIs
- State must be identical on server and client

### Client-Only Hooks
These run **only** in browser:
- `beforeMount()`
- `mounted()`
- `beforeUpdate()`
- `updated()`
- `beforeUnmount()`
- `unmounted()`

**Safe for**:
- DOM operations
- Browser APIs
- Event listeners
- Timers

## Conditional Rendering

### v-if Must Match on Server and Client

```javascript
// ❌ BAD: Always false on server
<div v-if="typeof window !== 'undefined'">
  Client-only content
</div>

// ✅ GOOD: Use data property set in mounted()
<template>
  <div v-if="isMounted">
    Client-only content
  </div>
</template>

<script>
export default {
  data() {
    return { isMounted: false };
  },
  mounted() {
    this.isMounted = true;
  }
};
</script>
```

### v-show for Client-Only Visibility

`v-show` is better for client-only content (element exists in SSR HTML but hidden):

```vue
<template>
  <div v-show="showClientContent">
    <!-- Rendered on server, hidden until mounted -->
  </div>
</template>

<script>
export default {
  data() {
    return { showClientContent: false };
  },
  mounted() {
    this.showClientContent = true;
  }
};
</script>
```

## Component Patterns

### Pattern 1: Client-Only Component

```vue
<template>
  <div>
    <ClientOnly>
      <BrowserComponent />
    </ClientOnly>
  </div>
</template>

<script>
// ClientOnly wrapper component
const ClientOnly = {
  data() {
    return { show: false };
  },
  mounted() {
    this.show = true;
  },
  render() {
    return this.show ? this.$slots.default() : null;
  }
};

export default {
  components: { ClientOnly }
};
</script>
```

### Pattern 2: Async Data Loading

```vue
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="data">{{ data }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      data: null
    };
  },
  mounted() {
    this.loading = true;
    fetch(this.src)
      .then(r => r.json())
      .then(data => {
        this.data = data;
        this.loading = false;
      });
  }
};
</script>
```

### Pattern 3: Progressive Enhancement

Provide fallback content that works without JavaScript:

```vue
<template>
  <div>
    <!-- Works on server, enhanced on client -->
    <a :href="url" @click.prevent="handleClick">
      {{ text }}
    </a>
  </div>
</template>

<script>
export default {
  props: ['url', 'text'],
  methods: {
    handleClick() {
      // Enhanced behavior in browser
      this.$emit('custom-action');
    }
  }
};
</script>
```

## Common Hydration Issues

### Issue 1: Text Whitespace Differences

**Problem**: Server renders with different whitespace than client.

```vue
<!-- ❌ BAD: Whitespace varies -->
<template>
  <p>
    {{ text }}
  </p>
</template>

<!-- ✅ GOOD: Consistent whitespace -->
<template>
  <p>{{ text }}</p>
</template>
```

### Issue 2: Unknown HTML Elements

**Problem**: Vue tries to resolve unknown tags as components.

```html
<!-- ❌ BAD: Vue warns about unknown element -->
<custom-web-component></custom-web-component>

<!-- ✅ GOOD: Tell Vue to ignore it -->
<custom-web-component v-pre></custom-web-component>
```

Or register as custom element in plugin config.

### Issue 3: Async Component Loading

**Problem**: Different timing on server vs client.

```javascript
// ❌ BAD: May load at different times
export default {
  components: {
    AsyncComponent: () => import('./AsyncComponent.vue')
  }
};

// ✅ GOOD: Synchronous on server, async on client
export default {
  components: {
    AsyncComponent: require('./AsyncComponent.vue').default
  }
};
```

### Issue 4: External Content Modification

**Problem**: Scripts modify SSR HTML before hydration.

```javascript
// ❌ BAD: Modifies SSR HTML
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.panel').classList.add('modified');
});

// ✅ GOOD: Let Vue handle DOM
export default {
  mounted() {
    // Vue has already hydrated, safe to modify
    this.$el.classList.add('modified');
  }
};
```

## Debugging Hydration Issues

### Enable SSR Warnings

Use developer mode:
```bash
markbind serve -d
```

Check browser console for hydration warnings.

### Common Warning Messages

**"Hydration node mismatch"**:
- Cause: Server HTML differs from client virtual DOM
- Fix: Check for invalid HTML or state differences

**"Hydration children mismatch"**:
- Cause: Different number of child elements
- Fix: Usually from `v-if` that evaluates differently

**"Hydration attribute mismatch"**:
- Cause: Attribute values differ
- Fix: Check for dynamic attributes with server/client differences

**"Hydration text mismatch"**:
- Cause: Text content differs
- Fix: Check for client-only state in templates

### Isolate the Issue

1. **Simplify the component**: Remove parts until hydration works
2. **Check HTML validity**: Use W3C validator
3. **Compare rendered HTML**: Check SSR output vs client render
4. **Add logging**: Log state in `created()` and `mounted()`

### Validation Utility

MarkBind validates HTML in `packages/core/src/utils/htmlValidationUtils.ts`.

Add new validation rules when discovering hydration causes:

```typescript
// Example validation rule
function validateNoBlockInParagraph(html: string): ValidationError[] {
  const errors: ValidationError[] = [];
  // Check for <div>, <p>, etc. inside <p>
  return errors;
}
```

## SSR Testing Checklist

### Before Committing

- [ ] Serve with `-d` flag and check console
- [ ] No hydration warnings
- [ ] Component is interactive after page load
- [ ] HTML structure is valid
- [ ] No FOUC (flash of unstyled content)

### Test Scenarios

1. **Initial render**: Component appears correctly
2. **Interaction**: Buttons/links work as expected
3. **State changes**: Reactivity works
4. **External content**: Loads properly
5. **Browser refresh**: No errors on hard reload

### Cross-Browser Testing

Test in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Some hydration issues are browser-specific.

## Best Practices Summary

### ✅ Do

- Use `mounted()` for DOM access
- Initialize state consistently
- Use valid HTML structure
- Test with SSR enabled (`-d` mode)
- Use `v-show` for client-only visibility
- Provide progressive enhancement
- Document SSR considerations

### ❌ Don't

- Access DOM in `setup()` or `created()`
- Use browser APIs before `mounted()`
- Create server/client state differences
- Use invalid HTML nesting
- Modify SSR HTML before hydration
- Rely on `v-if` for client-only content
- Forget to test hydration

## Advanced Topics

### Custom SSR Context

For advanced cases, access SSR context:

```javascript
export default {
  serverPrefetch() {
    // Only runs on server
    return this.fetchData();
  }
};
```

### Handling Third-Party Libraries

Many libraries aren't SSR-compatible. Wrap in client-only component:

```vue
<template>
  <ClientOnly>
    <ThirdPartyComponent />
  </ClientOnly>
</template>
```

### SSR Performance

- Minimize server-side work
- Avoid heavy computations in SSR hooks
- Use caching when possible
- Consider using CSR for complex components

## Reference

See also:
- [Vue SSR Guide](https://vuejs.org/guide/scaling-up/ssr.html)
- [MDN HTML Element Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element)
- MarkBind's `htmlValidationUtils.ts` for validation rules
