## Tooltips

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
<tooltip content="Lorem ipsum dolor sit amet" placement="top">
  <button class="btn btn-secondary">Tooltip on top</button>
</tooltip>
<tooltip content="Lorem ipsum dolor sit amet" placement="left">
  <button class="btn btn-secondary">Tooltip on left</button>
</tooltip>
<tooltip content="Lorem ipsum dolor sit amet" placement="right">
  <button class="btn btn-secondary">Tooltip on right</button>
</tooltip>
<tooltip content="Lorem ipsum dolor sit amet" placement="bottom">
  <button class="btn btn-secondary">Tooltip on bottom</button>
</tooltip>
<hr />

Trigger
<p>
  <tooltip content="Lorem ipsum dolor sit amet" placement="top" trigger="click">
    <button class="btn btn-secondary">Click</button>
  </tooltip>
</p>
<p>
  <tooltip content="Lorem ipsum dolor sit amet" placement="top" trigger="focus">
    <input placeholder="Focus"></input>
  </tooltip>
</p>
<hr />

**Markdown**:
<tooltip content="*Hello* **World**">
  <a href="">Hover me</a>
</tooltip>
<br />

**Free Text**:
<tooltip content="coupling is the degree of interdependence between software modules; a measure of how closely connected two routines or modules are; the strength of the relationships between modules."><i>coupling</i></tooltip>
</variable>
</include>

**Using trigger for Tooltip:**<br>

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">
More about <trigger for="tt:trigger_id">trigger</trigger>.
<tooltip id="tt:trigger_id" content="This tooltip triggered by a trigger"></tooltip>
<br>
This is the same <trigger for="tt:trigger_id">trigger</trigger> as last one.
</variable>
</include>

<panel header="More about triggers">
<include src="extra/triggers.md" />
</panel><p/>

****Options****

Name | Type | Default | Description
---- | ---- | ------- | ------
trigger	| `String` | `hover focus` | How the tooltip is triggered.<br>Supports: `click`, `focus`, `hover`, or any space-separated combination of these.
content | `String` | `''` | Text content of the tooltip.
placement | `String` | `top` | How to position the tooltip.<br>Supports: `top`, `left`, `right`, `bottom`.


<div id="short" class="d-none">

```html
Hover <tooltip content="An explanation, **supports simple Markdown**">here</tooltip> to see a tooltip.
```
</div>

<div id="examples" class="d-none">

Hover <tooltip content="An explanation, **supports simple Markdown**">here</tooltip> to see a tooltip.
</div>
