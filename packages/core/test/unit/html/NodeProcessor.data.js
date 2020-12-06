/* eslint-disable max-len */

/*
 * Panel
 */

module.exports.PROCESS_PANEL_ATTRIBUTES = `
<panel header="# Lorem ipsum" alt="_emphasized alt_">
  Header and alt attributes should be processed and inserted under panel as internal slots and deleted.
</panel>
`;

module.exports.PROCESS_PANEL_ATTRIBUTES_EXPECTED = `
<panel><template slot="header"><h1>Lorem ipsum</h1>
</template><template slot="_alt"><p><em>emphasized alt</em></p>
</template>
  Header and alt attributes should be processed and inserted under panel as internal slots and deleted.
</panel>
`;

module.exports.PROCESS_PANEL_HEADER_NO_OVERRIDE = `
<panel header="# Lorem ipsum" alt="**strong alt**">
  <div slot="header">
    This existing header slot should be preserved in favour over header attribute.
  </div>
  Header attribute should not be inserted under panel since there is both an alt attribute and header slot,
  but should be deleted.
  Alt attribute should be inserted under panel as slot.
</panel>
`;

module.exports.PROCESS_PANEL_HEADER_NO_OVERRIDE_EXPECTED = `
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

// Post Process

module.exports.POST_PROCESS_PANEL_ID_ASSIGNED_USING_HEADER_SLOT = `
<panel><template slot="header"><h1 id="slot-header">Slot Header</h1></template>
  Header and alt attributes should be processed and inserted under panel as internal slots and deleted.
</panel>
`;

module.exports.POST_PROCESS_PANEL_ID_ASSIGNED_USING_HEADER_SLOT_EXPECTED = `
<panel id="slot-header"><template slot="header"><h1 id="slot-header">Slot Header</h1></template>
  Header and alt attributes should be processed and inserted under panel as internal slots and deleted.
</panel>
`;

/*
 * Questions, QOption and Quizzes
 */

module.exports.PROCESS_QUESTION_ATTRIBUTES = `
<question header="**header**" hint="**hint**" answer="**answer**">
</question>
`;

module.exports.PROCESS_QUESTION_ATTRIBUTES_EXPECTED = `
<question><template slot="answer"><p><strong>answer</strong></p>
</template><template slot="hint"><p><strong>hint</strong></p>
</template><template slot="header"><p><strong>header</strong></p>
</template>
</question>
`;

module.exports.PROCESS_QUESTION_ATTRIBUTES_NO_OVERRIDE = `
<question header="**header**" hint="**hint**" answer="**answer**">
<template slot="header"></template>
<template slot="hint"></template>
<template slot="answer"></template>
</question>
`;

module.exports.PROCESS_QUESTION_ATTRIBUTES_NO_OVERRIDE_EXPECTED = `
<question>
<template slot="header"></template>
<template slot="hint"></template>
<template slot="answer"></template>
</question>
`;

module.exports.PROCESS_QOPTION_ATTRIBUTES = `
<q-option reason="**lorem ipsum**">
</q-option>
`;

module.exports.PROCESS_QOPTION_ATTRIBUTES_EXPECTED = `
<q-option><template slot="reason"><p><strong>lorem ipsum</strong></p>
</template>
</q-option>
`;

module.exports.PROCESS_QOPTION_ATTRIBUTES_NO_OVERRIDE = `
<q-option reason="**lorem ipsum**">
<template slot="reason"></template>
</q-option>
`;

module.exports.PROCESS_QOPTION_ATTRIBUTES_NO_OVERRIDE_EXPECTED = `
<q-option>
<template slot="reason"></template>
</q-option>
`;

module.exports.PROCESS_QUIZ_ATTRIBUTES = `
<quiz intro="**lorem ipsum**">
</quiz>
`;

module.exports.PROCESS_QUIZ_ATTRIBUTES_EXPECTED = `
<quiz><template slot="intro"><p><strong>lorem ipsum</strong></p>
</template>
</quiz>
`;

module.exports.PROCESS_QUIZ_ATTRIBUTES_NO_OVERRIDE = `
<quiz intro="**lorem ipsum**">
<template slot="intro"></template>
</quiz>
`;

module.exports.PROCESS_QUIZ_ATTRIBUTES_NO_OVERRIDE_EXPECTED = `
<quiz>
<template slot="intro"></template>
</quiz>
`;

/*
 * Popovers
 */

module.exports.PROCESS_POPOVER_ATTRIBUTES = `
<popover content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel tellus elit." 
         header="**Lorem ipsum**">
  Content and header attributes should be processed and inserted under panel as slots and deleted.
</popover>
`;

module.exports.PROCESS_POPOVER_ATTRIBUTES_EXPECTED = `
<span data-mb-component-type="popover" v-b-popover.hover.top.html="popoverInnerGetters" class="trigger"><span data-mb-slot-name="header"><strong>Lorem ipsum</strong></span><span data-mb-slot-name="content">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel tellus elit.</span>
  Content and header attributes should be processed and inserted under panel as slots and deleted.
</span>
`;

module.exports.PROCESS_POPOVER_ATTRIBUTES_NO_OVERRIDE = `
<popover content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel tellus elit." 
         header="_Lorem ipsum_">
  <div slot="header">Some header slot content that should not be overwritten</div>
  <div slot="content">Some content slot that should not be overwritten</div>
  Content and header attributes should not be inserted under panel as slots, but should be deleted.
</popover>
`;

module.exports.PROCESS_POPOVER_ATTRIBUTES_NO_OVERRIDE_EXPECTED = `
<span data-mb-component-type="popover" v-b-popover.hover.top.html="popoverInnerGetters" class="trigger">
  <div data-mb-slot-name="header">Some header slot content that should not be overwritten</div>
  <div data-mb-slot-name="content">Some content slot that should not be overwritten</div>
  Content and header attributes should not be inserted under panel as slots, but should be deleted.
</span>
`;

// todo remove tests for these once 'title' attribute is fully deprecated for popovers

module.exports.PROCESS_POPOVER_TITLE = `
<popover title="**Lorem ipsum**">
  Title attribute should be processed and inserted under popover as header slot and deleted.
</popover>
`;

module.exports.PROCESS_POPOVER_TITLE_EXPECTED = `
<span data-mb-component-type="popover" v-b-popover.hover.top.html="popoverInnerGetters" class="trigger"><span data-mb-slot-name="header"><strong>Lorem ipsum</strong></span>
  Title attribute should be processed and inserted under popover as header slot and deleted.
</span>
`;

module.exports.PROCESS_POPOVER_TITLE_NO_OVERRIDE = `
<popover title="**Title header**" header="**Header header**">
  Title attribute should not be inserted as slot as header attribute is present, and should be deleted.
</popover>
`;

module.exports.PROCESS_POPOVER_TITLE_NO_OVERRIDE_EXPECTED = `
<span data-mb-component-type="popover" v-b-popover.hover.top.html="popoverInnerGetters" class="trigger"><span data-mb-slot-name="header"><strong>Header header</strong></span>
  Title attribute should not be inserted as slot as header attribute is present, and should be deleted.
</span>
`;

/*
 * Tooltips
 */

module.exports.PROCESS_TOOLTIP_CONTENT = `
<tooltip content="Lorem ipsum dolor sit amet">
  <button>Content attribute should be inserted as _content internal slot</button>
</tooltip>
`;

module.exports.PROCESS_TOOLTIP_CONTENT_EXPECTED = `
<span data-mb-component-type="tooltip" v-b-tooltip.hover.top.html="tooltipInnerContentGetter" class="trigger"><span data-mb-slot-name="_content">Lorem ipsum dolor sit amet</span>
  <button>Content attribute should be inserted as _content internal slot</button>
</span>
`;

/*
 * Modals
 */

module.exports.PROCESS_MODAL_HEADER = `
<modal header="_Lorem ipsum dolor sit amet_">
  Header attribute should be inserted as bootstrap-vue modal-title slot.
</modal>
`;

module.exports.PROCESS_MODAL_HEADER_EXPECTED = `
<b-modal hide-footer size modal-class="mb-zoom"><template slot="modal-title"><em>Lorem ipsum dolor sit amet</em></template>
  Header attribute should be inserted as bootstrap-vue modal-title slot.
</b-modal>
`;

// todo remove tests for these once 'title' attribute is fully deprecated for modals

module.exports.PROCESS_MODAL_TITLE = `
<modal title="**Lorem ipsum dolor sit amet**">
  Title attribute should be inserted as internal _header slot.
</modal>
`;

module.exports.PROCESS_MODAL_TITLE_EXPECTED = `
<b-modal hide-footer size modal-class="mb-zoom"><template slot="modal-title"><strong>Lorem ipsum dolor sit amet</strong></template>
  Title attribute should be inserted as internal _header slot.
</b-modal>
`;

module.exports.PROCESS_MODAL_TITLE_NO_OVERRIDE = `
<modal title="**Title header**" header="**Header header**">
  Title attribute should not have priority over newer header attribute, and should be deleted.
</modal>
`;

module.exports.PROCESS_MODAL_TITLE_NO_OVERRIDE_EXPECTED = `
<b-modal hide-footer size modal-class="mb-zoom"><template slot="modal-title"><strong>Header header</strong></template>
  Title attribute should not have priority over newer header attribute, and should be deleted.
</b-modal>
`;

module.exports.PROCESS_MODAL_OK_TEXT = `
<modal ok-text="Custom OK" title="**Title header**" header="**Header header**">
  ok-only attr should be set, hide-footer should not be set.
</modal>
`;

module.exports.PROCESS_MODAL_OK_TEXT_EXPECTED = `
<b-modal ok-title="Custom OK" ok-only size modal-class="mb-zoom"><template slot="modal-title"><strong>Header header</strong></template>
  ok-only attr should be set, hide-footer should not be set.
</b-modal>
`;

// todo remove these once modal-header modal-footer slot names are deprecated fully.

module.exports.PROCESS_MODAL_SLOTS_RENAMING = `
<modal>
  <div slot="modal-header">Should be renamed to header</div>
  <div slot="modal-footer">Should be renamed to footer</div>
</modal>
`;

module.exports.PROCESS_MODAL_SLOTS_RENAMING_EXPECTED = `
<b-modal size modal-class="mb-zoom">
  <div slot="modal-header">Should be renamed to header</div>
  <div slot="modal-footer">Should be renamed to footer</div>
</b-modal>
`;

/*
 * Tab, tab-group
 */

module.exports.PROCESS_TAB_HEADER = `
<tab header="**Lorem ipsum dolor sit amet**">
  Header attribute should be inserted as internal _header slot and deleted.
</tab>
`;

module.exports.PROCESS_TAB_HEADER_EXPECTED = `
<tab><template slot="_header"><strong>Lorem ipsum dolor sit amet</strong></template>
  Header attribute should be inserted as internal _header slot and deleted.
</tab>
`;

module.exports.PROCESS_TAB_GROUP_HEADER = `
<tab-group header="**Lorem ipsum dolor sit amet**">
  Header attribute should be inserted as internal _header slot and deleted.
</tab-group>
`;

module.exports.PROCESS_TAB_GROUP_HEADER_EXPECTED = `
<tab-group><template slot="_header"><strong>Lorem ipsum dolor sit amet</strong></template>
  Header attribute should be inserted as internal _header slot and deleted.
</tab-group>
`;

/*
 * Boxes
 */

module.exports.PROCESS_BOX_ICON = `
<box icon=":rocket:">
  Icon attribute should be inserted as internal icon slot and deleted.
</box>
`;

module.exports.PROCESS_BOX_ICON_EXPECTED = `
<box><template slot="icon">🚀</template>
  Icon attribute should be inserted as internal icon slot and deleted.
</box>
`;

module.exports.PROCESS_BOX_HEADER = `
<box header="#### Lorem ipsum dolor sit amet :rocket:">
  Header attribute should be inserted as internal _header slot and deleted.
</box>
`;

module.exports.PROCESS_BOX_HEADER_EXPECTED = `
<box><template slot="_header"><h4>Lorem ipsum dolor sit amet 🚀</h4>
</template>
  Header attribute should be inserted as internal _header slot and deleted.
</box>
`;

// todo remove this test once 'heading' attribute is fully deprecated for boxes

module.exports.PROCESS_BOX_HEADING = `
<box heading="#### Lorem ipsum dolor sit amet :rocket:">
  Heading attribute should be inserted as internal _header slot and deleted.
</box>
`;

module.exports.PROCESS_BOX_HEADING_EXPECTED = `
<box><template slot="_header"><h4>Lorem ipsum dolor sit amet 🚀</h4>
</template>
  Heading attribute should be inserted as internal _header slot and deleted.
</box>
`;

/**
 * Dropdowns
 */

module.exports.PROCESS_DROPDOWN_HEADER = `
<dropdown header="**Lorem ipsum dolor sit amet**">
  Header attribute should be inserted as internal _header slot and deleted.
</dropdown>
`;

module.exports.PROCESS_DROPDOWN_HEADER_EXPECTED = `
<dropdown><template slot="_header"><strong>Lorem ipsum dolor sit amet</strong></template>
  Header attribute should be inserted as internal _header slot and deleted.
</dropdown>
`;

// TODO deprecate text attribute of dropdown
module.exports.PROCESS_DROPDOWN_TEXT_ATTR = `
<dropdown text="**Lorem ipsum dolor sit amet**">
  Text attribute should be inserted as internal _header slot and deleted.
</dropdown>
`;

// TODO deprecate text attribute of dropdown
module.exports.PROCESS_DROPDOWN_TEXT_ATTR_EXPECTED = `
<dropdown><template slot="_header"><strong>Lorem ipsum dolor sit amet</strong></template>
  Text attribute should be inserted as internal _header slot and deleted.
</dropdown>
`;

// TODO deprecate text attribute of dropdown
module.exports.PROCESS_DROPDOWN_HEADER_SHADOWS_TEXT = `
<dropdown text="Not expected text" header="**Lorem ipsum dolor sit amet**">
  Header attribute should be inserted as internal _header slot and deleted. Text attribute should be ignored.
</dropdown>
`;

// TODO deprecate text attribute of dropdown
module.exports.PROCESS_DROPDOWN_HEADER_SHADOWS_TEXT_EXPECTED = `
<dropdown><template slot="_header"><strong>Lorem ipsum dolor sit amet</strong></template>
  Header attribute should be inserted as internal _header slot and deleted. Text attribute should be ignored.
</dropdown>
`;

module.exports.PROCESS_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY = `
<dropdown header="**Lorem ipsum dolor sit amet**" text="shouldn't appear in result">
  <strong slot="header">slot text</strong>
  Header attribute should be ignored and deleted while header slot is reserved.
</dropdown>
`;

module.exports.PROCESS_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY_EXPECTED = `
<dropdown>
  <strong slot="header">slot text</strong>
  Header attribute should be ignored and deleted while header slot is reserved.
</dropdown>
`;

/* eslint-enable max-len */
