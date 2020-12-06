<frontmatter>
  title: "Hello World"
</frontmatter>

**Test Algolia plugin adds algolia-no-index classes**

**Dropdowns should have algolia-no-index class**

<dropdown header="Dropdown">
  <li><a class="dropdown-item" href="/">One</a></li>
  <li><a class="dropdown-item" href="/">Two</a></li>
</dropdown>

**Modal content should have algolia-no-index class**

<modal header="Modal" id="modal:trigger_id">
  Content should have `algolia-no-index` class
</modal>
<trigger for="modal:trigger_id">Trigger should not have `algolia-no-index` class</trigger>

**Panels that are not expanded should have algolia-no-index class**

<panel header="Panel">
  Content
</panel>

<panel header="Panel" expanded>
  Content
</panel>

**Popover content should have algolia-no-index class**

<popover effect="fade" header="Title" placement="top">
  <div slot="content">Content should have `algolia-no-index` class</div>
  <button class="btn btn-secondary">Trigger should not have `algolia-no-index` class</button>
</popover>

<popover effect="fade" header="Title" content="Content as attribute does not require `algolia-no-index` class" placement="top">
  <button class="btn btn-secondary">Trigger should not have `algolia-no-index` class</button>
</popover>

**Question hint and answer should have algolia-no-index class**

<question>
  Question should not have `algolia-no-index` class
  <div slot="hint">Hint should have `algolia-no-index` class</div>
  <div slot="answer">Answer should have `algolia-no-index` class</div>
</question>

**Tabs except first tab should have algolia-no-index class**

<tabs>
  <tab header="First Tab">
    Content<br />Content<br />Content<br />Content
  </tab>
  <tab header="Second Tab">
    Content<br />Content<br />Content<br />Content
  </tab>
</tabs>

<tabs>
  <tab-group header="First Group">
    <tab header="First Tab">
      Content<br />Content<br />Content<br />Content
    </tab>
    <tab header="Second Tab">
      Content<br />Content<br />Content<br />Content
    </tab>
  </tab-group>
  <tab-group header="Second Group">
    <tab header="First Tab">
      Content<br />Content<br />Content<br />Content
    </tab>
    <tab header="Second Tab">
      Content<br />Content<br />Content<br />Content
    </tab>
  </tab-group>
</tabs>

<tabs>
  <tab-group header="Outer One">
    <tab header="First Tab">
      Content<br />Content<br />Content<br />Content
    </tab>
    <tab header="Second Tab">
      Content<br />Content<br />Content<br />Content
    </tab>
  </tab-group>
  <tab header="Outer Two">
    Content<br />Content<br />Content<br />Content
  </tab>
</tabs>
