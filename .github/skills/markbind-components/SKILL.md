---
name: markbind-components
description: Use when adding MarkBind components like boxes, panels, tabs, modals, tooltips, popovers, dropdowns, navbars, search bars, cards, badges, questions, quizzes, trees, thumbnails, annotations, scroll-to-top buttons, dark mode toggles, breadcrumbs, site-nav, or page-nav to MarkBind pages
paths: *.md,*.html
---

# MarkBind Components

## Overview

MarkBind provides Vue.js components built on Bootstrap for creating rich, interactive pages. Use components via HTML-like tags in `.md` files.

## Essential Rules

- Prefer MarkBind components over custom HTML/JS when a component already provides the behavior.
- Keep navigation components (`navbar`, `site-nav`, `page-nav`) aligned with site layout and frontmatter/site config.
- Use semantic component choices (`box` for callouts, `panel` for collapsible sections, `tabs` for alternatives).
- Verify component content still reads well in print and search contexts.

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

## Component References

### Presentation
- [reference/boxes.md](reference/boxes.md) - callout boxes, visual emphasis patterns, and attributes for informational/warning/tip content.
- [reference/panels.md](reference/panels.md) - collapsible/expandable sections for progressive disclosure.
- [reference/tabs.md](reference/tabs.md) - parallel content variants in tabbed UI.
- [reference/cardstacks.md](reference/cardstacks.md) - filterable card layouts for grouped content.

### Popups
- [reference/popups.md](reference/popups.md) - tooltip/popover/modal/trigger behavior and when to use each interaction type.

### Navigation
- [reference/navigation.md](reference/navigation.md) - navbar, dropdown, breadcrumb, `site-nav`, `page-nav` patterns for page/site navigation.

### Media
- [reference/media.md](reference/media.md) - media-oriented components (`pic`, thumbnails, tree, annotate, badges) for visual explanation.

### Interactive
- [reference/interactive.md](reference/interactive.md) - question/quiz/searchbar components for reader interaction and discovery.

### Utility
- [reference/utility.md](reference/utility.md) - utility components such as scroll-to-top and dark mode toggle.

## User Guide Entry

- <https://markbind.org/userGuide/usingComponents.html>
