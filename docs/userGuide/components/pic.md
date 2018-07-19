# Pic

**Pic allows you to add captions below the image.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
    <pic src="https://vuejs.org/images/logo.png" width="300" alt="Logo">
      Logo for Vue.js
    </pic>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<pic src="https://vuejs.org/images/logo.png" width="300" alt="Logo">
  Logo for Vue.js
</pic>
```
</tip-box>
<br>

## Pic Options
Name | Type | Default | Description 
--- | --- | --- | ---
alt | `string` | | The alternative text of the image. Must be specified.
height | `string` | | The height of the image in pixels.
src | `string` | | Must be specified.
width | `string` | | The width of the image in pixels.
