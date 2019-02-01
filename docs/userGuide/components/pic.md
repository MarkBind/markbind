## Pic

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

****Options****
Name | Type | Default | Description 
--- | --- | --- | ---
alt | `string` | | **This must be specified.**<br>The alternative text of the image.
height | `string` | | The height of the image in pixels.
src | `string` | | **This must be specified.**<br>The URL of the image.
width | `string` | | The width of the image in pixels.<br>If both width and height are specified, width takes priority over height. It is to maintain the image's aspect ratio.
