# External Libraries and Dependencies

## Key External Libraries

### markdown-it
**Purpose**: Markdown parsing and rendering  
**Location**: npm package + custom plugins in `packages/core/src/lib/markdown-it/`  
**Version**: Check `packages/core/package.json`

**Why Used**:
- Industry-standard Markdown parser
- Extensive plugin ecosystem
- Fast and reliable

**MarkBind Customizations**:

**Custom Plugins** (`packages/core/src/lib/markdown-it/plugins/`):
- `markdown-it-attrs.js` - Attribute syntax `{#id .class}`
- `markdown-it-icons.js` - Icon shorthand `:fa-icon:`
- `markdown-it-task-lists.js` - Task list `- [ ]` syntax

**Patched Plugins** (`packages/core/src/lib/markdown-it/patches/`):
- Modified third-party plugins for MarkBind compatibility
- See individual patch files for rationale

**Installed Plugins** (in `package.json`):
- `markdown-it-emoji` - Emoji support
- `markdown-it-sub` - Subscript
- `markdown-it-sup` - Superscript
- `markdown-it-mark` - Highlighting
- Others listed in dependencies

### htmlparser2
**Purpose**: HTML parsing and DOM tree creation  
**Location**: npm package + patch in `packages/core/src/patches/htmlparser2.js`  
**Version**: Check `packages/core/package.json`

**Why Used**:
- Fast and forgiving parser
- Exposes DOM-like structure
- Works well with cheerio

**Why Patched**:
- Modify parsing behavior for MarkBind components
- Handle special cases like `<include>` tags
- Adjust whitespace handling for Markdown compatibility
- Support self-closing custom tags

**Key Patch Changes**:
- Custom tag recognition
- Whitespace preservation rules
- Self-closing tag behavior
- Better error messages

### cheerio
**Purpose**: jQuery-like DOM manipulation  
**Location**: npm package (inherits htmlparser2 patches)  
**Version**: Check `packages/core/package.json`

**Why Used**:
- Familiar jQuery-style API
- Server-side DOM manipulation
- Uses htmlparser2 internally

**MarkBind Usage Patterns**:
```javascript
const $ = cheerio.load(content);
$('.panel').addClass('expandable');
$('#header').attr('data-processed', 'true');
return $.html();
```

**Note**: Inherits htmlparser2 patches automatically.

### Nunjucks
**Purpose**: Templating engine for variables  
**Location**: npm package + patches in `packages/core/src/patches/nunjucks/`  
**Version**: Check `packages/core/package.json`

**Why Used**:
- Powerful templating syntax
- Supports loops, conditionals, filters
- Similar to Jinja2

**Why Patched**:
- Make compatible with MarkBind processing flow
- Add custom filters and functions
- Improve error messages with file context
- Handle MarkBind-specific syntax

**Key Patch Changes**:
- Custom tag resolution
- Better error reporting
- MarkBind-specific filters
- Variable scoping adjustments

## CLI-Specific Libraries

### commander.js
**Purpose**: CLI framework  
**Location**: npm package in `packages/cli/`  
**Version**: Check `packages/cli/package.json`

**Why Used**:
- Standard Node.js CLI framework
- Clean command definition
- Automatic help generation

**Not Patched**: Used as-is.

### live-server
**Purpose**: Development server with live reload  
**Location**: npm package + patches in `packages/cli/src/lib/live-server/`  
**Version**: Check `packages/cli/package.json`

**Why Patched**:
- Custom file watching behavior
- Fine-tuned reload triggers
- Better error handling
- MarkBind-specific optimizations

**Key Patch Changes**:
- Ignore certain file patterns
- Custom reload logic
- Integration with MarkBind build process

## Vue Ecosystem

### Vue 3
**Purpose**: Frontend framework  
**Location**: npm packages in `packages/vue-components/` and `packages/core-web/`  
**Version**: ^3.3.11 (check `package.json`)

**Key Packages**:
- `vue` - Main framework
- `@vue/compiler-sfc` - Single-file component compilation
- `@vue/server-renderer` - SSR support

**Not Patched**: Used as-is.

### Vue Libraries

**vue-final-modal**:
- Modal component implementation
- Used in Modal.vue

**floating-vue**:
- Tooltip and popover positioning
- Used in Tooltip.vue and Popover.vue

**Not Patched**: Used as-is.

## Frontend Dependencies

### Bootstrap
**Purpose**: CSS framework  
**Location**: npm package in `packages/core-web/`  
**Version**: 5.1.3

**Why This Version**: Must match Bootswatch version for theme compatibility.

**Not Patched**: Used as-is (only CSS).

### FontAwesome
**Purpose**: Icon library  
**Location**: npm package in `packages/core-web/`

**Not Patched**: Used as-is.

## Dependency Management Strategy

### When to Install (npm install)

**Pros**:
- Easy to upgrade
- Traceable in `package.json`
- Official releases

**Cons**:
- May not support custom behavior
- Vulnerable if unmaintained

**Use When**:
- Library meets needs as-is
- Active maintenance expected
- Standard functionality sufficient

### When to Fork

**Pros**:
- Can modify as needed
- Leverage upstream testing
- Can contribute back
- Easy to upgrade (pull upstream)

**Cons**:
- May become out-of-sync
- External maintenance burden
- Deployment complexity

**Use When**:
- Need significant changes
- Want to contribute upstream
- Library is actively maintained
- Changes benefit broader community

### When to Patch

**Pros**:
- Quick - no external packages
- Changes propagate to dependencies (e.g., cheerio uses htmlparser2 patches)
- Monorepo benefits
- Easy to maintain in one place

**Cons**:
- Harder to upgrade base library
- Changes not contributed upstream
- Must document rationale

**Use When**:
- Small, focused changes needed
- Changes specific to MarkBind
- Want dependency changes to propagate
- Quick iteration important

**MarkBind Preference**: Patching for core dependencies, installing for others.

## Patched Libraries in Detail

### packages/core/src/patches/htmlparser2.js

**Rationale** (from file comments):
- Modify parsing for MarkBind components
- Handle whitespace per Markdown spec
- Support self-closing custom tags
- Better `<include>` handling

**Key Functions Modified**:
- `parseStartTag()` - Custom tag recognition
- `parseEndTag()` - Self-closing behavior
- Whitespace handling logic

**Testing**: Functional tests verify patched behavior.

### packages/core/src/patches/nunjucks/

**Rationale**:
- Make compatible with multi-stage processing
- Add MarkBind-specific features
- Better error context

**Key Files**:
- Multiple files in directory
- See individual file comments

**Testing**: Unit tests in `packages/core/test/unit/variables/`.

### packages/cli/src/lib/live-server/

**Rationale**:
- Fine-tune live reload for MarkBind
- Optimize file watching
- Better integration with build process

**Testing**: Manual testing during development.

## Updating Dependencies

### General Process

1. Check dependency changelogs
2. Test in isolated branch
3. Run full test suite
4. Check for breaking changes
5. Update all packages using dependency

### Updating Patched Libraries

**High Risk**: Patches may break with new versions.

**Process**:
1. Review upstream changes
2. Update patch to match new version
3. Extensive testing
4. Document any patch changes

**Example**: Updating htmlparser2
1. Install new version
2. Review htmlparser2 changelog
3. Update `packages/core/src/patches/htmlparser2.js`
4. Run all functional tests
5. Fix any parsing issues

### Updating Bootstrap/Bootswatch

**Important**: Versions must stay in sync.

Current: Bootstrap 5.1.3, Bootswatch 5.1.3

**Process**:
1. Check if Bootswatch supports new Bootstrap
2. Update both simultaneously
3. Test all themes
4. Verify visual consistency

### Updating PlantUML

PlantUML JAR in `packages/core/src/plugins/default/plantuml.jar`

**Process**:
1. Download new JAR from plantuml.com
2. Rename to `plantuml.jar`
3. Replace existing file
4. Test diagram generation
5. Check test sites with diagrams

## Version Pinning Strategy

MarkBind uses **exact versions** (not semver ranges) for internal packages:

```json
{
  "dependencies": {
    "@markbind/core": "5.0.0",  // Exact, not ^5.0.0
  }
}
```

**Rationale**: Ensures all packages use identical internal versions.

**Managed by**: `lerna version --exact`

## Checking for Outdated Dependencies

```bash
# Check outdated packages
npm outdated

# Per package
cd packages/core && npm outdated
```

## Questions to Ask Before Adding Dependencies

1. **Is the package actively maintained?**
   - Recent commits/releases
   - Active issue tracker
   - Regular updates

2. **How big is the package?**
   - Check bundlephobia.com
   - Consider bundle size impact

3. **How invasive are proposed changes?**
   - Forking vs patching vs installing

4. **Are there existing APIs/plugin systems?**
   - Can we extend without modifying?

5. **What are the transitive dependencies?**
   - Will it block future upgrades?
   - Does it depend on old versions of other libraries?

## Example Decision: Choosing Modal Library

**Evaluated**:
- bootstrap-vue (old Bootstrap 4)
- Custom implementation
- vue-final-modal (chosen)

**Decision Factors**:
- Bootstrap 5 compatibility
- Active maintenance
- SSR support
- Reasonable bundle size
- Clean API

**Result**: Install vue-final-modal, wrap in Modal.vue component.
