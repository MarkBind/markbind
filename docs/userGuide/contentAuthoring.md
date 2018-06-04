<frontmatter>
  footer: userGuideSections.md
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

#### Glyphicons

This asset is provided by [Glyphicons](https://glyphicons.com/) via Bootstrap.
<br><br>
<tip-box>
Traditional usage:  
`<span class='glyphicon glyphicon-hand-right' aria-hidden='true'></span>`
<br>  
MarkBind usage:  
<code>{<span></span>{glyphicon_hand_right}}</code>
</tip-box>

Use these [available glyphs](https://getbootstrap.com/docs/3.3/components/#glyphicons) on your site by surrounding a glyph's name with double curly braces.  
e.g. <code>{<span></span>{glyphicon_hand_right}}</code> will be rendered as <code><span class='glyphicon glyphicon-hand-right' aria-hidden='true'></span></code>

Note: Replace all instances of `-` with `_` in the glyph's name, e.g. <code>{<span></span>{glyphicon-hand-right}}</code> becomes <code>{<span></span>{glyphicon_hand_right}}</code>

#### Timestamp

Use <code>{<span></span>{timestamp}}</code> to insert the following snippet that indicates when the page was generated.  

{{timestamp}}

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

### Use Searchbar

To use the searchbar, add the following markup to your file.

```html
<typeahead :data="searchData" placeholder="Search" :template="titleTemplate" template-name="title" :on-hit="searchCallback"></typeahead>
```

To use the searchbar within a navbar, add the following markup to your file. The searchbar can be positioned using the slot attribute for the list. The following markup adds a searchbar to the right side of the navbar with appropriate styling.

```html
<li slot="right">
  <form class="navbar-form">
    <typeahead :data="searchData" placeholder="Search" :template="titleTemplate" template-name="title" :on-hit="searchCallback"></typeahead>  
  </form>
</li>
```

### Use Components

To use a component, just type the corresponding markup in your file. For example, to create a Panel, you just need to write:

```html
<panel header="Click to expand" type="seamless">
  Panel Content.
</panel>
```

For a list of supported components, refer to [VueStrap modified by MarkBind](https://markbind.github.io/vue-strap/).

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

### Using Footers

It is optional to put footers in your site. If you wish to do so, there are two ways that MarkBind supports.

#### 1. Specifying footer file in Front Matter

By default, there is a `footer.md` file created for you in `_markbind/footers`. 
If you need additional footers for different pages, you can create footer files in the same folder and wrap the contents in a `<footer>` tag. 

```html
<!-- In _markbind/footers/myFooterFile.md -->
<footer>
  This is my own footer!
</footer>
```

After which, you must specify the file within [front matter](#front-matter)'s `footer` attribute to render the footer.

```html
<!-- In the file that you want to include a footer -->
<frontmatter>
  footer: myFooterFile.md
</frontmatter>
```

Note:
- Only one footer file can be specified in the [front matter](#front-matter) per page, and you must include its file extension.

#### 2. Defining your own inline footer

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
- MarkBind-dependent components and includes are not supported in footers.

</div>
