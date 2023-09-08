## Annotations

**An `annotate` component allows you to easily annotate over any images.**

Annotate wrappers (`<annotate>`) are used in conjunction with Annotate
Points (`<a-point>`).

- `<annotate>`: Annotate wrappers are used to hold the image and set its width and height.
- `<a-point>`: Annotate points define the position, text and style of each point within the image. Insert them between the Annotate wrappers.

The x and y coordinates of each Annotate Point are relative to the image and are written in percentage of total width or height.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<annotate src="../../images/annotateSampleImage.png" width="500" alt="Sample Image">
  <!-- Minimal Point -->
  <a-point x="25%" y="25%" content="This point is 25% from the left and 25% from the top" />
  <!-- Customize Point Size (default size is 40px) -->
  <a-point x="50%" y="25%" content="This point is 50% from the left and 25% from the top"  size="60"/>
  <!-- Customize Point Header (default is empty) -->
  <a-point x="75%" y="25%" content="This point is 75% from the left and 25% from the top"  header="This has a header"/>
  <!-- Customize Point Color (default color is green) -->
  <a-point x="33%" y="50%" content="This point is 33% from the left and 50% from the top"  color="red"/>
  <!-- Customize Point Opacity (default opacity is 0.3) -->
  <a-point x="66%" y="50%" content="This point is 66% from the left and 50% from the top"  opacity="0.7"/>
  <!-- Customize Point Label (default is empty) -->
  <a-point x="25%" y="75%" content="This point is 25% from the left and 75% from the top" label="1"/>
  <!-- Customize Text Color (default color is black) -->
  <a-point x="50%" y="75%" content="This point is 50% from the left and 75% from the top"  textColor="white" color="black" label="2" opacity="1"/>
  <!-- Customize Font Size (default font size is 14) -->
  <a-point x="75%" y="75%" content="This point is 75% from the left and 75% from the top"  fontSize="30" label="3"/>
</annotate>
</variable>
</include>

**Using triggers and positions for Annotate Point** <br>

Similar to **[popovers](../components/popups.md#popovers)**, Annotate Points also support different types of triggers and positions
for users with different needs.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<annotate src="../../images/annotateSampleImage.png" width="500" alt="Sample Image">
  <!-- Default Trigger (click)-->
  <a-point x="33%" y="33%" content="Lorem ipsum dolor sit amet" />
  <!-- Set Trigger to hover focus -->
  <a-point x="66%" y="33%" content="Lorem ipsum dolor sit amet" trigger="hover focus"/>
  <!-- Set Popover Placement (click)-->
  <a-point x="25%" y="66%" content="Popover on the left" placement="left"/>
  <a-point x="50%" y="66%" content="Popover on the bottom" placement="bottom"/>
  <a-point x="75%" y="66%" content="Popover on the right" placement="right"/>
  <!-- Both trigger and popover placement hover focus -->
  <a-point x="50%" y="66%" content="Popover on the bottom" placement="bottom" trigger="hover focus"/>
</annotate>
</variable>
</include>

<br>

**Displaying content as legends in Annotate Point**

`<a-point>` allows users to display its content !!inside a popover!! or !!as a legend below the diagram!! or !!both!!. However, the label attribute  must be specified in `<a-point>` in order to display the content below the image.

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<annotate src="../../images/annotateSampleImage.png" width="500" alt="Sample Image">
  <!-- Default Legend (popover only)-->
  <a-point x="25%" y="50%" content="There is only text when you click me" label="1"/>
  <!-- Set Legend to bottom only (no popover) -->
  <a-point x="50%" y="50%" content="Clicking on this does nothing" label="2" legend="bottom" header="Headers are displayed as well"/>
  <!-- Set Legend to both -->
  <a-point x="75%" y="50%" content="There is text at both locations"  label="3" legend="both" header="Headers are displayed at both positions"/>
</annotate>
</variable>
</include>

<br>

**Sample use cases for Annotate** <br>

Here we showcase some use cases of the Annotate feature.

**Example 1: Describing elements in an image** <br>

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<annotate src="../../images/annotateSampleObject.png" height="500" alt="Sample Image">
  <a-point x="6%" y="50%" content="You can use a triangle and a solid line (not to be confused with an arrow) to indicate class inheritance." label="1" header="Class inheritance" legend="both"/>
  <a-point x="25.5%" y="50%" content="UML uses a solid diamond symbol to denote composition." label="2" header="Composition" color="red"  legend="both"/>
  <a-point x="45%" y="50%" content="UML uses a hollow diamond to indicate an aggregation."  label="3" header="Aggregation" color="blue" legend="both"/>
  <a-point x="64.5%" y="50%" content="Association labels describe the meaning of the association."  label="4" header="Association labels" color="yellow"  legend="both"/>
</annotate>
</variable>
</include>

**Example 2: Drawing over elements** <br>

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<annotate src="../../images/annotateSampleSequence.png" height="500" alt="Sample Image">
  <a-point x="35%" y="18.5%" content="Operation is invoked" header="Operation"  opacity="0.2" size="30"/>
  <a-point x="65%" y="50%" content="This is the period during which the method is being executed" header="Activation Bar" opacity="0.3" size="50" color="yellow"/>
  <a-point x="14%" y="85%" content="Return control and possibly some return value" header="Return Value" opacity="0.2" size="30" color="blue"/>
</annotate>
</variable>
</include>

<br>

****`<a-point>` Options****

| Name      | Type     | Default     | Description                                                                                                                              |
| --------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| x         | `String` |        | **This must be specified.**<br>The x-coordinate of the point.<br>Supports range of values from `0%` to `100%`.           |
| y         | `String` |        | **This must be specified.**<br>The y-coordinate of the point.<br>Supports range of values from `0%` to `100%`.           |
| content   | `String` | `''`        | Annotate Point content.<br>The annotation content will be omitted if this is not provided. |
| header    | `String` | `''`        | Annotate Point header.<br>The header will be omitted if this is not provided.                            |
| trigger   | `String` | `click`     | Popover trigger type.<br>Supports: `click`, `focus`, `hover`, or any space-separated combination of these.                       |
| placement | `String` | `top`       | Position of the Popover.<br>Supports: `top`, `left`, `right`, `bottom`.                                                              |
| label     | `String` | `''`        | The label shown on the point itself.<br>The label will be omitted if this is not provided.<br>Note that labels should not be too long as they might overflow out of the point.                                       |
| size      | `String` | `'40'`      | The size of the point in pixels.                                                                                                         |
| color     | `String` | `'green'`   | The color of the point.<br>Supports any color in the CSS color format. E.g. `red`, `#ffffff`, `rgb(66, 135, 245)`, etc.                |
| opacity   | `String` | `'0.3'`     | The opacity of the point.<br>Supports range of values from `0` to `1`.                                                                   |
| fontSize  | `String` | `'14'`      | The font size of the label.<br>Supports any pixel size smaller than size of the point.                                                   |
| textColor | `String` | `'black'`   | The color of the label.<br>Supports any color in the CSS color format. E.g. `red`, `#ffffff`, `rgb(66, 135, 245)`, etc.                  |
| legend    | `String` | `'popover'` | The position of the Annotate Point content and header.<br>Supports: `popover`, `bottom`, `both`.                                                      |

****`<annotate>` Options****

This is effectively the same as the options used for the [picture](#pictures) component.

| Name   | Type      | Default | Description                                                                                                                                                                                                           |
| ------ | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| alt    | `string`  |         | **This must be specified.**<br>The alternative text of the image.                                                                                                                                                     |
| src    | `string`  |         | **This must be specified.**<br>The URL of the image.<br>The URL can be specified as absolute or relative references. More info in: _[Intra-Site Links]({{baseUrl}}/userGuide/formattingContents.html#intraSiteLinks)_ |
| height | `string`  |`''`| The height of the image in pixels.                                                                                                                                                                                    |
| width  | `string`  |`''`| The width of the image in pixels.<br>If both width and height are specified, width takes priority over height. It is to maintain the image's aspect ratio.                                                            |

</div>

<div id="short" class="d-none">

```
<annotate src="../../images/annotateSampleImage.png" width="500" alt="Sample Image">
  <a-point x="25%" y="25%" content="Lorem ipsum dolor sit amet" />
  <a-point x="50%" y="25%" content="Lorem ipsum dolor sit amet" label="1a"/>
  <a-point x="50%" y="25%" content="Lorem ipsum dolor sit amet" label="1b" legend="both"/>
</annotate>
```

</div>

<div id="examples" class="d-none">

<annotate src="https://markbind.org/userGuide/diagrams/object.png" height="500" alt="Sample Image">
  <!-- Default Legend (popover only)-->
  <a-point x="6%" y="50%" content="You can use a triangle and a solid line (not to be confused with an arrow) to indicate class inheritance." label="1" header="
Class inheritance"/>
  <!-- Set Legend to bottom only (popover is not clickable) -->
  <a-point x="25.5%" y="50%" content="UML uses a solid diamond symbol to denote composition." label="2" header="Composition" color="red"/>
  <!-- Set Legend to both -->
  <a-point x="45%" y="50%" content="UML uses a hollow diamond to indicate an aggregation."  label="3" header="
Aggregation" color="blue"/>
  <a-point x="64.5%" y="50%" content="Association labels describe the meaning of the association."  label="4" header="Association labels" color="yellow"/>
</annotate>

</div>
</popover>
</div>
