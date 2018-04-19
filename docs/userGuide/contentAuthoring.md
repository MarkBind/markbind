<link rel="stylesheet" href="{{baseUrl}}/css/main.css">

<include src="../common/header.md" />

<div class="website-content">

# Content authoring
### General writing guide

#### Mixing HTML with Markdown
*MarkBind* allows you to mix HTML with Markdown content. 

To separate inline Markdown from HTML elements, enclose inline Markdown content with `<md>` tags.

e.g.
```
<div>
 <md> # 1: *Markdown* Content </md>
</div>
```
The HTML output will be 
```
<div>
  <span> # 1: <em>Markdown</em> content </span></div>
</div>
```
Note that we get the italic *Markdown* but not the header (the char # is rendered). Also, a new line is not added as the content is enclosed within `<span>` tags.

To separate Markdown block elements (e.g. headers) from HTML elements, you may enclose the Markdown content with `<markdown>` tags.

Example 1:
```
<div>
  <markdown> # 1: *Markdown* Content </markdown>
</div>
```
The HTML output will be:
```
<div>
  <h1 id="1-markdown-content">1: <em>Markdown</em> content</h1>
</div>
``` 
In this case, we will get a `h1` header.

Example 2:
```
<span>Hello this is your</span> <markdown> **Markdown Content**</markdown>
```
The HTML output will be:
```
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
  
  ```
  - ( ) Option 1
  - (X) Option 2 (selected)
  ```

* Youtube video
  ```
  @[youtube](lJIrF4YjHfQ)
  @[youtube](http://www.youtube.com/watch?v=lJIrF4YjHfQ)
  @[youtube](http://youtu.be/lJIrF4YjHfQ)
  ```

* Powerpoint slide - provide the embed url from Powerpoint online
  ```
  @[powerpoint](https://onedrive.live.com/embed?cid=A5AF047C4CAD67AB&resid=A5AF047C4CAD67AB%212070&authkey=&em=2)
  ```
  or
  ```
  <div class="pull-right" v-closeable alt="Read lecture slides online">

  <iframe src='https://onedrive.live.com/embed?cid=A5AF047C4CAD67AB&resid=A5AF047C4CAD67AB%212074&authkey=&em=2&wdAr=1.3333333333333333' width='350px' height='286px' frameborder='0'>This is an embedded <a target='_blank' href='https://office.com'>Microsoft Office</a> presentation, powered by <a target='_blank' href='https://office.com/webapps'>Office Online</a>.</iframe>

  </div>
  ```

* More media blocks, embedding services and additional options can be found in [Markdown-it-block-embed docs](https://github.com/rotorz/markdown-it-block-embed)

### Add your own variables

In `_markbind/variables.md`, you can define your own variables that can be used anywhere in your site. The format is as follows.

```
<span id="year">2018</span>

<span id="options">
* yes
* no
* maybe
</span>
```

Each variable must have an id and the value can be any MarkBind-compliant code fragment. The id should not contain `-` and `.`. For example, `search-option` and `search.options` are not allowed.

In any file in your site, you can include the variable by surrounding the variable's id with double curly braces, e.g. <code>{&#8203;{options}&#8203;}</code>

### Use Searchbar

To use the searchbar, add the following markup to your file.

```
<typeahead :data="searchData" placeholder="Search" :on-hit="searchCallback"></typeahead>
```

To use the searchbar within a navbar, add the following markup to your file. The searchbar can be positioned using the slot attribute for the list. The following markup adds a searchbar to the right side of the navbar with appropriate styling.

```
<li slot="right">
  <form class="navbar-form">
    <typeahead :data="searchData" placeholder="Search" :on-hit="searchCallback"></typeahead> 
  </form>
</li>
```

### Use Components

To use a component, just type the corresponding markup in your file. For example, to create a Panel, you just need to write:
	
```
<panel header="Click to expand" type="seamless">
	Panel Content.
</panel>
```
	
For a list of supported components, refer to the component [doc](https://markbind.github.io/vue-strap/).

To make an element closeable, use `v-closeable`.

e.g. 
```
<img src="schedule/textbook/images/img1.png" height="320px" v-closeable>
```
or
```
<div v-closeable>
...
</div>
```
### Include Contents

Being able to include different markdown file into the current context is another feature of *MarkBind*. You can create a complex document from different content fragments by including them.

For detailed guide on using `<include>` tag for including contents, read the doc [here](includingContents.html).

### Front Matter

Front matter allows you to specify page parameters such as the title and keywords of the page. These parameters will be used to build a site data file (`siteData.json`) that will contain the index used for the search function.
You can specify front matter at the beginning of your page by using the `<frontmatter>` tag as follows:

```
<frontmatter>
  title: Binary Search Tree
  keywords: bst, avl, red-black
</frontmatter>
```

Note: A title that is defined in `site.json` for a particular page will take precedence over a title defined in the front matter.

Front matter can also be included from a separate file, just like how content can be included. This makes it easy to simply define all your required front matter in one file, and use it everywhere.

`matterDefinition.md`
```
<seg id="bst">
  <frontmatter>
    title: Binary Search Tree
    keywords: bst, avl, red-black
  </frontmatter>
</seg>
```

`index.md`
```
<include src="matterDefinition.md#bst" />
```

This will result in `index.md` having the title `Binary Search Tree` and the specified keywords in order for it to be looked up through the search bar.

<include src="../common/userGuideSections.md" />

</div>
