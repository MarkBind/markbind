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
<box type="tip" seamless>
The list icons can be customized by adding an {icon="..."} at the end of a list item or a list itself.
</box>
<div id="main-example-markbind">
<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* item 1 {icon="x"}
* item 2 {icon="heavy_check_mark"}
* item 3
* item 4 {icon="/images/deer.jpg"}
  
{icon="fas fa-check"}
</variable>
</include>
</div>
<box type="warning">

1. Item-level specifications should only be attached to the list heading or list item, not the list content.
2. A blank line preceding the content is crucial.
3. It's important to insert a blank line before list-level specifications.
4. It is possible to any of the icons supported by MarkBind (e.g., Font Awesome, Octicons, Glyphicons, Images and etc.) as the icon of a list item.
</box>

<box type="tip" seamless>
It is possible to specify icons for nested levels using the icons attribute.
</box>
<div id="main-example-markbind">
<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* item 1
* item 2 
  * item 2.1
  * item 2.2
  
  {icon="x"}
* item 3
  
{icon="fas fa-check"}
</variable>
</include>
</div>

<box type="tip" seamless>
The icon appearance can be customized further a class attribute.
</box>
<div id="main-example-markbind">
<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* item 1 {icon="fas fa-check" class="text-warning"}
* item 2 {icon="fas fa-check" class="text-danger"}
* item 3 
  
{icon="fas fa-check" class="text-primary"}
</variable>
</include>
</div>
<box type="tip" seamless>

You can adjust the size of the icon by using the size attribute, which accepts the following options: 's', 'm', 'l', 'xl'.
</box>
<div id="main-example-markbind">
<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">

* item 1
  
* item 2  

* item 3 

{icon="/images/deer.jpg" size="xl" class="rounded"}
</variable>
</include>
</div>