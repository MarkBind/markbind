# Utility Components

## Scroll To Top Button

**Scroll-to-top** allows users to scroll back to the top of the page.

### Basic Usage

```html
<scroll-top-button></scroll-top-button>
```

### Custom Options

```html
<scroll-top-button
    icon=":fas-arrow-circle-up:"
    icon-size="2x"
    bottom="2%"
    right="2%"
></scroll-top-button>
```

### Options
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | String | `:fas-arrow-circle-up:` | Icon text |
| `icon-size` | String | `lg` | Icon size (`2x`, `3x`, etc.) |
| `bottom` | String | `2%` | Distance from bottom |
| `right` | String | `2%` | Distance from right |

### Placement
Add to your layout file (e.g., `_markbind/layouts/default.md`).

---

## Dark Mode Toggle

**Dark-mode-toggle** switches between light and dark themes.

### Basic Usage

```html
<dark-mode-toggle />
```

Requires `darkMode: true` in `site.json`:
```json
{
  "style": {
    "darkMode": true
  }
}
```

### Behavior
- Defaults to user's OS preference (`prefers-color-scheme`)
- Persists choice in `localStorage` under `markbind-theme`
- Appears in navbar to the right of search bar

### Adapting Content for Dark Mode

Images with transparent backgrounds may need a light background:

```html
<box background-color="#f8f9fa">
  ![Image with transparent bg](image.png)
</box>
```

Update CSS for dark mode compatibility:
```css
/* Use CSS custom properties for theme-aware colors */
.text-primary {
  color: var(--bs-primary);
}
```

---

## Trigger Component

**Trigger** activates tooltips, popovers, and modals.

### Syntax

```html
<trigger trigger="event" for="prefix:id">Trigger text</trigger>
```

### Prefixes

| Prefix | Component |
|--------|-----------|
| `modal:` | Modal |
| `tt:` | Tooltip |
| `pop:` | Popover |

### Events

| Event | Description |
|-------|-------------|
| `click` | Mouse click |
| `hover` | Mouse hover |
| `focus` | Keyboard focus |

### Examples

```html
<!-- Open modal -->
<trigger trigger="click" for="modal:myModal">Open Modal</trigger>

<!-- Show tooltip -->
<trigger trigger="hover" for="tt:myTooltip">Show</trigger>

<!-- Show popover -->
<trigger trigger="click" for="pop:myPopover">Show</trigger>

<!-- Combined -->
<trigger trigger="click hover" for="pop:myPopover">Click or hover</trigger>
```

---

## Badges

**Badges** display small status labels.

```html
<span class="badge bg-primary">Primary</span>
<span class="badge bg-success">Success</span>
<span class="badge bg-danger">Danger</span>
<span class="badge bg-warning">Warning</span>
<span class="badge bg-info">Info</span>
<span class="badge bg-secondary">Secondary</span>
<span class="badge bg-light">Light</span>
<span class="badge bg-dark">Dark</span>
<span class="badge rounded-pill bg-primary">Pill</span>
```

### Colors
- `bg-primary`, `bg-secondary`
- `bg-success`, `bg-danger`
- `bg-warning`, `bg-info`
- `bg-light`, `bg-dark`

### Pill Shape
Add `rounded-pill` class.