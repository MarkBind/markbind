## Dropdowns should have algolia-no-index class

<dropdown text="Dropdown">
  <li><a class="dropdown-item" href="/">One</a></li>
  <li><a class="dropdown-item" href="/">Two</a></li>
</dropdown>

## Modals should have algolia-no-index class

<modal title="Modal" id="modal:trigger_id">
  Content
</modal>
<trigger for="modal:trigger_id">Trigger</trigger>

## Panels that are not expanded should have algolia-no-index class

<panel header="Panel">
  Content
</panel>

<panel header="Panel" expanded>
  Content
</panel>

## Popover should have algolia-no-index class

<popover effect="fade" content="Content" placement="top">
  <button class="btn btn-secondary">Popover</button>
</popover>

## Tabs except first tab should have algolia-no-index class

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

## Tooltip should have algolia-no-index class

<tooltip header content="Content" placement="top">
  <button class="btn btn-secondary">Tooltip</button>
</tooltip>
