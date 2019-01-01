<frontmatter>
  title: "User Guide: Basic Syntax"
  footer: footer.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# MarkBind Syntax


<span class="lead" id="overview">

**A MarkBind source file may contain a mix of several popular syntax schemes** used in creating web pages. MarkBind source code can be as simple as basic Markdown, and you can use progressively more complicated syntax to create progressively more sophisticated Web pages while optimizing other aspects such as content reuse.
</span>

Here are the syntax schemes supported, each of which are explained in the sections below:

1. [Markdown](#support-for-markdown)
1. [GFMD extensions to Markdown](#support-for-gfmd)
1. [MarkBind extensions to Markdown](#markbind-extensions-to-markdown)
1. [MarkBind custom syntax](#markbind-custom-syntax)
1. [HTML, JavaScript, CSS](#support-for-html%2C-javascript%2C-css)
1. [VueStrap and Bootstrap](#support-for-vuestrap-and-bootstrap)
1. [Nunjucks](#support-for-nunjucks)

## Support for Markdown

**MarkBind supports all basic Markdown syntax.** A summary is given below. Refer [markdownguide.org](https://www.markdownguide.org/) for more details.

##### Headings:
```markdown
# Heading level 1
...
###### Heading level 6
```

<box>

# Heading level 1
...
###### Heading level 6

</box>

##### Text Formatting:
```markdown
Ants **Bees Cats** Dogs
Ants _Bees Cats_ Dogs
Ants ___Bees Cats___ Dogs
Ants `Bees Cats` Dogs
```

<box>

Ants **Bees Cats** Dogs<br>
Ants _Bees Cats_ Dogs<br>
Ants ___Bees Cats___ Dogs<br>
Ants `Bees Cats` Dogs

</box>


##### Blockquotes

```markdown
> Ants Bees
>
> Cats Dogs Elephants
>> Fish
```

<box>

> Ants Bees
>
> Cats Dogs Elephants
>> Fish
</box>

##### Lists

```markdown
* Ants Bees
  * Cats Dogs
  * Elephants
* Fish

1. Ants Bees
   1. Cats Dogs
   1. Elephants
1. Fish
```

<box>

* Ants Bees
  * Cats Dogs
  * Elephants
* Fish

1. Ants Bees
   1. Cats Dogs
   1. Elephants
1. Fish
</box>

##### Images

```markdown
![](https://markbind.github.io/markbind/images/logo-lightbackground.png)
```

<box>

![](https://markbind.github.io/markbind/images/logo-lightbackground.png)
</box>

##### Links

```markdown
Go to the [MarkBind Website](https://markbind.github.io/markbind/)
```

<box>

Go to the [MarkBind Website](https://markbind.github.io/markbind/)
</box>

<hr><!-- ======================================================================================================= -->

## Support for GFMD

**MarkBind supports additional Markdown features provided by Github-Flavored Markdown (GFMD).** A summary is given below. Refer [Github's GFMD documentation](https://guides.github.com/features/mastering-markdown/#GitHub-flavored-markdown) for more details.


##### Fenced code blocks / syntax highlighting

<span>
<code>```python</code>
</span>

<code>def say_hello(name):</code><br>
&nbsp;&nbsp;&nbsp;&nbsp;`print('Hello', name)`<br>
&nbsp;&nbsp;&nbsp;&nbsp;`print('How are you', name)`<br>
<code>```</code>

```python
def say_hello(name):
    print('Hello', name)
    print('How are you', name)
```

##### Task Lists

```markdown
- [x] Ants
- [x] Bees
- [x] Cats
- [ ] Dogs
```

<box>

- [x] Ants
- [x] Bees
- [x] Cats
- [ ] Dogs
</box>

##### Tables

```markdown
Animal | Trainable?
------ | -------------
Ants   | no
Bees   | no
Cats   | yes
```

<box>

Animal | Trainable?
------ | -------------
Ants   | no
Bees   | no
Cats   | yes

</box>

##### Strikethrough

```markdown
Ants ~~Bees Cats~~ Dogs
```

<box>

Ants ~~Bees Cats~~ Dogs

</box>

##### Emoji

```markdown
:+1: :exclamation: :x: :construction:
```

<box>

:+1: :exclamation: :x: :construction:

</box>

<div class="indented">

%%{{ icon_info }} [the list of supported emoji](https://github.com/ikatyang/emoji-cheat-sheet/blob/master/README.md).%%
</div>

<hr><!-- ======================================================================================================= -->

## MarkBind Extensions to Markdown

MarkBind adds several Markdown-like features on top of GFMD.

#### Extra Text Formatting Features

* **Dimmed Text**:<br>
  `Apple %%Banana Cherries%%` {{ icon_arrow_right }} Apple %%Banana Cherries%%

* **Highlighting**:<br>
  `Apple ==Banana Cherries==` {{ icon_arrow_right }} Apple ==Banana Cherries==

* **Underlining**:<br>
  `++Apple Banana++ Cherries` {{ icon_arrow_right }} ++Apple Banana++ Cherries

* **Radio Button List**:<br>
  ```markdown
  - ( ) Option 1
  - (X) Option 2 (selected)
  ```
  {{ icon_arrow_down }}
<div class="indented">

- ( ) Option 1
- (X) Option 2 (selected)
</div>

#### Media Embeds

**There are easy ways to embed media content such as YouTube videos and PowerPoint slides**.

###### Embedding Youtube Videos

<div class="indented">

{{ icon_example }} Here are three ways of embedding YouTube videos and one example of how it will look in the page.

<tabs>
  <tab header="Code">

```markdown
@[youtube](v40b3ExbM0c)
@[youtube](http://www.youtube.com/watch?v=v40b3ExbM0c)
@[youtube](http://youtu.be/v40b3ExbM0c)
```

  </tab>
  <tab header="Outcome">

@[youtube](v40b3ExbM0c)

</tab>
</tabs>

</div>

More media blocks, embedding services and additional options can be found in [Markdown-it documentation](https://github.com/rotorz/markdown-it-block-embed).

###### Embedding Powerpoint Slides (using the embed url from Powerpoint online)

<div class="indented">

{{ icon_example }} Here is an example of embedding a PowerPoint slide deck:

<tabs>
  <tab header="Code">

```markdown
@[powerpoint](https://onedrive.live.com/embed?cid=A5AF047C4CAD67AB&resid=A5AF047C4CAD67AB%212070&authkey=&em=2)
```

  </tab>
  <tab header="Outcome">

@[powerpoint](https://onedrive.live.com/embed?cid=A5AF047C4CAD67AB&resid=A5AF047C4CAD67AB%212070&authkey=&em=2)

</tab>
</tabs>

</div>

<hr><!-- ======================================================================================================= -->

## MarkBind Custom Syntax

#### Intra-Site Links

<div id="intra-site-links">

Links to files of the generated site (e.g., an HTML page or an image file) should be specified as absolute paths and should start with {{ showBaseUrl }} (which represents the root directory of the project).

<div class="indented">

{{ icon_example }} Here's how to specify a link to (1) a page, and (2) an image, using the {{ showBaseUrl }}:

1. <code>Click [here]({<span></span>{ baseUrl }}/userGuide/reusingContents.html).</code> {{ icon_arrow_right }} Click [here]({{ baseUrl }}/userGuide/reusingContents.html)
2. `![](`{{ showBaseUrl }}`/images/preview.png)`

</div>
</div>

<div id="iconFonts">

#### Icons Fonts

<small>%%Acknowledgement: Font Awesome icons are provided by [Font Awesome](https://fontawesome.com/) under their [free license](https://fontawesome.com/license) while Glyphicons are provided by [Glyphicons](https://glyphicons.com/) via Bootstrap 3.%%</small>

MarkBind supports using Font Icons provided by Font Awesome and Glyphicons.

<box border-left-color="{{ markbind_blue}}">

{{ icon_bulb_blue }} The advantage of font icons over emojis is font icons can be _styled_ to fit your needs.e.g.,
* emoji: <font color="purple">Don't judge the :book: by it's cover! :-1:</font>
* font icons: <font color="purple">Don't judge the {{ fas_book }} by it's cover! {{ icon_dislike }}</font>
</box>


###### Using Font Awesome Icons
1. Decide which icon you want to use from the [list of available icons](https://fontawesome.com/icons?d=gallery&m=free).
1. Construct the MarkBind name for the selected icon by replacing the hyphens (`-`) in the actual name with underscores ( `_` ) and adding the _type prefix_.
   Note: Font Awesome has three different styles for their icons, each with their own type prefix. Here is an example from each type:
   * _Solid_ (prefix: `fas_`) e.g., {{ fas_file_code }} (actual name `file-code`, MarkBind name **`fas_`**`file_code`)
   * _Regular_ (prefix: `far_`) e.g., {{ far_file_code }} (actual name `file-code`, MarkBind name **`far_`**`file_code`)
   * _Brands_ (prefix: `fab_`): e.g., {{ fab_github_alt }} (actual name `github-alt`, MarkBind name **`fab_`**`github_alt`)

1. Insert MarkBind name for the icon enclosed within double curly braces to get the icon in your page.<br>
  `Create a **branch**`<code> {<span></span>{fas_code_branch}} now!</code> → Create a **branch** {{ fas_code_branch }} now!


###### Using Glyphicons

1. Decide which icon you want to use from [list of provided glyphicons](https://getbootstrap.com/docs/3.3/components/#glyphicons).
1. Construct the MarkBind name for the selected icon by replacing the hyphens (`-`) in the actual name with underscores ( `_` ).<br>
   e.g., {{ glyphicon_home }} (actual name `glyphicon-home`, MarkBind name `glyphicon_home`)
1. Insert MarkBind name for the icon enclosed within double curly braces to get the icon in your page.<br>
  `Move to the right!`<code> {<span></span>{glyphicon_hand_right}}</code> → Move to the right! {{ glyphicon_hand_right }}

</div>

#### Variables

<blockquote>
<include src="reusingContents.md#variables-overview" inline />
</blockquote>

<include src="reusingContents.md#variables-link" inline />

#### The `<include>` Tag

<blockquote>
<include src="reusingContents.md#include-overview" inline />
</blockquote>

<include src="reusingContents.md#include-link" inline />

#### MarkBind Components

<blockquote>
<include src="usingComponents.md#components-overview" inline />
</blockquote>

<include src="usingComponents.md#components-link" inline />

## Support for HTML, JavaScript, CSS

**A MarkBind source file can contain a mixture of HTML, JavaScript, and CSS** as a normal web page would.

==Text within HTML tags are considered plain text unless the text is preceded by a blank line,== in which case the text is parsed as Markdown text.

<div class="indented">

{{ icon_example }} Here is an example of how text within an html tag is parsed as Markdown when preceded by a blank line.

Code:
```html
<span>
Without preceding blank line: Apples **Bananas** Cherries
</span>

<span>

With preceding blank line: Apples **Bananas** Cherries
</span>
```
Outcome:<br>

<span>
Without preceding blank line: Apples **Bananas** Cherries
</span>

<span>

With preceding blank line: Apples **Bananas** Cherries
</span>
</div>

Alternatively, you can use `<markdown>` (for _block_ Markdown elements such as headings) or `<md>` (for _inline_ Markdown elements such as bold/italic text) tags to indicate the text should be treated as Markdown.

<div class="indented">

{{ icon_example }} Here is an example of how text within an HTML tag can be treated as Markdown using `<markdown>`/`<md>` tags.

Code:
```html
<span>
<md>Apples **Bananas** Cherries</md>
</span>

<span>
<markdown>##### Apples **Bananas** Cherries</markdown>
</span>
```
Outcome:<br>
<span>
<md>Apples **Bananas** Cherries</md>
</span>

<span>
<markdown>##### Apples **Bananas** Cherries</markdown>
</span>
</div>

<hr><!-- ======================================================================================================= -->

## Support for VueStrap and BootStrap

As MarkBind uses [VueStrap](https://bootstrap-vue.js.org/docs/components/alert/) (which in turn is based on [BootStrap](https://getbootstrap.com/docs/4.2/getting-started/introduction/)) internally, many of their syntax work within MarkBind files too.

<hr><!-- ======================================================================================================= -->

## Support for Nunjucks

[Nunjucks](https://mozilla.github.io/nunjucks/) is a JavaScrip based templating tool. Here is a simple example:

<box><span>
`<ul>`<br>
<code>{<span></span>% for item in [1, 2, 3, 4] %<span></span>}</code><br>
&nbsp;&nbsp;`<li>`<code>Item {<span></span>{ item }}</code>`</li>`<br>
<code>{<span></span>% endfor %<span></span>}</code><br>
`</ul>`
</span></box>

{{ icon_arrow_down }}

<box>
<ul>
{% for item in [1, 2, 3, 4] %}
  <li>Item {{ item }}</li>
{% endfor %}
</ul>
</box>

As MarkBind uses Nunjucks behind the scene, **MarkBind is generally compatible with Nunjucks**, which means you can use Nunjucks templating in your source files. Note that ==the code is processed for Nunjucks syntax before the rest of the MarkBind syntax are processed==.


</div>
