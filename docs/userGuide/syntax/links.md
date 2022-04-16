## Links

Basic style:

<div id="main-example">
<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
MarkBind home is at [here](https://markbind.org).
</variable>
</include>
</div>

_Reference style_ links (i.e., specify the URL in a separate place):

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
MarkBind home is at [here][1].

[1]: https://markbind.org
</variable>
</include>

<small>More info: https://www.markdownguide.org/basic-syntax#links</small>

#### Autolinks
A <tooltip content="with `http(s)://` head">URL</tooltip> or an email address in plain text will be auto converted into clickable links.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">markdown</variable>
<variable name="code">
**These will be converted:**

https://www.google.com

https://markbind.org

foobar@gmail.com

**These will not be converted:**

google.com

markbind.org

foo@bar

**Tricks to prevent autolink:**

`https://markbind.org`

https://<span></span>markbind.org

</variable>
</include>

#### Intra-Site Links

<div id="intraSiteLinks">

Links to files of the generated site (e.g., an HTML page or an image file) can be specified either as relative paths or absolute paths.

****Auto-conversion of extension****

<div class="indented">

You may link to markdown files using its original extension (**.md**) as it will automatically be converted to a html extension (**.html**) when the site is generated. 

{{ icon_example }}
`Click [here](index.md)` --- *auto-conversion* ---> `Click [here](index.html)`

<box type="warning">

If you wish to disable the auto-conversion, you may use the `no-convert` attribute in your link. 

{{ icon_example }}
`Click [here](index.md){no-convert}`

</box>

</div>


****Absolute paths****
<div class="indented">

Links should start with {% raw %}`{{ baseUrl }}`{% endraw %} (which represents the root directory of the site).

{{ icon_example }} Here's how to specify a link to (1) a page, and (2) an image, using the {% raw %}`{{ baseUrl }}`:

1. `Click [here]({{ baseUrl }}/userGuide/reusingContents.html).`
2. `![]({{ baseUrl }}/images/preview.png)`

<box type="important">

To ensure that links in the <code>_markbind/</code> folder work correctly across the entire site, they should be written as absolute paths, prepended with `{{ baseUrl }}`. 
</box>
{% endraw %}
</div>

****Relative paths****

<div class="indented">

{{ icon_example }} Assuming that we have the following folder structure:
<tree>
C:\course\
  textbook\
    subsite.md
    image.png
    site.json
  index.md
  site.json
</tree>

Within `textbook/subsite.md`, we can refer to the image using:
```html
<img src="image.png" />
<!-- or -->
![](image.png)
```
Within `index.md`, we can also display the image using
```html
<img src="textbook/image.png" />
<!-- or -->
![](textbook/image.png)
```

<box type="warning">

  Relative links to resources (e.g. images, hrefs) should be valid **relative to the file where the link is defined**.

  In the example above, `image.png` is in the same directory as `subsite.md`. Thus, the correct path is `image.png` and not `textbook/image.png`.
</box>

</div>

****Link validation****

<div class="indented">

Links will be validated when generating a site and a warning will be displayed in the console for every link that is invalid. 


<box type="warning">

**Disabling link validation**

Link validation is enabled by default. 

If you wish to only disable validation for a **specific link**, you may use the `no-validation` attribute.

{{ icon_example }}
`Click [here](index.md){no-validation}`

However, if you wish to disable this feature **entirely**, you may simply modify your `site.json` like <trigger for="pop:global-intralink-disable" placement="bottom" trigger="click"> this </trigger>. 

<modal header="Disabling global intra-site link validation in `site.json`" id="pop:global-intralink-disable" backdrop> 
  <include src="{{ baseUrl }}/userGuide/siteJsonFile.md#disable-global-intrasite-link-validation"/>
</modal>	

</box>

</div>
</div>

<div id="short" class="d-none">

```markdown
MarkBind home is at [here](https://markbind.org).

MarkBind home is at [here][1].

[1]: https://markbind.org
```
</div>

<div id="examples" class="d-none">

MarkBind home is at [here](https://markbind.org).
</div>
