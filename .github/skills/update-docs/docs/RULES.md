# MarkBind Documentation Rules and Best Practices

## Basic Rules

### 1. Frontmatter Usage
All documentation files must start with a frontmatter section containing at least a title.

```markdown
<frontmatter>
  title: "Page Title"
</frontmatter>
```

Some files may include additional metadata like layout, pageNav, etc.

### 2. Lead Placement
Lead text (introductory text) should only appear at the top of pages, typically right after the main heading.

```markdown
<h1 class="display-3"><md>**Main Title**</md></h1>

<span class="lead">Introductory lead text goes here.</span>
```

### 3. Environment Tags
Use environment tags to control content visibility across different documentation environments:

- `environment--ug` for User Guide content
- `environment--dg` for Developer Guide content
- `environment--combined` for both environments

```markdown
<div tags="environment--ug">
  <!-- User Guide specific content -->
</div>

<div tags="environment--dg">
  <!-- Developer Guide specific content -->
</div>
```

### 4. MarkBind Text Formatting Syntax

#### Highlighted Text
```markdown
==highlighted text==
```

#### Grey/Dimmed Text
```markdown
%%grey text%%
```

#### Underlined Text
```markdown
!!underlined text!!
```

#### Strikethrough Text
```markdown
~~strikethrough text~~
```

#### Bold and Italic
```markdown
**bold text**
_italic text_
___bold and italic___
```

### 5. Tooltips
Use tooltips for inline explanations and definitions:

```markdown
<tooltip content="explanation text">trigger text</tooltip>
```

Examples:
```markdown
<tooltip content="Computer Science">CS</tooltip>
<tooltip content="Node Version Manager">nvm</tooltip>
<tooltip content="as opposed to _one-size-fits-all_ static content">_more dynamic_</tooltip>
```

Tooltip placement options:
```markdown
<tooltip content="text" placement="top|left|right|bottom">trigger</tooltip>
```

### 6. Popovers and Modals
Use triggers with popovers and modals for interactive content:

```markdown
<trigger for="pop:id">trigger text</trigger>
<popover id="pop:id" header="Popover Title">
  <div slot="content">
    Popover content here
  </div>
</popover>

<trigger trigger="click" for="modal:id">trigger text</trigger>
<modal large header="Modal Title" id="modal:id">
  Modal content here
</modal>
```

### 7. Content Reuse with Includes
Use the include mechanism to avoid duplication and maintain consistency:

```markdown
<include src="file.md" boilerplate>
  <variable name="varName">value</variable>
</include>
```

## Consistent Formatting Rules

### 1. Text Styles
Maintain consistent use of MarkBind text formatting throughout documentation:

- `**bold**` and `_italic_` for emphasis
- `==highlighted text==` for important concepts
- `%%dimmed text%%` for secondary information
- `!!underlined text!!` for interactive elements
- `~~strikethrough~~` for deprecated or removed content

### 2. Code Examples
Use consistent code formatting with proper syntax highlighting:

```markdown
```html
<tooltip content="explanation">trigger</tooltip>
```

For code and output examples:
```markdown
<include src="codeAndOutput.md" boilerplate>
  <variable name="highlightStyle">markdown</variable>
  <variable name="code">
    Example code here
  </variable>
</include>
```

### 3. Panels and Boxes
Organize content using panels and boxes:

```markdown
<panel type="seamless" header="%%Header text%%">
  Panel content here
</panel>

<box>
  Grouped content here
</box>
```

Panel types:
- `seamless` - no border, blends with page
- `primary`, `secondary`, `success`, `danger`, `warning`, `info` - colored panels
- Custom headers with `%%text%%` formatting

### 4. Lists and Tables
Use proper Markdown formatting for lists and tables:

```markdown
- List item 1
- List item 2
  - Nested item

1. Numbered item 1
2. Numbered item 2

Syntax | Code | Output
-------|------|-------
Markdown | `**bold**` | **bold**
```

### 5. Cross-referencing
Link to other documentation sections using relative paths:

```markdown
[link text](userGuide/formattingContents.html)
[link text](userGuide/formattingContents.html#section-id)
```

### 6. Environment-Specific Content
Wrap environment-specific content appropriately:

```markdown
<div tags="environment--ug">
  <!-- User Guide only content -->
</div>

<div tags="environment--combined">
  <!-- Both User Guide and Developer Guide content -->
</div>
```

## Best Practices

### 1. Interactive Elements
Use tooltips, popovers, and modals judiciously:
- Tooltips for brief explanations and definitions
- Popovers for slightly more detailed information
- Modals for complex or lengthy content that shouldn't interrupt main flow

### 2. Content Organization
Use panels, boxes, and tabs to organize related content logically:

```markdown
<tabs>
  <tab header="Tab 1">
    Content for tab 1
  </tab>
  <tab header="Tab 2">
    Content for tab 2
  </tab>
</tabs>
```

### 3. Version Information
Include version-specific details, especially for installation and update instructions:

```markdown
[Node.js](https://nodejs.org) {{ node_version }} or higher installed
```

### 4. Prerequisites
Clearly list prerequisites at the beginning of guides:

```markdown
++**Prerequisites**++

<div class="indented">
  %%{{ icon_ticked }}%% Requirement 1
  %%{{ icon_ticked }}%% Requirement 2
</div>
```

### 5. Step-by-Step Instructions
Provide clear, numbered steps with appropriate code examples:

```markdown
++**1. Step Title**++

Instruction text here

```
code example here
```

++**2. Next Step**++

More instructions
```

### 6. Contributor Sections
Maintain the ALL-CONTRIBUTORS-LIST format without modification:

```markdown
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <!-- Auto-generated content -->
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
```

### 7. 404 Page Format
Use the specific arrow syntax for 404 pages:

```markdown
-><p style="font-size: 10rem">404</p><-
-><p style="font-size: 1.5rem">File not found<br>Click <a href="/">here</a> to go back to the home page.</p><-
```

### 8. Icons and Emoji
Use consistent icon and emoji formatting:

```markdown
:glyphicon-icon-name:  <!-- Glyphicons -->
:fa-solid-icon-name:  <!-- Font Awesome solid -->
:fa-brands-icon-name: <!-- Font Awesome brands -->
:emoji-shortcode:     <!-- Emoji -->
```

### 9. Variables and Templates
Use variables for consistent values across documentation:

```markdown
{% set title = "Page Title" %}
<span id="title" class="d-none">{{ title }}</span>
```

### 10. Comments and Annotations
Use proper comment formatting:

```markdown
<!-- Single line comment -->

{% comment %}
Multi-line
comment block
{% endcomment %}

%%Comment that appears in output%%
```

## File Structure and Organization

### Frontmatter Requirements
- All `.md` files should have frontmatter with at least `title`
- User guide files should include `layout: userGuide.md`
- Developer guide files should include `layout: devGuide.md`

### Directory Structure
- `docs/` - Main documentation root
- `docs/userGuide/` - User guide content
- `docs/devGuide/` - Developer guide content
- `docs/_markbind/` - Templates and boilerplates
- `docs/pages/` - Reusable content fragments

### Configuration Files
- `site.json` - Main site configuration
- `ug-site.json` - User guide specific configuration
- `dg-site.json` - Developer guide specific configuration

## Writing Style Guidelines

1. **Concise Language**: Use clear, direct language suitable for an LLM audience
2. **Consistent Terminology**: Use established MarkBind terminology consistently
3. **Logical Flow**: Organize content from basic to advanced concepts
4. **Practical Examples**: Include relevant examples for each concept
5. **Cross-references**: Link to related documentation sections
6. **Version Awareness**: Note version-specific behaviors and requirements
7. **Timelessness and clarity**: Avoid using phrasies like "now supports". Communicate about the product in the current state and be clear.

## Navigation Rules

### Previous/Next Configuration

When adding or modifying navigation links in the documentation, ensure that the `previous_next` configuration is updated to maintain proper navigation flow. Specifically:

- The "previous" link of the page that comes after the new page should point to the new page.
- The "next" link of the page that comes before the new page should point to the new page.

This ensures that users can navigate through the documentation seamlessly without encountering broken links or incorrect navigation paths.

**Example**:
```markdown
{% from "njk/common.njk" import previous_next %}
{{ previous_next('previousPage', 'nextPage') }}
```
