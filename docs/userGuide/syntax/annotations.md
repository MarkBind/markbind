{% from "userGuide/components/advanced.md" import slot_info_trigger %}

## Annotations

Annotation components allows you to easily add annotations over any image.
### Introduction

Annotation wrappers (`<annotate>`) are used in conjunction with annotation points (`<a-point>`).

Annotation wrappers are used to hold the image and set the width and height of said image.

Annotation points are used to define the position, text and style of each point within the image. In use, the annotation points are directly inserted between the annotate wrappers (`<annotate>...</annotate>`).


<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<annotate src="https://www.researchgate.net/profile/Chaiwat-Sakul/publication/228949121/figure/fig2/AS:300654661783574@1448693065750/The-previous-square-root-circuit-1.png" >
  <!-- Minimal Point -->
  <a-point x="25%" y="25%" body="Lorem ipsum dolor sit amet" />
  <!-- Customize Point Label (default is empty) -->
  <a-point x="50%" y="25%" body="Lorem ipsum dolor sit amet" label="1a"/>
  <!-- Customize Point Header (default is nothing) -->
  <a-point x="75%" y="25%" body="Lorem ipsum dolor sit amet"  header="Lorem ipsum"/>
  <!-- Customize Point Size (default size is 40px) -->
  <a-point x="25%" y="50%" body="Lorem ipsum dolor sit amet"  size="60"/>
  <!-- Customize Point Color (default color is green) -->
  <a-point x="50%" y="50%" body="Lorem ipsum dolor sit amet"  color="red"/>
  <!-- Customize Point Opacity (default opacity is 0.3) -->
  <a-point x="75%" y="50%" body="Lorem ipsum dolor sit amet"  opacity="0.7"/>
</annotate>
</variable>
</include>



**Using trigger for Popover:**<br>

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
More about <trigger for="pop:trigger_id">trigger</trigger>.
<popover id="pop:trigger_id" content="This popover is triggered by a trigger"></popover>
<br>
This is the same <trigger for="pop:trigger_id">trigger</trigger> as last one.
</variable>
</include>

<panel header="More about triggers">
<include src="extra/triggers.md" />
</panel>

<br>

****Options****

| Name                         | Type     | Default       | Description                                                                                                        |
| ---------------------------- | -------- | ------------- | -------------------------------------------------------------------------------------------------------------------|
| trigger                      | `String` | `hover focus` | How the Popover is triggered.<br>Supports: `click`, `focus`, `hover`, or any space-separated combination of these. |
| header{{slot_info_trigger}}  | `String` | `''`          | Popover header, supports MarkDown text.                                                                            |
| content{{slot_info_trigger}} | `String` | `''`          | Popover content, supports MarkDown text.                                                                           |
| src                          | `String` |               | The url to the remote page to be loaded as the content of the popover.<br>Both `.md` and `.html` are accepted.     |
| placement                    | `String` | `top`         | How to position the Popover.<br>Supports: `top`, `left`, `right`, `bottom`.                                        |

<box type="info" light>

MarkBind supports the `src` attribute, `content` attribute and `content` slot for popovers. 
Usually, only one of these would be used at a time.

If multiple of these are used, MarkBind will prioritise in the following order:
  1. `content` slot
  2. `content` attribute
  3. `src` attribute
</box>

<div id="short" class="d-none">

```html
Hover over the <trigger for="pop:context-target">keyword</trigger> to see the popover.

<popover id="pop:context-target" header="Popover header" placement="top">
<div slot="content">

description :+1:

</div>
</popover>
```
</div>

<div id="examples" class="d-none">

Hover over the <trigger for="pop:context-target">keyword</trigger> to see the popover.

<popover id="pop:context-target" header="Popover header" placement="top">
<div slot="content">

description :+1:

</div>
</popover>
</div>
