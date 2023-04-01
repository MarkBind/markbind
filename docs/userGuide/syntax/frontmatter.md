## Frontmatter

**You can use a _frontmatter_ section to specify page properties such as the title and keywords of the page.** 
To specify frontmatter for a page, insert a `<frontmatter>` tag in the following format at the beginning of the page.<br>
You can use YAML-style frontmatter syntax `---` as well.
<div class="indented">
<include src="codeHorizontal.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="headingLeft">Frontmatter</variable>
<variable name="headingRight">YAML-style Frontmatter Syntax</variable>
<variable name="codeLeft">
<frontmatter>
  property1: value1
  property2: value2
</frontmatter>
</variable>
<variable name="codeRight">
---
  property1: value1
  property2: value2
---
</variable>
</include>
</div>



<div class="indented">

{{ icon_example }} Here, we set the page `title` attribute as `Binary Search Tree`.

<include src="codeHorizontal.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="headingLeft">Frontmatter</variable>
<variable name="headingRight">YAML-style Frontmatter Syntax</variable>
<variable name="codeLeft">
<frontmatter>
  title: Binary Search Tree
</frontmatter>
</variable>
<variable name="codeRight">
---
  title: Binary Search Tree
---
</variable>
</include>
</div>

<box type="warning" seamless>

Should you need more expressive formatting, or encounter any issues when formatting the frontmatter, note that the frontmatter follows the [YAML](https://yaml.org/refcard.html) spec.
</box>

<box type="warning" seamless>

If a page has multiple frontmatters, it will take the last frontmatter by default. You may make use of [omitFrontmatter]({{ base_url }}/userGuide/reusingContents.html#includes), which is an attribute of MarkBind's \<include> feature to omit the frontmatters that are not needed.
</box>

**Page properties:**

* **`title`**: The title of the page. Will be used as the `<title>` attribute of the HTML page generated.
* Other properties such as `keywords`, `layout`, etc. will be explained in other places of this user guide.

<include src="../siteJsonFile.md#page-property-overriding" />

<div id="short" class="d-none">

```html
<frontmatter>
  title: Binary Search Tree
  pageNav: 2
</frontmatter>
```
</div>
