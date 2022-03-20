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


<span id="short" class="d-none">

```markdown
![alt text here](https://markbind.org/images/logo-lightbackground.png "title here")
```
</span>

<span id="examples" class="d-none">

![alt text here](https://markbind.org/images/logo-lightbackground.png "title here")
</span>

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
