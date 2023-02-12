**Panel with attributes**

<panel header="Correct header">
  Lorem ipsum...
</panel>

<br>

**Panel with slots**

<panel>
  <span slot="header">Correct header</span>
  Lorem ipsum...
</panel>

<br>

**Panel with slots overriding attributes**

<panel header="Should not appear: Overwritten header">
  <span slot="header">Correct header</span>
  Lorem ipsum...
</panel>

<br>
