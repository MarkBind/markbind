---
name: markbind-architecture
description: Internal architecture and code organization of the MarkBind project including monorepo structure, content processing flow, key classes, and package relationships. Use when understanding how MarkBind works internally, navigating the codebase, implementing features that interact with core processing logic, or understanding the relationship between packages (cli, core, core-web, vue-components).
---

# MarkBind Architecture

## Monorepo Structure

MarkBind uses a monorepo managed by [lerna](https://github.com/lerna/lerna) with 4 packages:

### packages/cli
Command-line interface application that:
- Accepts user commands (`init`, `serve`, `build`, `deploy`)
- Uses the core library to process content
- Provides live reload development server
- Manages site deployment

**Key dependencies**: commander.js, live-server (patched)

### packages/core
Core processing library that:
- Parses and processes MarkBind syntax
- Implements the content processing flow
- Manages pages, layouts, and external files
- Handles plugins and extensions

**Key dependencies**: markdown-it, cheerio, htmlparser2, nunjucks (all patched)

### packages/core-web
Client-side bundle containing:
- Vue runtime and setup scripts
- Bootstrap and FontAwesome bundles
- Custom stylesheets
- UI component library
- SSR render logic

**Outputs**:
- `markbind.min.js` - Main client bundle
- `markbind.min.css` - Styles
- `vuecommonappfactory.min.js` - SSR setup
- `vuecommonappfactory.min.css` - SSR styles

### packages/vue-components
UI components library with:
- Bootstrap-based components (modified)
- Custom MarkBind components (panels, modals, tooltips, etc.)
- Vue directives (closeable, float)

**Key dependencies**: Vue 3, Bootstrap 5, floating-vue, vue-final-modal

## Content Processing Flow

Every Page, Layout, and External follows the same three-stage flow:

```
Nunjucks → Markdown → HTML
```

### Stage 1: Nunjucks (VariableProcessor)
- Processes template variables and expressions
- Expands loops and conditionals
- Resolves `{% set %}` and `{{ variable }}` syntax
- Output: Markdown/HTML with variables resolved

### Stage 2: Markdown (NodeProcessor)
- Renders Markdown to HTML
- Processes markdown-it plugins
- Handles custom MarkBind syntax
- Output: HTML with some MarkBind components

### Stage 3: HTML (NodeProcessor)
- Traverses HTML node tree
- Processes MarkBind components
- Handles includes recursively
- Applies plugins
- Output: Final HTML ready for layout injection

### Important Notes

- **Predictable order**: Always Nunjucks first, Markdown second, HTML last
- **Nunjucks compatibility**: Processed first so templating works on all content
- **Markdown before HTML**: Prevents Markdown syntax from conflicting with HTML parsing
- **External generation**: Files referenced by `<panel src="...">` generate separate output files processed by ExternalManager **after** the referencing page

## Key Classes

### Site (packages/core/src/Site/)
The main orchestrator that:
- Manages all pages, layouts, and configuration
- Coordinates the build process
- Copies assets to output folder
- Handles site-wide operations

**Location**: `packages/core/src/Site/index.ts`

### Page (packages/core/src/Page/)
Represents a single page:
- Processes page content through the content flow
- Manages page-specific frontmatter
- Generates output HTML file
- Directly managed by Site instance

**Location**: `packages/core/src/Page/index.ts`

### Layout (packages/core/src/Layout/)
Stores layout templates:
- Processed similarly to Pages
- Stores intermediate results
- Does not generate output files directly
- Used by Pages for final rendering
- Managed by LayoutManager

**Location**: `packages/core/src/Layout/`

### External (packages/core/src/External/)
Handles dynamically-loaded content:
- Content referenced in `<panel src="...">` or similar
- Generates separate `_include_.html` files
- Loaded on-demand in browser
- Managed by ExternalManager

**Location**: `packages/core/src/External/`

### NodeProcessor (packages/core/src/html/NodeProcessor.ts)
The core HTML processing engine:
- Traverses HTML node tree
- Matches node names to components
- Applies transformations in three phases:
  - `preProcessNode()` - Before main processing
  - `processNode()` - Main processing
  - `postProcessNode()` - After processing
- Handles includes and plugins

**Location**: `packages/core/src/html/NodeProcessor.ts`

### VariableProcessor (packages/core/src/variables/)
Manages Nunjucks templating:
- Processes site and page variables
- Handles frontmatter
- Manages variable scoping
- Integrates with Nunjucks

**Location**: `packages/core/src/variables/`

## Package Relationships

```
User → CLI → Core → Core-Web (client-side)
              ↓
         Vue-Components (bundled into Core-Web)
```

### Build-time Dependencies
- CLI depends on Core (uses Site class)
- Core-Web bundles Vue-Components
- Core uses Core-Web bundles (copies to output)

### Runtime Dependencies
- Browser loads Core-Web bundles
- Core-Web initializes Vue with components
- Vue components hydrate SSR HTML

For detailed information about specific packages, see:
- [references/core-package.md](references/core-package.md) - Core package deep dive
- [references/vue-integration.md](references/vue-integration.md) - Vue and SSR details
- [references/external-libraries.md](references/external-libraries.md) - Key dependencies

## Processing Flow Example

Given this MarkBind file:
```markdown
{% set myVariable = "Item" %}

# Header

<ul>
{% for item in [1, 2, 3] %}
   <li>{{ myVariable }} #{{ item }}</li>
{% endfor %}
</ul>

<include src="content.md" />
```

### After Nunjucks Stage:
```markdown
# Header

<ul>
   <li>Item #1</li>
   <li>Item #2</li>
   <li>Item #3</li>
</ul>

<include src="content.md" />
```

### After Markdown Stage:
```html
<h1 id="header">Header<a class="fa fa-anchor" href="#header"></a></h1>
<p></p>
<ul>
   <li>Item #1</li>
   <li>Item #2</li>
   <li>Item #3</li>
</ul>

<include src="content.md" />
```

### After HTML Stage:
```html
<h1 id="header">Header<a class="fa fa-anchor" href="#header"></a></h1>
<p></p>
<ul>
   <li>Item #1</li>
   <li>Item #2</li>
   <li>Item #3</li>
</ul>

<div>
<!-- content from content.md processed and inserted here -->
</div>
```

Then injected into layout template for final output.

## File Locations Reference

### Core Processing Logic
- `packages/core/src/html/` - HTML processing and NodeProcessor
- `packages/core/src/variables/` - Nunjucks and variable handling
- `packages/core/src/Page/` - Page processing
- `packages/core/src/Layout/` - Layout handling
- `packages/core/src/External/` - External file management
- `packages/core/src/Site/` - Site orchestration

### Plugin System
- `packages/core/src/plugins/` - Plugin interface and default plugins
- `packages/core/src/plugins/default/` - Built-in plugins (PlantUML, tree, etc.)

### Utilities
- `packages/core/src/lib/` - Helper libraries
- `packages/core/src/utils/` - Utility functions
- `packages/core/src/patches/` - Patched external libraries

### Templates
- `packages/core/template/` - Site initialization templates

### CLI
- `packages/cli/src/` - CLI commands and implementation
- `packages/cli/src/lib/live-server/` - Patched live-server

### Frontend
- `packages/core-web/src/` - Client-side setup and scripts
- `packages/vue-components/src/` - Vue component implementations
