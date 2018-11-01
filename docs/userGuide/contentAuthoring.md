<frontmatter>
  footer: userGuideFooter.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# Content Authoring

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

### Include Contents

Being able to include different markdown file into the current context is another feature of *MarkBind*. You can create a complex document from different content fragments by including them.

For detailed guide on using `<include>` tag for including contents, read the doc [here](includingContents.html).

</div>
