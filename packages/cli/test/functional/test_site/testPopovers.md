**Popover with attributes**

<popover header="Correct header" content="Correct content">
  Hover popover
</popover>

<br>

<popover header="Correct header" content="Correct content" trigger="click">
  Click popover
</popover>

<br>

**Popover with slots**

<popover>
  <span slot="content">Correct content</span>
  Hover popover
</popover>

<br>

<popover trigger="click">
  <span slot="header">Correct header</span>
  <span slot="content">Correct content</span>
  Click popover
</popover>

<br>

**Popover with slots overriding attributes**

<popover header="Correct header" content="Should not appear: Overwritten content">
  <span slot="content">Correct content</span>
  Hover popover
</popover>

<br>

<popover header="Should not appear: Overwritten header" content="Should not appear: Overwritten content" trigger="click">
  <span slot="header">Correct header</span>
  <span slot="content">Correct content</span>
  Click popover
</popover>

<br>

**Popover with src attribute**

<popover header="Correct header" src="{{ baseUrl }}/test_md_fragment.md">
  src from a .md file
</popover>

<br>

<popover src="{{ baseUrl }}/contentFragmentToInclude.md#fragment">
  src with a fragment
</popover>

<br>

<popover src="{{ baseUrl }}/testPanels/NestedPanel.md">
  <span slot="header">Reactive content</span>
  src containing reactive content
</popover>

