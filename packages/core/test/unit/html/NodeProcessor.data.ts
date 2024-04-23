/* eslint-disable max-len */

/*
 * Panel
 */

export const PROCESS_PANEL_ATTRIBUTES = `
<panel header="# Lorem ipsum" alt="_emphasized alt_">
  Header and alt attributes should be processed and inserted under panel as slots and internal slots respectively and deleted.
</panel>
`;

export const PROCESS_PANEL_ATTRIBUTES_EXPECTED = `
<panel><template #header><h1>Lorem ipsum</h1>
</template><template #_alt><p><em>emphasized alt</em></p>
</template>
  Header and alt attributes should be processed and inserted under panel as slots and internal slots respectively and deleted.
</panel>
`;

export const PROCESS_PANEL_HEADER_SLOT_TAKES_PRIORITY = `
<panel header="# Lorem ipsum" alt="**strong alt**">
  <div slot="header">
    This existing header slot should be preserved in favour over header attribute.
  </div>
  Header attribute should not be inserted under panel since there is both an alt attribute and header slot,
  but should be deleted.
  Alt attribute should be inserted under panel as slot.
</panel>
`;

export const PROCESS_PANEL_HEADER_SLOT_TAKES_PRIORITY_EXPECTED = `
<panel><template #_alt><p><strong>strong alt</strong></p>
</template>
  <template #header><div>
    This existing header slot should be preserved in favour over header attribute.
  </div></template>
  Header attribute should not be inserted under panel since there is both an alt attribute and header slot,
  but should be deleted.
  Alt attribute should be inserted under panel as slot.
</panel>
`;

export const PROCESS_PANEL_HEADER_SLOT_TAKES_PRIORITY_WARN_MSG = "panel has a header slot, 'header' attribute has no effect.";

export const PROCESS_PANEL_ALT_SLOT_TAKES_PRIORITY = `
<panel alt="lorem ipsum">
  <div slot="_alt">
    Alt slot text
  </div>
  Alt attribute should be ignored and deleted while alt slot is reserved.
</panel>
`;

export const PROCESS_PANEL_ALT_SLOT_TAKES_PRIORITY_EXPECTED = `
<panel>
  <template #_alt><div>
    Alt slot text
  </div></template>
  Alt attribute should be ignored and deleted while alt slot is reserved.
</panel>
`;

export const PROCESS_PANEL_ALT_SLOT_TAKES_PRIORITY_WARN_MSG = "panel has a _alt slot, 'alt' attribute has no effect.";

// Post Process

export const POST_PROCESS_PANEL_ID_ASSIGNED_USING_HEADER_SLOT = `
<panel><template slot="header"><h1 id="slot-header">Slot Header</h1></template>
  Header and alt attributes should be processed and inserted under panel as slots and internal slots respectively and deleted.
</panel>
`;

export const POST_PROCESS_PANEL_ID_ASSIGNED_USING_HEADER_SLOT_EXPECTED = `
<panel panelId="slot-header"><template #header><h1 id="slot-header">Slot Header</h1></template>
  Header and alt attributes should be processed and inserted under panel as slots and internal slots respectively and deleted.
</panel>
`;

/*
 * Questions, QOption and Quizzes
 */

export const PROCESS_QUESTION_ATTRIBUTES = `
<question header="**header**" hint="**hint**" answer="**answer**">
</question>
`;

export const PROCESS_QUESTION_ATTRIBUTES_EXPECTED = `
<question><template #answer><p><strong>answer</strong></p>
</template><template #hint><p><strong>hint</strong></p>
</template><template #header><p><strong>header</strong></p>
</template>
</question>
`;

export const PROCESS_QUESTION_HEADER_SLOT_TAKES_PRIORITY = `
<question header="**lorem ipsum**">
<template slot="header"></template>
</question>
`;

export const PROCESS_QUESTION_HEADER_SLOT_TAKES_PRIORITY_EXPECTED = `
<question>
<template #header></template>
</question>
`;

export const PROCESS_QUESTION_HEADER_SLOT_TAKES_PRIORITY_WARN_MSG = "question has a header slot, 'header' attribute has no effect.";

export const PROCESS_QUESTION_HINT_SLOT_TAKES_PRIORITY = `
<question hint="**lorem ipsum**">
<template slot="hint"></template>
</question>
`;

export const PROCESS_QUESTION_HINT_SLOT_TAKES_PRIORITY_EXPECTED = `
<question>
<template #hint></template>
</question>
`;

export const PROCESS_QUESTION_HINT_SLOT_TAKES_PRIORITY_WARN_MSG = "question has a hint slot, 'hint' attribute has no effect.";

export const PROCESS_QUESTION_ANSWER_SLOT_TAKES_PRIORITY = `
<question answer="**lorem ipsum**">
<template slot="answer"></template>
</question>
`;

export const PROCESS_QUESTION_ANSWER_SLOT_TAKES_PRIORITY_EXPECTED = `
<question>
<template #answer></template>
</question>
`;

export const PROCESS_QUESTION_ANSWER_SLOT_TAKES_PRIORITY_WARN_MSG = "question has a answer slot, 'answer' attribute has no effect.";

export const PROCESS_QOPTION_ATTRIBUTES = `
<q-option reason="**lorem ipsum**">
</q-option>
`;

export const PROCESS_QOPTION_ATTRIBUTES_EXPECTED = `
<q-option><template #reason><p><strong>lorem ipsum</strong></p>
</template>
</q-option>
`;

export const PROCESS_QOPTION_REASON_SLOT_TAKES_PRIORITY = `
<q-option reason="**lorem ipsum**">
<template slot="reason"></template>
</q-option>
`;

export const PROCESS_QOPTION_REASON_SLOT_TAKES_PRIORITY_EXPECTED = `
<q-option>
<template #reason></template>
</q-option>
`;

export const PROCESS_QOPTION_REASON_SLOT_TAKES_PRIORITY_WARN_MSG = "q-option has a reason slot, 'reason' attribute has no effect.";

export const PROCESS_QUIZ_ATTRIBUTES = `
<quiz intro="**lorem ipsum**">
</quiz>
`;

export const PROCESS_QUIZ_ATTRIBUTES_EXPECTED = `
<quiz><template #intro><p><strong>lorem ipsum</strong></p>
</template>
</quiz>
`;

export const PROCESS_QUIZ_INTRO_SLOT_TAKES_PRIORITY = `
<quiz intro="**lorem ipsum**">
<template slot="intro"></template>
</quiz>
`;

export const PROCESS_QUIZ_INTRO_SLOT_TAKES_PRIORITY_EXPECTED = `
<quiz>
<template #intro></template>
</quiz>
`;

export const PROCESS_QUIZ_INTRO_SLOT_TAKES_PRIORITY_WARN_MSG = "quiz has a intro slot, 'intro' attribute has no effect.";

/*
 * Popovers
 */

export const PROCESS_POPOVER_ATTRIBUTES = `
<popover content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel tellus elit." 
         header="**Lorem ipsum**">
  Content and header attributes should be processed and inserted under panel as slots and deleted.
</popover>
`;

export const PROCESS_POPOVER_ATTRIBUTES_EXPECTED = `
<popover><template #content>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel tellus elit.</template><template #header><strong>Lorem ipsum</strong></template>
  Content and header attributes should be processed and inserted under panel as slots and deleted.
</popover>
`;

export const PROCESS_POPOVER_HEADER_SLOT_TAKES_PRIORITY = `
<popover header="_Lorem ipsum_">
  <div slot="header">Some header slot content that should not be overwritten</div>
  Header attribute should not be inserted under panel as slot, but should be deleted.
</popover>
`;

export const PROCESS_POPOVER_HEADER_SLOT_TAKES_PRIORITY_EXPECTED = `
<popover>
  <template #header><div>Some header slot content that should not be overwritten</div></template>
  Header attribute should not be inserted under panel as slot, but should be deleted.
</popover>
`;

export const PROCESS_POPOVER_HEADER_SLOT_TAKES_PRIORITY_WARN_MSG = "popover has a header slot, 'header' attribute has no effect.";

export const PROCESS_POPOVER_CONTENT_SLOT_TAKES_PRIORITY = `
<popover content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel tellus elit.">
  <div slot="content">Some content slot that should not be overwritten</div>
  Content attribute should not be inserted under panel as slot, but should be deleted.
</popover>
`;

export const PROCESS_POPOVER_CONTENT_SLOT_TAKES_PRIORITY_EXPECTED = `
<popover>
  <template #content><div>Some content slot that should not be overwritten</div></template>
  Content attribute should not be inserted under panel as slot, but should be deleted.
</popover>
`;
export const PROCESS_POPOVER_CONTENT_SLOT_TAKES_PRIORITY_WARN_MSG = "popover has a content slot, 'content' attribute has no effect.";

export const PROCESS_POPOVER_CONTENT_ATTRIBUTE_TAKES_PRIORITY = `
<popover content="Some content that should not be overriden" src="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel tellus elit.">
  Src attribute should not be inserted under panel as slot, but should be deleted.
</popover>
`;

export const PROCESS_POPOVER_CONTENT_ATTRIBUTE_TAKES_PRIORITY_EXPECTED = `
<popover><template #content>Some content that should not be overriden</template>
  Src attribute should not be inserted under panel as slot, but should be deleted.
</popover>
`;
export const PROCESS_POPOVER_CONTENT_ATTRIBUTE_TAKES_PRIORITY_WARN_MSG = "popover has a 'content' attribute, 'src' attribute has no effect.";

/*
 * Tooltips
 */

export const PROCESS_TOOLTIP_CONTENT = `
<tooltip content="Lorem ipsum dolor sit amet">
  <button>Content attribute should be inserted as _content internal slot</button>
</tooltip>
`;

export const PROCESS_TOOLTIP_CONTENT_EXPECTED = `
<tooltip><template #content>Lorem ipsum dolor sit amet</template>
  <button>Content attribute should be inserted as _content internal slot</button>
</tooltip>
`;

export const PROCESS_TOOLTIP_CONTENT_SLOT_TAKES_PRIORITY = `
<tooltip content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel tellus elit.">
  <div slot="content">Some content slot that should not be overwritten</div>
  Content attribute should not be inserted under tooltip as slot, but should be deleted.
</tooltip>
`;

export const PROCESS_TOOLTIP_CONTENT_SLOT_TAKES_PRIORITY_EXPECTED = `
<tooltip>
  <template #content><div>Some content slot that should not be overwritten</div></template>
  Content attribute should not be inserted under tooltip as slot, but should be deleted.
</tooltip>
`;

export const PROCESS_TOOLTIP_CONTENT_SLOT_TAKES_PRIORITY_WARN_MSG = "tooltip has a content slot, 'content' attribute has no effect.";

/*
 * Modals
 */

export const PROCESS_MODAL_HEADER = `
<modal header="_Lorem ipsum dolor sit amet_">
  Header attribute should be inserted as header slot.
</modal>
`;

export const PROCESS_MODAL_HEADER_EXPECTED = `
<modal><template #header><em>Lorem ipsum dolor sit amet</em></template>
  Header attribute should be inserted as header slot.
</modal>
`;

export const PROCESS_MODAL_OK_TEXT = `
<modal ok-text="Custom OK" header="**Header header**">
  ok-only attr should be set, hide-footer should not be set.
</modal>
`;

export const PROCESS_MODAL_OK_TEXT_EXPECTED = `
<modal ok-text="Custom OK"><template #header><strong>Header header</strong></template>
  ok-only attr should be set, hide-footer should not be set.
</modal>
`;

export const PROCESS_MODAL_HEADER_SLOT_TAKES_PRIORITY = `
<modal header="Lorem ipsum">
  <div slot="header">Some header slot content that should not be overwritten</div>
  Header attribute should not be inserted under modal as slot, but should be deleted.
</modal>
`;

export const PROCESS_MODAL_HEADER_SLOT_TAKES_PRIORITY_EXPECTED = `
<modal>
  <template #header><div>Some header slot content that should not be overwritten</div></template>
  Header attribute should not be inserted under modal as slot, but should be deleted.
</modal>
`;

export const PROCESS_MODAL_HEADER_SLOT_TAKES_PRIORITY_WARN_MSG = "modal has a header slot, 'header' attribute has no effect.";

/*
 * Tab, tab-group
 */

export const PROCESS_TAB_HEADER = `
<tab header="**Lorem ipsum dolor sit amet**">
  Header attribute should be inserted as header slot and deleted.
</tab>
`;

export const PROCESS_TAB_HEADER_EXPECTED = `
<tab><template #header><strong>Lorem ipsum dolor sit amet</strong></template>
  Header attribute should be inserted as header slot and deleted.
</tab>
`;

export const PROCESS_TAB_HEADER_SLOT_TAKES_PRIORITY = `
<tab header="Lorem ipsum">
  <div slot="header">Some header slot content that should not be overwritten</div>
  Header attribute should not be inserted under tab as slot, but should be deleted.
</tab>
`;

export const PROCESS_TAB_HEADER_SLOT_TAKES_PRIORITY_EXPECTED = `
<tab>
  <template #header><div>Some header slot content that should not be overwritten</div></template>
  Header attribute should not be inserted under tab as slot, but should be deleted.
</tab>
`;

export const PROCESS_TAB_HEADER_SLOT_TAKES_PRIORITY_WARN_MSG = "tab has a header slot, 'header' attribute has no effect.";

export const PROCESS_TAB_GROUP_HEADER = `
<tab-group header="**Lorem ipsum dolor sit amet**">
  Header attribute should be inserted as header slot and deleted.
</tab-group>
`;

export const PROCESS_TAB_GROUP_HEADER_EXPECTED = `
<tab-group><template #header><strong>Lorem ipsum dolor sit amet</strong></template>
  Header attribute should be inserted as header slot and deleted.
</tab-group>
`;

export const PROCESS_TAB_GROUP_HEADER_SLOT_TAKES_PRIORITY = `
<tab-group header="Lorem ipsum">
  <div slot="header">Some header slot content that should not be overwritten</div>
  Header attribute should not be inserted under tab-group as slot, but should be deleted.
</tab-group>
`;

export const PROCESS_TAB_GROUP_HEADER_SLOT_TAKES_PRIORITY_EXPECTED = `
<tab-group>
  <template #header><div>Some header slot content that should not be overwritten</div></template>
  Header attribute should not be inserted under tab-group as slot, but should be deleted.
</tab-group>
`;

export const PROCESS_TAB_GROUP_HEADER_SLOT_TAKES_PRIORITY_WARN_MSG = "tab-group has a header slot, 'header' attribute has no effect.";

/*
 * Boxes
 */

export const PROCESS_BOX_ICON = `
<box icon=":rocket:">
  Icon attribute should be inserted as icon slot and deleted.
</box>
`;

export const PROCESS_BOX_ICON_EXPECTED = `
<box><template #icon>🚀</template>
  Icon attribute should be inserted as icon slot and deleted.
</box>
`;

export const PROCESS_BOX_HEADER = `
<box header="#### Lorem ipsum dolor sit amet :rocket:">
  Header attribute should be inserted as header slot and deleted.
</box>
`;

export const PROCESS_BOX_HEADER_EXPECTED = `
<box><template #header><h4>Lorem ipsum dolor sit amet 🚀</h4>
</template>
  Header attribute should be inserted as header slot and deleted.
</box>
`;

export const PROCESS_BOX_ICON_SLOT_TAKES_PRIORITY = `
<box icon=":question:">
  <div slot="icon"><md>:rocket:</md></div>
  Icon attribute should not be inserted under box as slot, but should be deleted.
</box>
`;

export const PROCESS_BOX_ICON_SLOT_TAKES_PRIORITY_EXPECTED = `
<box>
  <template #icon><div><md>:rocket:</md></div></template>
  Icon attribute should not be inserted under box as slot, but should be deleted.
</box>
`;

export const PROCESS_BOX_ICON_SLOT_TAKES_PRIORITY_WARN_MSG = "box has a icon slot, 'icon' attribute has no effect.";

export const PROCESS_BOX_HEADER_SLOT_TAKES_PRIORITY = `
<box header="Lorem ipsum">
  <div slot="header">Some header slot content that should not be overwritten</div>
  Header attribute should not be inserted under box as slot, but should be deleted.
</box>
`;

export const PROCESS_BOX_HEADER_SLOT_TAKES_PRIORITY_EXPECTED = `
<box>
  <template #header><div>Some header slot content that should not be overwritten</div></template>
  Header attribute should not be inserted under box as slot, but should be deleted.
</box>
`;

export const PROCESS_BOX_HEADER_SLOT_TAKES_PRIORITY_WARN_MSG = "box has a header slot, 'header' attribute has no effect.";

/**
 * Dropdowns
 */

export const PROCESS_DROPDOWN_HEADER = `
<dropdown header="**Lorem ipsum dolor sit amet**">
  Header attribute should be inserted as header slot and deleted.
</dropdown>
`;

export const PROCESS_DROPDOWN_HEADER_EXPECTED = `
<dropdown><template #header><strong>Lorem ipsum dolor sit amet</strong></template>
  Header attribute should be inserted as header slot and deleted.
</dropdown>
`;

export const PROCESS_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY = `
<dropdown header="**Lorem ipsum dolor sit amet**">
  <strong slot="header">slot text</strong>
  Header attribute should be ignored and deleted while header slot is reserved.
</dropdown>
`;

export const PROCESS_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY_EXPECTED = `
<dropdown>
  <template #header><strong>slot text</strong></template>
  Header attribute should be ignored and deleted while header slot is reserved.
</dropdown>
`;

export const PROCESS_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY_WARN_MSG = "dropdown has a header slot, 'header' attribute has no effect.";

/**
 * Scroll-to-top button
 */

export const PROCESS_SCROLL_TOP_BUTTON_ICON = `
<scroll-top-button icon=":rocket:">
</scroll-top-button>
`;

export const PROCESS_SCROLL_TOP_BUTTON_ICON_EXPECTED = `
<scroll-top-button><template #icon>🚀</template>
</scroll-top-button>
`;

export const PROCESS_SCROLL_TOP_BUTTON_ICON_SLOT_TAKES_PRIORITY = `
<scroll-top-button icon=":question:">
  <div slot="icon"><md>:rocket:</md></div>
</scroll-top-button>
`;

export const PROCESS_SCROLL_TOP_BUTTON_ICON_SLOT_TAKES_PRIORITY_EXPECTED = `
<scroll-top-button>
  <template #icon><div><md>:rocket:</md></div></template>
</scroll-top-button>
`;

export const PROCESS_SCROLL_TOP_BUTTON_ICON_SLOT_TAKES_PRIORITY_WARN_MSG = "scroll-top-button has a icon slot, 'icon' attribute has no effect.";

/**
 * A-points
 */

export const PROCESS_A_POINT_HEADER = `
<a-point x="25%" y="25%" header="lorem ipsum">
</a-point>
`;

export const PROCESS_A_POINT_HEADER_EXPECTED = `
<a-point x="25%" y="25%"><template #header><p>lorem ipsum</p>
</template>
</a-point>
`;

export const PROCESS_A_POINT_CONTENT = `
<a-point x="25%" y="25%" content="lorem ipsum">
</a-point>
`;

export const PROCESS_A_POINT_CONTENT_EXPECTED = `
<a-point x="25%" y="25%"><template #content><p>lorem ipsum</p>
</template>
</a-point>
`;

export const PROCESS_A_POINT_LABEL = `
<a-point x="25%" y="25%" label="L">
</a-point>
`;

export const PROCESS_A_POINT_LABEL_EXPECTED = `
<a-point x="25%" y="25%"><template #label><p>L</p>
</template>
</a-point>
`;

export const PROCESS_A_POINT_HEADER_SLOT_TAKES_PRIORITY = `
<a-point x="25%" y="25%" header="lorem ipsum">
  <div slot="header">Some header slot content that should not be overwritten</div>
</a-point>
`;

export const PROCESS_A_POINT_HEADER_SLOT_TAKES_PRIORITY_EXPECTED = `
<a-point x="25%" y="25%">
  <template #header><div>Some header slot content that should not be overwritten</div></template>
</a-point>
`;

export const PROCESS_A_POINT_HEADER_SLOT_TAKES_PRIORITY_WARN_MSG = "a-point has a header slot, 'header' attribute has no effect.";

export const PROCESS_A_POINT_CONTENT_SLOT_TAKES_PRIORITY = `
<a-point x="25%" y="25%" content="lorem ipsum">
  <div slot="content">Some content slot content that should not be overwritten</div>
</a-point>
`;

export const PROCESS_A_POINT_CONTENT_SLOT_TAKES_PRIORITY_EXPECTED = `
<a-point x="25%" y="25%">
  <template #content><div>Some content slot content that should not be overwritten</div></template>
</a-point>
`;

export const PROCESS_A_POINT_CONTENT_SLOT_TAKES_PRIORITY_WARN_MSG = "a-point has a content slot, 'content' attribute has no effect.";

export const PROCESS_A_POINT_LABEL_SLOT_TAKES_PRIORITY = `
<a-point x="25%" y="25%" label="L">
  <div slot="label">O</div>
</a-point>
`;

export const PROCESS_A_POINT_LABEL_SLOT_TAKES_PRIORITY_EXPECTED = `
<a-point x="25%" y="25%">
  <template #label><div>O</div></template>
</a-point>
`;

export const PROCESS_A_POINT_LABEL_SLOT_TAKES_PRIORITY_WARN_MSG = "a-point has a label slot, 'label' attribute has no effect.";

/* eslint-enable max-len */
