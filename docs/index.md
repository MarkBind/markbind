<frontmatter>
  title: "Generate More Dynamic Websites from Markdown Text"
</frontmatter>

<div tags="environment--ug">

<h1 class="display-3"><md>**MarkBind**</md></h1>

<span class="lead">

<big>**Generate <tooltip content="as opposed to _one-size-fits-all_ static content">_more dynamic_</tooltip> websites from Markdown text.**</big>
Optimized for creating text-heavy websites %%e.g., eLearning websites, online instruction manuals, project documentation etc.%%.
</span>

<a class="btn btn-primary" href="userGuide/">Get Started</a>

<hr>

#### {{ icon_check_blue }} Simple syntax. Dynamic content.

MarkBind source files can be as simple as basic Markdown, but you can also [**use a mix of several popular syntax schemes**](userGuide/markBindSyntaxOverview.html) (<tooltip content="GitHub Flavored Markdown">GFMD</tooltip>, BootStrap, NunJucks, etc. as well as MarkBind's own custom syntax) to create more dynamic content that you cannot normally get from a typical markdown-to-html site generator.

Here are some simple text-formatting examples:

Syntax scheme | Code | Output
--------------|------|-------
Markdown | `**bold text** _italic text_` | **bold text** _italic text_
GFMD | `~~striked out text~~` | ~~striked out text~~
MarkBind extensions to Markdown | `==highlighted text==`<br>`%%grey text%%`<br>`++underlined text++` | ==highlighted text==<br>%%grey text%%<br>++underlined text++

<panel type="seamless" header="%%More examples of generating static content%%" >

An example that uses GFMD synatx for task lists:

<table>
<tr>
  <td>

```markdown
**Things to do:**

- [x] Finish my changes
- [ ] Push my commits to GitHub
- [ ] Open a pull request

```
  </td>
  <td>&nbsp;→&nbsp;</td>
  <td><br>
<tip-box>

**Things to do:**

- [x] Finish my changes
- [ ] Push my commits to GitHub
- [ ] Open a pull request

</tipbox>
  </td>
</tr>
</table>

An example that uses KaTeX to generate math equations:


<table>
<tr>
  <td>

```markdown
Euler's Identity \(e^{i\pi}+1=0\) is a beautiful formula.
```
  </td>
  <td>&nbsp;→&nbsp;</td>
  <td><br>
<tip-box>

Euler's Identity \(e^{i\pi}+1=0\) is a beautiful formula.

</tipbox>
  </td>
</tr>
</table>


</panel>
<p/>

The example paragraph below has the following dynamic elements: a tooltip, a popover, and a modal. Hover/click on the underlined words to see each.

<box>

In <tooltip content="Computer Science">CS</tooltip>, a binary tree is a <trigger for="pop:index-tree">tree data structure</trigger> in which each node has at most two children, which are referred to as the _left child_ and the _right child_. <trigger trigger="click" for="modal:index-primitive">Primitive data types</trigger> on the other hand ...

<popover id="pop:index-tree" header="An example tree data structure" placement="top">
<div slot="content">

![](https://upload.wikimedia.org/wikipedia/commons/f/f7/Binary_tree.svg)<br>
%%<sub>[source:wikipedia]</sub>%%

</div>
</popover>

<modal large header="Some examples of primitive data types" id="modal:index-primitive">
  <include src="pages/primitiveDataTypes.md" />
</modal>

</box>

<panel type="seamless" header="%%More examples of generating dynamic content%%">
In the example below, there is an expandable panel that can reveal more content.

<box>

A binary tree is a tree data structure in which each node has at most two children, which are referred to as the left child and the right child. Primitive data types on the other hand ...

<panel header="%%{{ icon_info }} Some example primitive data types%%">
  <include src="pages/primitiveDataTypes.md" />
</panel>

</box>

In the example below, there are expandable panels that are nested within each other.

<box>

<panel header=":far-list-alt: Exercises" no-close >

  <panel type="danger" header=":exclamation: [Compulsory] Ex 1" no-close >

Details of exercise 1
  </panel>
  <panel type="warning" header="[Recommended] Ex 2" no-close >

Details of exercise 2
  </panel>
  <panel type="success" header="[Optional] Ex 23" no-close >

Details of exercise 3
  </panel>
</panel>

</box>

</panel>
<p/>

<hr><!-- ======================================================================================================= -->

#### {{ icon_check_blue }} Everything you need for text-heavy websites, built-in.

MarkBind is **highly optimized for creating text-heavy websites** %%e.g., eLearning websites, online instruction manuals, project documentation etc.%% Anything that you might need for creating such websites are built-in, sparing you the hassle of finding/installing/searching plugins that you need.

Here are some examples:
<div class="indented">

<big>:fas-heart:</big> **Icons** can improve the readability of a text-heavy document. MarkBind comes with a wide selection of [icons](userGuide/formattingContents.html#icons) and [emoji](userGuide/formattingContents.html#emoji).<br>
<big>:fas-search:</big> With MarkBind's [**search feature**](userGuide/makingTheSiteSearchable.html), you can allow readers to search for keywords in your site.<br>
<big>:fas-window-maximize:</big> MarkBind allows you to add [**site/page navigation menus, headers, footers**](userGuide/tweakingThePageStructure.html) easily.
</div>

<hr><!-- ======================================================================================================= -->

#### {{ icon_check_blue }} More control to the reader, without duplicating code.

A MarkBind website can be a _buffet_ of content, as opposed to a _set menu_: a site can have optional contents that the reader can access at her discretion, and the same content can be organized in multiple ways so that the reader can choose the one that fits the need. To _cater_ (pun intended) for creating such buffet style websites, MarkBind has **[reuse mechanisms](userGuide/reusingContents.html) for presenting the same content in multiple ways without duplicating the source file**.

For example, MarkBind has a powerful `include` mechanism that allows content fragments (i.e., a file or part of a file) to be reused at multiple places in the website. In the example below, both the modal and the expandable panel reuse the same content originating from a _single_ source file.

<box>

In CS, a binary tree is a tree data structure in which each node has at most two children, which are referred to as the _left child_ and the _right child_. <trigger trigger="click" for="modal:index-primitive2">Primitive data types</trigger> on the other hand ...

<panel type="seamless" header="%%{{ icon_info }} Some example primitive data types%%">
  <include src="pages/primitiveDataTypes.md" />
</panel>

<modal large header="Some examples of primitive data types" id="modal:index-primitive2">
  <include src="pages/primitiveDataTypes.md" />
</modal>

</box>

<hr><!-- ======================================================================================================= -->

#### {{ icon_check_blue }} Easy to set up, modify, deploy, integrate.

Installing MarkBind takes just one command. Creating a new MarkBind site too takes just one command. With MarkBind's _live preview_ feature, you can see how your site will look like as you modify the source file. [Deploying the site to a server](userGuide/deployingTheSite.html) can be as simple as one command too.

As MarkBind is also optimized for project documentation, it can easily [integrate with the workflow of a software project](userGuide/markBindInTheProjectWorkflow.html).

<a class="btn btn-primary" href="userGuide/">Get Started</a>

</div>

<div tags="environment--dg">

## Developer Guide

<box type="warning">
    If you are a user, please visit <a href="https://markbind.org">MarkBind.org</a> instead.
</box>

This is the latest Developer Guide for MarkBind.

For contributors: please access the Developer Guide [here](devGuide/index.html)

</div>
