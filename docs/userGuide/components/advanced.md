## Advanced Tips and Tricks

### Rich formatting in headings/titles

Using the normal syntax, you are only able to use markdown formatting on headings. If you would like more styling options, you can define an element within the component that acts as your heading. This is done by adding a <md>`slot`</md> attribute with the correct name to that element.

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <panel expanded>
    <p slot="header" class="card-title">
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
  <p slot="header" class="card-title">
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

**Box Slot Options:**

Slot name | Default class |
--- | --- |
icon | (depends on box's `type` attribute) |

*Example 1*: Override the default icon for a certain type of box.

```html
<box type="info">
    <span slot="icon" class="text-danger"><md>:fas-home:</md></span>
    info
</box>
```

<box type="info">
    <span slot="icon" class="text-danger"><md>:fas-home:</md></span>
    info
</box>

*Example 2*: Use pictures (or even gifs) as icon for a box.

<box type="info">
    <img slot="icon" src="https://icons8.com/vue-static/landings/animated-icons/icons/cloud/cloud.gif"></img>
    some very useful info
</box>

**Panel Slot Options:**
Slot name | Default class | Notes
--- | --- | --- 
header | `card-title` | Aligning text to the center of the panel is not possible, as the header element does not take up the entire container.

**Modal Slot Options:**
When using slots for Modals, you need to add a single blank line before each `<modal>` tag, in order for the customization to render correctly.

Slot name | Default class | Notes
--- | --- | ---
header <hr style="margin-top:0.2rem; margin-bottom:0" /> <small>`modal-header` <br> (deprecated)</small>  | `modal-title` |
footer <hr style="margin-top:0.2rem; margin-bottom:0" /> <small>`modal-footer` <br> (deprecated)</small> | `modal-footer` | Specifying `modal-footer` will override the `ok-text` attribute, and the OK button will not render.

**Popover Slot Options:**
Slot name | Default class
--- | --- | ---
header <hr style="margin-top:0.2rem; margin-bottom:0" /> <small>`title` <br> (deprecated)</small>  | `popover-header`
content | `popover-body` 

**Dropdown Slot Options:**
Slot name | Default class
--- | ---
header | `dropdown-toggle`

### Inserting custom classes into components

Every component documented in our user guide allows you to insert your own defined CSS classes.
This is done by adding the `add-class` attribute to a component along with the desired class names.

<tip-box border-left-color="#00B0F0">
  <i style="font-style: normal; font-weight: bold; color: dimgray">Example</i><br>
  <tip-box type="info" add-class="lead font-italic text-center">
    Easily apply Bootstrap classes without using a wrapper!
  </tip-box>
</tip-box>

<tip-box border-left-color="black">
<i style="font-style: normal; font-weight: bold; color: dimgray">Markup</i>

```html
<tip-box type="info" add-class="lead font-italic text-center">
  Easily apply Bootstrap classes without using a wrapper!
</tip-box>
```
</tip-box>
<br>
