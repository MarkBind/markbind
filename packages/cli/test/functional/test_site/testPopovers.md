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
  src from a .md file with absolute links
</popover>

<br>

<popover header="Correct header" src="./test_md_fragment.md">
  src from a .md file with relative links
</popover>

<br>

<popover header="Correct header" src="{{ baseUrl }}/testInclude.html">
  src from a .html file with absolute links
</popover>

<br>

<popover header="Correct header" src="./testInclude.html">
  src from a .html file with relative links
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

<br>

**Popover contents should use the priority of content slot > content attribute > src attribute**

<popover header="Content slot > content attrib > src attrib" src="{{ baseUrl }}/test_md_fragment.md" content="Correct content">
  Content attribute overrides src attribute
</popover>

<br>

<popover header="Content slot > content attrib > src attrib" src="{{ baseUrl }}/test_md_fragment.md" content="This should be overwritten by slot">
  <span slot="content">Correct content</span>
  Content slot overrides content attribute overrides src attribute
</popover>

<br>

<popover header="Content slot > content attrib > src attrib" src="{{ baseUrl }}/test_md_fragment.md">
  <span slot="content">Correct content</span>
  Content slot overrides content attribute overrides src attribute
</popover>

<br>

**URLs are not valid src**

<popover header="URLs are not valid" src="http://www.shouldnotwork.com">
  URLs should not be valid
</popover>

