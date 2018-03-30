<link rel="stylesheet" href="{{baseUrl}}/css/main.css">

<include src="./common/header.md" />

<div class="website-content">

# MarkBind

MarkBind is a website generator that can generate a website from markdown documents. While there are other markdown-to-html website generators around %%(e.g., Jekyll, GitBook, MkDocs)%%, MarkBind is particularly suitable for creating course Websites. **The main aim of MarkBind is to provide a way to easily create content-heavy websites that allow _<tooltip content="i.e., the reader can go deeper or get more content as desired">self-directed consumption</tooltip>_**, as opposed to one-size-fits-all static content.  

## <span class="glyphicon glyphicon-th-list" aria-hidden="true"></span> Features

#### ✓ Support for Markdown and <tooltip content="GitHub-Flavored Markdown">GFMD</tooltip>

MarkBind supports all MarkDown and GFMD syntax. Here is an example:

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

#### ✓ Ability to add additional layers of information as Tooltips, pop-overs, modals

The example paragraph below has a tooltip, a pop-over, and a modal. Hover/click on the underlined words to see each.

<tip-box> 

In <tooltip content="Computer Science">CS</tooltip>, a binary tree is a <trigger for="pop:index-tree">tree data structure</trigger> in which each node has at most two children, which are referred to as the _left child_ and the _right child_. <trigger trigger="click" for="modal:index-primitive">Primitive data types</trigger> on the other hand ...

<popover id="pop:index-tree" title="An example tree data structure" placement="top">
  <div slot="content">

![](https://upload.wikimedia.org/wikipedia/commons/f/f7/Binary_tree.svg)<br>
%%<sub>[source:wikipedia]</sub>%%

  </div>
</popover> 

<modal large title="Some examples of primitive data types" id="modal:index-primitive">
  <include src="pages/primitiveDataTypes.md" />
</modal>

</tip-box>

#### ✓ Ability to emphasize or de-emphasize content easily

In addition to the ability to show **bold** and _italic_ text provided by normal Markdown, MarkBind can ==highlight== text or show text in %%grey color%% easily.

<table> 
<tr>
  <td>

```markdown
**bold text**
_itatic text_
~~striked out text~~
==highlighted text==
%%grey text%%

```
  </td>
  <td>&nbsp;→&nbsp;</td>
  <td><br>

<tip-box> 

**bold text**<br>
_itatic text_<br>
~~striked out text~~<br>
==highlighted text==<br>
%%grey text%%<br>

</tip-box>

  </td>
</tr>
</table>

#### ✓ Ability to allow readers reveal content progressively

In the example below, there is a expandable panel that can reveal more content.

<tip-box> 

A binary tree is a tree data structure in which each node has at most two children, which are referred to as the left child and the right child. Primitive data types on the other hand ...

<panel type="seamless" header="%%:bulb: Some example primitive data types%%">
  <include src="pages/primitiveDataTypes.md" />
</panel>

</tip-box>

In the example below, there are expandable panels that are nested within each other.

<tip-box> 

<panel type="info" header=":muscle: Exercises" no-close >
  
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

</tip-box>


#### ✓ Ability to reuse content easily

MarkBind has a powerful`include` mechanism that allows content fragments (i.e., a file or part of a file) to be reused at multiple places in the website.

In the example below, both the modal and the expandable panel reuses the same content.

<tip-box> 

In CS, a binary tree is a tree data structure in which each node has at most two children, which are referred to as the _left child_ and the _right child_. <trigger trigger="click" for="modal:index-primitive2">Primitive data types</trigger> on the other hand ...

<panel type="seamless" header="%%:bulb: Some example primitive data types%%">
  <include src="pages/primitiveDataTypes.md" />
</panel>

<modal large title="Some examples of primitive data types" id="modal:index-primitive2">
  <include src="pages/primitiveDataTypes.md" />
</modal>

</tip-box>

## <span class="glyphicon glyphicon-bookmark" aria-hidden="true"></span> Examples

Examples of websites built using MarkBind: 
* [CS2103 Software Engineering - course website](https://www.comp.nus.edu.sg/~cs2103)
* [CS3281 Thematic Systems Project - course website](https://nus-cs3281.github.io/website/)
* [TE3291 Software Engineering - course website](https://nus-te3201.github.io/website/)
* [se-edu/se-book - An online text book on Software Engineering](https://se-edu.github.io/se-book/)
* This website (i.e., MarkBind website)

## <span class="glyphicon glyphicon-book" aria-hidden="true"></span> Documentation 

#### For Users

* [Quick Start](https://github.com/MarkBind/markbind-cli/wiki/User-Quick-Start)


#### For Developers

* [Developer Guide](https://github.com/MarkBind/markbind-cli/wiki/Developer-Guide)

## <span class="glyphicon glyphicon-home" aria-hidden="true"></span> About us

MarkBind is a project based in the [National University of Singapore, School of Computing](http://www.comp.nus.edu.sg/), and is funded by a grant from [NUS Center for Development of Teaching and Learning](http://www.cdtl.nus.edu.sg/).

* [**Aaron Chong Jun Hao**](https://github.com/acjh): Current _Team Lead_ since Aug 2017
* [**Chua Yun Zhi Nicholas**](https://github.com/nicholaschuayunzhi): _Project Member_ since Jan 2018
* [**Damith C. Rajapakse**](https://github.com/damithch): _Project Mentor_ since Aug 2016
* [**Daniel Berzin Chua Yuan Siang**](https://github.com/danielbrzn): _Project Member_ since Jan 2018
* [**Jiang Sheng**](https://github.com/Gisonrg): _Founding Member_ and _Team Lead_ for Aug 2016 - Jul 2017
* [**Rachael Sim Hwee Ling**](https://github.com/rachx): _Project Member_ since Jan 2018

<span class="glyphicon glyphicon-send" aria-hidden="true"></span> You can **email us** at `seer` at `comp.nus.edu.sg`

<span class="glyphicon glyphicon-console" aria-hidden="true"></span> Interested in **contributing to MarkBind**? Visit the [MarkBind project on GitHub](https://github.com/MarkBind/markbind).

</div>
