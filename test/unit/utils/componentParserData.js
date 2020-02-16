/* eslint-disable max-len */

/*
 * Panel
 */

module.exports.PARSE_PANEL_ATTRIBUTES = `
<panel header="# Lorem ipsum" alt="_emphasized alt_">
  Header and alt attributes should be parsed and inserted under panel as internal slots and deleted.
</panel>
`;

module.exports.PARSE_PANEL_ATTRIBUTES_EXPECTED = `
<panel><template slot="_header"><h1>Lorem ipsum</h1>
</template><template slot="_alt"><p><em>emphasized alt</em></p>
</template>
  Header and alt attributes should be parsed and inserted under panel as internal slots and deleted.
</panel>
`;

module.exports.PARSE_PANEL_HEADER_NO_OVERRIDE = `
<panel header="# Lorem ipsum" alt="**strong alt**">
  <div slot="header">
    This existing header slot should be preserved in favour over header attribute.
  </div>
  Header attribute should not be inserted under panel since there is both an alt attribute and header slot,
  but should be deleted.
  Alt attribute should be inserted under panel as slot.
</panel>
`;

module.exports.PARSE_PANEL_HEADER_NO_OVERRIDE_EXPECTED = `
<panel><template slot="_alt"><p><strong>strong alt</strong></p>
</template>
  <div slot="header">
    This existing header slot should be preserved in favour over header attribute.
  </div>
  Header attribute should not be inserted under panel since there is both an alt attribute and header slot,
  but should be deleted.
  Alt attribute should be inserted under panel as slot.
</panel>
`;

// Post Parse
module.exports.POST_PARSE_PANEL_ID_ASSIGNED_USING_HEADER_ATTRIBUTE = `
<panel><template slot="_header"><h1 id="lorem-ipsum">Lorem ipsum</h1>
</template>
  Header and alt attributes should be parsed and inserted under panel as internal slots and deleted.
</panel>
`;

module.exports.POST_PARSE_PANEL_ID_ASSIGNED_USING_HEADER_ATTRIBUTE_EXPECTED = `
<panel id="lorem-ipsum"><template slot="_header"><h1 id="lorem-ipsum">Lorem ipsum</h1>
</template>
  Header and alt attributes should be parsed and inserted under panel as internal slots and deleted.
</panel>
`;

module.exports.POST_PARSE_PANEL_ID_ASSIGNED_USING_HEADER_SLOT = `
<panel><template slot="_header"><h1 id="attribute-header">Attribute Header</h1>
</template>
<template slot="header"><h1 id="slot-header">Slot Header</h1></template>
  Header and alt attributes should be parsed and inserted under panel as internal slots and deleted.
</panel>
`;

module.exports.POST_PARSE_PANEL_ID_ASSIGNED_USING_HEADER_SLOT_EXPECTED = `
<panel id="slot-header"><template slot="_header"><h1 id="attribute-header">Attribute Header</h1>
</template>
<template slot="header"><h1 id="slot-header">Slot Header</h1></template>
  Header and alt attributes should be parsed and inserted under panel as internal slots and deleted.
</panel>
`;

/*
 * Popovers
 */

module.exports.PARSE_POPOVER_ATTRIBUTES = `
<popover content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel tellus elit." 
         header="**Lorem ipsum**">
  Content and header attributes should be parsed and inserted under panel as slots and deleted.
</popover>
`;

module.exports.PARSE_POPOVER_ATTRIBUTES_EXPECTED = `
<popover><template slot="header"><strong>Lorem ipsum</strong></template><template slot="content">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel tellus elit.</template>
  Content and header attributes should be parsed and inserted under panel as slots and deleted.
</popover>
`;

module.exports.PARSE_POPOVER_ATTRIBUTES_NO_OVERRIDE = `
<popover content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel tellus elit." 
         header="_Lorem ipsum_">
  <div slot="header">Some header slot content that should not be overwritten</div>
  <div slot="content">Some content slot that should not be overwritten</div>
  Content and header attributes should not be inserted under panel as slots, but should be deleted.
</popover>
`;

module.exports.PARSE_POPOVER_ATTRIBUTES_NO_OVERRIDE_EXPECTED = `
<popover>
  <div slot="header">Some header slot content that should not be overwritten</div>
  <div slot="content">Some content slot that should not be overwritten</div>
  Content and header attributes should not be inserted under panel as slots, but should be deleted.
</popover>
`;

// todo remove tests for these once 'title' attribute is fully deprecated for popovers

module.exports.PARSE_POPOVER_TITLE = `
<popover title="**Lorem ipsum**">
  Title attribute should be parsed and inserted under panel as header slot and deleted.
</popover>
`;

module.exports.PARSE_POPOVER_TITLE_EXPECTED = `
<popover><template slot="header"><strong>Lorem ipsum</strong></template>
  Title attribute should be parsed and inserted under panel as header slot and deleted.
</popover>
`;

module.exports.PARSE_POPOVER_TITLE_NO_OVERRIDE = `
<popover title="**Title header**" header="**Header header**">
  Title attribute should not be inserted as slot as header attribute is present, and should be deleted.
</popover>
`;

module.exports.PARSE_POPOVER_TITLE_NO_OVERRIDE_EXPECTED = `
<popover><template slot="header"><strong>Header header</strong></template>
  Title attribute should not be inserted as slot as header attribute is present, and should be deleted.
</popover>
`;

/*
 * Tooltips
 */

module.exports.PARSE_TOOLTIP_CONTENT = `
<tooltip content="Lorem ipsum dolor sit amet">
  <button>Content attribute should be inserted as _content internal slot</button>
</tooltip>
`;

module.exports.PARSE_TOOLTIP_CONTENT_EXPECTED = `
<tooltip><template slot="_content">Lorem ipsum dolor sit amet</template>
  <button>Content attribute should be inserted as _content internal slot</button>
</tooltip>
`;

/*
 * Modals
 */

module.exports.PARSE_MODAL_HEADER = `
<modal header="_Lorem ipsum dolor sit amet_">
  Header attribute should be inserted as internal _header slot.
</modal>
`;

module.exports.PARSE_MODAL_HEADER_EXPECTED = `
<modal><template slot="_header"><em>Lorem ipsum dolor sit amet</em></template>
  Header attribute should be inserted as internal _header slot.
</modal>
`;

// todo remove tests for these once 'title' attribute is fully deprecated for modals

module.exports.PARSE_MODAL_TITLE = `
<modal title="**Lorem ipsum dolor sit amet**">
  Title attribute should be inserted as internal _header slot.
</modal>
`;

module.exports.PARSE_MODAL_TITLE_EXPECTED = `
<modal><template slot="_header"><strong>Lorem ipsum dolor sit amet</strong></template>
  Title attribute should be inserted as internal _header slot.
</modal>
`;

module.exports.PARSE_MODAL_TITLE_NO_OVERRIDE = `
<modal title="**Title header**" header="**Header header**">
  Title attribute should not have priority over newer header attribute, and should be deleted.
</modal>
`;

module.exports.PARSE_MODAL_TITLE_NO_OVERRIDE_EXPECTED = `
<modal><template slot="_header"><strong>Header header</strong></template>
  Title attribute should not have priority over newer header attribute, and should be deleted.
</modal>
`;

// todo remove these once modal-header modal-footer slot names are deprecated fully.

module.exports.PARSE_MODAL_SLOTS_RENAMING = `
<modal>
  <div slot="modal-header">Should be renamed to header</div>
  <div slot="modal-footer">Should be renamed to footer</div>
</modal>
`;

module.exports.PARSE_MODAL_SLOTS_RENAMING_EXPECTED = `
<modal>
  <div slot="header">Should be renamed to header</div>
  <div slot="footer">Should be renamed to footer</div>
</modal>
`;


/*
 * Tab, tab-group
 */

module.exports.PARSE_TAB_HEADER = `
<tab header="**Lorem ipsum dolor sit amet**">
  Header attribute should be inserted as internal _header slot and deleted.
</tab>
`;

module.exports.PARSE_TAB_HEADER_EXPECTED = `
<tab><template slot="_header"><strong>Lorem ipsum dolor sit amet</strong></template>
  Header attribute should be inserted as internal _header slot and deleted.
</tab>
`;

module.exports.PARSE_TAB_GROUP_HEADER = `
<tab-group header="**Lorem ipsum dolor sit amet**">
  Header attribute should be inserted as internal _header slot and deleted.
</tab-group>
`;

module.exports.PARSE_TAB_GROUP_HEADER_EXPECTED = `
<tab-group><template slot="_header"><strong>Lorem ipsum dolor sit amet</strong></template>
  Header attribute should be inserted as internal _header slot and deleted.
</tab-group>
`;

/*
 * Boxes
 */

module.exports.PARSE_BOX_ICON = `
<box icon=":rocket:">
  Icon attribute should be inserted as internal _icon slot and deleted.
</box>
`;

module.exports.PARSE_BOX_ICON_EXPECTED = `
<box><template slot="_icon">🚀</template>
  Icon attribute should be inserted as internal _icon slot and deleted.
</box>
`;

/**
 * Dropdowns
 */

module.exports.PARSE_DROPDOWN_HEADER_EXPECTED = `
<dropdown><template slot="_header"><strong>Lorem ipsum dolor sit amet</strong></template>
  Header attribute should be inserted as internal _header slot and deleted.
</dropdown>
`;

module.exports.PARSE_DROPDOWN_HEADER = `
<dropdown header="**Lorem ipsum dolor sit amet**">
  Header attribute should be inserted as internal _header slot and deleted.
</dropdown>
`;

module.exports.PARSE_DROPDOWN_TEXT_ATTR_EXPECTED = `
<dropdown><template slot="_header"><strong>Lorem ipsum dolor sit amet</strong></template>
  Text attribute should be inserted as internal _header slot and deleted.
</dropdown>
`;

module.exports.PARSE_DROPDOWN_TEXT_ATTR = `
<dropdown text="**Lorem ipsum dolor sit amet**">
  Text attribute should be inserted as internal _header slot and deleted.
</dropdown>
`;

module.exports.PARSE_DROPDOWN_HEADER_SHADOWS_TEXT_EXPECTED = `
<dropdown text="Not expected text"><template slot="_header"><strong>Lorem ipsum dolor sit amet</strong></template>
  Header attribute should be inserted as internal _header slot and deleted. Text attribute should be ignored.
</dropdown>
`;

module.exports.PARSE_DROPDOWN_HEADER_SHADOWS_TEXT = `
<dropdown text="Not expected text" header="**Lorem ipsum dolor sit amet**">
  Header attribute should be inserted as internal _header slot and deleted. Text attribute should be ignored.
</dropdown>
`;

module.exports.PARSE_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY_EXPECTED = `
<dropdown>
  <strong slot="header">slot text</strong>
  Header attribute should be ignored and deleted while header slot is reserved.
</dropdown>
`;

module.exports.PARSE_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY = `
<dropdown header="**Lorem ipsum dolor sit amet**">
  <strong slot="header">slot text</strong>
  Header attribute should be ignored and deleted while header slot is reserved.
</dropdown>
`;

/* eslint-enable max-len */
