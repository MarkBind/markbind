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
* item 1 {icon="fas-fa-times"}
* item 2 a default icon
  * item 2.1 {icon="fas-fa-check"}
  * item 2.2
  {icon="fas-fa-times"}
* item 3 {icon="fas-fa-home"}
* item 4 {icon="fas-fa-trophy"}
* item 5 {icon="glyphicon-education"}
* item 6 {icon="mif-perm-media"}
* item 7 {icon="zzz"}
* item 8 {icon="glyphicon-education"}
* item 9 {icon="octicon-git-pull-request"}
  
{icon="fas-fa-check"}
</variable>
</include>

**The icon's appearance can be further customized by adding a `class` attribute.**

<div id="main-example-markbind">

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
* item 1 {icon="fas-fa-times" class="text-danger"}
* item 2 a default icon
  * item 2.1 {icon="fas-fa-check" class="text-primary"}
  * item 2.2
  {icon="fas fa-times" class="text-danger"}
* item 3 {icon="fas-fa-home"}
* item 4 {icon="fas-fa-trophy"}
* item 5 {icon="glyphicon-education"}
* item 6 {icon="mif-perm-media"}
* item 7 {icon="zzz"}
* item 8 {icon="glyphicon-education"}
* item 9 {icon="octicon-git-pull-request"}

{icon="fas-fa-check" class="text-primary"}
</variable>
</include>

</div>

**You can adjust the icon's size by using the `size` attribute.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* item 1 {icon="/images/deer.jpg" size="25px"}
* item 1 {icon="/images/deer.jpg" size="35px"}
* item 2 {icon="/images/deer.jpg" size="45px"}
* item 3 {icon="/images/deer.jpg" size="55px"}
* item 4 {icon="/images/deer.jpg" size="65px"}
</variable>
</include>

**You can apply Markdown's heading and paragraph syntax within the list.**

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* ### Heading 1 Planning {icon="/images/planning.png" size="65px" class="rounded"}
  
   This is the content for item 1. 
   Here we discuss the key aspects and details related to this specific item. 
   Information is comprehensive, well-organized, 
   and presented in a clear, concise manner.  
   
* ### Heading 2 Detail

  For item 2, the content delves deeper into the topic, 
  providing a robust analysis and extensive insights. 
  The goal is to offer a thorough understanding of the subject matter.

* ### Heading 3 Perspective {icon="/images/angle.png" size="65px" class="rounded"}

  The content for item 3 takes a different angle, offering fresh perspectives and innovative ideas. 
  The objective is to stimulate thought and inspire creative solutions.

{icon="/images/ideas.png" size="65px" class="rounded"}
</variable>
</include>

<box type="warning">

1. Item-level specifications should be attached only to the list heading or list item, not the list content.
2. Ensuring a blank line precedes the content is crucial.
3. Inserting a blank line before list-level specifications is important.
4. Use any of the icons supported by MarkBind (e.g., Font Awesome, Octicons, Glyphicons, Images, etc.) as the icon of a list item.
5. When using emojis, omit the `::` around the icon name (e.g., use `{icon="emoji"}` instead of `{icon=":emoji:"}`).

</box>