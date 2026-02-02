# Core Package Deep Dive

## Directory Structure

```
packages/core/src/
├── html/                  # HTML processing
│   ├── NodeProcessor.ts   # Main node traversal and processing
│   ├── vueServerRenderer/ # Server-side rendering with Vue
│   └── ...
├── variables/             # Nunjucks and variable handling
│   ├── VariableProcessor.ts
│   └── ...
├── Page/                  # Page class and processing
├── Layout/                # Layout management
├── External/              # External file handling
├── Site/                  # Site orchestration
├── plugins/               # Plugin system
│   ├── Plugin.ts          # Plugin interface
│   └── default/           # Built-in plugins
├── lib/                   # Helper libraries
│   ├── markdown-it/       # Markdown-it plugins and patches
│   └── ...
├── utils/                 # Utility functions
├── patches/               # Patched external libraries
│   ├── htmlparser2.js
│   ├── nunjucks/
│   └── ...
└── template/              # Init templates
```

## HTML Processing (packages/core/src/html/)

### NodeProcessor.ts
The core processing engine that traverses the HTML DOM tree.

**Key Methods**:
- `processNode(node)` - Main node processing, handles components and includes
- `preProcessNode(node)` - Called before main processing
- `postProcessNode(node)` - Called after main processing, handles CSS extraction

**Processing Flow**:
1. Parse HTML into node tree (using htmlparser2)
2. Traverse tree depth-first
3. For each node:
   - Check if it's a MarkBind component
   - Apply transformations
   - Process children recursively
4. Convert tree back to HTML (using cheerio)

**Component Processing**:
- Nodes are matched by tag name (e.g., `<panel>` → panel component)
- Each component can have custom processing logic
- Plugins can hook into `processNode` and `postProcessNode`

### vueServerRenderer/
Server-side rendering logic for Vue components.

**Key Files**:
- `PageVueServerRenderer.ts` - Main SSR entry point
- Compiles page content to Vue render function
- Executes render function with Vue's `renderToString`
- Returns pre-rendered HTML

## Variable Processing (packages/core/src/variables/)

### VariableProcessor.ts
Handles Nunjucks templating and variable resolution.

**Key Responsibilities**:
- Compiles site and page variables
- Processes Nunjucks templates
- Manages variable scoping (global, page-level, frontmatter)
- Handles `{% set %}`, `{{ }}`, loops, conditionals

**Variable Sources** (in order of precedence):
1. Inline frontmatter in page
2. Frontmatter overrides in `site.json`
3. Global variables in `site.json`
4. Built-in variables (e.g., `baseUrl`)

## Page, Layout, External Classes

### Page/index.ts
**Represents**: A single content page

**Key Methods**:
- `generate()` - Main entry point for page generation
- `collectBaseUrl()` - Resolves base URLs for assets
- `collectPluginPageNunjucksAssets()` - Gathers plugin assets
- `generate()` - Runs through content processing flow

**Properties**:
- `content` - Source content
- `frontmatter` - Page frontmatter
- `src` - Source file path
- `output` - Output file path

### Layout/index.ts
**Represents**: A layout template

**Key Difference from Page**:
- Does not generate output files directly
- Stores intermediate processed results
- Used by Pages during final rendering

### External/index.ts
**Represents**: Dynamically-loaded content

**Generated For**:
- `<panel src="file.md">` with `preload=false`
- Other components with `src` attributes

**Output Format**: `filename._include_.html`

**Processing**: Same three-stage flow as Pages

## Plugin System (packages/core/src/plugins/)

### Plugin Interface
Plugins can implement:

**Rendering Hooks**:
- `processNode(context, node)` - Process individual nodes
- `postRender(context, frontmatter, content)` - Process final HTML

**Asset Injection**:
- `getLinks(context, frontmatter, content)` - Add `<link>` tags
- `getScripts(context, frontmatter, content)` - Add `<script>` tags

**Lifecycle**:
- `beforeSiteGenerate()` - Reset plugin state

**Tag Configuration**:
- `tagConfig` - Define special tag behaviors

### Default Plugins (packages/core/src/plugins/default/)

**markbind-plugin-plantuml.ts**:
- Processes `<puml>` tags
- Generates UML diagrams using PlantUML JAR
- Outputs PNG images

**markbind-plugin-tree.ts**:
- Renders directory trees
- Uses `<tree>` component

## Libraries (packages/core/src/lib/)

### markdown-it/ 
Custom markdown-it plugins and patches.

**plugins/** - Custom MarkBind plugins:
- `markdown-it-attrs.js` - Attribute syntax
- `markdown-it-icons.js` - Icon support
- `markdown-it-task-lists.js` - Task list syntax

**patches/** - Patched third-party plugins:
- Modified behavior to fit MarkBind needs
- Fixes for compatibility issues

### Other Libraries
- `markbind/src/parser/` - MarkBind syntax parsing
- `nunjucks-extensions/` - Custom Nunjucks extensions

## Utility Modules (packages/core/src/utils/)

**Key Utilities**:
- `htmlValidationUtils.ts` - Validate HTML for SSR compatibility
- `urlUtils.ts` - URL resolution and manipulation
- `fsUtils.ts` - File system operations
- `logger.ts` - Logging utilities

## Patched Libraries (packages/core/src/patches/)

MarkBind patches several external libraries for custom behavior.

### htmlparser2.js
**Why Patched**: 
- Modify parsing behavior for MarkBind components
- Handle special cases for `<include>` and `<panel>`
- Maintain compatibility with Markdown spec

**Key Changes**:
- Custom tag recognition
- Whitespace handling
- Self-closing tag behavior

### nunjucks/
**Why Patched**:
- Make compatible with MarkBind processing flow
- Add custom filters and functions
- Improve error messages

**Key Changes**:
- Custom tag resolution
- Better error context
- MarkBind-specific filters

### Rationale for Patching

Patching is chosen when:
- Changes are too invasive for forking
- Need to ensure compatibility with other dependencies
- Want to leverage monorepo benefits
- Quick iteration is important

See workflow documentation for more on patching vs forking vs installing.

## Data Flow Summary

```
User writes .md file
    ↓
CLI command triggers Site
    ↓
Site creates Page instances
    ↓
Page.generate() runs content through:
    1. VariableProcessor (Nunjucks)
    2. NodeProcessor (Markdown)
    3. NodeProcessor (HTML)
    ↓
Plugins hook into processing
    ↓
SSR renders Vue components
    ↓
Content injected into Layout
    ↓
Output HTML file generated
    ↓
Assets copied to output
```

## Important Patterns

### Cheerio Usage
Most processing uses cheerio for DOM manipulation:
```javascript
const $ = cheerio.load(content);
$('#my-element').addClass('highlight');
return $.html();
```

### Node Traversal
Processing walks the DOM tree:
```javascript
function processNode(node) {
  // Process current node
  if (node.name === 'panel') {
    handlePanel(node);
  }
  
  // Process children
  node.children.forEach(child => processNode(child));
}
```

### Async Processing
Many operations are asynchronous:
```javascript
async generate() {
  const processed = await this.variableProcessor.process();
  const rendered = await this.nodeProcessor.process(processed);
  return rendered;
}
```
