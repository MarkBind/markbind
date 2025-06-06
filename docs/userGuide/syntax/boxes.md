{% from "userGuide/components/advanced.md" import slot_info_trigger %}

## Boxes

**Simple Example**
<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<box>
plain text
</box>

<box>
<md>_markdown_</md>
</box>
</variable>
</include>

**Boxes come with different built-in types.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<box type="info">
    info
</box>
<box type="warning">
    warning
</box>
<box type="success">
    success
</box>
<box type="important">
    important
</box>
<box type="wrong">
    wrong
</box>
<box type="tip">
    tip
</box>
<box type="definition">
    definition
</box>
<box type="info" dismissible>
    dismissible info
</box>
<box type="success" header="#### Header :rocket:" icon-size="2x">

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

  <box type="warning" header="You can use **markdown** here! :pizza:" dismissible>
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  </box>
</box>
</variable>
</include>

**The built in types can be colored.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<box type="info" theme="primary">
    primary
</box>
<box type="info" theme="secondary">
    secondary
</box>
<box type="info" theme="success">
    success
</box>
<box type="info" theme="danger">
    danger
</box>
<box type="info" theme="warning">
    warning
</box>
<box type="info" theme="info">
    info
</box>
<box type="info" theme="light">
    light
</box>
<box type="info" theme="dark">
    dark
</box>
</variable>
</include>

**MarkBind also supports a light color scheme for boxes**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<box light>
    default light
</box>
<box type="info" light>
    info light
</box>
<box type="warning" light>
    warning light
</box>
<box type="success" light>
    success light
</box>
<box type="important" light>
    important light
</box>
<box type="wrong" light>
    wrong light
</box>
<box type="tip" light>
    tip light
</box>
<box type="definition" light>
    definition light
</box>
<box type="definition" header="##### Header markdown :rocket:" light>
    definition light with header markdown
</box>
</variable>
</include>

**MarkBind also supports a seamless style of boxes**

<box type="info">

As `light` and `seamless` are mutually exclusive styles, `light` takes priority over `seamless`.
</box>

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<box seamless>
    default seamless
</box>
<box type="info" seamless>
    info seamless
</box>
<box type="warning" seamless>
    warning seamless
</box>
<box type="success" seamless>
    success seamless
</box>
<box type="important" seamless>
    important seamless
</box>
<box type="wrong" seamless>
    wrong seamless
</box>
<box type="tip" seamless>
    tip seamless
</box>
<box type="definition" seamless dismissible>
    dismissible definition seamless
</box>
<box type="definition" header="##### Header markdown :rocket:" seamless>
    success seamless with header markdown
</box>
</variable>
</include>

**You can further customize the Box's appearance.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<box background-color="#ffca6a" border-color="grey" border-left-color="#8b5a01">
default type, styled as an orange box with a brown left border
</box>
<box type="info" color="red" icon=":rocket:">

info, with a custom markdown rocket icon and `red` colored text.

You can use any inline markdown in the `icon` property.
</box>
</variable>
</include>

**You can remove the background, icon and borders of preset styles.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<box no-icon no-background type="success">
    success box without a tick icon and backgound
</box>

<box no-border type="definition" light>
    definition type box, light style without border
</box>
</variable>
</include>

<box header="Note" type="info" seamless>

Custom styles **(** `background-color`, `border-color`, `border-left-color`, `icon` **)** as introduced in the previous section, takes precedence over the `no-background`, `no-border`, `no-icon` attributes.
</box>

**You can also use icons, resize them and change their color accordingly.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<box type="success" icon=":fas-camera:">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit
</box>
<box type="warning" icon=":fas-camera:" icon-size="2x">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
</box>
<box type="definition" icon=":fas-camera:" icon-size="3x">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</box>
<box type="info" icon=":fas-camera:" icon-color="red" icon-size="3x">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</box>
</variable>
</include>

****Options****
Name | Type | Default | Description
--- | --- | --- | ---
background-color | `String` | `null` |
border-color | `String` | `null` |
border-left-color | `String` | `null` | Overrides border-color for the left border.
color | `String` | `null` | Color of the text.
dismissible | `Boolean` | `false` | Adds a button to close the box to the top right corner.
icon{{slot_info_trigger}} | `String` | `null` | Inline MarkDown text of the icon displayed on the left.
icon-size | `String` | `null` | Resizes the icon. Supports integer-scaling of the icon dimensions e.g. `2x`, `3x`, `4x`, etc.
icon-color | `String` | `null` | Color of the icon.
header{{slot_info_trigger}} | `String` | `null` | Markdown text of the box header.
type | `String` | `''` | Supports: `info`, `warning`, `success`, `important`, `wrong`, `tip`, `definition`, or empty for default.
theme | `String` | `''` | Supports: `primary`, `secondary`, `success`, `danger`, `warning`, `tip`, `light`, `dark` or empty for default.
light | `Boolean` | `false` | Uses a light color scheme for the box.
seamless | `Boolean` | `false` | Uses a seamless style for the box. If `light` is specified, this style will not be activated.
no-border | `Boolean` | `false` | Removes border, except if styled by `border-color` or `border-left-color`. 
no-background | `Boolean` | `false` | Removes background, except if styled by `background-color` option.
no-icon | `Boolean` | `false` | Removes icon, except if icon is displayed via `icon` option.
no-page-break | `Boolean` | `false`| Prints the box fully on a single page by moving it to a new page if needed.


<div id="short" class="d-none">

```html
<box type="warning">
  warning
</box>
```
</div>
<div id="examples" class="d-none">

<box>
    default
</box>
<box type="info">
    info
</box>
<box type="warning">
    warning
</box>
<box type="success">
    success
</box>
<box type="important">
    important
</box>
<box type="wrong">
    wrong
</box>
<box type="tip">
    tip
</box>
<box type="definition">
    definition
</box>
</div>
