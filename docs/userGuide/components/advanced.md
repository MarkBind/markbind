## Advanced Tips and Tricks

{% set slot_info_trigger %}<trigger for="on-slots" trigger="click"><strong>^\[S\]^</strong></trigger>{% endset %}

{% set slot_type_info_trigger %}<trigger for="on-slots" trigger="click">Slot</trigger>{% endset %}

### Richer formatting of attributes using slots

<div id="slots">

Most component attributes allow a richer form of formatting using slots, denoted by an attribute<strong>^\[S\]^</strong> superscript in the respective components' tables.
In other cases, when the option is of type "Slot", only the slot option is available.

You can define such a slot within the component by adding a `slot="attribute name"` attribute to any element within the slot.

{{ icon_example }}

<include src="codeAndOutput.md" boilerplate>
<variable name="code">
<panel expanded>
  <p slot="header" class="card-title">
    <i><strong>
      <span style="color:#FF0000;">R</span>
      <span style="color:#FF7F00;">A</span>
      <span style="color:#FFFF00;">I</span>
      <span style="color:#00FF00;">N</span>
      <span style="color:#0000FF;">B</span>
      <span style="color:#4B0082;">O</span>
      <span style="color:#9400D3;">W</span>
    </strong></i>
  </p>
  As shown in this panel, using the header slot
  allows you to customize the Panel's header using HTML.
</panel>
</variable>
<variable name="highlightStyle">html</variable>
</include>
</div>
  
<modal header="Richer formatting of attributes using slots" id="on-slots" large>
<include src="advanced.md#slots" />
</modal>

**Other examples of slots in use**

{{ icon_example }} Custom modal header

<include src="codeAndOutput.md" boilerplate>
<variable name="code">
<trigger for="modal:tip-example" trigger="click">Click here to show Modal.</trigger>

<modal id="modal:tip-example">
  <div slot="header" class="modal-title text-center">
    <span style="font-size:20pt"><span style="color:red;">BIG</span> header</span>
  </div>
    Modal allows you to style both header and footer individually, with style classes and inline styles.
  <div slot="footer" class="text-center">
    <span style="font-size:10pt">Tiny <span style="color:green;">footer</span></span>
  </div>
</modal>
</variable>
<variable name="highlightStyle">html</variable>
</include>


{{ icon_example }} Override the default icon for a certain type of box.

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

{{ icon_example }} Use pictures (or even gifs) as the icon for a box.

```html
<box type="info" seamless>
    <img slot="icon" src="https://icons8.com/vue-static/landings/animated-icons/icons/cloud/cloud.gif"></img>
    some very useful info
</box>
```

<box type="info" seamless>
    <img slot="icon" width="75%" src="https://icons8.com/vue-static/landings/animated-icons/icons/cloud/cloud.gif"></img>
    some very useful info
</box>

{{ icon_example }} Use [thumbnail]({{ baseUrl }}/userGuide/usingComponents.html#thumbnails) as the icon. 


```html
<box type="info" light>
    <thumbnail circle slot="icon" text=":book:" background="#dff5ff" size="50"/>
    use thumbnail as the icon
</box>
```

<box type="info" light>
    <thumbnail circle slot="icon" text=":book:" background="#dff5ff" size="50"/>
    use thumbnail as the icon
</box>

### Inserting custom classes into components {.mt-4 .mb-3}

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
