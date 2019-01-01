## Box

**Box comes with different built-in types.**

<box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
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
</box>

<box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
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
```
</box>
<br>

**You can customize the TipBox's appearance.**

<box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
    <box background-color="white" border-color="grey" border-left-color="blue">
        default, styled as empty box with blue left border
    </box>
    <box type="info" icon=":rocket:">
        info, with rocket icon
    </box>
</box>

<box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<box background-color="white" border-color="grey" border-left-color="blue">
    default, styled as empty box with blue left border
</box>
<box type="info" icon=":rocket:">
    info, with rocket icon
</box>
```
</box>
<br>

#### TipBox Options
Name | Type | Default | Description 
--- | --- | --- | ---
background-color | `String` | `null` |
border-color | `String` | `null` |
border-left-color | `String` | `null` | Overrides border-color for the left border.
color | `String` | `null` | Color of the text.
icon | `String` | `null` |
type | `String` | `'none'` | Supports: `info`, `warning`, `success`, `important`, `wrong`, `tip`, `definition`, or empty for default.
