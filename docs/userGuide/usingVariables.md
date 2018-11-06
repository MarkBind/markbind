<frontmatter>
  footer: userGuideFooter.md
  siteNav: userGuideSections.md
</frontmatter>

<include src="../common/header.md" />

<div class="website-content">

# Using Variables

You can insert variables to be replaced by pre-defined values anywhere in your site. MarkBind treats any text surrounded with double curly braces as a variable, e.g. <code>{<span></span>{variable_name}}</code>

Some helpful variables are provided by MarkBind for your convenience, as shown below. 

### Specifying Path Reference

Use {{showBaseUrl}} for absolute path reference of images and resource files so that the path could be handled correctly when deployed. The {{showBaseUrl}} is parsed from the project root (where `site.json` located).

### Font Awesome icons

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

### Glyphicons

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


### Timestamp

Use <code>{<span></span>{timestamp}}</code> to insert a UTC time snippet that indicates when the page was generated.  

<code>{<span></span>{timestamp}}</code> will be rendered as: {{timestamp}}

### MarkBind Link

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

</div>
