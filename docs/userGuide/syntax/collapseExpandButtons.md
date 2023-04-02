## Collapse Expand Buttons

 The collapse expand buttons component provides an easy way for readers to expand and collapse all dropdowns in the site navigation.

 #### Usage

 Include the collapse expand buttons component (`<collapse-expand-buttons />`) in the layout file to add the buttons to your page. The collapse expand buttons can be added to any location within the site navigation and will always appear at the top right.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<div class="site-nav-top">
  <div class="fw-bold mb-2" style="font-size: 1.25rem;">
    User Guide
  </div>
</div>
<site-nav>
* [Getting Started]({{baseUrl}}/userGuide/gettingStarted.html)
* Authoring Contents :expanded:
  * [Overview]({{baseUrl}}/userGuide/authoringContents.html)
  * [Adding Pages]({{baseUrl}}/userGuide/addingPages.html)
  * [MarkBind Syntax Overview]({{baseUrl}}/userGuide/markBindSyntaxOverview.html)
  * [Formatting Contents]({{baseUrl}}/userGuide/formattingContents.html)
  * [Using Components]({{baseUrl}}/userGuide/usingComponents.html)
</site-nav>
<collapse-expand-buttons />
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