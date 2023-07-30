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

**To customize Unordered list, add the configuration `{icon="icon-name"}` after a specific list item**

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

1. If an item has a specified icon, that icon will be used for it and for subsequent items at that level.
2. If any item at a level is customized, the first item at that level must also be customized. If not, the list will be invalidated.
3. You can use any of the [icons](../formattingContents.html#icons) supported by MarkBind.
4. When using icons, omit the `::` around the icon name (e.g., use `{icon="fas-home"}` instead of `{icon=":fas-home:"}`).

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

**You can use images as icon.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* Item 1 { icon="/images/deer.jpg" i-width="30px" }
* Item 2 { i-width="60px" i-height="34px" }
* Item 3 { i-width="90px" i-height="51px" }
* Item 4 { i-width="120px" i-height="68px" }
* Item 5 { i-width="150px" i-height="84px" }

</variable>
</include>

If either the `i-width` or the `i-height` of an image is not specified, the unspecified dimension will adjust to maintain the image's original aspect ratio (e.g. Original Image: 800x600 (aspect ratio 4:3), Set `i-width`: 500px, Outcome: 500x375).

**The icon's appearance can be further customized by adding a `i-class` attribute.**

<div id="main-example-markbind">

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* Item 1 <br>
  Item 1 line 2{ icon="/images/deer.jpg" i-width="60px" height="17px" i-class="rounded" }
* Item 2
  Item 2 Continue
  * Item 2.1 { icon="fas-question-circle" i-class="badge rounded-pill my-1 bg-success text-white" }
  * Item 2.2 { i-class="badge rounded-pill my-1 bg-danger text-white" }
  * Item 2.3 
    * Item 2.3.1 { icon="fas-question-circle" i-class="badge rounded my-1 bg-danger text-white" }
* Item 3
  * Item 3.1 
  * Item 3.2 { i-class="badge rounded-pill my-1 bg-primary text-white"}
  * Item 3.3 { icon="fas-compass" i-class="badge rounded-pill my-1 bg-warning text-white }
  * Item 3.4
* Item 4
  * Item 4.1
    * Item 4.1.1
  * Item 4.2 
</variable>
</include>

1. Once a `i-class` attribute is assigned to an icon, it will continue apply to icons at the same level, until it is overridden by a different `i-class` attribute (e.g., from Item 2.1 to Item 2.2, and so on to Item 3.2).

</div>


**You can apply Markdown's heading and paragraph syntax within the list.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* #### Heading 1: Overview {icon="/images/overview-d.png" i-width="65px" i-class="rounded" }
  
   Content 1: This section provides a summary of the document or topic. 
   It sets the context and purpose of the content to follow.

   * ##### Heading 1.1: Highlights { icon="/images/highlights-d.png" i-width="65px" i-class="rounded" }
  
      Content 1.1: Here we summarize the key points, findings, or features of the main topic. 
      This could include important data, outcomes, or insights.

* #### Heading 2: Detailed Description { icon="/images/detailed-d.png" i-width="65px" i-class="rounded" }
    
   Content 2: This section delves deeper into the topic, offering comprehensive information and detailed explanations.
   It might also include evidence, examples, or justifications.

* #### Heading 3: Conclusion { icon="/images/conclusion-d.png" i-width="65px" i-class="rounded" }
  
    Content 3: The conclusion draws together the main threads of the topic, 
    summarizing the central points and their implications.

   * ##### Heading 3.1: Final Thoughts
  
     Content 3.1: This is a place for final reflections, recommendations, or a look towards future developments or trends.

</variable>
</include>

1. Icon specifications should be attached only to the first element of a list item (for the example above, the icon specification should be attached to the heading, not the block of text below the heading).
2. A blank line must separate a heading from the content that follows it.

****Ordered lists:****

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
1. Item 1
   1. Sub item 1.1
   1. Sub item 1.2
1. Item 2
1. Item 3
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
