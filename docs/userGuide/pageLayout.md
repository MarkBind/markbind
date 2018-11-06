<frontmatter>
  footer: userGuideFooter.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# Page Layout

Markbind offers several ways to quickly apply different styles and components to a page, for example, headers, footers or scripts.

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

### Using Footers

It is optional to put footers in your site. If you wish to do so, there are two ways that MarkBind supports.
  
1. [Specifying footer file in Front Matter](#specifying-footer-file-in-front-matter)
2. [Defining your own inline footer](#defining-your-own-inline-footer)

### Specifying footer file in Front Matter

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

### Defining your own inline footer

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
