# Navbar

#### Navbar allows visitors of your website to navigate through pages easily.

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
    <navbar type="default">
      <!-- Brand as slot -->
      <a slot="brand" href="/" title="Home" class="navbar-brand">MarkBind</a>
      <!-- You can use dropdown component -->
      <dropdown text="Dropdown">
        <li><a href="#navbar">Option</a></li>
      </dropdown>
      <!-- For right positioning use slot -->
      <li slot="right">
        <a href="https://github.com/MarkBind/markbind" target="_blank">Fork...</a>
      </li>
    </navbar>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<navbar placement="top" type="default">
  <!-- Brand as slot -->
  <a slot="brand" href="/" title="Home" class="navbar-brand">MarkBind</a>
  <!-- You can use dropdown component -->
  <dropdown text="Dropdown">
    <li><a href="#navbar">Option</a></li>
  </dropdown>
  <!-- For right positioning use slot -->
  <li slot="right">
    <a href="https://github.com/MarkBind/markbind" target="_blank">Fork...</a>
  </li>
</navbar>
```
</tip-box>
<br>

## Navbar Options
Name | Type | Default | Description 
--- | --- | --- | ---
placement | `String` | `''` | Supports: `top`, `bottom`, `static`, or empty for normal. 
type | `String` | `default` | Supports: `inverse`, `default`.
