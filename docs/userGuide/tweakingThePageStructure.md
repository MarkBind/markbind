<frontmatter>
  title: "User Guide: Tweaking the Page Structure"
  footer: footer.md
  pageNav: "default"
  pageNavTitle: "List of Tweaks"
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# Tweaking the Page Structure

<span class="lead" id="overview">**MarkBind offers several ways to easily tweak the overall structure of a page**, for example, using headers, footers, scripts, or stylesheets.</span>

## Setting Page Properties Using Front Matter

**You can use a _Front Matter_ section to specify page properties such as the title and keywords of the page.** To specify front matter for a page, insert a `<frontmatter>` tag in the following format at the beginning of the page.

```html
<frontmatter>
  property1: value1
  property2: value2
</frontmatter>
```
<div class="indented">

{{ icon_example }} Here, we set the page `title` attribute as `Binary Search Tree`.
```html
<frontmatter>
  title: Binary Search Tree
</frontmatter>
```
</div>

**Page properties:**

* **`title`**: The title of the page. Will be used as the `<title>` attribute of the HTML page generated.
* Other properties such as `keywords`, `layout`, `head` etc. will be explained in other places of this user guide.

<include src="siteConfiguration.md#page-property-overriding" />

<hr><!-- ======================================================================================================= -->

## Tweaking the Page `<head>`

**MarkBind allows you to insert code into the `<head>` section of the generated HTML page**, for example, to add links to custom JavaScript or CSS files.

Steps:
1. Put the code you want to insert into the `<head>` into a file inside the `_markbind/head` directory.
2. Specify the file as an attribute named `head` in the `<frontmatter>` of the page.

<div class="indented">

{{ icon_example }} Suppose you want to insert the code below into the `<head>` of a page, and you have saved the code as **`_markbind/head/`**`myCustomLinks.md`:

<box>

`<script src="`{{ showBaseUrlCode }}`/js/myCustomScript.js"></script>`<br>
`<link rel="stylesheet" href="`{{ showBaseUrlCode }}`/css/main.css">`<br>
`<link rel="stylesheet" href="`{{ showBaseUrlCode }}`/css/extra.css">`

</box>

To specify that you want to insert `myCustomLinks.md` into the `<head>` of `myPage.html`, update the front matter of the `myPage.md` as follows:
 ```html
 <frontmatter>
   head: myCustomLinks.md
 </frontmatter>
 ...
 ```

</div>

**All content is inserted at the bottom of the `<head>` tag by default.** You can use the optional `<head-top>` tag to specify content that should be inserted at the top of the `<head>` tag instead.

<div class="indented">

{{ icon_example }} Here's how you can force the line `<script ... > ... </script>` to be inserted at the top of the `<head>` section.

<box>

**`<head-top>`**<br>
&nbsp;&nbsp;`<script src="`{{ showBaseUrlCode }}`/js/myCustomScript.js"></script>`<br>
**`</head-top>`**<br>
`<link rel="stylesheet" href="`{{ showBaseUrlCode }}`/css/main.css">`<br>
`<link rel="stylesheet" href="`{{ showBaseUrlCode }}`/css/extra.css">`

</box>

</div>

**Multiple head files can be included** within a page by providing a comma separated list. They will be added to the `<head>` in the order in which they are listed.
**You may specify raw `.js` or `.css` files** as your head file if you wish to do so.

<div class="indented">

{{ icon_example }}
```html
<frontmatter>
  head: customStyles.md, extraScripts.md, extra.css, other.js
</frontmatter>
```
</div>

<hr><!-- ======================================================================================================= -->

## Using Footers

**You can specify a <tooltip content="For an example of a page footer, see the bottom of this page.">page footer</tooltip>** using a `<footer>` tag.

<div class="indented">

{{ icon_example }}
```html
<!-- main body of the page -->
<footer>
  This page is not updated anymore!
</footer>
```
</div>

If the same footer is to appear in many pages, instead of specifying it _inline_ as explained above, you can save it as a separate file in the `_markbind/footers` and specify it in the `<frontmatter>` of the pages in which it should appear.


<div class="indented">

{{ icon_example }}
**`_markbind/footers/`**`commonFooter.md`:
```html
<footer>
  This page is not updated anymore!
</footer>
```
In the page that you want to include the footer:
```html
<frontmatter>
  footer: commonFooter.md
</frontmatter>
```
</div>

Notes:
- An inline footer needs to be the last element in the page.
- The footer specified in the `<frontmatter>` overrides the inline footer, if the page has any.
- Footers nested in other components or HTML tags will be shifted outside of the enclosing tag.
- [MarkBind Components]({{ baseUrl }}/userGuide/usingComponents.html) and [`<include>` tags]({{ baseUrl }}/userGuide/reusingContents.html#the-include-tag) are not supported in footers.

<hr><!-- ======================================================================================================= -->

## Site Navigation Menus

**You can add a <trigger trigger="click" for="modal:pageStructure-siteNavidationMenu">_site navigation menu_</trigger> to a page.**

<modal title="Site Naviation Menu" id="modal:pageStructure-siteNavidationMenu">
  <include src="glossary.md#site-navigation-menu" />
</modal>

Steps to add a site navigation menu ==(_siteNav_ for short)==:
1. Format your siteNav as an unordered Markdown list and save it inside the `_markbind/navigation` directory.
2. Specify the file as the value of the `siteNav` attribute in the `<frontmatter>` of the page.

<div class="indented">

{{ icon_example }} Here is an example siteNav code saved in **`_markbind/navigation/`**`mySiteNav.md` file:

<box>

<code>
* [:house: Home]({{ showBaseUrlText }}/index.html)<br>
* Docs<br>
&nbsp;&nbsp;* [User Guide]({{ showBaseUrlText }}/ug.html)<br>
&nbsp;&nbsp;* [Dev Guide]({{ showBaseUrlText }}/dg.html)<br>
* [Search]({{ showBaseUrlText }}/search.html)<br>
&nbsp;&nbsp;* [Google Search](https://www.google.com/)<br>
&nbsp;&nbsp;* [YouTube Search](https://www.youtube.com/)<br>
* [Contact]({{ showBaseUrlText }}/contact.html)
</code>
</box>

Here's how another page can make use of the above siteNav:

```html
<frontmatter>
  siteNav: mySiteNav.md
</frontmatter>
...
```

Here's how the above siteNav will appear:

<ul style="list-style-type: none; margin-left:-1em">
  <li style="margin-top: 10px"><a class="site-nav__a" href="/index.html">🏠 Home</a></li>
  <li style="margin-top: 10px">
    <button class="dropdown-btn">Docs <i class="dropdown-btn-icon">
      <span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span></i></button>
    <div class="dropdown-container">
      <ul style="list-style-type: none; margin-left:-1em">
        <li style="margin-top: 10px"><a class="site-nav__a" href="">User Guide</a></li>
        <li style="margin-top: 10px"><a class="site-nav__a" href="">Dev Guide</a></li>
      </ul>
    </div>
  </li>
  <li style="margin-top:10px"><a class="site-nav__a" href="">Search</a>
    <ul style="list-style-type: none; margin-left:-1em">
      <li style="margin-top: 10px"><a class="site-nav__a" href="http://www.google.com">Google Search</a></li>
      <li style="margin-top: 10px"><a class="site-nav__a" href="http://www.youtube.com">YouTube Search</a></li>
    </ul>
  </li>
</ul>

</div>


You can **append the `:expanded:` to a <tooltip content="a menu item with sub menu-items">parent menu item</tooltip> to make it expand by default.** In the example above, `* Docs :expanded:` will make the menu item `Docs` expand by default.

A parent menu item that is also linked will not be collapsible %%e.g., the `Search` menu item in the above example%%.

You may have additional HTML and Markdown content in a <tooltip content="the file containing the code for a site navigation menu, e.g., `mySiteNav.md` in the example above">siteNav file</tooltip>, in which case the code for the siteNav should be enclosed in a `<navigation>` tag. There should only be one `<navigation>` tag in the file.

<div class="indented">

{{ icon_example }} A siteNav code using a `<navigation>` tag.

<box>

<code>
# Site Map<br>
<strong><<span></span>navigation></strong><br>
* [:house: Home]({{ showBaseUrlText }}/index.html)<br>
* Docs<br>
&nbsp;&nbsp;* [User Guide]({{ showBaseUrlText }}/ug.html)<br>
&nbsp;&nbsp;* [Dev Guide]({{ showBaseUrlText }}/dg.html)<br>
* [Search]({{ showBaseUrlText }}/search.html)<br>
<strong><<span></span>/navigation></strong><br>
</code>
</box>
</div>

More than one siteNav file can be in `_markbind/navigation/` directory but a page may not have more than one siteNav.

A siteNav has a fixed width of 300 pixels for its contents. A siteNavs is [_responsive_](https://www.w3schools.com/html/html_responsive.asp) in that it will collapse to a menu button when the screen width is smaller than 992 pixels. It will then be completely hidden when the screen size is smaller than 576 pixels.

There is no limit to the number of nesting levels or the number of items in the menu, but note that any content exceeding a height of 1000 pixels will be cut off.


<hr><!-- ======================================================================================================= -->

## Page Navigation Menus

**You can add a <trigger trigger="click" for="modal:pageStructure-pageNavidationMenu">_page navigation menu_</trigger> to a page.**

<modal title="Page Naviation Menu" id="modal:pageStructure-pageNavidationMenu">
  <include src="glossary.md#page-navigation-menu" />
</modal>

Steps to add a page navigation menu ==(_pageNav_ for short)==:
1. Specify your pageNav within the `<frontmatter>` of a page with <tooltip content="The value `default` will use `headingIndexingLevel` within `site.json`.">`"default"`</tooltip> or a <tooltip content="HTML defines six levels of headings, numbered from <br>`1 to 6`.">`heading level`</tooltip>.
2. (Optional) You may also specify a page navigation title within `<frontmatter>` that will be placed at the top of the page navigation menu.

<div class="indented">

{{ icon_example }}
In the page that you want to have page navigation:
```html
<frontmatter>
  pageNav: 2
  pageNavTitle: "Chapters of This Page"
</frontmatter>
```

The example above will create a page navigation containing only heading levels of `1 and 2`.
</div>

A pageNav has a fixed width of 300 pixels for its contents. It is [_responsive_](https://www.w3schools.com/html/html_responsive.asp) by design and will be completely hidden when the screen size is smaller than 1300 pixels.


<hr><!-- ======================================================================================================= -->

## Page Layouts

**A _layout_ is a set of page-tweaks that can be applied to a page (or group of pages) in one go.**

A layout consists of the following files:
1. A footer (filename: `footer.md`)
1. Tweaks to the `<head>` (`head.md`)
1. A site navigation menu (`navigation.md`)
1. Custom styles (`styles.css`)
1. Custom scripts (`scripts.js`)

A layout is represented by a sub-directory in the `_markbind/layouts/` containing the files listed above. The name of the layout is same as the name of the sub-directory.

To apply the layout, specify it as an attribute named `layout` in the `<frontmatter>` of each page, or in the `site.json`.


<div class="indented">

{{ icon_example }} Suppose you have a layout named `chapterLayout`.
```
<root>/_markbind/layouts/
                  └── chapterLayout/
                        ├── footer.md
                        ├── head.md
                        ├── navigation.md
                        ├── styles.css
                        └── scripts.js
```
You can apply it to the `chapter.md` by setting its `<frontmatter>` as follows:
```html
<frontmatter>
  layout: chapterLayout
</frontmatter>
...
```
You can apply it to all `chapter.md` files by adding this entry to the `site.json`.

```json
{
  "glob": "**/chapter.md",
  "layout": "chapterLayout"
}
```
</div>

The layout specified in the `site.json` overrides the one specified in the `<frontmatter>`.

Any files specified in `<frontmatter>` overrides the corresponding file in the layout applied.

<div class="indented">

{{ icon_example }} Suppose a file has the following:
```html
<frontmatter>
  layout: chapterLayout
  head: myHead.md
</frontmatter>
...
```
In this case `myHead.md` will override the `chapterLayout/head.md`.

</div>

**The layout named `default` (if any) is automatically applied to every single page.** When you `init` a MarkBind site, MarkBind also generates an empty `default` layout.

## Toggling alternative contents in a page

You can use tags to selectively filter HTML elements when building a site.

Tags are specified by the `tags` attribute, **and can be attached to any HTML element**. During rendering, only elements that match tags specified in the `site.json` files will be rendered.

<div class="indented">

{{ icon_example }} Attaching tags to elements:
```html
# Print 'Hello world'

<p tags="language--java">System.out.println("Hello world");</p>
<p tags="language--C#">Console.WriteLine("Hello world");</p>
<p tags="language--python">print("Hello world")</p>
```

You need to specify the tags to include in `site.json`, under the `tags` option:

```json
{
  ...
  "tags": ["language--java"]
}
```

All other tagged elements will be filtered out. In this case, only the element with the `language--java` tag will be rendered. This is helpful when creating multiple versions of a page without having to maintain separate copies.

</div>

If the `tags` option is not specified in `site.json`, all tagged elements will be rendered.

**You can also use multiple tags in a single HTML element. Specify each tag in the `tags` attribute** separated by a space. An element will be rendered if **any of the tags** matches the one in `site.json`.

<div class="indented">

{{ icon_example }} Attaching multiple tags to an element:
```html
# For loops

<p tags="language--java language--C#">for (int i = 0; i < 5; i++) { ... }</p>
```

As long as the `language--java` or `language--C#` tag is specified, the code snippet will be rendered.

</div>

Alternatively, you can specify tags to render for a page in the front matter.

<div class="indented">

{{ icon_example }} Specifying tags in front matter:
```html
<frontmatter>
  title: "Hello World"
  tags: ["language--java"]
</frontmatter>
```
</div>

Tags in `site.json` will take precedence over the ones in the front matter.

</div>
