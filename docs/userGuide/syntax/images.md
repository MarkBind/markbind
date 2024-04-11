## Images

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
![](https://markbind.org/images/logo-lightbackground.png)
</variable>
</include>

<box type="info">
  URLs can be specified as relative references. More info in: <i><a href="#intraSiteLinks">Intra-Site Links</a></i>
</box>


<div id="short" class="d-none">

```markdown
![alt text here](https://markbind.org/images/logo-lightbackground.png "title here")
```
</div>

<div id="examples" class="d-none">

![alt text here](https://markbind.org/images/logo-lightbackground.png "title here")
</div>

**Adjusting image dimension**

MarkBind also supports the `=Wx` shorthand for specifying image width:

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
This image has a width of 100px: ![](https://markbind.org/images/logo-lightbackground.png =100x)
</variable>
</include>

<box type="info">
  The width of images cannot exceed that of their parent container. If the specified width is too large, it will be ignored.
</box>

MarkBind does not support setting the height of images through the `=WxH` or `=xH` syntax. This is because images are automatically resized to ensure responsiveness based on their width.

**Auto-linkify**

MarkBind automatically wraps images with link to the image URL such that one can click on the image to view the full image.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
Click on the image to open the image: ![logo](https://markbind.org/images/logo-lightbackground.png =150x)
</variable>
</include>

If the image is wrapped with a link, the link will be used instead.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
Clicking on this image will bring you to the MarkBind homepage (instead of opening the image):
[![logo](https://markbind.org/images/logo-lightbackground.png =150x)](https://markbind.org)
</variable>
</include>

<box type="info" seamless>

If you want to display images with captions, or have the image auto-resize to fit its container, take a look at [MarkBind's `pic` component]({{baseUrl}}/userGuide/components/imagesAndDiagrams.html#pictures).

</box>
