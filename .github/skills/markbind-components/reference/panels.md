# Panels

**Panel** is a flexible container that supports collapsing and expanding its content. It is expandable by default.

## Basic Panel

```html
<panel header="This is your header for a Panel, click me to expand!">
<markdown>_markdown_</markdown>
plain text ...
</panel>
```

## Minimized Panel

With `minimized` attribute, panel is minimized into an inline block element. The `alt` attribute specifies the minimized block header.

```html
<panel header="How to cultivate a tomato plant at home" alt="Tomatoes" minimized>
  Lorem ipsum ...
</panel>
```

## Expanded Panel

With `expanded` attribute, panels are expanded when loaded.

```html
<panel header="Have your readers click less to see the Panel's contents" expanded>
  Lorem ipsum ...
</panel>
```

## Expand Headerless

With `expand-headerless` attribute, hide the panel header when expanded.

```html
<panel header="This header will only show when the Panel is collapsed" expand-headerless>
  Lorem ipsum ...
</panel>
```

## Peek Mode

With `peek` attribute, showcase part of content without expanding.

```html
<panel header="Give your readers a peek of the content without expanding Panel" peek>
  Lorem ipsum dolor sit amet...
  Curabitur ornare ipsum eu ex congue egestas...
</panel>
```

## Panel Types

```html
<panel header="light type panel (DEFAULT)" type="light" minimized>...</panel>
<panel header="dark type panel" type="dark" minimized>...</panel>
<panel header="primary type panel" type="primary" minimized>...</panel>
<panel header="secondary type panel" type="secondary" minimized>...</panel>
<panel header="info type panel" type="info" minimized>...</panel>
<panel header="danger type panel" type="danger" minimized>...</panel>
<panel header="warning type panel" type="warning" minimized>...</panel>
<panel header="success type panel" type="success" minimized>...</panel>
<panel header="seamless type panel" type="seamless" minimized>...</panel>
<panel header="minimal type panel" type="minimal" minimized>...</panel>
```

<box background-color="#C51E3A" color="white">
:bulb: Seamless panels inherit the background colour and text colour of parents!
<panel type="seamless" header="This is an example seamless panel">
  This is its content.
</panel>
</box>

## Control Buttons

```html
<panel header="This minimized panel does not have a switch button" minimized no-minimized-switch>
  ...
</panel>
<panel header="This panel does not have a switch button" no-switch>
  ...
</panel>
<panel header="This panel does not have a close button" no-close>
  ...
</panel>
<panel header="This panel does not have either buttons" no-close no-switch>
  ...
</panel>
```

## Markdown in Header

```html
<panel header="**Bold text** :rocket: ![](https://markbind.org/images/logo-lightbackground.png =x20)" type="seamless">
  ...
</panel>
```

## External Content

```html
<panel header="Content loaded in from 'src'" src="extra/loadContent.html#fragment" minimized></panel>
```

<box type="warning" header="#### Global Effects of Script and Styles">
Importing external resources with `script` or `styles` can affect your entire MarkBind website globally.
</box>

## Popup Button

```html
<panel header="Try clicking on my pop-up button" popup-url="https://example.com">
  This panel has a popup.
</panel>
```

## Preload Content

```html
<panel header="Right click and inspect my HTML before expanding me!" src="content.md#fragment" preload>
  <p>You should be able to find this text before expanding the Panel.</p>
</panel>
```

## Nested Panels

```html
<panel header="Parent Panel">
  <panel header="Level 1 Nested Panel">
    <panel header="Level 2 Nested Panel">
      <box type="success">I'm a nested box</box>
      <panel header="Level 3 Nested Panel" type="minimal">minimal-type panel</panel>
    </panel>
  </panel>
  <panel header="Level 1 Nested Panel" type="info">Some Text</panel>
</panel>
```

## Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `header` | String | '' | Clickable header text. Supports Markdown |
| `alt` | String | Panel header | Minimized panel header text. Supports Markdown |
| `expandable` | Boolean | true | Whether Panel is expandable |
| `expanded` | Boolean | false | Whether expanded when loaded |
| `minimized` | Boolean | false | Whether minimized |
| `expand-headerless` | Boolean | false | Hide header when expanded |
| `peek` | Boolean | false | Show part of content when collapsed |
| `no-close` | Boolean | false | Hide close button |
| `no-switch` | Boolean | false | Hide expand switch |
| `no-page-break` | Boolean | false | Keep on single printed page |
| `bottom-switch` | Boolean | true | Show expand switch at bottom |
| `popup-url` | String | - | URL for popup window |
| `preload` | Boolean | false | Load content immediately |
| `src` | String | - | Path to external `.md` or `.html` file. Supports `#fragment-id` |
| `type` | String | light | `light`, `dark`, `primary`, `secondary`, `info`, `success`, `warning`, `danger`, `seamless`, `minimal` |