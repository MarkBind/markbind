# Boxes

**Boxes** highlight small, specific pieces of information with styled containers.

## Simple Example

```html
<box>
plain text
</box>

<box>
<md>_markdown_</md>
</box>
```

## Box Types

```html
<box type="info">info</box>
<box type="warning">warning</box>
<box type="success">success</box>
<box type="important">important</box>
<box type="wrong">wrong</box>
<box type="tip">tip</box>
<box type="definition">definition</box>
<box type="info" dismissible>dismissible info</box>
```

## Box Themes

Color the built-in types with themes:

```html
<box type="info" theme="primary">primary</box>
<box type="info" theme="secondary">secondary</box>
<box type="info" theme="success">success</box>
<box type="info" theme="danger">danger</box>
<box type="info" theme="warning">warning</box>
<box type="info" theme="info">info</box>
<box type="info" theme="light">light</box>
<box type="info" theme="dark">dark</box>
```

## Light Style

```html
<box light>default light</box>
<box type="info" light>info light</box>
<box type="warning" light>warning light</box>
<box type="success" light>success light</box>
<box type="definition" header="##### Header markdown :rocket:" light>
definition light with header markdown
</box>
```

## Seamless Style

```html
<box seamless>default seamless</box>
<box type="info" seamless>info seamless</box>
<box type="definition" header="##### Header markdown :rocket:" seamless>
success seamless with header markdown
</box>
```

Note: `light` and `seamless` are mutually exclusive. `light` takes priority.

## Custom Styling

```html
<box background-color="#ffca6a" border-color="grey" border-left-color="#8b5a01">
default type, styled as an orange box with a brown left border
</box>
<box type="info" color="red" icon=":rocket:">
info, with a custom markdown rocket icon and `red` colored text.
</box>
```

## Remove Default Elements

```html
<box no-icon no-background type="success">
success box without a tick icon and background
</box>
<box no-border type="definition" light>
definition type box, light style without border
</box>
```

Note: Custom styles (`background-color`, `border-color`, `border-left-color`, `icon`) take precedence over `no-background`, `no-border`, `no-icon`.

## Icon Customization

```html
<box type="success" icon=":fas-camera:">
Lorem ipsum dolor sit amet
</box>
<box type="warning" icon=":fas-camera:" icon-size="2x">
With 2x icon size
</box>
<box type="definition" icon=":fas-camera:" icon-size="3x" icon-color="red">
With 3x red icon
</box>
```

## Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `background-color` | String | null | Custom background color |
| `border-color` | String | null | Custom border color |
| `border-left-color` | String | null | Override border-color for left border |
| `color` | String | null | Text color |
| `dismissible` | Boolean | false | Adds close button to top right |
| `icon` | String | null | Inline Markdown for icon |
| `icon-size` | String | null | Resize icon (e.g., `2x`, `3x`) |
| `icon-color` | String | null | Icon color |
| `header` | String | null | Markdown text for box header |
| `type` | String | '' | `info`, `warning`, `success`, `important`, `wrong`, `tip`, `definition` |
| `theme` | String | '' | `primary`, `secondary`, `success`, `danger`, `warning`, `tip`, `light`, `dark` |
| `light` | Boolean | false | Light color scheme |
| `seamless` | Boolean | false | Seamless style |
| `no-border` | Boolean | false | Remove border |
| `no-background` | Boolean | false | Remove background |
| `no-icon` | Boolean | false | Remove icon |
| `no-page-break` | Boolean | false | Keep on single printed page |