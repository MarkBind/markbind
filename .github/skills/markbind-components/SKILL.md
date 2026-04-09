---
name: markbind-components
description: Use when adding MarkBind components like boxes, panels, tabs, modals, tooltips, popovers, dropdowns, navbars, search bars, cards, badges, questions, quizzes, trees, thumbnails, annotations, scroll-to-top buttons, dark mode toggles, breadcrumbs, site-nav, or page-nav to MarkBind pages
paths: *.md,*.html
---

# MarkBind Components

## Overview

MarkBind provides Vue.js components built on Bootstrap for creating rich, interactive pages. Use components via HTML-like tags in `.md` files.

## Component Categories

### Presentation Components
- **Box**: Highlight information with styled containers
- **Panel**: Flexible collapsible/expandable containers
- **Tabs**: Organize content into tabbed interfaces
- **CardStack**: Filterable card grid layouts

### Popup Components
- **Tooltip**: Brief explanations on hover/focus/click
- **Popover**: Rich content pop-ups with headers
- **Modal**: Full-screen overlay dialogs
- **Trigger**: Activate popups

### Navigation Components
- **Navbar**: Top navigation bar
- **Dropdown**: Dropdown menus
- **Breadcrumb**: Hierarchical navigation path
- **Site-nav**: Sidebar navigation menu
- **Page-nav**: Table of contents for current page

### Media Components
- **Picture**: Images with captions
- **Thumbnail**: Small visual elements
- **Tree**: Tree-like visualizations
- **Annotate**: Interactive annotation points
- **Badges**: Small status labels

### Interactive Components
- **Question/Quiz**: Assessment components
- **Searchbar**: Site search functionality

### Utility Components
- **Scroll-to-top**: Back to top button
- **Dark-mode-toggle**: Theme switcher

## Quick Reference

| Component | Key Attribute | Purpose |
|-----------|---------------|---------|
| `<box>` | `type="info\|warning\|tip\|success"` | Styled info containers |
| `<panel>` | `header`, `expanded`, `minimized` | Collapsible content |
| `<tabs>` | `:active`, `tab header` | Tabbed interface |
| `<tooltip>` | `content`, `trigger`, `placement` | Hover explanations |
| `<popover>` | `header`, `content` | Rich popups |
| `<modal>` | `header`, `id`, `large` | Dialog boxes |
| `<navbar>` | `type`, `highlight-on` | Top navigation |
| `<searchbar>` | `:data`, `:on-hit` | Search functionality |
| `<site-nav>` | Markdown list format | Sidebar navigation |
| `<page-nav />` | Config via frontmatter | Page TOC |

## Common Patterns

### Custom Classes
```html
<box type="info" add-class="my-custom-class mt-3">
  Content
</box>
```

### Indent Components
```html
<box class="ms-4">Indented box</box>
<panel header="Title" class="ms-3">Indented panel</panel>
```

### Slots
```html
<component>
  <span slot="attributeName">Rich content</span>
</component>
```

## Detailed References

For complete reference documentation on each component:

### Presentation
- [reference/boxes.md](reference/boxes.md) - Box component
- [reference/panels.md](reference/panels.md) - Panel component
- [reference/tabs.md](reference/tabs.md) - Tabs component
- [reference/cardstacks.md](reference/cardstacks.md) - CardStack component

### Popups
- [reference/popups.md](reference/popups.md) - Tooltip, Popover, Modal, Trigger

### Navigation
- [reference/navigation.md](reference/navigation.md) - Navbar, Dropdown, Breadcrumb, Site-nav, Page-nav

### Media
- [reference/media.md](reference/media.md) - Picture, Thumbnail, Tree, Annotate, Badges

### Interactive
- [reference/interactive.md](reference/interactive.md) - Question, Quiz, Searchbar

### Utility
- [reference/utility.md](reference/utility.md) - Scroll-to-top, Dark-mode-toggle