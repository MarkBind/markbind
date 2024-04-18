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

**To customize unordered lists' icons, add the configuration `{icon="icon-name"}` and/or `{text="text"}` after a specific list item.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* Item 1 { text="Step 1 :+1:" icon="glyphicon-education" }
* Item 2 { text="Step 2" }
  * Item 2.1 { icon="fas-file-code" }
  * Item 2.2
* Item 3 { text="Step 3" }
  * Item 3.1 
* Item 4 { text="\`PR`" icon="octicon-git-pull-request" }
  * Item 4.1 { icon="mif-perm-media" }
* Item 5 { text="Step 5" icon="glyphicon-education" }
  * Item 5.1 { icon="notebook_with_decorative_cover" }
  </variable>
</include>

**You can also use `{texts="['text1', 'text2', 'text3']"}` syntax to add text customisation to a level quickly**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* Item 1 { texts="['(a)','(b)','(c)','(d)']" }
  * sub level not applied as per norm
* Item 2
* You can override once like this { text="OverrideOnce" once=true }
* Item 3
* Item 4
* Last text config will be applied when the list length exceeds texts
* Another last text
* You can override like this { text="OVERRIDE" }
* Another overrided text
  </variable>
</include>

<box type=warning seamless>

Please be alerted that when using the `{texts="['text1', 'text2', 'text3']"}` syntax, you need to have`""` outside the array, and use `''` for the string inside the array.

<panel header="Notes on having single quote `'` inside text"  minimized>

If you want to use `'` in you text icon, you need to escape it with double escape sequence. 
<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
1. Text-icons of lists can use double escape to include quote test
* item 1 { texts="['\\'a\\'','\\'b\\'','\\'c\\'']" }
* item 1
* item 1
  </variable>
</include>
</panel>
</box>



<box type=info seamless>

Customization will be carried over to the other items within the **same level of the list**.
Example: 
<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* Item 1 { icon="glyphicon-education" }
  * Item 1.1
* Item 2 
  </variable>
</include>

The customised icon appears for Item 2 but not for Item 1.1.

Hence, if you customize any item on a certain level, you must also **customize the first item on that level**. If not, the list will revert to its uncustomized form.
If you wish to remove the customization from the following levels, you can set `text` and/or `icon` to be an empty string `""`. 

Example:
<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* Item 1 { icon="glyphicon-education" text="Only for this bullet" }
* Item 2 { icon="" }
  </variable>
  </include>
</box>

You can use any of the [icons](../formattingContents.html#icons) supported by MarkBind. If an item has a specified icon, that icon will be used for it and for subsequent items at that level.

Markdown can also be used in texts.

<box type=warning seamless>
You may need to add escape characters when using special characters for Markdown in text. 
</box>

**You can add an icon or text that only applies to a specific item by using the `once` attribute.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* Item 1 { icon="glyphicon-education" }
* Item 2 { icon="fas-code-branch" once=true }
  * Item 2.1
  * Item 2.2
* Item 3
  </variable>
</include>

Subsequent items at the same level will not inherit icons or texts with the `once` attribute and will instead inherit the icons or texts before it.

The `once` attribute also applies to all other attributes such as `i-size` and `t-size` as seen below.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* Item 1 { icon="glyphicon-education" i-size="40px" i-class="text-primary" }
* Item 2 { i-size="25px" once=true }
  * Sub-item 2.1
* Item 3
  </variable>
</include>

**You can adjust the icon and text's size by using the `i-size` and `t-size` attribute respectively.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* Item 1 { icon="fas-file-code" i-size="35px" }
* Item 2 { icon="fas-file-code" i-size="4rem" }
* Item 3 { icon="fas-file-code" i-size="5em" }

</variable>
</include>

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* Item 1 { text="Step 1" t-size="35px" }
* Item 2 { text="Step 2" t-size="4rem" }
* Item 3 { text="Step 3" t-size="5em" }

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

**The icon and text's appearance can be further customized by adding a `i-class` and `t-class` attribute respectively.**

<div id="main-example-markbind">

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* Item 1 { icon="/images/deer.jpg" text="Deer" i-width="60px" height="17px" i-class="rounded" t-class="text-warning my-2" }
* Item 2 { t-class="text-info my-2" }
  * Item 2.1 { icon="fas-question-circle" i-class="badge rounded-pill my-1 bg-success text-white" }
  * Item 2.2
  * Item 2.3 { i-class="badge rounded-pill my-1 bg-primary text-white"}
* Item 3 { t-class="text-primary my-2" }
  * Item 3.1 
  * Item 3.2  { icon="fas-question-circle" i-class="badge rounded my-1 bg-danger text-white" }
  * Item 3.3 
</variable>
</include>
  
**The spacing between the icon and the content can be customized by using a `i-spacing` attribute.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* Item 1 { icon="+1" }
* Item 2 { i-spacing="1rem" }
* Item 3 { i-spacing="2rem" }
</variable>
</include>

<box type=tip seamless>

Similar to the `icon` and `text` attribute, other icon attributes such as `i-class`, `i-width`, `i-height`, `i-spacing`, `t-size` and `t-class` apply for subsequent list items at the same level, until they are overridden by the same attribute. For example, Item 2.3's `i-class` overrides Item 2.1's and applies up to Item 3.1.

</box>

**The spacing between the icon and the content can be customized by using a `i-spacing` attribute.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* Item 1 { icon="+1" text="Yay" }
* Item 2 { i-spacing="1rem" }
* Item 3 { i-spacing="2rem" }
</variable>
</include>


</div>

**You can apply Markdown's heading and paragraph syntax within the list.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* #### Heading 1: Overview {icon="/images/overview-d.png" i-width="65px" i-class="rounded" }
   Content 1: This section provides a summary of the document or topic. 
   It sets the context and purpose of the content to follow.
* #### Heading 2: Detailed Description { icon="/images/detailed-d.png" i-width="65px" i-class="rounded" }
   Content 2: This section delves deeper into the topic, offering comprehensive information and detailed explanations.
   It might also include evidence, examples, or justifications.
</variable>
</include>

Icon specifications should be attached only to the first element of a list item (for the example above, the icon specification should be attached to the heading, not the content below the heading).

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
