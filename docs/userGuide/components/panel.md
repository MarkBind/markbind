## Panel

**Panel is a flexible container that supports collapsing and expanding its content. It is expandable by default.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <panel header="This is your header for a Panel, click me to expand!">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<panel header="This is your header for a Panel, click me to expand!">
  ...
</panel>
```
</tip-box>
<br>

**With `minimized` attribute, panel is minimized into an inline block element. The `alt` attribute is for you to specify the minimized block header.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <panel header="How to cultivate a tomato plant at home" alt="Tomatoes" minimized>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<panel header="How to cultivate a tomato plant at home" alt="Tomatoes" minimized>
  ...
</panel>
```
</tip-box>
<br>

**With `expanded` attribute, you can set the panels to be expanded when loaded in.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <panel header="Have your readers click less to see the Panel's contents" expanded>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<panel header="Have your readers click less to see the Panel's contents" expanded>
  ...
</panel>
```
</tip-box>
<br>

**Panel provides many types that change its appearance.**


<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <p>Click the Panels to see the expanded style.</p>
  <panel header="**light type panel (DEFAULT)**" type="light" minimized>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
  <panel header="**dark type panel**" type="dark" minimized>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
  <panel header="**primary type panel**" type="primary" minimized>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
  <panel header="**secondary type panel**" type="secondary" minimized>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
  <panel header="**info type panel**" type="info" minimized>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
  <panel header="**danger type panel**" type="danger" minimized>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
  <panel header="**warning type panel**" type="warning" minimized>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
  <panel header="**success type panel**" type="success" minimized>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
  <panel header="**seamless type panel**" type="seamless" minimized>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<panel header="###### light type panel (DEFAULT)" type="light" minimized>
  ...
</panel>
<panel header="###### dark type panel" type="dark" minimized>
  ...
</panel>
<panel header="###### primary type panel" type="primary" minimized>
  ...
</panel>
<panel header="###### secondary type panel" type="secondary" minimized>
  ...
</panel>
<panel header="###### info type panel" type="info" minimized>
  ...
</panel>
<panel header="###### danger type panel" type="danger" minimized>
  ...
</panel>
<panel header="###### warning type panel" type="warning" minimized>
  ...
</panel>
<panel header="###### success type panel" type="success" minimized>
  ...
</panel>
<panel header="###### seamless type panel" type="seamless" minimized>
  ...
</panel>
```
</tip-box>
<br>

**Show/Hide buttons using `no-switch` or `no-close`.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <panel header="This panel does not have a switch button" no-switch>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
  <panel header="This panel does not have a close button" no-close>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
  <panel header="This panel does not have either buttons" no-close no-switch>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<panel header="This panel does not have a switch button" no-switch>
  ...
</panel>
<panel header="This panel does not have a close button" no-close>
  ...
</panel>
<panel header="This panel does not have either buttons" no-close no-switch>
  ...
</panel>
```
</tip-box>
<br>

**Use markdown in the header (only inline level markdown are supported).**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <panel header="**Bold text** :rocket: ![](https://vuejs.org/images/logo.png =25x25)" type="seamless">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias dolores excepturi expedita illum impedit ipsa labore qui veniam. Blanditiis exercitationem id ipsum libero molestiae, necessitatibus unde? Amet fugiat fugit molestias?
  </panel>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<panel header="**Bold text** :rocket: ![](https://vuejs.org/images/logo.png =25x25)" type="seamless">
  ...
</panel>
```
</tip-box>
<br>

**If `src` attribute is provided, the panel will take content from the `src` specified and add it to the Panel body.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <panel header="Content loaded in from 'src'" src="anotherSrc/loadContent.html#fragment" minimized></panel>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<panel header="Content loaded in from 'src'" src="anotherSrc/loadContent.html#fragment" minimized></panel>
```
</tip-box>
<br>

**If `popup-url` attribute is provided, a popup button will be shown. If clicked, it opens the specified url in a new window.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <panel header="Try clicking on my pop-up button" popup-url="anotherSrc/loadContent.html">
    This panel has a popup.
  </panel>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<panel header="Try clicking on my pop-up button" popup-url="anotherSrc/loadContent.html">
  This panel has a popup.
</panel>
```
</tip-box>
<br>

**If `preload` attribute is provided, the panel body will load the HTML when the page renders instead of after being expanded.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <panel header="Right click and inspect my HTML before expanding me!" src="anotherSrc/loadContent.html#fragment" preload>
    <p>You should be able to find this text before expanding the Panel.</p>
  </panel>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<panel header="Right click and inspect my HTML before expanding me!" src="anotherSrc/loadContent.html#fragment" preload>
  <p>You should be able to find this text before expanding the Panel.</p>
</panel>
```
</tip-box>
<br>

**You can nest Panels or other components within a Panel.**

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <panel header="Parent Panel">
    <panel header="Level 1 Nested Panel">
      <panel header="Level 2 Nested Panel">
        <tip-box type="success">
          I'm a nested tip-box
        </tip-box>
      </panel>
    </panel>
    <panel header="Level 1 Nested Panel" type="info"> 
      Some Text
    </panel>
  </panel>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<panel header="Parent Panel">
  <panel header="Level 1 Nested Panel">
    <panel header="Level 2 Nested Panel">
      <tip-box type="success">
        I'm a nested tip-box
      </tip-box>
    </panel>
  </panel>
  <panel header="Level 1 Nested Panel" type="info">
    Some Text
  </panel>
</panel>
```
</tip-box>
<br>

#### Panel Options
Name | Type | Default | Description 
--- | --- | --- | ---
header | `String` | `''` | The clickable text on the Panel's header.
alt | `String` | Panel header | The clickable text on the minimised Panel.
expandable | `Boolean`| `true` | Whether Panel is expandable.
expanded | `Boolean` | `false` | Whether Panel is expanded or collapsed when loaded in.
minimized | `Boolean` | `false` | Whether Panel is minimized.
no-close | `Boolean` | `false` | Whether to show the close button.
no-switch | `Boolean` | `false` | Whether to show the expand switch.
bottom-switch | `Boolean` | `true` | Whether to show an expand switch at the bottom of the panel. Independent of no-switch.
popup-url | `String` | | The url that the popup window will navigate to. The url can be absolute or relative.
preload | `Boolean` | `false` | Whether the content is loaded immediately from `src`.
src | `String` | | The url to the remote page to be loaded as the content of the panel.
type | `String` | `light` | The type of color for the tab (single).<br>Supports: `light`, `dark`, `primary`, `secondary`, `info`, `success`, `warning`, `danger`, `seamless`.
