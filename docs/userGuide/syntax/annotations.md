{% from "userGuide/components/advanced.md" import slot_info_trigger %}

## Annotations

Annotation components allow you to easily add annotations over any image.

### Introduction

Annotation wrappers (`<annotate>`) are used in conjunction with annotation
points (`<a-point>`).

Annotation wrappers hold the image and set its width and height.

Annotation points are used to define the position, text and style of each point
within the image. Insert them between
the annotation wrappers (`<annotate>...</annotate>`).

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<annotate src="../../images/annotateSampleImage.png" width="500" alt="sampleImage">
  <!-- Minimal Point -->
  <a-point x="25%" y="25%" content="Lorem ipsum dolor sit amet" />
  <!-- Customize Point Size (default size is 40px) -->
  <a-point x="50%" y="25%" content="Lorem ipsum dolor sit amet"  size="60"/>
  <!-- Customize Point Header (default is empty) -->
  <a-point x="75%" y="25%" content="Lorem ipsum dolor sit amet"  header="Lorem ipsum"/>
  <!-- Customize Point Color (default color is green) -->
  <a-point x="33%" y="50%" content="Lorem ipsum dolor sit amet"  color="red"/>
  <!-- Customize Point Opacity (default opacity is 0.3) -->
  <a-point x="66%" y="50%" content="Lorem ipsum dolor sit amet"  opacity="0.7"/>
  <!-- Customize Point Label (default is empty) -->
  <a-point x="25%" y="75%" content="Lorem ipsum dolor sit amet" label="1"/>
  <!-- Customize Text Color (default color is black) -->
  <a-point x="50%" y="75%" content="Lorem ipsum dolor sit amet"  textColor="white" color="black" label="2" opacity="1"/>
  <!-- Customize Font Size (default font size is 14) -->
  <a-point x="75%" y="75%" content="Lorem ipsum dolor sit amet"  fontSize="30" label="3"/>
</annotate>
</variable>
</include>

**Using trigger for Annotate Point** <br>

Similar to **[popovers](popups.md)**, annotation points also support different types of triggers
for users with different needs.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<annotate src="../../images/annotateSampleImage.png" width="500" alt="sampleImage">
  <!-- Default Trigger (click)-->
  <a-point x="33%" y="33%" content="Lorem ipsum dolor sit amet" />
  <!-- Set Trigger to hover focus -->
  <a-point x="66%" y="33%" content="Lorem ipsum dolor sit amet" trigger="hover focus"/>
  <!-- Set Popover Placement (click)-->
  <a-point x="25%" y="66%" content="Lorem ipsum dolor sit amet" placement="left"/>
  <a-point x="50%" y="66%" content="Lorem ipsum dolor sit amet" placement="bottom"/>
  <a-point x="75%" y="66%" content="Lorem ipsum dolor sit amet" placement="right"/>
</annotate>
</variable>
</include>

<br>

**Displaying content as legends in Annotate Point**

Annotate point allows users to display its content inside the popover or as
a legend below the diagram or both. However, this only works when if a label is
also provided for the point.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<annotate src="../../images/annotateSampleImage.png" width="500" alt="sampleImage">
  <!-- Default Legend (popover only)-->
  <a-point x="25%" y="50%" content="There is only text when you click me" label="1"/>
  <!-- Set Legend to bottom only (popover is not clickable) -->
  <a-point x="50%" y="50%" content="Clicking on this does nothing" label="2" legend="bottom" header="Headers are displayed as well"/>
  <!-- Set Legend to both -->
  <a-point x="75%" y="50%" content="There is text at both locations"  label="3" legend="both" header="Headers are displayed at both positions"/>
</annotate>
</variable>
</include>

<br>

****`<a-point>` Options****

| Name      | Type     | Default     | Description                                                                                                                              |
| --------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| x         | `String` | `''`        | **This must be specified.**<br>How to position the x-coordinate of the point.<br>Supports range of values from `0%` to `100%`.           |
| y         | `String` | `''`        | **This must be specified.**<br>How to position the y-coordinate of the point.<br>Supports range of values from `0%` to `100%`.           |
| content   | `String` | `''`        | **This must be specified.**<br>The content to be inserted into the body of the text.<br>The body will be omitted if this is not provided |
| header    | `String` | `''`        | The content to be inserted into the header of the text.<br>The header will be omitted if this is not provided                            |
| trigger   | `String` | `click`     | How the Popover is triggered.<br>Supports: `click`, `focus`, `hover`, or any space-separated combination of these.                       |
| placement | `String` | `top`       | How to position the Popover.<br>Supports: `top`, `left`, `right`, `bottom`.                                                              |
| label     | `String` | `''`        | The content to be shown over the point.<br>The label will be omitted if this is not provided                                             |
| size      | `String` | `'40'`      | The size of the point in pixels.                                                                                                         |
| color     | `String` | `'green'`   | The color of the point.<br>Supports any color in the CSS color format. E.g. `red`, `#ffffff`, `rgb(66, 135, 245)`, etc...                |
| opacity   | `String` | `'0.3'`     | The opacity of the point.<br>Supports range of values from `0` to `1`.                                                                   |
| fontSize  | `String` | `'14'`      | The font size of the label.<br>Supports any pixel size smaller than size of the point.                                                   |
| textColor | `String` | `'black'`   | The color of the label.<br>Supports any color in the CSS color format. E.g. `red`, `#ffffff`, `rgb(66, 135, 245)`, etc..                 |
| legend    | `String` | `'popover'` | The presence of a legend to be displayed.<br>Supports: `popover`, `bottom`, `both`.                                                      |

****`<annotate>` Options****

This is effectively the same as the options used for the [picture](#pictures) component.

| Name   | Type      | Default | Description                                                                                                                                                                                                           |
| ------ | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| alt    | `string`  |         | **This must be specified.**<br>The alternative text of the image.                                                                                                                                                     |
| src    | `string`  |         | **This must be specified.**<br>The URL of the image.<br>The URL can be specified as absolute or relative references. More info in: _[Intra-Site Links]({{baseUrl}}/userGuide/formattingContents.html#intraSiteLinks)_ |
| height | `string`  |`''`| The height of the image in pixels.                                                                                                                                                                                    |
| width  | `string`  |`''`| The width of the image in pixels.<br>If both width and height are specified, width takes priority over height. It is to maintain the image's aspect ratio.                                                            |
| eager  | `boolean` | false   | The `<pic>` component lazy loads its images by default.<br>If you want to eagerly load the images, simply specify this attribute.                                                                                     |

</div>

<div id="short" class="d-none">

```
<annotate src="../../images/annotateSampleImage.png" width="500" alt="sampleImage">
  <a-point x="25%" y="25%" content="Lorem ipsum dolor sit amet" />
  <a-point x="50%" y="25%" content="Lorem ipsum dolor sit amet" label="1a"/>
  <a-point x="50%" y="25%" content="Lorem ipsum dolor sit amet" label="1b" legend="both"/>
</annotate>
```

</div>

<div id="examples" class="d-none">

<annotate src="../../images/annotateSampleImage.png" width="500" alt="sampleImage">
  <a-point x="25%" y="25%" content="Lorem ipsum dolor sit amet" />
  <a-point x="50%" y="25%" content="Lorem ipsum dolor sit amet" label="1a"/>
  <a-point x="50%" y="25%" content="Lorem ipsum dolor sit amet" label="1b" legend="both"/>
</annotate>

</div>
</popover>
</div>
