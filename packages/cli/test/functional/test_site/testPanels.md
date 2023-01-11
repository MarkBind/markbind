**Panel with attributes**

<panel header="Correct header">
  Lorem ipsum...
</panel>

<br>

<panel header="Correct header" alt="Alternative header">
  Lorem ipsum...
</panel>

<br>

**Panel with slots**

<panel>
  <span slot="header">Correct header</span>
  Lorem ipsum...
</panel>

<br>

<panel>
  <span slot="header">Correct header</span>
  <span slot="alt">Alternative header</span>
  Lorem ipsum...
</panel>

<br>

**Panel with slots overriding attributes**

<panel header="Should not appear: Overwritten header">
  <span slot="header">Correct header</span>
  Lorem ipsum...
</panel>

<br>
