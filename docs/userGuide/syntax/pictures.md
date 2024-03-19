## Pictures

**A `pic` component allows you to add captions below the image.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<pic src="https://markbind.org/images/logo-lightbackground.png" width="300" alt="Logo" lazy>
  MarkBind Logo
</pic>
</variable>
</include>

****Options****
Name | Type | Default | Description 
--- | --- | --- | ---
alt | `string` | | **This must be specified.**<br>The alternative text of the image.
height | `string` | | The height of the image in pixels.
src | `string` | | **This must be specified.**<br>The URL of the image.<br>The URL can be specified as absolute or relative references. More info in: _[Intra-Site Links]({{baseUrl}}/userGuide/formattingContents.html#intraSiteLinks)_
width | `string` | | The width of the image in pixels.<br>If both width and height are specified, width takes priority over height. It is to maintain the image's aspect ratio.
lazy | `boolean` | false | The `<pic>` component lazy loads if this attribute is specified.<br>**Either the height or width should be specified to avoid layout shifts while lazy loading images.**

<div id="short" class="d-none">

```html
<pic src="https://markbind.org/images/logo-lightbackground.png" width="300" alt="Logo" lazy>
  MarkBind Logo
</pic>
```
</div>

<div id="examples" class="d-none">

<pic src="https://markbind.org/images/logo-lightbackground.png" width="300" alt="Logo">
  MarkBind Logo
</pic>
</div>
