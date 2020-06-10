## Thumbnails

**A `thumbnail` component allows you to insert thumbnails using text, images, or icons.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<thumbnail circle src="../../images/deer.jpg" size="100"/>
<thumbnail circle text=":book:" background="#dff5ff" size="100"/>
<thumbnail circle text="___CS___" background="#333" font-color="white" size="100"/>
<thumbnail circle text=":fas-book:" font-color="darkgreen" border="3px solid darkgreen" size="100"/>

<thumbnail src="../../images/deer.jpg" size="100"/>
<thumbnail text=":book:" background="#dff5ff" size="100"/>
<thumbnail text="___CS___" background="#333" font-color="white" size="100"/>
<thumbnail text=":fas-book:" font-color="darkgreen" border="3px solid darkgreen" size="100"/>
</variable>
</include>

****Options****
Name | Type | Default | Description
--- | --- | --- | ---
alt | `string` | | **This must be specified if `src` is specified**<br>The alternative text of the image.
background | `string` | | Specifies the background color.<br> Accepts any valid CSS background property
border | `string` | | Specifies the border thickness, type, and color.<br> Accepts any valid CSS border property
circle | `boolean` | false | If this option is enabled, the thumbnail will be circle shaped instead of square
font-color | `string` | | The color of the text, affects normal text and icons (but not emojis)
font-size | `string` | | Text size, defaults to half of `size`, affects text, icons and emojis
size | `string` | 100 | The size of the thumbnail in pixels
src | `string` | | The URL of the image.<br>The URL can be specified as absolute or relative references. More info in: _[Intra-Site Links]({{baseUrl}}/userGuide/formattingContents.html#intraSiteLinks)_
text | `string` | | The text to use in the thumbnail, [icons]({{baseUrl}}/userGuide/formattingContents.html#icons), [emojis]({{baseUrl}}/userGuide/formattingContents.html#emoji) and markdown are supported here

<box type="info">

If both `text` and `src` are specified, `src` will take higher priority.
</box>

<span id="short" class="d-none">

```html
<thumb circle src="https://markbind.org/images/logo-lightbackground.png" size="100"/>
```
</span>

<span id="examples" class="d-none">
<thumb circle src="https://markbind.org/images/logo-lightbackground.png" size="100"/>
</span>
