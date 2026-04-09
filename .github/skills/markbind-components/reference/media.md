# Media Components

## Picture

**Pic** displays images with captions.

```html
<pic src="https://example.com/image.png" width="300" alt="Description">
  Image caption
</pic>
```

### Options
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `src` | String | Yes | Image URL (absolute or relative) |
| `alt` | String | Yes | Alternative text |
| `width` | String | No | Width in pixels (priority over height) |
| `height` | String | No | Height in pixels |
| `lazy` | Boolean | false | Enable lazy loading |

<box type="info">
For auto-linked images (clickable to view full), use standard Markdown: `![Alt](url)`
</box>

---

## Thumbnail

**Thumbnail** creates small visual elements with images, text, or icons.

```html
<!-- Image thumbnail -->
<thumbnail src="image.png" alt="Description" size="150" />

<!-- Icon thumbnail -->
<thumbnail text=":fa-solid-star:" size="80" circle />

<!-- Text thumbnail -->
<thumbnail text="A" font-color="white" background="blue" />
```

### Options
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `src` | String | - | Image URL |
| `alt` | String | - | Alternative text (required if src) |
| `text` | String | - | Text, icons, or emojis |
| `size` | Number | 100 | Size in pixels |
| `circle` | Boolean | false | Circle shape |
| `background` | String | - | CSS background |
| `border` | String | - | CSS border |
| `font-color` | String | - | Text color |
| `font-size` | Number | - | Text font size |

---

## Tree

**Tree** generates tree-like visualizations.

```html
<tree>
root
  child1
    grandchild1
    grandchild2
  child2
    - list style child
  * another list style
</tree>
```

Uses 2-space indentation for nesting. Supports Markdown list markers (`-`, `*`, `+`).

---

## Annotations

**Annotate** adds interactive annotation points over images.

```html
<annotate src="image.png" alt="Annotated image" width="600">
  <a-point x="30%" y="40%" content="Point description" header="Point Title"></a-point>
  <a-point x="70%" y="60%" label="B" trigger="click" placement="right"></a-point>
</annotate>
```

### Annotate Options
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `src` | String | Yes | Image URL |
| `alt` | String | Yes | Alternative text |
| `width` | String | No | Width |
| `height` | String | No | Height |
| `lazy` | Boolean | false | Lazy loading |

### A-Point Options
| Name | Type | Description |
|------|------|-------------|
| `x` | String | X coordinate (0-100%) |
| `y` | String | Y coordinate (0-100%) |
| `content` | slot | Annotation content |
| `header` | slot | Annotation header |
| `label` | slot | Label on the point |
| `trigger` | String | `click`, `focus`, `hover` |
| `placement` | String | `top`, `left`, `right`, `bottom` |
| `size` | Number | Point size (default 40) |
| `color` | String | Point color (default green) |
| `opacity` | Number | Point opacity (default 0.3) |
| `legend` | String | `popover`, `bottom`, `both` |

---

## Badges

**Badges** display small status labels using Bootstrap classes.

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

### Badge Colors
- `bg-primary`
- `bg-secondary`
- `bg-success`
- `bg-danger`
- `bg-warning`
- `bg-info`
- `bg-light`
- `bg-dark`

### Pill Shape
Add `rounded-pill` class for rounded corners.