/* eslint-disable max-len */
/*
 * Panel
 */
module.exports.PROCESS_PANEL_ATTRIBUTES = "\n<panel header=\"# Lorem ipsum\" alt=\"_emphasized alt_\">\n  Header and alt attributes should be processed and inserted under panel as internal slots and deleted.\n</panel>\n";
module.exports.PROCESS_PANEL_ATTRIBUTES_EXPECTED = "\n<panel><template slot=\"header\"><h1>Lorem ipsum</h1>\n</template><template slot=\"_alt\"><p><em>emphasized alt</em></p>\n</template>\n  Header and alt attributes should be processed and inserted under panel as internal slots and deleted.\n</panel>\n";
module.exports.PROCESS_PANEL_HEADER_NO_OVERRIDE = "\n<panel header=\"# Lorem ipsum\" alt=\"**strong alt**\">\n  <div slot=\"header\">\n    This existing header slot should be preserved in favour over header attribute.\n  </div>\n  Header attribute should not be inserted under panel since there is both an alt attribute and header slot,\n  but should be deleted.\n  Alt attribute should be inserted under panel as slot.\n</panel>\n";
module.exports.PROCESS_PANEL_HEADER_NO_OVERRIDE_EXPECTED = "\n<panel><template slot=\"_alt\"><p><strong>strong alt</strong></p>\n</template>\n  <div slot=\"header\">\n    This existing header slot should be preserved in favour over header attribute.\n  </div>\n  Header attribute should not be inserted under panel since there is both an alt attribute and header slot,\n  but should be deleted.\n  Alt attribute should be inserted under panel as slot.\n</panel>\n";
// Post Process
module.exports.POST_PROCESS_PANEL_ID_ASSIGNED_USING_HEADER_SLOT = "\n<panel><template slot=\"header\"><h1 id=\"slot-header\">Slot Header</h1></template>\n  Header and alt attributes should be processed and inserted under panel as internal slots and deleted.\n</panel>\n";
module.exports.POST_PROCESS_PANEL_ID_ASSIGNED_USING_HEADER_SLOT_EXPECTED = "\n<panel id=\"slot-header\"><template slot=\"header\"><h1 id=\"slot-header\">Slot Header</h1></template>\n  Header and alt attributes should be processed and inserted under panel as internal slots and deleted.\n</panel>\n";
/*
 * Questions, QOption and Quizzes
 */
module.exports.PROCESS_QUESTION_ATTRIBUTES = "\n<question header=\"**header**\" hint=\"**hint**\" answer=\"**answer**\">\n</question>\n";
module.exports.PROCESS_QUESTION_ATTRIBUTES_EXPECTED = "\n<question><template slot=\"answer\"><p><strong>answer</strong></p>\n</template><template slot=\"hint\"><p><strong>hint</strong></p>\n</template><template slot=\"header\"><p><strong>header</strong></p>\n</template>\n</question>\n";
module.exports.PROCESS_QUESTION_ATTRIBUTES_NO_OVERRIDE = "\n<question header=\"**header**\" hint=\"**hint**\" answer=\"**answer**\">\n<template slot=\"header\"></template>\n<template slot=\"hint\"></template>\n<template slot=\"answer\"></template>\n</question>\n";
module.exports.PROCESS_QUESTION_ATTRIBUTES_NO_OVERRIDE_EXPECTED = "\n<question>\n<template slot=\"header\"></template>\n<template slot=\"hint\"></template>\n<template slot=\"answer\"></template>\n</question>\n";
module.exports.PROCESS_QOPTION_ATTRIBUTES = "\n<q-option reason=\"**lorem ipsum**\">\n</q-option>\n";
module.exports.PROCESS_QOPTION_ATTRIBUTES_EXPECTED = "\n<q-option><template slot=\"reason\"><p><strong>lorem ipsum</strong></p>\n</template>\n</q-option>\n";
module.exports.PROCESS_QOPTION_ATTRIBUTES_NO_OVERRIDE = "\n<q-option reason=\"**lorem ipsum**\">\n<template slot=\"reason\"></template>\n</q-option>\n";
module.exports.PROCESS_QOPTION_ATTRIBUTES_NO_OVERRIDE_EXPECTED = "\n<q-option>\n<template slot=\"reason\"></template>\n</q-option>\n";
module.exports.PROCESS_QUIZ_ATTRIBUTES = "\n<quiz intro=\"**lorem ipsum**\">\n</quiz>\n";
module.exports.PROCESS_QUIZ_ATTRIBUTES_EXPECTED = "\n<quiz><template slot=\"intro\"><p><strong>lorem ipsum</strong></p>\n</template>\n</quiz>\n";
module.exports.PROCESS_QUIZ_ATTRIBUTES_NO_OVERRIDE = "\n<quiz intro=\"**lorem ipsum**\">\n<template slot=\"intro\"></template>\n</quiz>\n";
module.exports.PROCESS_QUIZ_ATTRIBUTES_NO_OVERRIDE_EXPECTED = "\n<quiz>\n<template slot=\"intro\"></template>\n</quiz>\n";
/*
 * Popovers
 */
module.exports.PROCESS_POPOVER_ATTRIBUTES = "\n<popover content=\"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel tellus elit.\" \n         header=\"**Lorem ipsum**\">\n  Content and header attributes should be processed and inserted under panel as slots and deleted.\n</popover>\n";
module.exports.PROCESS_POPOVER_ATTRIBUTES_EXPECTED = "\n<span data-mb-component-type=\"popover\" v-b-popover.hover.top.html=\"popoverInnerGetters\" class=\"trigger\"><span data-mb-slot-name=\"header\"><strong>Lorem ipsum</strong></span><span data-mb-slot-name=\"content\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel tellus elit.</span>\n  Content and header attributes should be processed and inserted under panel as slots and deleted.\n</span>\n";
module.exports.PROCESS_POPOVER_ATTRIBUTES_NO_OVERRIDE = "\n<popover content=\"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel tellus elit.\" \n         header=\"_Lorem ipsum_\">\n  <div slot=\"header\">Some header slot content that should not be overwritten</div>\n  <div slot=\"content\">Some content slot that should not be overwritten</div>\n  Content and header attributes should not be inserted under panel as slots, but should be deleted.\n</popover>\n";
module.exports.PROCESS_POPOVER_ATTRIBUTES_NO_OVERRIDE_EXPECTED = "\n<span data-mb-component-type=\"popover\" v-b-popover.hover.top.html=\"popoverInnerGetters\" class=\"trigger\">\n  <div data-mb-slot-name=\"header\">Some header slot content that should not be overwritten</div>\n  <div data-mb-slot-name=\"content\">Some content slot that should not be overwritten</div>\n  Content and header attributes should not be inserted under panel as slots, but should be deleted.\n</span>\n";
// todo remove tests for these once 'title' attribute is fully deprecated for popovers
module.exports.PROCESS_POPOVER_TITLE = "\n<popover title=\"**Lorem ipsum**\">\n  Title attribute should be processed and inserted under popover as header slot and deleted.\n</popover>\n";
module.exports.PROCESS_POPOVER_TITLE_EXPECTED = "\n<span data-mb-component-type=\"popover\" v-b-popover.hover.top.html=\"popoverInnerGetters\" class=\"trigger\"><span data-mb-slot-name=\"header\"><strong>Lorem ipsum</strong></span>\n  Title attribute should be processed and inserted under popover as header slot and deleted.\n</span>\n";
module.exports.PROCESS_POPOVER_TITLE_NO_OVERRIDE = "\n<popover title=\"**Title header**\" header=\"**Header header**\">\n  Title attribute should not be inserted as slot as header attribute is present, and should be deleted.\n</popover>\n";
module.exports.PROCESS_POPOVER_TITLE_NO_OVERRIDE_EXPECTED = "\n<span data-mb-component-type=\"popover\" v-b-popover.hover.top.html=\"popoverInnerGetters\" class=\"trigger\"><span data-mb-slot-name=\"header\"><strong>Header header</strong></span>\n  Title attribute should not be inserted as slot as header attribute is present, and should be deleted.\n</span>\n";
/*
 * Tooltips
 */
module.exports.PROCESS_TOOLTIP_CONTENT = "\n<tooltip content=\"Lorem ipsum dolor sit amet\">\n  <button>Content attribute should be inserted as _content internal slot</button>\n</tooltip>\n";
module.exports.PROCESS_TOOLTIP_CONTENT_EXPECTED = "\n<span data-mb-component-type=\"tooltip\" v-b-tooltip.hover.top.html=\"tooltipInnerContentGetter\" class=\"trigger\"><span data-mb-slot-name=\"_content\">Lorem ipsum dolor sit amet</span>\n  <button>Content attribute should be inserted as _content internal slot</button>\n</span>\n";
/*
 * Modals
 */
module.exports.PROCESS_MODAL_HEADER = "\n<modal header=\"_Lorem ipsum dolor sit amet_\">\n  Header attribute should be inserted as bootstrap-vue modal-title slot.\n</modal>\n";
module.exports.PROCESS_MODAL_HEADER_EXPECTED = "\n<b-modal hide-footer size modal-class=\"mb-zoom\"><template slot=\"modal-title\"><em>Lorem ipsum dolor sit amet</em></template>\n  Header attribute should be inserted as bootstrap-vue modal-title slot.\n</b-modal>\n";
// todo remove tests for these once 'title' attribute is fully deprecated for modals
module.exports.PROCESS_MODAL_TITLE = "\n<modal title=\"**Lorem ipsum dolor sit amet**\">\n  Title attribute should be inserted as internal _header slot.\n</modal>\n";
module.exports.PROCESS_MODAL_TITLE_EXPECTED = "\n<b-modal hide-footer size modal-class=\"mb-zoom\"><template slot=\"modal-title\"><strong>Lorem ipsum dolor sit amet</strong></template>\n  Title attribute should be inserted as internal _header slot.\n</b-modal>\n";
module.exports.PROCESS_MODAL_TITLE_NO_OVERRIDE = "\n<modal title=\"**Title header**\" header=\"**Header header**\">\n  Title attribute should not have priority over newer header attribute, and should be deleted.\n</modal>\n";
module.exports.PROCESS_MODAL_TITLE_NO_OVERRIDE_EXPECTED = "\n<b-modal hide-footer size modal-class=\"mb-zoom\"><template slot=\"modal-title\"><strong>Header header</strong></template>\n  Title attribute should not have priority over newer header attribute, and should be deleted.\n</b-modal>\n";
module.exports.PROCESS_MODAL_OK_TEXT = "\n<modal ok-text=\"Custom OK\" title=\"**Title header**\" header=\"**Header header**\">\n  ok-only attr should be set, hide-footer should not be set.\n</modal>\n";
module.exports.PROCESS_MODAL_OK_TEXT_EXPECTED = "\n<b-modal ok-title=\"Custom OK\" ok-only size modal-class=\"mb-zoom\"><template slot=\"modal-title\"><strong>Header header</strong></template>\n  ok-only attr should be set, hide-footer should not be set.\n</b-modal>\n";
// todo remove these once modal-header modal-footer slot names are deprecated fully.
module.exports.PROCESS_MODAL_SLOTS_RENAMING = "\n<modal>\n  <div slot=\"modal-header\">Should be renamed to header</div>\n  <div slot=\"modal-footer\">Should be renamed to footer</div>\n</modal>\n";
module.exports.PROCESS_MODAL_SLOTS_RENAMING_EXPECTED = "\n<b-modal size modal-class=\"mb-zoom\">\n  <div slot=\"modal-header\">Should be renamed to header</div>\n  <div slot=\"modal-footer\">Should be renamed to footer</div>\n</b-modal>\n";
/*
 * Tab, tab-group
 */
module.exports.PROCESS_TAB_HEADER = "\n<tab header=\"**Lorem ipsum dolor sit amet**\">\n  Header attribute should be inserted as internal _header slot and deleted.\n</tab>\n";
module.exports.PROCESS_TAB_HEADER_EXPECTED = "\n<tab><template slot=\"_header\"><strong>Lorem ipsum dolor sit amet</strong></template>\n  Header attribute should be inserted as internal _header slot and deleted.\n</tab>\n";
module.exports.PROCESS_TAB_GROUP_HEADER = "\n<tab-group header=\"**Lorem ipsum dolor sit amet**\">\n  Header attribute should be inserted as internal _header slot and deleted.\n</tab-group>\n";
module.exports.PROCESS_TAB_GROUP_HEADER_EXPECTED = "\n<tab-group><template slot=\"_header\"><strong>Lorem ipsum dolor sit amet</strong></template>\n  Header attribute should be inserted as internal _header slot and deleted.\n</tab-group>\n";
/*
 * Boxes
 */
module.exports.PROCESS_BOX_ICON = "\n<box icon=\":rocket:\">\n  Icon attribute should be inserted as internal icon slot and deleted.\n</box>\n";
module.exports.PROCESS_BOX_ICON_EXPECTED = "\n<box><template slot=\"icon\">\uD83D\uDE80</template>\n  Icon attribute should be inserted as internal icon slot and deleted.\n</box>\n";
module.exports.PROCESS_BOX_HEADER = "\n<box header=\"#### Lorem ipsum dolor sit amet :rocket:\">\n  Header attribute should be inserted as internal _header slot and deleted.\n</box>\n";
module.exports.PROCESS_BOX_HEADER_EXPECTED = "\n<box><template slot=\"_header\"><h4>Lorem ipsum dolor sit amet \uD83D\uDE80</h4>\n</template>\n  Header attribute should be inserted as internal _header slot and deleted.\n</box>\n";
// todo remove this test once 'heading' attribute is fully deprecated for boxes
module.exports.PROCESS_BOX_HEADING = "\n<box heading=\"#### Lorem ipsum dolor sit amet :rocket:\">\n  Heading attribute should be inserted as internal _header slot and deleted.\n</box>\n";
module.exports.PROCESS_BOX_HEADING_EXPECTED = "\n<box><template slot=\"_header\"><h4>Lorem ipsum dolor sit amet \uD83D\uDE80</h4>\n</template>\n  Heading attribute should be inserted as internal _header slot and deleted.\n</box>\n";
/**
 * Dropdowns
 */
module.exports.PROCESS_DROPDOWN_HEADER = "\n<dropdown header=\"**Lorem ipsum dolor sit amet**\">\n  Header attribute should be inserted as internal _header slot and deleted.\n</dropdown>\n";
module.exports.PROCESS_DROPDOWN_HEADER_EXPECTED = "\n<dropdown><template slot=\"_header\"><strong>Lorem ipsum dolor sit amet</strong></template>\n  Header attribute should be inserted as internal _header slot and deleted.\n</dropdown>\n";
// TODO deprecate text attribute of dropdown
module.exports.PROCESS_DROPDOWN_TEXT_ATTR = "\n<dropdown text=\"**Lorem ipsum dolor sit amet**\">\n  Text attribute should be inserted as internal _header slot and deleted.\n</dropdown>\n";
// TODO deprecate text attribute of dropdown
module.exports.PROCESS_DROPDOWN_TEXT_ATTR_EXPECTED = "\n<dropdown><template slot=\"_header\"><strong>Lorem ipsum dolor sit amet</strong></template>\n  Text attribute should be inserted as internal _header slot and deleted.\n</dropdown>\n";
// TODO deprecate text attribute of dropdown
module.exports.PROCESS_DROPDOWN_HEADER_SHADOWS_TEXT = "\n<dropdown text=\"Not expected text\" header=\"**Lorem ipsum dolor sit amet**\">\n  Header attribute should be inserted as internal _header slot and deleted. Text attribute should be ignored.\n</dropdown>\n";
// TODO deprecate text attribute of dropdown
module.exports.PROCESS_DROPDOWN_HEADER_SHADOWS_TEXT_EXPECTED = "\n<dropdown><template slot=\"_header\"><strong>Lorem ipsum dolor sit amet</strong></template>\n  Header attribute should be inserted as internal _header slot and deleted. Text attribute should be ignored.\n</dropdown>\n";
module.exports.PROCESS_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY = "\n<dropdown header=\"**Lorem ipsum dolor sit amet**\" text=\"shouldn't appear in result\">\n  <strong slot=\"header\">slot text</strong>\n  Header attribute should be ignored and deleted while header slot is reserved.\n</dropdown>\n";
module.exports.PROCESS_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY_EXPECTED = "\n<dropdown>\n  <strong slot=\"header\">slot text</strong>\n  Header attribute should be ignored and deleted while header slot is reserved.\n</dropdown>\n";
/* eslint-enable max-len */
