# Dependency Management in MarkBind

## Three Approaches to Dependencies

MarkBind uses three strategies for incorporating external code: **installing**, **forking**, and **patching**.

## Approach 1: Installing (npm install)

### When to Use

- Package works as-is without modifications
- Package is actively maintained
- Standard functionality is sufficient
- Want easy upgrades

### Pros

- Easy to upgrade (just update version)
- Traceable in `package.json`
- Official releases with changelogs
- Community support

### Cons

- Cannot customize behavior
- Vulnerable if package becomes unmaintained
- Tied to package release schedule
- May include unnecessary features

### Process

1. **Choose package** based on:
   - Active maintenance (recent commits, releases)
   - Good documentation
   - Reasonable bundle size
   - Compatible license
   - Few/manageable dependencies

2. **Install in appropriate package**:
   ```bash
   cd packages/core  # or cli, vue-components, core-web
   npm install package-name
   ```

3. **Delete package-lock.json**:
   ```bash
   rm package-lock.json
   ```

4. **Update root lock file**:
   ```bash
   cd ../../  # back to root
   npm run setup
   ```

5. **Commit changes**:
   ```bash
   git add packages/*/package.json package-lock.json
   git commit -m "Add package-name dependency"
   ```

### Examples in MarkBind

- `markdown-it` - Markdown parser
- `commander` - CLI framework  
- `vue` - Frontend framework
- `cheerio` - DOM manipulation

## Approach 2: Forking

### When to Use

- Need significant modifications
- Want to contribute changes upstream
- Changes benefit broader community
- Package is actively maintained upstream
- Changes are substantial enough to justify separate repo

### Pros

- Can modify as needed
- Leverage upstream testing
- Can contribute back via PRs
- Easy to pull upstream updates
- Benefit others with same use case

### Cons

- May become out-of-sync with upstream
- External maintenance burden
- Deployment complexity (publishing to npm)
- Need to maintain fork long-term

### Process

1. **Fork repository** on GitHub
2. **Clone fork locally**
3. **Make modifications**
4. **Publish to npm** (if needed):
   ```bash
   npm publish
   ```
5. **Update MarkBind** to use fork:
   ```json
   {
     "dependencies": {
       "package-name": "^1.0.0-markbind.1"
     }
   }
   ```

### When to Contribute Upstream

If changes are:
- Generally useful (not MarkBind-specific)
- Well-tested and documented
- Compatible with upstream goals

Submit PR to original repository.

### MarkBind Example

Previously forked `vue-strap` from [yuche/vue-strap](https://github.com/yuche/vue-strap) into [MarkBind/vue-strap](https://github.com/MarkBind/vue-strap), later merged into main monorepo as `packages/vue-components`.

## Approach 3: Patching

### When to Use

- Small, focused modifications needed
- Changes are MarkBind-specific
- Want changes to propagate to dependents
- Quick iteration is important
- Don't want to maintain external package

### Pros

- Quick - no external repo needed
- Changes propagate (e.g., cheerio uses htmlparser2 patches)
- Easy to maintain in monorepo
- Keep everything in one place
- Fast iteration

### Cons

- Harder to upgrade base library
- Changes not contributed upstream
- Must document rationale clearly
- Patches can break with version updates

### Process

1. **Create patch file** in `packages/core/src/patches/`:
   ```
   packages/core/src/patches/
   ├── htmlparser2.js
   ├── nunjucks/
   │   ├── file1.js
   │   └── file2.js
   ```

2. **Document rationale** at top of patch file:
   ```javascript
   /**
    * Patched htmlparser2 for MarkBind-specific behavior
    * 
    * Changes:
    * 1. Modified tag parsing for custom components
    * 2. Adjusted whitespace handling for Markdown compatibility
    * 3. Added support for self-closing custom tags
    * 
    * See: https://github.com/MarkBind/markbind/issues/123
    */
   ```

3. **Import patched version** instead of original:
   ```javascript
   // Instead of: const htmlparser2 = require('htmlparser2');
   const htmlparser2 = require('./patches/htmlparser2');
   ```

4. **Test thoroughly**:
   - Unit tests for patched functionality
   - Functional tests for integration
   - Verify dependent packages work correctly

### MarkBind Patched Libraries

**packages/core/src/patches/htmlparser2.js**:
- Modify parsing for MarkBind components
- Handle whitespace per Markdown spec
- Support self-closing custom tags

**packages/core/src/patches/nunjucks/**:
- Compatible with multi-stage processing
- MarkBind-specific filters
- Better error messages

**packages/cli/src/lib/live-server/**:
- Custom file watching
- Fine-tuned reload behavior
- MarkBind build integration

## Choosing the Right Approach

### Decision Matrix

| Factor | Install | Fork | Patch |
|---|---|---|---|
| **Modification size** | None | Large | Small |
| **Upstream contribution** | N/A | Yes | No |
| **Maintenance burden** | Low | High | Medium |
| **Upgrade difficulty** | Easy | Medium | Hard |
| **MarkBind-specific** | No | No | Yes |
| **External visibility** | N/A | High | None |

### Decision Tree

```
Need modifications?
├─ No → Install
└─ Yes
   ├─ Large/general changes?
   │  └─ Yes → Fork (consider upstream contribution)
   └─ No → Small/MarkBind-specific?
      └─ Yes → Patch
```

### Questions to Ask

1. **Does the package work as-is?**
   - Yes → Install
   - No → Continue

2. **Are changes large and generally useful?**
   - Yes → Fork
   - No → Continue

3. **Are changes small and MarkBind-specific?**
   - Yes → Patch
   - No → Reconsider if changes are actually needed

4. **Will this benefit the broader community?**
   - Yes → Fork and contribute upstream
   - No → Patch

5. **Is the package actively maintained?**
   - Yes → Fork (easier to stay in sync)
   - No → Patch or consider alternatives

## Updating Dependencies

### Updating Installed Packages

```bash
# Check for outdated packages
npm outdated

# Update package
cd packages/core
npm install package-name@latest

# Update all packages
cd ../../
npm run setup
```

**Important**: Check changelog for breaking changes!

### Updating Forked Packages

```bash
# In fork repository
git remote add upstream https://github.com/original/repo.git
git fetch upstream
git merge upstream/master

# Fix conflicts
# Run tests
# Publish new version
npm version patch
npm publish
```

Then update MarkBind dependency version.

### Updating Patched Packages

**High risk** - patches may break!

```bash
# Update base package
cd packages/core
npm install package-name@latest

# Review changelog
# Update patch file to match new version
# Test extensively
```

Process:
1. Read upstream changelog
2. Check if patch changes are still needed
3. Update patch code for new version
4. Run all tests
5. Fix any breaking changes

## Adding New Dependencies

### Evaluation Checklist

Before adding any dependency:

- [ ] **Active maintenance?** Recent commits/releases
- [ ] **Bundle size acceptable?** Check bundlephobia.com
- [ ] **License compatible?** MIT, Apache, BSD preferred
- [ ] **Few dependencies?** Avoid dependency trees
- [ ] **Good documentation?** Essential for long-term maintenance
- [ ] **TypeScript support?** Types available or bundled
- [ ] **Browser compatible?** If used in frontend
- [ ] **SSR compatible?** If used with Vue components
- [ ] **Alternatives considered?** Is this the best option?

### Bundle Size Considerations

Check size impact at [bundlephobia.com](https://bundlephobia.com):

```
Small:    < 10KB minified
Medium:   10-50KB
Large:    50-100KB
Too Large: > 100KB (reconsider or lazy-load)
```

### Adding to Monorepo

1. **Identify target package**:
   - Core processing → `packages/core`
   - CLI functionality → `packages/cli`
   - Vue components → `packages/vue-components`
   - Client-side code → `packages/core-web`
   - Dev tooling → root `package.json`

2. **Add to package.json**:
   ```json
   {
     "dependencies": {
       "new-package": "^1.0.0"
     }
   }
   ```

3. **Update lockfile**:
   ```bash
   npm run setup
   ```

4. **Import and use**:
   ```javascript
   const newPackage = require('new-package');
   ```

5. **Add tests** for functionality using the new package

6. **Document usage** if non-obvious

## Removing Dependencies

1. **Remove from package.json**
2. **Run setup**:
   ```bash
   npm run setup
   ```
3. **Verify nothing breaks**:
   ```bash
   npm run test
   ```
4. **Search for imports** to ensure complete removal:
   ```bash
   grep -r "package-name" packages/
   ```

## Dependency Version Strategy

### Exact Versions for Internal Packages

```json
{
  "dependencies": {
    "@markbind/core": "5.0.0",  // Exact, not ^5.0.0
  }
}
```

**Why**: Ensures consistency across all packages.

**Managed by**: `lerna version --exact`

### Semver Ranges for External Packages

```json
{
  "dependencies": {
    "markdown-it": "^13.0.0",  // Caret range
    "cheerio": "~1.0.0"        // Tilde range
  }
}
```

**Caret (^)**: Allow minor and patch updates
**Tilde (~)**: Allow only patch updates

### Locking Versions

Sometimes lock to exact version:

```json
{
  "dependencies": {
    "critical-package": "1.2.3"  // Locked
  }
}
```

**When to lock**:
- Known issues with newer versions
- Waiting for dependency to stabilize
- Temporary until proper fix

**Document why** in comments or commit message.

## Special Cases

### Bootstrap and Bootswatch

Must stay synchronized:

```json
{
  "dependencies": {
    "bootstrap": "5.1.3",
    "bootswatch": "5.1.3"
  }
}
```

**Why**: Bootswatch themes built for specific Bootstrap version.

### PlantUML JAR

Not an npm package, stored directly:
- Location: `packages/core/src/plugins/default/plantuml.jar`
- Update: Download new JAR, replace file
- Test: Generate diagrams in test sites

### Vue Ecosystem

Major version must match:

```json
{
  "dependencies": {
    "vue": "^3.3.11",
    "@vue/compiler-sfc": "^3.3.11",
    "@vue/server-renderer": "^3.3.11"
  }
}
```

All Vue packages must use same major version (3.x).

## Troubleshooting

### "Cannot find module"

```bash
# Clean and reinstall
npm run clean
npm run setup
```

### Version conflicts

```bash
# Check for duplicates
npm ls package-name

# Deduplicate
npm dedupe
```

### Broken after update

1. Check changelog for breaking changes
2. Search issues for version number
3. Rollback if necessary:
   ```bash
   npm install package-name@previous-version
   ```

### Peer dependency warnings

Usually safe to ignore, but verify:
```bash
npm ls package-name
```

If multiple versions installed, may need to update dependents.

## Best Practices

### ✅ Do

- Check maintenance status before adding
- Read changelogs before updating
- Test thoroughly after changes
- Document patch rationale
- Update all packages using a dependency
- Use exact versions for internal packages
- Check bundle size impact

### ❌ Don't

- Add dependencies without evaluation
- Update without reading changelog
- Patch without documenting why
- Mix dependency versions
- Ignore peer dependency warnings without investigation
- Commit package-lock.json changes alone (always with package.json)
