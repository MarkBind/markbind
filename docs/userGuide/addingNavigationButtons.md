{% set title = "Adding Navigation Buttons" %}
{% set filename = "addingNavigationButtons" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "User Guide: {{ title }}"
  layout: userGuide.md
  pageNav: 2
</frontmatter>

<span id="link" class="d-none">
<md>[_User Guide → {{ title }}_]({{ filename }}.html)</md>
</span>

# {{ title }}

<div class="lead" id="overview">

Navigation buttons can **greatly help your website visitors browse through your content with ease**. 
</div>

**Overview of steps**

> 1. Define a function to read the page title and create navigation buttons via [Nunjucks](/userGuide/markBindSyntaxOverview.html#support-for-nunjucks)
> 2. Define a title variable in the content file and invoke the function created to render the navigation buttons

In the following example, we will be editing the site content generated from the [default template](/userGuide/templates.html#templates) (by running `markbind init` in the terminal)

## Adding the required file and folder

1. Create a folder `njk` in the root directory
2. In the folder, create a file `common.njk` with the following code:
<div class="indented">

{% raw %}
```html {heading="**common.njk**"}
{% macro previous_next(previous_page, next_page) %}
<div class="clearfix">
{% if previous_page != ''%}
<span class="float-start">
    <a class="btn btn-light" href="{{ previous_page }}.html">
        <md>:far-arrow-alt-circle-left: <include src="{{ previous_page }}.md#title" inline />
        </md>
    </a>
</span>
{% endif %}
{% if next_page != ''%}
<span class="float-end">
    <a class="btn btn-light" href="{{ next_page }}.html">
        <md>
            <include src="{{ next_page }}.md#title" inline /> :far-arrow-alt-circle-right:
        </md>
    </a>
</span>
{% endif %}
</div>
<br>
{% endmacro %}
```
{% endraw %}
</div>

{{ icon_example }} Here is an example of how the default template's directory structure will look like after the changes.

<div class="indented">

<tree>
root
  _markbind
  _site
  contents
  njk/
    common.njk
  stylesheets
  index.md
  site.json
</tree>
</div>

## Editing the content files

<box type="tip">

Whenever you create a new page, be sure to include the following code below and replace the parts enclosed in the square brackets e.g `[Name_Of_Section]`

{% raw %}
```html {.line-numbers}
<!--- Creates an invisible title used in the common.njk file -->
<span id="title" class="d-none">[Name_Of_Section]</span>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('[Previous_Page_Filename]', '[Next_Page_Filename]') }}
```
{% endraw %}

<panel type="info" header="**Effect after changes are made**" expanded no-close>

1. Changing `[Name_Of_Section]` will affect the **text in the navigation button** when attempting to navigate to the current page from the previous and next pages.
2. Changing `[Previous_Page_Filename]` and `[Next_Page_Filename]` is to link the current page to the previous and next pages.
3. Line 4 aims to **import the previous_next function** from common.njk file that you created earlier, you can refer to the Nunjucks docs for the syntax [here](https://mozilla.github.io/nunjucks/templating.html#import)
4. Line 5 aims to **call the previous_next function** you imported, you can refer to the Nunjucks docs for the syntax [here](https://mozilla.github.io/nunjucks/templating.html#variables)

</panel>

</box>

1. Add the following code into the `topic1.md` file:
<div class="indented">

{% raw %}
```html {heading="**topic1.md**"}
<!--- Add this to the top of the file -->
<span id="title" class="d-none">Topic 1</span>

<!--- Add this to the end of the file -->
{% from "njk/common.njk" import previous_next %}
{{ previous_next('', 'topic2') }}
```
{% endraw %}
</div>

2. Add the following code into the `topic2.md` file:
<div class="indented">

{% raw %}
```html {heading="**topic2.md**"}
<!--- Add this to the top of the file -->
<span id="title" class="d-none">Topic 2</span>

<!--- Add this to the end of the file -->
{% from "njk/common.njk" import previous_next %}
{{ previous_next('topic1', '') }}
```
{% endraw %}
</div>

{{ icon_example }} Here is an example of how the files will look like after the changes.

<div class="indented">

{% raw %}
```html {heading="**topic1.md**" .line-numbers highlight-lines="1,9-10"}
<span id="title" class="d-none">Topic 1</span>

<br>

# Topic 1

> More content to be added

{% from "njk/common.njk" import previous_next %}
{{ previous_next('', 'topic2') }}
```
{% endraw %}

{% raw %}
```html {heading="**topic2.md**" .line-numbers highlight-lines="1,8-9"}
<span id="title" class="d-none">Topic 2</span>

<br>
<box>
    <span class="fas fa-tools"></span><span> This is a placeholder page</span>
</box>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('topic1', '') }}
```
{% endraw %}

</div>

You should now be able to navigate between section `Topic 1` and `Topic 2` with ease.

<box type="tip">

Whenever you create a new page, be sure to include the following code below and replace the parts enclosed in the square brackets e.g `[Name_Of_Section]`   

{% raw %}
```html
<span id="title" class="d-none">[Name_Of_Section]</span>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('[Previous_Page_Filename]', '[Next_Page_Filename]') }}
```
{% endraw %}

</box>

{% from "njk/common.njk" import previous_next %}
{{ previous_next('redirectingToACustom404Page', '') }}
