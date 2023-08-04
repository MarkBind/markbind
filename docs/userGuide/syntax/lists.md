## Lists


****Unordered lists:****

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* Item 1
  * Sub item 1.1
  * Sub item 1.2<br>
    Second line
    * Sub item 1.2.1
* Item 2
* Item 3
</variable>
</include>

****Customizing the Unordered list appearance:****

**To customize unordered lists' icons, add the configuration `{icon="icon-name"}` after a specific list item.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* Item 1 { icon="glyphicon-education" }
* Item 2
  * Item 2.1 { icon="fas-file-code" }
  * Item 2.2
* Item 3 { icon="fas-code-branch" }
  * Item 3.1 
* Item 4 { icon="octicon-git-pull-request" }
  * Item 4.1 { icon="mif-perm-media" }
* Item 5 { icon="glyphicon-education" }
  * Item 5.1 { icon="notebook_with_decorative_cover" }
  </variable>
</include>

You can use any of the [icons](../formattingContents.html#icons) supported by MarkBind. If an item has a specified icon, that icon will be used for it and for subsequent items at that level.

<box type=warning seamless>
If you customize any item on a certain level, you must also customize the first item on that level. If not, the list will revert to its uncustomized form.
</box>

**You can adjust the icon's size by using the `i-size` attribute.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* Item 1 { icon="fas-file-code" i-size="35px" }
* Item 2 { icon="fas-file-code" i-size="4rem" }
* Item 3 { icon="fas-file-code" i-size="5em" }

</variable>
</include>

You can utilize any [CSS size unit](https://www.w3schools.com/cssref/css_units.php).

**You can also use images as icons.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* Item 1 { icon="/images/deer.jpg" i-width="30px" }
* Item 2 { i-width="60px" i-height="44px" }
* Item 3 { i-width="90px" i-height="61px" }

</variable>
</include>

If either the `i-width` or the `i-height` of an image is not specified, the unspecified dimension will adjust to maintain the image's original aspect ratio. For example, for an image of size 800x600 (4:3), if `i-width` is set to 400px, its height will be 300px.

**The icon's appearance can be further customized by adding a `i-class` attribute.**

<div id="main-example-markbind">

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* Item 1 { icon="/images/deer.jpg" i-width="60px" height="17px" i-class="rounded" }
* Item 2
  * Item 2.1 { icon="fas-question-circle" i-class="badge rounded-pill my-1 bg-success text-white" }
  * Item 2.2
  * Item 2.3 { i-class="badge rounded-pill my-1 bg-primary text-white"}
* Item 3
  * Item 3.1 
  * Item 3.2  { icon="fas-question-circle" i-class="badge rounded my-1 bg-danger text-white" }
  * Item 3.3 
</variable>
</include>
  
<box type=tip seamless>

Similar to the `icon` attribute, other icon attributes such as `i-class`, `i-width`, `i-height` apply for subsequent list items at the same level, until they are overridden by the same attribute. For example, Item 2.3's `i-class` overrides Item 2.1's and applies up to Item 3.1.
</box>

</div>

**You can apply Markdown's heading and paragraph syntax within the list.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* #### Heading 1: Overview {icon="/images/overview-d.png" i-width="65px" i-class="rounded" }
  
   Content 1: This section provides a summary of the document or topic. 
   It sets the context and purpose of the content to follow.

</variable>
</include>

Always leave a blank line between the heading and the content that comes after it.

****Ordered lists:****

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
1. Item 1
   1. Sub item 1.1
   2. Sub item 1.2
2. Item 2
3. Item 3
</variable>
</include>

<box type="tip" seamless>
You can also start an ordered list at a particular number by changing the
<popover>
first number
<template slot="content">
<div style="text-align: center; margin-bottom: 5px;">{{ icon_example }}</div>
<include src="codeAndOutputSeparate.md" boilerplate>
<variable name="highlightStyle">markdown</variable>
<variable name="code">
10. Item 1
   1. Sub item 1.1
   1. Sub item 1.2
1. Item 2
</variable>
<variable name="output">
10. Item 1
   1. Sub item 1.1
   1. Sub item 1.2
1. Item 2
{.ps-0 .ms-0}
</variable>
</include>
</template>
</popover>!
</box>

<small>More info on above list types: https://www.markdownguide.org/basic-syntax#lists</small>

****Task lists**** (from GFMD):

<div id="main-example-gfmd">
<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
- [ ] Item 1
   - [ ] Sub item 1.1
   - [x] Sub item 1.2
- [x] Item 2
- [ ] Item 3
</variable>
</include>
</div>


****Radio-button lists:****
<div id="main-example-markbind">
<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
- ( ) Item 1
- ( ) Item 2
- (x) Item 3
</variable>
</include>
</div>

<div id="short" class="d-none">

```markdown
1. Item 1
   1. Sub item 1.1
   1. Sub item 1.2
* Item 2
  * item 2.1
- [ ] Item 3
- [x] Item 4
- ( ) Item 5
```
</div>
<div id="examples" class="d-none">

1. Item 1
   1. Sub item 1.1
   1. Sub item 1.2
* Item 2
  * item 2.1
- [ ] Item 3
- [x] Item 4
- ( ) Item 5
</div>
