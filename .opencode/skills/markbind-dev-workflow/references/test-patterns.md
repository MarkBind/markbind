# Test Patterns and Procedures

## Functional Test Architecture

Functional tests build test sites listed in `packages/cli/test/functional/testSites.js` and compare generated HTML with expected output in each test site's `expected/` directory.

## Adding a Test Page to Existing Test Site

Example: Adding `newTestPage.md` to `test_site`

1. **Create the test page** in `packages/cli/test/functional/test_site/newTestPage.md` demonstrating the new feature

2. **Update site.json** to include the new page:
   ```json
   "pages": [
     {
       "src": "index.md",
       "title": "Hello World"
     },
     {
       "src": "newTestPage.md",
       "title": "New Feature Demo"
     }
   ]
   ```

3. **Run updatetest** to generate expected output:
   ```bash
   npm run updatetest
   ```

4. **Verify the output** by checking:
   - Generated HTML in `test_site/expected/newTestPage.html`
   - Only intended changes appear in git diff
   - No unintended binary file changes (images, fonts)

## Creating a New Test Site

1. **Create test site directory** under `packages/cli/test/functional/`

2. **Add minimum required files**:
   - `index.md` - Main content
   - `site.json` - Site configuration

3. **Register test site** in `packages/cli/test/functional/testSites.js`:
   ```javascript
   const testSites = [
     'test_site',
     'your_new_test_site',
     // ... other test sites
   ];
   ```

4. **Run updatetest** to generate expected output

## Snapshot Tests for Vue Components

Located in `packages/vue-components/src/__tests__/`

### Adding Snapshot Tests

1. **Create/modify test file** using Vue Test Utils:
   ```javascript
   import { mount } from '@vue/test-utils';
   import MyComponent from '../MyComponent.vue';

   test('renders correctly', () => {
     const wrapper = mount(MyComponent, {
       props: { /* ... */ }
     });
     expect(wrapper.html()).toMatchSnapshot();
   });
   ```

2. **Run updatetest** to generate/update snapshots:
   ```bash
   npm run updatetest
   ```

3. **Review snapshot changes** in `__snapshots__/` folder

## Updating Test Files After Changes

### When to Run updatetest

Run after:
- Modifying component behavior
- Changing HTML output structure
- Updating frontend bundles
- Making any change that affects generated HTML

### What updatetest Does

1. Regenerates all expected HTML files in test sites
2. Updates snapshot files for Vue components
3. Rebuilds frontend bundles into test sites

### Version-Only Changes During Release

During releases, only version numbers should change in expected files:

```diff
-    <meta name="generator" content="MarkBind 1.20.0">
+    <meta name="generator" content="MarkBind 1.21.0">
```

If other lines change unexpectedly, functional tests weren't properly updated in earlier PRs.

## PlantUML Test Images

PlantUML generates images that are gitignored to avoid unnecessary file changes.

### Maintained Ignore Lists

- `packages/cli/test/functional/testSites.js` - Lists ignored PlantUML images
- `.gitignore` - Patterns for ignored generated content

### Adding PlantUML Content

Update both files if adding new PlantUML diagrams to test sites.

## Binary Files in Tests

### Common Binary Files
- Images: `.png`, `.jpg`, `.gif`
- Fonts: `.woff`, `.woff2`, `.ttf`
- Icons: `.ico`

### Handling Binary Changes

**If you didn't directly modify these files**, discard the changes:
```bash
git checkout -- path/to/binary/file
```

Binary files may appear changed due to:
- Different generation timestamps
- Non-deterministic compression
- Platform-specific rendering

Only commit binary file changes if you intentionally modified them.

## Expected Test Errors

Some test cases intentionally trigger errors. These are documented in test logs:

```javascript
// In test file
console.log('info: The following 2 errors are expected:');
console.log('info: 1: No such segment \'#doesNotExist\' in file');
console.log('info: 2: Cyclic reference detected.');
```

If adding tests with expected errors, update the corresponding info messages.

## Test Site Best Practices

### Keep Test Sites Focused
- Each test site should demonstrate specific features
- Don't overload a single test site with unrelated features
- Create new test sites for distinctly different feature sets

### Use Descriptive Filenames
- `pluginTest.md` - Tests plugin functionality
- `layoutsTest.md` - Tests layout features
- Clear names help locate tests for specific features

### Document Test Purpose
Add comments in test files explaining what they test:
```markdown
<!-- Testing panel component with src attribute and preload=false -->
<panel src="content.md" preload="false">
</panel>
```

### Minimize Test Content
- Test the minimum needed to verify functionality
- Avoid large blocks of unnecessary content
- Focus on demonstrating the specific feature

## Debugging Test Failures

### Compare Expected vs Actual

When tests fail:
1. Check diff between `expected/` and actual output
2. Identify which component/feature caused the difference
3. Determine if change is intended or a bug

### Isolate the Issue

1. Run single test site:
   ```bash
   cd packages/cli
   npm run test -- --testPathPattern=functional/test_site
   ```

2. Serve the test site locally:
   ```bash
   cd packages/cli/test/functional/test_site
   markbind serve
   ```

3. Inspect generated output in browser DevTools

### Common Causes

- Forgot to run `npm run build:backend` after TypeScript changes
- Forgot to run `npm run build:web` or `markbind serve -d` for frontend changes
- Stale node_modules (run `npm run setup`)
- Platform-specific line endings (configure git autocrlf)
