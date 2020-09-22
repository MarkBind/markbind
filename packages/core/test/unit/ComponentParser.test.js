const cheerio = require('cheerio');
const htmlparser = require('htmlparser2');
const { ComponentParser } = require('../../src/parsers/ComponentParser');
const testData = require('./ComponentParser.data');

/**
 * Runs the parseComponent or postParseComponent method of componentParser on the provided
 * template, verifying it with the expected result.
 * @param template The html template, which should only have one root element
 * @param expectedTemplate The expected result template
 * @param postParse Boolean of whether to run postParseComponent instead of parseComponent.
 *                  Defaults to false
 */
const parseAndVerifyTemplate = (template, expectedTemplate, postParse = false) => {
  const handler = new htmlparser.DomHandler((error, dom) => {
    expect(error).toBeFalsy();

    if (postParse) {
      dom.forEach(node => ComponentParser.postParseComponents(node));
    } else {
      dom.forEach(node => ComponentParser.parseComponents(node));
    }
    const result = cheerio.html(dom);

    expect(result).toEqual(expectedTemplate);
  });

  const htmlParser = new htmlparser.Parser(handler);

  htmlParser.parseComplete(template);
};

test('parseComponent parses panel attributes and inserts into dom as slots correctly', () => {
  parseAndVerifyTemplate(testData.PARSE_PANEL_ATTRIBUTES,
                         testData.PARSE_PANEL_ATTRIBUTES_EXPECTED);
  parseAndVerifyTemplate(testData.PARSE_PANEL_HEADER_NO_OVERRIDE,
                         testData.PARSE_PANEL_HEADER_NO_OVERRIDE_EXPECTED);
});

test('parseComponent parses question attributes and inserts into dom as slots correctly', () => {
  parseAndVerifyTemplate(testData.PARSE_QUESTION_ATTRIBUTES,
                         testData.PARSE_QUESTION_ATTRIBUTES_EXPECTED);
  parseAndVerifyTemplate(testData.PARSE_QUESTION_ATTRIBUTES_NO_OVERRIDE,
                         testData.PARSE_QUESTION_ATTRIBUTES_NO_OVERRIDE_EXPECTED);
});

test('parseComponent parses q-option attributes and inserts into dom as slots correctly', () => {
  parseAndVerifyTemplate(testData.PARSE_QOPTION_ATTRIBUTES,
                         testData.PARSE_QOPTION_ATTRIBUTES_EXPECTED);
  parseAndVerifyTemplate(testData.PARSE_QOPTION_ATTRIBUTES_NO_OVERRIDE,
                         testData.PARSE_QOPTION_ATTRIBUTES_NO_OVERRIDE_EXPECTED);
});

test('parseComponent parses quiz attributes and inserts into dom as slots correctly', () => {
  parseAndVerifyTemplate(testData.PARSE_QUIZ_ATTRIBUTES_EXPECTED,
                         testData.PARSE_QUIZ_ATTRIBUTES_EXPECTED);
  parseAndVerifyTemplate(testData.PARSE_QUIZ_ATTRIBUTES_NO_OVERRIDE,
                         testData.PARSE_QUIZ_ATTRIBUTES_NO_OVERRIDE_EXPECTED);
});

test('parseComponent parses popover attributes and inserts into dom as slots correctly', () => {
  parseAndVerifyTemplate(testData.PARSE_POPOVER_ATTRIBUTES,
                         testData.PARSE_POPOVER_ATTRIBUTES_EXPECTED);
  parseAndVerifyTemplate(testData.PARSE_POPOVER_ATTRIBUTES_NO_OVERRIDE,
                         testData.PARSE_POPOVER_ATTRIBUTES_NO_OVERRIDE_EXPECTED);

  // todo remove these once 'title' for popover is fully deprecated
  parseAndVerifyTemplate(testData.PARSE_POPOVER_TITLE,
                         testData.PARSE_POPOVER_TITLE_EXPECTED);
  parseAndVerifyTemplate(testData.PARSE_POPOVER_TITLE_NO_OVERRIDE,
                         testData.PARSE_POPOVER_TITLE_NO_OVERRIDE_EXPECTED);
});

test('parseComponent parses tooltip attributes and inserts into dom as slots correctly', () => {
  parseAndVerifyTemplate(testData.PARSE_TOOLTIP_CONTENT,
                         testData.PARSE_TOOLTIP_CONTENT_EXPECTED);
});

test('parseComponent parses modal attributes and inserts into dom as slots correctly', () => {
  parseAndVerifyTemplate(testData.PARSE_MODAL_HEADER,
                         testData.PARSE_MODAL_HEADER_EXPECTED);

  // todo remove these once 'title' for modals is fully deprecated
  parseAndVerifyTemplate(testData.PARSE_MODAL_TITLE,
                         testData.PARSE_MODAL_TITLE_EXPECTED);
  parseAndVerifyTemplate(testData.PARSE_MODAL_TITLE_NO_OVERRIDE,
                         testData.PARSE_MODAL_TITLE_NO_OVERRIDE_EXPECTED);

  // todo remove these once 'modal-header' / 'modal-footer' for modal is fully deprecated
  parseAndVerifyTemplate(testData.PARSE_MODAL_SLOTS_RENAMING,
                         testData.PARSE_MODAL_SLOTS_RENAMING_EXPECTED);

  // when the ok-text attr is set, footer shouldn't be disabled and ok-only attr should be added
  parseAndVerifyTemplate(testData.PARSE_MODAL_OK_TEXT,
                         testData.PARSE_MODAL_OK_TEXT_EXPECTED);
});

test('parseComponent parses tab & tab-group attributes and inserts into dom as slots correctly', () => {
  parseAndVerifyTemplate(testData.PARSE_TAB_HEADER,
                         testData.PARSE_TAB_HEADER_EXPECTED);
  parseAndVerifyTemplate(testData.PARSE_TAB_GROUP_HEADER,
                         testData.PARSE_TAB_GROUP_HEADER_EXPECTED);
});

test('parseComponent parses box attributes and inserts into dom as slots correctly', () => {
  parseAndVerifyTemplate(testData.PARSE_BOX_ICON,
                         testData.PARSE_BOX_ICON_EXPECTED);
  parseAndVerifyTemplate(testData.PARSE_BOX_HEADER,
                         testData.PARSE_BOX_HEADER_EXPECTED);
  parseAndVerifyTemplate(testData.PARSE_BOX_HEADING,
                         testData.PARSE_BOX_HEADING_EXPECTED);
});

test('postParseComponent assigns the correct header id to panels', () => {
  parseAndVerifyTemplate(testData.POST_PARSE_PANEL_ID_ASSIGNED_USING_HEADER_SLOT,
                         testData.POST_PARSE_PANEL_ID_ASSIGNED_USING_HEADER_SLOT_EXPECTED,
                         true);
});

test('parseComponent parses dropdown header attribute and inserts into DOM as _header slot correctly', () => {
  parseAndVerifyTemplate(testData.PARSE_DROPDOWN_HEADER,
                         testData.PARSE_DROPDOWN_HEADER_EXPECTED);
});

test('parseComponent parses dropdown text attribute and inserts into DOM as _header slot correctly', () => {
  parseAndVerifyTemplate(testData.PARSE_DROPDOWN_TEXT_ATTR,
                         testData.PARSE_DROPDOWN_TEXT_ATTR_EXPECTED);
});

test('parseComponent parses dropdown with header taking priority over text attribute', () => {
  parseAndVerifyTemplate(testData.PARSE_DROPDOWN_HEADER_SHADOWS_TEXT,
                         testData.PARSE_DROPDOWN_HEADER_SHADOWS_TEXT_EXPECTED);
});

test('parseComponent parses dropdown with header slot taking priority over header attribute', () => {
  parseAndVerifyTemplate(testData.PARSE_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY,
                         testData.PARSE_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY_EXPECTED);
});

test('renderFile converts markdown headers to <h1> with an id', async () => {
  const componentParser = new ComponentParser({ headerIdMap: {} });
  const indexPath = 'index.md';

  const index = ['# Index'].join('\n');

  const result = await componentParser.render(indexPath, index);

  const expected = [
    '<h1 id="index">Index</h1>',
    '',
  ].join('\n');

  expect(result).toEqual(expected);
});
