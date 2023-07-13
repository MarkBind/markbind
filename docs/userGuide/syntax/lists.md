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

****Customizing the list appearance:****

**To customize list icons, add the configuration `{icon="icon-name"}` either after a specific list item or at the end of the entire list.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* Item 1 {icon="glyphicon-education"}
* Item 2
  * Item 2.1 {icon="fas-file-code"}
  * Item 2.2
* Item 3 {icon="fas-code-branch"}
  * Item 3.1 
* Item 4 {icon="octicon-git-pull-request"}
  * Item 4.1 {icon="mif-perm-media"}
* Item 5 {icon="glyphicon-education"}
  * Item 5.1 {icon="notebook_with_decorative_cover"}
  </variable>
</include>
<box type="definition" seamless>

1. You can use any of the icons supported by MarkBind (e.g., Font Awesome, Octicons, Glyphicons, Images, etc.) as the icon of a list item.
1. When using emojis, omit the `::` around the icon name (e.g., use `{icon="emoji"}` instead of `{icon=":emoji:"}`).
1. If an item has a specified icon, that icon will be used for it and for subsequent items at that level. 
1. If any item at a level is customized, the first item at that level must also be customized. If not, the list will be invalidated.
</box>

**The icon's appearance can be further customized by adding a `class` attribute.**

<div id="main-example-markbind">

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* Item 1 <br>
  Item 1 line 2  {icon="fas-file-code" class="text-warning"}
* Item 2 
  Item 2 line 1 continue 
  * Item 2.1 {icon="fas-code-branch" class="text-success"}
  * Item 2.2 {class="text-danger"}
* Item 3
  * Item 3 {icon="/images/deer.jpg" width="30px" height="17px" class="rounded text-white"}
</variable>
</include>

<box type="definition" seamless>
Each item level attribute supersedes the default one. For instance, the class attribute of item 2.2 overrides the default attribute of item 2.1.
</box>

</div>

**You can adjust the icon's size by using the `size` attribute.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* Item 1 {icon="/images/deer.jpg" width="30px" height="17px"}
* Item 2 {icon="/images/deer.jpg" width="60px" height="34px"}
* Item 3 {icon="/images/deer.jpg" width="90px" height="51px"}
* Item 4 {icon="/images/deer.jpg" width="120px" height="68px"}
* Item 5 {icon="/images/deer.jpg" width="150px" height="84px"}

</variable>
</include>

<box type="definition" seamless>

1. All CSS units are acceptable for size. 
2. If height is omitted, width will be used instead, and vice versa. If both are omitted, the size defaults to the smallest icon size.
</box>

**You can apply Markdown's heading and paragraph syntax within the list.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* #### Heading 1: MarkBind Overview {icon="/images/list.png" width="65px" class="rounded"}
  
  Content 1: MarkBind is a tool for generating dynamic, text-heavy websites from Markdown. It supports various syntax schemes for enhanced content dynamism.
  * ##### Heading 3 Setup and Integration {icon="/images/setup.png" width="65px" class="rounded"}
  
  Content 3: MarkBind is easy to install, modify, and deploy. It integrates seamlessly with software project workflows and offers a live preview feature.

* #### Heading 2 Features {icon="/images/toolbox.png" width="65px" class="rounded"}
  
  Content 2: MarkBind offers built-in features like icons, emoji, and search functionality. It also supports content reuse and multiple organization methods.

* #### Heading 3 Setup and Integration {icon="/images/setup.png" width="65px" class="rounded"}
  
  Content 3: MarkBind is easy to install, modify, and deploy. It integrates seamlessly with software project workflows and offers a live preview feature.
  * ##### Heading 3 Setup and Integration
  
  Content 3: MarkBind is easy to install, modify, and deploy. It integrates seamlessly with software project workflows and offers a live preview feature.

</variable>
</include>

<box type="definition">

1. Item-level specifications should be attached only to the list heading or list item, not the list content.
2. Ensuring a blank line precedes the content is crucial.
</box>