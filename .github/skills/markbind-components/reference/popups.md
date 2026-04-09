# Tooltips

**Tooltips** show brief explanations on hover/focus/click.

## Basic Usage

```html
Hover <tooltip content="An explanation, **supports simple Markdown**">here</tooltip> to see a tooltip.
```

## Placement

```html
<tooltip content="Tooltip text" placement="top">Top</tooltip>
<tooltip content="Tooltip text" placement="bottom">Bottom</tooltip>
<tooltip content="Tooltip text" placement="left">Left</tooltip>
<tooltip content="Tooltip text" placement="right">Right</tooltip>
```

## Trigger Methods

```html
<!-- Default: hover + focus -->
<tooltip content="Hover or focus">Hover me</tooltip>

<!-- Click trigger -->
<tooltip content="Click me" trigger="click">
  <button class="btn btn-secondary">Click</button>
</tooltip>

<!-- Focus trigger (for inputs) -->
<tooltip content="Focus on me" trigger="focus">
  <input placeholder="Focus here">
</tooltip>
```

## Using Trigger Component

```html
More about <trigger for="tt:trigger_id">trigger</trigger>.
<tooltip id="tt:trigger_id" content="This tooltip triggered by a trigger"></tooltip>
<br>
This is the same <trigger for="tt:trigger_id">trigger</trigger> as last one.
```

## Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | String | `hover focus` | How triggered: `click`, `focus`, `hover`, or space-separated combination |
| `content` | String | '' | Text content (supports simple Markdown) |
| `placement` | String | `top` | Position: `top`, `left`, `right`, `bottom` |

---

# Popovers

**Popovers** show richer content with headers.

## Basic Usage

```html
<popover header="Popover Title" content="Popover content">Hover me</popover>
```

## Rich Content with Slots

```html
<popover>
  <span slot="header">**Bold Header**</span>
  <span slot="content">
    - List item 1
    - List item 2
  </span>
  Hover for popover
</popover>
```

## External Content

```html
<popover src="content.md#section">External content</popover>
```

## Placement and Trigger

```html
<popover header="Title" content="Content" placement="top" trigger="click">
  Click me
</popover>
```

## Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `header` | slot | - | Popover header (supports Markdown) |
| `content` | slot | - | Popover content |
| `src` | String | - | Path to external `.md` or `.html` file |
| `trigger` | String | `hover focus` | How triggered |
| `placement` | String | `top` | Position |

---

# Modals

**Modals** are full-screen overlay dialogs.

## Basic Modal

```html
<modal header="Modal Title" id="myModal">
  Modal content here
</modal>

<trigger trigger="click" for="modal:myModal">Open Modal</trigger>
```

## Sizes

```html
<modal header="Small Modal" id="small" small>Content</modal>
<modal header="Large Modal" id="large" large>Content</modal>
<modal header="Centered Modal" id="centered" center>Content</modal>
```

## Custom Footer

```html
<modal header="Custom Actions" id="custom">
  Content
  
  <span slot="footer">
    <button class="btn btn-secondary">Cancel</button>
    <button class="btn btn-primary">Save</button>
  </span>
</modal>
```

## Custom OK Button

```html
<modal header="Confirm" id="confirm" ok-text="I understand!">
  Please acknowledge this message
</modal>
```

## Animation Effects

```html
<modal header="Zoom Effect" id="zoom" effect="zoom">Default (zoom)</modal>
<modal header="Fade Effect" id="fade" effect="fade">Fade animation</modal>
```

## Disable Backdrop Close

```html
<modal header="No Backdrop Close" id="noBackdrop" :backdrop="false">
  Click outside won't close this
</modal>
```

## Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `header` | slot | - | Modal header (supports Markdown) |
| `footer` | slot | - | Custom footer (replaces OK button) |
| `ok-text` | String | - | OK button text |
| `id` | String | - | Unique ID for trigger |
| `effect` | `zoom`, `fade` | `zoom` | Animation |
| `small` | Boolean | false | Small modal |
| `large` | Boolean | false | Large modal |
| `center` | Boolean | false | Vertically center |
| `backdrop` | Boolean | true | Close on backdrop click |

---

# Triggers

**Triggers** activate tooltips, popovers, and modals.

## Syntax

```html
<trigger trigger="event" for="prefix:id">Trigger text</trigger>
```

## Prefix Reference

| Prefix | Component |
|--------|-----------|
| `modal:` | Modal |
| `tt:` | Tooltip |
| `pop:` | Popover |

## Trigger Events

| Event | Description |
|-------|-------------|
| `click` | Mouse click |
| `hover` | Mouse hover |
| `focus` | Keyboard focus |

## Examples

```html
<!-- Open modal -->
<trigger trigger="click" for="modal:myModal">Open Modal</trigger>

<!-- Show tooltip -->
<trigger trigger="hover" for="tt:myTooltip">Show Tooltip</trigger>

<!-- Show popover -->
<trigger trigger="click" for="pop:myPopover">Show Popover</trigger>
```

## Combined Triggers

```html
<trigger trigger="click hover" for="pop:myPopover">
  Click or hover to show
</trigger>
```