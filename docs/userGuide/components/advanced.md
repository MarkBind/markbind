# Advanced Tips and Tricks

## Rich formatted text in headings and titles

<p style="font-size:18px;">
  Using the normal syntax, you are only able to use markdown formatting on headings. If you would like more styling options, you can define an element within the component that acts as your heading. This is done by adding a <md>`slot`</md> attribute with the correct name to that element.
</p>

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <panel expanded>
    <p slot="header" class="panel-title">
      <i><strong>
        <span style="color:#FF0000;">R  </span>
        <span style="color:#FF7F00;">A  </span>
        <span style="color:#FFFF00;">I  </span>
        <span style="color:#00FF00;">N  </span>
        <span style="color:#0000FF;">B  </span>
        <span style="color:#4B0082;">O  </span>
        <span style="color:#9400D3;">W  </span>
      </strong></i>
    </p>
    As shown in this panel, using the header slot allows you to customize the Panel's header using HTML.
  </panel>
</tip-box>

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <trigger for="modal:tip-example" trigger="click">Click here to show Modal.</trigger>
  <modal id="modal:tip-example">
    <div slot="modal-header" class="modal-title text-center">
      <span style="font-size:20pt"><span style="color:red;">BIG</span> header</span>
    </div>
      Modal allows you to style both header and footer individually, with style classes and inline styles.
    <div slot="modal-footer" class="text-center">
      <span style="font-size:10pt">Tiny <span style="color:green;">footer</span></span>
    </div>
  </modal>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<panel expanded>
  <p slot="header" class="panel-title">
    <i><strong>
      <span style="color:#FF0000;">R  </span>
      <span style="color:#FF7F00;">A  </span>
      <span style="color:#FFFF00;">I  </span>
      <span style="color:#00FF00;">N  </span>
      <span style="color:#0000FF;">B  </span>
      <span style="color:#4B0082;">O  </span>
      <span style="color:#9400D3;">W  </span>
    </strong></i>
  </p>
  As shown in this panel, using the header slot allows you to customize the Panel's header using HTML.
</panel>

<trigger for="modal:tip-example" trigger="click">Click here to show Modal.</trigger>
<modal id="modal:tip-example">
  <div slot="modal-header" class="modal-title text-center">
    <span style="font-size:20pt"><span style="color:red;">BIG</span> header</span>
  </div>
    Modal allows you to style both header and footer individually, with style classes and inline styles.
  <div slot="modal-footer" class="text-center">
    <span style="font-size:10pt">Tiny <span style="color:green;">footer</span></span>
  </div>
</modal>
```
</tip-box>
<br>

### Panel Slot Options
Slot name | Default class | Notes
--- | --- | --- 
`header` | `panel-title` | Aligning text to the center of the panel is not possible, as the header element does not take up the entire container.

### Modal Slot Options
Slot name | Default class | Notes
--- | --- | ---
`modal-header` | `modal-title` |
`modal-footer` | `modal-footer` | Specifying `modal-footer` will override the `ok-text` attribute, and the OK button will not render.
