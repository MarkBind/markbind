<frontmatter>
  footer: userGuideFooter.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# Using Components

To use a component, just type the corresponding markup in your file. For example, to create a Panel, you just need to write:

```html
<panel header="Click to expand" type="seamless">
  Panel Content.
</panel>
```

For a list of supported components, refer to the [Components Reference]({{baseUrl}}/userGuide/components.html).

To make an element closeable, use `v-closeable`.

e.g.
```html
<img src="schedule/textbook/images/img1.png" height="320px" v-closeable>
```
or
```html
<div v-closeable>
  Div Content.
</div>
```

### Question body syntax

<panel header=":lock::key: Does MarkBind allow using checkboxes and radio buttons with the Question and Panel components?">
<question>

- ( ) Yes
- ( ) No

<div slot="hint">
Probably yes
</div>
<div slot="answer">
Yes!
</div>
</question>
</panel>
<br>

```html
<panel header=":lock::key: Does MarkBind allow for the use of checkboxes and radio buttons?">
<question>

- ( ) Yes
- ( ) No

<div slot="hint">
Probably yes
</div>
<div slot="answer">
Yes!
</div>
</question>
</panel>
```

Checkboxes can also be used by substituting `- ( )` with `- [ ]`.

### Site Navigation

A site navigation bar is a fixed menu on the left side of your page contents, that allows the viewer to navigate your site pages. 
The menu has a fixed width of 300 pixels for its contents. 
If you would like to have a site navigation bar for your site, you may create one easily using Markdown.

- Start by creating a Markdown file (`.md`) in `_markbind/navigation`.
    - All new sites created with `init` have a `site-nav.md` file created automatically for you as a template in `_markbind/navigation`.
    - More than one navigation file can be created for different pages.

- Author your navigation layout using Markdown's unordered list syntax as shown below.
    - When you are using links (`[linkName](url)`), ensure that the url starts from the root directory <code>{<span></span>{baseUrl}}/</code> when you are referencing a page in your site. 
    e.g. <code>{<span></span>{baseUrl}}/folder1/myPage.html</code>
    - Ensure you wrap your navigation layout in a `<navigation>` tag for MarkBind to render it properly. Also, there should only be one `<navigation>` tag in your file.
    - You may author additional HTML and Markdown content outside the `<navigation>` tag.
    - The `<navigation>` tag is also optional, allowing you to author everything in HTML and Markdown syntax.
    - Use `:expanded:` keyword at the end of Dropdown titles to expand them by default. 

```html
<!-- In _markbind/navigation/mySiteNav.md -->
<navigation>
* [Home :house:]({{baseUrl}}/index.html)
* Dropdown title :pencil2: <!-- Nested list items will be placed inside a Dropdown menu -->
  * [Dropdown link one](https://www.google.com/)
  * Expanded Nested Dropdown title :triangular_ruler: :expanded: <!-- specify :expanded: to have it expand by default -->
    * [**Nested** Dropdown link one](https://www.google.com/)
    * [**Nested** Dropdown link two](https://www.google.com/)
  * [Dropdown link two](https://www.google.com/)
* [==Third Link== :clipboard:](https://www.google.com/)
* [Youtube](https://www.youtube.com/) <!-- Using a link as a Dropdown title will not render a Dropdown menu -->
  * [Youtube video one](http://www.youtube.com/watch?v=lJIrF4YjHfQ)
  * Dropdown title :pencil2: <!-- Dropdown menus in are still supported inside, as long as the title is not a link -->
    * [**Nested** Dropdown link one](https://www.google.com/)
</navigation>
```

- Specify the navigation file you have created within a page's [front matter](#front-matter) `siteNav` attribute to render it.

```html
<!-- In the page that you want to have a site navigation bar -->
<frontmatter>
  siteNav: mySiteNav.md
</frontmatter>
```

The above Markdown content will be rendered as:

<ul style="list-style-type: none; margin-left:-1em">
  <li style="margin-top: 10px"><a href="/index.html">Home 🏠</a></li>
  <li style="margin-top: 10px">
    <button class="dropdown-btn">Dropdown title ✏️  <i class="dropdown-btn-icon">
      <span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span></i></button>
    <div class="dropdown-container">
      <ul style="list-style-type: none; margin-left:-1em">
        <li style="margin-top: 10px"><a href="https://www.google.com/">Dropdown link one</a></li>
        <li style="margin-top: 10px">
          <button class="dropdown-btn dropdown-btn-open">Expanded Nested Dropdown title 📐
            <i class="dropdown-btn-icon rotate-icon">
            <span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span></i></button>
          <div class="dropdown-container dropdown-container-open">
            <ul style="list-style-type: none; margin-left:-1em">
              <li style="margin-top: 10px"><a href="https://www.google.com/"><strong>Nested</strong> Dropdown link one</a></li>
              <li style="margin-top: 10px"><a href="https://www.google.com/"><strong>Nested</strong> Dropdown link two</a></li>
            </ul>
          </div>
        </li>
        <li style="margin-top: 10px"><a href="https://www.google.com/">Dropdown link two</a></li>
      </ul>
    </div>
  </li>
  <li style="margin-top: 10px"><a href="https://www.google.com/"><mark>Third Link</mark> 📋</a></li>
  <li style="margin-top:10px"><a href="https://www.youtube.com/">Youtube</a>
    <ul style="list-style-type: none; margin-left:-1em">
      <li style="margin-top: 10px"><a href="http://www.youtube.com/watch?v=lJIrF4YjHfQ">Youtube video one</a></li>
      <li style="margin-top: 10px">
        <button class="dropdown-btn">Dropdown title ✏️  <i class="dropdown-btn-icon">
          <span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span></i></button>
        <div class="dropdown-container">
          <ul style="list-style-type: none; margin-left:-1em">
            <li style="margin-top: 10px"><a href="https://www.google.com/"><strong>Nested</strong> Dropdown link one</a></li>
          </ul>
        </div>
      </li>
    </ul>
  </li>
</ul>

The site navigation bar has [responsive properties](https://www.w3schools.com/html/html_responsive.asp), and will collapse to a menu button when the screen width is smaller than 992 pixels. It will then be completely hidden when the screen size is smaller than 576 pixels.

You are able to use [Markdown syntax](#supported-markdown-syntax), [Glyphicons](#glyphicons) and [Font Awesome icons](#font-awesome-icons) to author your site navigation layout.

Note:
- Only one navigation file can be specified in a page, and you must include its file extension.
- There is no limit to the number of nested Dropdown menus, but each menu's height is restricted to 1000 pixels.
    - Dropdown menu content exceeding 1000 pixels in height will be cut off.

### Use Searchbar

The searchbar allows users to search all headings within any page on the site.

To use the searchbar, add the following markup to your file.

```html
<searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback"></searchbar>
```

To use the searchbar within a navbar, add the following markup to your file. The searchbar can be positioned using the slot attribute for the list. The following markup adds a searchbar to the right side of the navbar with appropriate styling.

```html
<li slot="right">
  <form class="navbar-form">
    <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback"></searchbar>
  </form>
</li>
```

### Keywords

You can also specify custom keywords to be included under a heading by tagging the words with the `keyword` class:

```html
# Heading
This is good for catching <span class="keyword">regressions</span>
```

These keywords will be linked to the immediate heading before it. Users will be able to search for these keywords using the searchbar.

If you want to include a keyword without rendering it to the page, add `d-none` as a class. This can be useful for tagging arbitrary keywords to a header.

```html
# Heading
<span class="keyword d-none">testing</span>

This is good for catching <span class="keyword">regressions</span>
```

</div>
