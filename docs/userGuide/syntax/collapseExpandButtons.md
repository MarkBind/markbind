## Collapse Expand Buttons

 The collapse expand buttons component provides an easy way for readers to expand and collapse all dropdowns in the site navigation.

 #### Usage

 Include the collapse expand buttons component (`<collapse-expand-buttons />`) in the layout file to add the buttons to your page. A common places to add collapse expand buttons are at the bottom of the site navigation.

<include src="codeAndOutput.md" boilerplate >
<variable name="heading">Collapse Expand Buttons at Bottom</variable>
<variable name="code">
<nav id="site-nav">
<site-nav>
* [**Getting Started**]({{baseUrl}}/userGuide/gettingStarted.html)
* **Authoring Contents** :expanded:
  * [Overview]({{baseUrl}}/userGuide/authoringContents.html)
  * [Adding Pages]({{baseUrl}}/userGuide/addingPages.html)
  * [MarkBind Syntax Overview]({{baseUrl}}/userGuide/markBindSyntaxOverview.html)
  * [Formatting Contents]({{baseUrl}}/userGuide/formattingContents.html)
  * [Using Components]({{baseUrl}}/userGuide/usingComponents.html)
</site-nav>
<collapse-expand-buttons />
</nav>
</variable>
</include>

<!-- Included in syntax cheat sheet -->
<div id="short" class="d-none">

```html
<collapse-expand-buttons />
```

</div>

<!-- Included in readerFacingFeatures.md -->
<div id="examples" class="d-none">

You can see an example of collapse expand buttons on the ==on the bottom left side== of this page.
</div>