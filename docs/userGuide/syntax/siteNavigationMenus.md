## Site Navigation Menus

<div id="content">

**A _Site Navigation Menu_ (==_siteNav_ for short==) can be used to show a road map of the main pages of your site.**

Steps to add a siteNav:
1. Format your siteNav as an unordered Markdown list
2. Include it under a `<site-nav>` element.
3. (Optional) To make siteNav accessible on smaller screens, you can use the `<site-nav-button />` component in the [navbar]({{baseUrl}}/userGuide/components/navigation.html#navbars).


<include src="codeAndOutput.md" boilerplate >
<variable name="code">
<site-nav>
* [**Getting Started**]({{baseUrl}}/userGuide/gettingStarted.html)
* **Authoring Contents** :expanded:
  * [Overview]({{baseUrl}}/userGuide/authoringContents.html)
  * [Adding Pages]({{baseUrl}}/userGuide/addingPages.html)
  * [MarkBind Syntax Overview]({{baseUrl}}/userGuide/markBindSyntaxOverview.html)
  * [Formatting Contents]({{baseUrl}}/userGuide/formattingContents.html)
  * [Using Components]({{baseUrl}}/userGuide/usingComponents.html)
</site-nav>
</variable>
</include>


MarkBind has styles nested lists with additional padding and smaller text sizes up to **4** nesting levels.
Beyond that, you'd have to include your own styles.

****Expanding menu items by default****

You can **append the `:expanded:` to a <tooltip content="a menu item with sub menu-items">parent menu item</tooltip> to make it expand by default.** In the example above, `* Authoring Contents :expanded:` makes the menu item `Authoring Contents` expand by default.

</div>

<div id="examples" class="d-none">

You can see an example of a Site Navigation Menu ==on the top== of <a target="_blank" href="{{ baseUrl }}/userGuide/formattingContents.html">this page</a>.
</div>

<div id="short" class="d-none">

```html
<site-nav>
* [**Getting Started**]({{baseUrl}}/userGuide/gettingStarted.html)
* **Authoring Contents** :expanded:
  * [Overview]({{baseUrl}}/userGuide/authoringContents.html)
  * [Adding Pages]({{baseUrl}}/userGuide/addingPages.html)
  * [MarkBind Syntax Overview]({{baseUrl}}/userGuide/markBindSyntaxOverview.html)
  * [Formatting Contents]({{baseUrl}}/userGuide/formattingContents.html)
  * [Using Components]({{baseUrl}}/userGuide/usingComponents.html)
</site-nav>
```

</div>
