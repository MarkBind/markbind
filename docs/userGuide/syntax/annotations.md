{% from "userGuide/components/advanced.md" import slot_info_trigger %}

## Annotations

Annotation components allows you to easily add annotations over any image.

### Introduction

Annotation wrappers (`<annotate>`) are used in conjunction with annotation
points (`<a-point>`).

Annotation wrappers are used to hold the image and set the width and height of
said image.

Annotation points are used to define the position, text and style of each point
within the image. In use, the annotation points are directly inserted between
the annotate wrappers (`<annotate>...</annotate>`).

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<annotate src="https://www.researchgate.net/profile/Chaiwat-Sakul/publication/228949121/figure/fig2/AS:300654661783574@1448693065750/The-previous-square-root-circuit-1.png" width="500">
  <!-- Minimal Point -->
  <a-point x="25%" y="25%" content="Lorem ipsum dolor sit amet" />
  <!-- Customize Point Label (default is empty) -->
  <a-point x="50%" y="25%" content="Lorem ipsum dolor sit amet" label="1a"/>
  <!-- Customize Point Header (default is empty) -->
  <a-point x="75%" y="25%" content="Lorem ipsum dolor sit amet"  header="Lorem ipsum"/>
  <!-- Customize Point Size (default size is 40px) -->
  <a-point x="25%" y="50%" content="Lorem ipsum dolor sit amet"  size="60"/>
  <!-- Customize Point Color (default color is green) -->
  <a-point x="50%" y="50%" content="Lorem ipsum dolor sit amet"  color="red"/>
  <!-- Customize Point Opacity (default opacity is 0.3) -->
  <a-point x="75%" y="50%" content="Lorem ipsum dolor sit amet"  opacity="0.7"/>
</annotate>
</variable>
</include>

**Using trigger for Annotate Point** <br>

Similar to popovers, annotation points also support different types of triggers for users with different needs.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<annotate src="https://www.researchgate.net/profile/Chaiwat-Sakul/publication/228949121/figure/fig2/AS:300654661783574@1448693065750/The-previous-square-root-circuit-1.png" width="500">
  <!-- Default Trigger (click)-->
  <a-point x="33%" y="50%" content="Lorem ipsum dolor sit amet" />
  <!-- Set Trigger to hover focus -->
  <a-point x="66%" y="50%" content="Lorem ipsum dolor sit amet" trigger="hover focus"/>
</annotate>
</variable>
</include>

<br>

**Displaying content as legends in Annotate Point** <br>

Annotate point also allows users to display its content as a legend below the diagram. However, this only works when a label is provided for the point.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<annotate src="https://www.researchgate.net/profile/Chaiwat-Sakul/publication/228949121/figure/fig2/AS:300654661783574@1448693065750/The-previous-square-root-circuit-1.png" width="500">
  <!-- Default Legend (popover only)-->
  <a-point x="25%" y="50%" content="There is only text when you click me" label="1"/>
  <!-- Set Legend to bottom only -->
  <a-point x="50%" y="50%" content="Clicking on this does nothing" label="2" legend="bottom"/>
  <!-- Set Legend to both -->
  <a-point x="75%" y="50%" content="There is text at both locations" header="Headers are displayed as well" label="3" legend="both"/>
</annotate>
</variable>
</include>

<br>

****`<a-point>` Options****

| Name      | Type     | Default   | Description                                                                                                               |
| --------- | -------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| x         | `String` | `''`      | How to position the x-coordinate of the point.<br>Supports range of values from `0%` to `100%`.                           |
| y         | `String` | `''`      | How to position the y-coordinate of the point.<br>Supports range of values from `0%` to `100%`.                           |
| content      | `String` | `''`      | The content to be inserted into the body of the text.<br>The body will be omitted if this is not provided                 |
| header    | `String` | `''`      | The content to be inserted into the header of the text.<br>The header will be omitted if this is not provided             |
| trigger   | `String` | `click`   | How the Popover is triggered.<br>Supports: `click`, `focus`, `hover`, or any space-separated combination of these.        |
| placement | `String` | `top`     | How to position the Popover.<br>Supports: `top`, `left`, `right`, `bottom`.                                               |
| label     | `String` | `''`      | The content to be shown over the point.<br>The label will be omitted if this is not provided                              |
| size      | `String` | `'40'`    | The size of the point in pixels.                                                                                          |
| color     | `String` | `'green'` | The color of the point.<br>Supports any color in the CSS color format. E.g. `red`, `#ffffff`, `rgb(66, 135, 245)`, etc... |
| opacity   | `String` | `'0.3'`   | The opacity of the point.<br>Supports range of values from `0` to `1`.                                                    |
| legend     | `String` | `'popover'`      | The presence of a legend to be displayed.<br>Supports: `popover`, `bottom`, `both`.                          |

</div>

<div id="examples" class="d-none">

Hover over the <trigger for="pop:context-target">keyword</trigger> to see the
popover.

<popover id="pop:context-target" header="Popover header" placement="top">
<div slot="content">

description :+1:

</div>
</popover>
</div>
