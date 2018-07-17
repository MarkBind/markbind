# TipBox

**You can either use \<tip-box> or \<box>.**

**TipBox comes with different built-in types.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
    <tip-box>
        default
    </tip-box>
    <tip-box type="info">
        info
    </tip-box>
    <tip-box type="warning">
        warning
    </tip-box>
    <tip-box type="success">
        success
    </tip-box>
    <tip-box type="important">
        important
    </tip-box>
    <tip-box type="wrong">
        wrong
    </tip-box>
    <tip-box type="tip">
        tip
    </tip-box>
    <tip-box type="definition">
        definition
    </tip-box>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<tip-box>
    default
</tip-box>
<tip-box type="info">
    info
</tip-box>
<tip-box type="warning">
    warning
</tip-box>
<tip-box type="success">
    success
</tip-box>
<tip-box type="important">
    important
</tip-box>
<tip-box type="wrong">
    wrong
</tip-box>
<tip-box type="tip">
    tip
</tip-box>
<tip-box type="definition">
    definition
</tip-box>
```
</tip-box>
<br>

**You can customize the TipBox's appearance.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
    <box background-color="white" border-color="grey" border-left-color="blue">
        default, styled as empty box with blue left border
    </box>
    <box type="info" icon=":rocket:">
        info, with rocket icon
    </box>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<box background-color="white" border-color="grey" border-left-color="blue">
    default, styled as empty box with blue left border
</box>
<box type="info" icon=":rocket:">
    info, with rocket icon
</box>
```
</tip-box>
<br>

## TipBox Options
Name | Type | Default | Description 
--- | --- | --- | ---
background-color | `String` | `null` |
border-color | `String` | `null` |
border-left-color | `String` | `null` | Overrides border-color for the left border.
color | `String` | `null` | Color of the text.
icon | `String` | `null` |
type | `String` | `'none'` | Supports: `info`, `warning`, `success`, `important`, `wrong`, `tip`, `definition`, or empty for default.
