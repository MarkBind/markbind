<frontmatter>
  footer: userGuideFooter.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# Content authoring

### General writing guide

#### Mixing HTML with Markdown

*MarkBind* allows you to mix HTML with Markdown content.

To separate inline Markdown from HTML elements, enclose inline Markdown content with `<md>` tags.

e.g.
```html
<div>
  <md> # 1: *Markdown* Content </md>
</div>
```
The HTML output will be
```html
<div>
  <span> # 1: <em>Markdown</em> content </span></div>
</div>
```
Note that we get the italic *Markdown* but not the header (the char # is rendered). Also, a new line is not added as the content is enclosed within `<span>` tags.

To separate Markdown block elements (e.g. headers) from HTML elements, you may enclose the Markdown content with `<markdown>` tags.

Example 1:
```html
<div>
  <markdown> # 1: *Markdown* Content </markdown>
</div>
```
The HTML output will be:
```html
<div>
  <h1 id="1-markdown-content">1: <em>Markdown</em> content</h1>
</div>
```
In this case, we will get a `h1` header.

Example 2:
```html
<span>Hello this is your</span> <markdown> **Markdown Content**</markdown>
```
The HTML output will be:
```html
<span>Hello this is your</span>
<div>
  <p><strong>Markdown Content</strong></p>
</div>
```
In this case, we will get the `Markdown Content` text rendered in bold on a new line.

#### Specifying Path Reference

Use {{showBaseUrl}} for absolute path reference of images and resource files so that the path could be handled correctly when deployed. The {{showBaseUrl}} is parsed from the project root (where `site.json` located).


### Supported Markdown Syntax

MarkBind support the standard Markdown syntax. Read the [guide](https://guides.github.com/features/mastering-markdown/).

In addition, it supports:

* [Tables](https://help.github.com/articles/organizing-information-with-tables/) (GFM)
* [Strikethrough](https://help.github.com/articles/basic-writing-and-formatting-syntax/#styling-text) (GFM)
* [Emoji](https://www.webpagefx.com/tools/emoji-cheat-sheet/) shortcut.

  `:EMOJICODE:`. For example, `:smile:` will be rendered as :smile:.

* [Task List](https://help.github.com/articles/basic-writing-and-formatting-syntax/#task-lists)
* Text Hightlight using `<mark>`

  `==Highlight Text==` => `<mark>Highlight Text</mark>`

* Text Underline using `<ins>`

  `++Underline Text++` => `<ins>Underline Text</ins>`

* Dimmed Text (Text with grey background)

  `%%Dimmed Text%%`

* Radio Button List

  ```markdown
  - ( ) Option 1
  - (X) Option 2 (selected)
  ```

* Youtube video
  ```markdown
  @[youtube](lJIrF4YjHfQ)
  @[youtube](http://www.youtube.com/watch?v=lJIrF4YjHfQ)
  @[youtube](http://youtu.be/lJIrF4YjHfQ)
  ```

* Powerpoint slide - provide the embed url from Powerpoint online
  ```markdown
  @[powerpoint](https://onedrive.live.com/embed?cid=A5AF047C4CAD67AB&resid=A5AF047C4CAD67AB%212070&authkey=&em=2)
  ```
  or
  ```html
  <div class="pull-right" v-closeable alt="Read lecture slides online">

    <iframe src='https://onedrive.live.com/embed?cid=A5AF047C4CAD67AB&resid=A5AF047C4CAD67AB%212074&authkey=&em=2&wdAr=1.3333333333333333' width='350px' height='286px' frameborder='0'>This is an embedded <a target='_blank' href='https://office.com'>Microsoft Office</a> presentation, powered by <a target='_blank' href='https://office.com/webapps'>Office Online</a>.</iframe>

  </div>
  ```

* More media blocks, embedding services and additional options can be found in [Markdown-it-block-embed docs](https://github.com/rotorz/markdown-it-block-embed)

### Use MarkBind variables

You can insert variables to be replaced by pre-defined values anywhere in your site. MarkBind treats any text surrounded with double curly braces as a variable, e.g. <code>{<span></span>{variable_name}}</code>

Some helpful variables are provided by MarkBind for your convenience, as shown below. 

#### Font Awesome icons

This asset is provided by [Font Awesome](https://fontawesome.com/) under their [free license](https://fontawesome.com/license).

<tip-box>
Traditional usage:
<markdown>`<span class='fas fa-chess-knight'></span>`</markdown>
MarkBind usage:
<br>
<code>{<span></span>{fas_chess_knight}}</code>
</tip-box>

Font Awesome has three different styles for their free icons, each with their own prefix:
<strong>Solid</strong> (`fas`), <strong>Regular</strong> (`far`) and <strong>Brands</strong> (`fab`).<br>
Be sure to check Font Awesome's [full list of icons](https://fontawesome.com/icons?d=gallery&m=free) and which styles each icon supports.

MarkBind offers a shorter syntax by transforming the icon's name. It is a two-step process: 
1. Shift the icon's prefix to replace `fa`, the icon's name first two characters. e.g `fas fa-chess-knight` becomes `fas-chess-knight`
2. Next, replace all instances of `-` with `_` in the icon's name. e.g. `fas-chess-knight` becomes `fas_chess_knight`

After doing so, you are able to use the icons anywhere on your site by surrounding an icon's shortened name with double curly braces.<br>
e.g. <code>{<span></span>{fas_fighter_jet}}</code> will be rendered as {{fas_fighter_jet}}

#### Glyphicons

This asset is provided by [Glyphicons](https://glyphicons.com/) via Bootstrap 3.

<tip-box>
Traditional usage:  
<markdown>`<span class='glyphicon glyphicon-hand-right' aria-hidden='true'></span>`</markdown>
MarkBind usage:
<br>
<code>{<span></span>{glyphicon_hand_right}}</code>
</tip-box>

Here is the [list of provided glyphs](https://getbootstrap.com/docs/3.3/components/#glyphicons) from Bootstrap.

MarkBind offers an alternate syntax by transforming the icon's name.<br> 
It is done by replacing all instances of `-` with `_` in the glyph's name. e.g. <code>{<span></span>{glyphicon-hand-right}}</code> becomes <code>{<span></span>{glyphicon_hand_right}}</code>

After doing so, you are able to use the glyphs anywhere on your site by surrounding a glyph's modified name with double curly braces.<br>
e.g. <code>{<span></span>{glyphicon_hand_right}}</code> will be rendered as <span class='glyphicon glyphicon-hand-right' aria-hidden='true'></span>

#### Timestamp

Use <code>{<span></span>{timestamp}}</code> to insert a UTC time snippet that indicates when the page was generated.  

<code>{<span></span>{timestamp}}</code> will be rendered as: {{timestamp}}

#### MarkBind Link

Reference or support MarkBind by using <code>{<span></span>{MarkBind}}</code> to insert a link to our website.

 <code>{<span></span>{MarkBind}}</code> will be rendered as: {{MarkBind}}

### Add your own variables

In `_markbind/variables.md`, you can define your own variables that can be used anywhere in your site. The format is as follows.

```html
<span id="year">2018</span>

<span id="options">
* yes
* no
* maybe
</span>
```

Each variable must have an id and the value can be any MarkBind-compliant code fragment. The id should not contain `-` and `.`. For example, `search-option` and `search.options` are not allowed.

In any file in your site, you can include the variable by surrounding the variable's id with double curly braces, e.g. <code>{<span></span>{options}}</code>

Variables can refer to other variables that are declared earlier, including helpful variables provided by MarkBind.

<tip-box>
<div>
This is allowed, MarkBind helpful variables can be used.<br>

<code>\<span id="right_hand">{<span></span>{glyphicon_hand_right}}\</span></code>
</div>
<div>
This is also allowed, the second variable will be assigned the contents of the first variable.

<code>\<span id="first">This is the first variable.\</span></code><br>
<code>\<span id="second">{<span></span>{first}}\</span></code><br>
<code>\<span id="third">{<span></span>{second}}\</span></code>
</div>
<div>
This is forbidden, as the fourth variable is not declared yet, and will not be rendered correctly.

<code>\<span id="third">{<span></span>{fourth}}\</span></code><br>
<code>\<span id="fourth">This is the fourth variable.\</span></code>
</div>
</tip-box>

Note: If the variable being referenced contains HTML tags, MarkBind may escape the tags and render it literally. For example:

<tip-box>
<div>
If we declare the variables as follow:<br>

<code>\<span id="right_hand">{<span></span>{glyphicon_hand_right}}\</span></code><br>
<code>\<span id="right_hand_2">{<span></span>{right_hand}}\</span></code>
</div>
<div>
The following will be rendered:<br>

{{glyphicon_hand_right}}<br>
\<span class='glyphicon glyphicon-hand-right' aria-hidden='true'></span>
</div>
</tip-box>

You must use the `safe` filter when using such variables:

<tip-box>
<div>
If we use the safe filter for the second variable:<br>

<code>\<span id="right_hand">{<span></span>{glyphicon_hand_right}}\</span></code><br>
<code>\<span id="right_hand_2">{<span></span>{right_hand | safe}}\</span></code>
</div>
<div>
The following will be rendered:<br>

{{glyphicon_hand_right}}<br>
{{glyphicon_hand_right}}
</div>
</tip-box>


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

### Use Components

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

#### Question body syntax

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

### Include Contents

Being able to include different markdown file into the current context is another feature of *MarkBind*. You can create a complex document from different content fragments by including them.

For detailed guide on using `<include>` tag for including contents, read the doc [here](includingContents.html).

### Front Matter

Front matter allows you to specify page parameters such as the title and keywords of the page. These parameters will be used to build a site data file (`siteData.json`) that will contain the index used for the search function.
You can specify front matter at the beginning of your page by using the `<frontmatter>` tag as follows:

```html
<frontmatter>
  title: Binary Search Tree
  keywords: bst, avl, red-black
</frontmatter>
```

Note: A title that is defined in `site.json` for a particular page will take precedence over a title defined in the front matter.

Front matter can also be included from a separate file, just like how content can be included. This makes it easy to simply define all your required front matter in one file, and use it everywhere.

`matterDefinition.md`
```html
<seg id="bst">
  <frontmatter>
    title: Binary Search Tree
    keywords: bst, avl, red-black
  </frontmatter>
</seg>
```

`index.md`
```html
<include src="matterDefinition.md#bst" />
```

This will result in `index.md` having the title `Binary Search Tree` and the specified keywords in order for it to be looked up through the search bar.

### Inserting content into a page's head element

While authoring your website, you may want to have your own CSS or Javascript files to be included in a page.

- Start by creating a head file with Markdown extension (`.md`) in the `_markbind/head` folder.
    - More than one head file can be created for different pages.

- Author your `<style>` elements for CSS files and `<link>` elements for Javascript files using HTML as shown below.
    - Ensure that your URLs start from the root directory, by using <code>{<span></span>{baseUrl}}/</code> when you are referencing your files.

- All content is inserted near the bottom of the `<head>` tag by default.
    - Use the `<head-top>` tag to specify content that you wish to place at the top of the `<head>` tag.
    - The `<head-top>` tag is optional, you may omit it from your head file if you do not use it. 

```css
/* In yourCSSFolder/subfolder/myCustomStyle.css */
p {
    background: lightskyblue;
}
```

```js
// In yourScriptFolder/myCustomScript.js
alert("Welcome to my website!"); 
```

```html
<!-- In _markbind/head/compiledRef.md -->
<head-top>  <!-- HTML within this tag will be placed first, directly after the starting <head> tag -->
  <script src="{{baseUrl}}/yourScriptFolder/myCustomScript.js"></script>
</head-top>
<!-- Any content outside the <head-top> tag will default to the bottom position -->
<link rel="stylesheet" href="{{baseUrl}}/yourCSSFolder/subfolder/myCustomStyle.css">
```

- Specify the head file in pages that uses it, by specifying the [front matter](#front-matter) `head` attribute.

```html
<!-- In the page you want the head file to be in -->
<frontmatter>
  head: compiledRef.md
</frontmatter>
```

Style elements placed at the bottom will override existing Bootstrap and MarkBind CSS styles if there is an overlap of selectors. 

Multiple head files can be included within a page by providing a comma separated list:

```html
<frontmatter>
  head: compiledRef.md, compiledRef2.md
</frontmatter>
```

These will be added to `<head>` in the order in which they are listed. If the markdown head files contain scripts, this may affect the order in which they are run.

Note:
  - You may specify raw `.js` or `.css` files as your head file if you wish to do so.
  - You **must** include its file extension.

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

### Using Footers

It is optional to put footers in your site. If you wish to do so, there are two ways that MarkBind supports.
  
1. [Specifying footer file in Front Matter](#specifying-footer-file-in-front-matter)
2. [Defining your own inline footer](#defining-your-own-inline-footer)

#### Specifying footer file in Front Matter

To create a new footer, make a new markdown file (`.md`) in `_markbind/footers`.
Author your footer contents and wrap everything in a `<footer>` tag.
You can create more than one footer file if you want different footers for different pages.

Tip: All new sites created with `init` will have a `footer.md` file automatically created for you as a template in `_markbind/footers`.

```html
<!-- In _markbind/footers/myFooterFile.md -->
<footer>
  This is my own footer!
</footer>
```

After which, you must specify the file within a page's [front matter](#front-matter) `footer` attribute to render the footer.

```html
<!-- In the page that you want to include a footer -->
<frontmatter>
  footer: myFooterFile.md
</frontmatter>
```

Note:
- Only one footer file can be specified in the [front matter](#front-matter) per page, and you must include its file extension.

#### Defining your own inline footer

If you would like to have a page-specific footer content, you can author one inline with the same `<footer>` tag. 

```html
# Hello world
<p>Some text</p>
<footer>
  <p align="center">
    This is my inline footer, unique to this page!
  </p>
</footer>
```

Note:
- Footer file specified in [front matter](#front-matter) overrides all inline footers in the same page.
- Inline footers need to be the last element in a page.
- If there is more than one inline footer in a page, only the last inline footer will be rendered.
- Footers should not be nested in other components or HTML tags. If found inside, they will be shifted outside to be rendered properly.
- [MarkBind components](#use-components) and [includes](#include-contents) are not supported in footers.

### Heading Anchors

Your site's readers may want to obtain a link to a heading within a page, to share with someone else for example.

MarkBind automatically generates heading anchors for your page.

When the reader hovers over a heading in your page, a small anchor icon <i class="fas fa-anchor"></i> will become visible next to the heading. Clicking this icon will redirect the page to that heading, producing the desired URL in the URL bar that the reader can share with someone else. Try it with the headings on this page!

### Layouts

A layout is a set of styles that can be applied to a page, or glob of pages. Layouts allow you to quickly apply styles to a batch of pages at once. It consists of the following files:

- `footer.md` : See [Using Footers](#using-footers)
- `head.md` : See [Inserting content into a page's head element](#inserting-content-into-a-pages-head-element)
- `navigation.md` : See [Site Navigation](#site-navigation)
- `styles.css` : Contains custom styles
- `scripts.js` : Contains custom javascript

These files will be automatically appended to a page upon generation.

Layouts can be found in `_markbind/layouts`. Markbind will generate a default layout with blank files in `_markbind/layouts/default`. The default layout is automatically applied to every single page.

To make a new layout, simply copy and rename the `default` folder (e.g. `_markbind/layouts/myLayout`) and edit the files within.

A page can be assigned a layout in two ways:

- Using `site.json`
```js
// Layout A will be applied to all index.md files
{
  "glob": "**/index.md",
  "layout": "LayoutA"
},

// Layout B will be applied to index2.md
{
  "src": "index2.md",
  "layout": "LayoutB"
},

// No Layout - default layout will be applied
{
  "src": "index3.md"
},
```
- Using `<frontmatter>`
```html
<frontmatter>
  layout: layoutA
  head: myHead.md
</frontmatter>
```

Note that the layout specified in the `<frontmatter>` takes precedence over the one specified in `site.json`, and any files specified in `frontMatter` will take precedence over layout files (`myHead.md` will be used instead of the one in `layoutA`, in this case).
</div>
