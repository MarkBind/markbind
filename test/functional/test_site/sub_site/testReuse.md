This is a page from another Markbind site.
The purpose of this page is to ensure that reuse works as expected.
All the following images should display correctly.

Some variables:
<variable name="imgFolder">images</variable>

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
<a href="{{baseUrl}}/images/I'm not allowed to use my favorite tool.png">Link to picture</a>
<a id="namedAnchor">Named Anchor</a>
<a>Anchor with no attributes</a>