This is a page from another Markbind site.
The purpose of this page is to ensure that reuse works as expected.
All the following images should display correctly.

IMG tags:
<img src="images/I'm not allowed to use my favorite tool.png">
<img src="{{imgFolder}}/I'm not allowed to use my favorite tool.png">
<img src="{{baseUrl}}/{{imgFolder}}/I'm not allowed to use my favorite tool.png">
<img src="{{baseUrl}}/images/I'm not allowed to use my favorite tool.png">
<img src="https://dummyimage.com/600x400/000/fff">

PIC tags:
<pic src="images/I'm not allowed to use my favorite tool.png"></pic>
<pic src="{{imgFolder}}/I'm not allowed to use my favorite tool.png"></pic>
<pic src="{{baseUrl}}/{{imgFolder}}/I'm not allowed to use my favorite tool.png"></pic>
<pic src="{{baseUrl}}/images/I'm not allowed to use my favorite tool.png"></pic>
<pic src="https://dummyimage.com/600x400/000/fff"></pic>

Anchor:
<a href="https://dummyimage.com/600x400/000/fff">External Image</a>
<!--
  Markdown used to be rendered before Nunjucks in links, which caused curly braces in markdown style links to be encoded.
  This was patched in https://github.com/MarkBind/markbind/commit/188db1e,
  which has been reverted as it is no longer the case. This is also a small regression test hence.
-->
[Link to picture](<{{baseUrl}}/images/I'm not allowed to use my favorite tool.png>)
<a id="namedAnchor">Named Anchor</a>
<a>Anchor with no attributes</a>

Within DIV tag:
<div id="imageTest">
  <img src="{{baseUrl}}/images/I'm not allowed to use my favorite tool.png">
  <pic src="{{baseUrl}}/images/I'm not allowed to use my favorite tool.png"></pic>
</div>