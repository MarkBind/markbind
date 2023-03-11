const path = require('path');
const cheerio = require('cheerio');
const htmlparser = require('htmlparser2');
const { getNewDefaultNodeProcessor } = require('../utils/utils');
const testData = require('./NodeProcessor.data');
const { Context } = require('../../../src/html/Context');
const { shiftSlotNodeDeeper, transformOldSlotSyntax } = require('../../../src/html/vueSlotSyntaxProcessor');

/**
 * Runs the processNode or postProcessNode method of NodeProcessor on the provided
 * template, verifying it with the expected result.
 * @param template The html template, which should only have one root element
 * @param expectedTemplate The expected result template
 * @param postProcess Boolean of whether to run postProcessNode instead of processNode.
 *                  Defaults to false
 */
const processAndVerifyTemplate = (template, expectedTemplate, postProcess = false) => {
  const handler = new htmlparser.DomHandler((error, dom) => {
    expect(error).toBeFalsy();

    const nodeProcessor = getNewDefaultNodeProcessor();

    if (postProcess) {
      /*
        Need to process node first (convert deprecated vue slot to updated shorthand syntax)
        before doing post-processing.
      */
      dom.forEach(node => nodeProcessor.processNode(node, new Context(path.resolve(''))));
      dom.forEach(node => nodeProcessor.postProcessNode(node));
    } else {
      dom.forEach(node => nodeProcessor.processNode(node, new Context(path.resolve(''))));
    }
    const result = cheerio.html(dom);

    expect(result).toEqual(expectedTemplate);
  });

  const htmlParser = new htmlparser.Parser(handler);

  htmlParser.parseComplete(template);
};

test('processNode processes panel attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_PANEL_ATTRIBUTES,
                           testData.PROCESS_PANEL_ATTRIBUTES_EXPECTED);
  processAndVerifyTemplate(testData.PROCESS_PANEL_HEADER_SLOT_TAKES_PRIORITY,
                           testData.PROCESS_PANEL_HEADER_SLOT_TAKES_PRIORITY_EXPECTED);
  processAndVerifyTemplate(testData.PROCESS_PANEL_HEADER_NO_OVERRIDE,
                           testData.PROCESS_PANEL_HEADER_NO_OVERRIDE_EXPECTED);
});

test('processNode processes question attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_QUESTION_ATTRIBUTES,
                           testData.PROCESS_QUESTION_ATTRIBUTES_EXPECTED);
  processAndVerifyTemplate(testData.PROCESS_QUESTION_ATTRIBUTES_NO_OVERRIDE,
                           testData.PROCESS_QUESTION_ATTRIBUTES_NO_OVERRIDE_EXPECTED);
});

test('processNode processes q-option attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_QOPTION_ATTRIBUTES,
                           testData.PROCESS_QOPTION_ATTRIBUTES_EXPECTED);
  processAndVerifyTemplate(testData.PROCESS_QOPTION_ATTRIBUTES_NO_OVERRIDE,
                           testData.PROCESS_QOPTION_ATTRIBUTES_NO_OVERRIDE_EXPECTED);
});

test('processNode processes quiz attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_QUIZ_ATTRIBUTES_EXPECTED,
                           testData.PROCESS_QUIZ_ATTRIBUTES_EXPECTED);
  processAndVerifyTemplate(testData.PROCESS_QUIZ_ATTRIBUTES_NO_OVERRIDE,
                           testData.PROCESS_QUIZ_ATTRIBUTES_NO_OVERRIDE_EXPECTED);
});

test('processNode processes popover attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_POPOVER_ATTRIBUTES,
                           testData.PROCESS_POPOVER_ATTRIBUTES_EXPECTED);
  processAndVerifyTemplate(testData.PROCESS_POPOVER_ATTRIBUTES_NO_OVERRIDE,
                           testData.PROCESS_POPOVER_ATTRIBUTES_NO_OVERRIDE_EXPECTED);
});

test('processNode processes tooltip attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_TOOLTIP_CONTENT,
                           testData.PROCESS_TOOLTIP_CONTENT_EXPECTED);
});

test('processNode processes modal attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_MODAL_HEADER,
                           testData.PROCESS_MODAL_HEADER_EXPECTED);

  // todo remove these once 'modal-header' / 'modal-footer' for modal is fully deprecated
  processAndVerifyTemplate(testData.PROCESS_MODAL_SLOTS_RENAMING,
                           testData.PROCESS_MODAL_SLOTS_RENAMING_EXPECTED);

  // when the ok-text attr is set, footer shouldn't be disabled and ok-only attr should be added
  processAndVerifyTemplate(testData.PROCESS_MODAL_OK_TEXT,
                           testData.PROCESS_MODAL_OK_TEXT_EXPECTED);
});

test('processNode processes tab & tab-group attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_TAB_HEADER,
                           testData.PROCESS_TAB_HEADER_EXPECTED);
  processAndVerifyTemplate(testData.PROCESS_TAB_GROUP_HEADER,
                           testData.PROCESS_TAB_GROUP_HEADER_EXPECTED);
});

test('processNode processes box attributes and inserts into dom as slots correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_BOX_ICON,
                           testData.PROCESS_BOX_ICON_EXPECTED);
  processAndVerifyTemplate(testData.PROCESS_BOX_HEADER,
                           testData.PROCESS_BOX_HEADER_EXPECTED);
});

test('postProcessNode assigns the correct panel id to panels', () => {
  processAndVerifyTemplate(testData.POST_PROCESS_PANEL_ID_ASSIGNED_USING_HEADER_SLOT,
                           testData.POST_PROCESS_PANEL_ID_ASSIGNED_USING_HEADER_SLOT_EXPECTED,
                           true);
});

test('processNode processes dropdown header attribute and inserts into DOM as header slot correctly', () => {
  processAndVerifyTemplate(testData.PROCESS_DROPDOWN_HEADER,
                           testData.PROCESS_DROPDOWN_HEADER_EXPECTED);
});

test('processNode processes dropdown with header slot taking priority over header attribute', () => {
  processAndVerifyTemplate(testData.PROCESS_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY,
                           testData.PROCESS_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY_EXPECTED);
});

test('markdown coverts inline colour syntax correctly', async () => {
  const nodeProcessor = getNewDefaultNodeProcessor();
  const indexPath = 'index.md';
  const syntaxToTest = '#r# red ## #c#cyan## #y#yellow #m#magenta ## yellow##';

  const result = await nodeProcessor.process(indexPath, syntaxToTest);

  let expected = '<p>';
  expected += '<span class="mkb-text-red"> red </span> ';
  expected += '<span class="mkb-text-cyan">cyan</span> ';
  expected += '<span class="mkb-text-yellow">yellow ';
  expected += '<span class="mkb-text-magenta">magenta </span> yellow</span>';
  expected += '</p>';

  expect(result).toEqual(expected);
});

test('markdown does not convert escaped inline colour syntax', async () => {
  const nodeProcessor = getNewDefaultNodeProcessor();
  const indexPath = 'index.md';
  const syntaxToTest = 'escaped start: \\#r# real start: #b#and escaped end:\\## and real end:## black';

  const result = await nodeProcessor.process(indexPath, syntaxToTest);

  let expected = '<p>';
  expected += 'escaped start: #r# real start: ';
  expected += '<span class="mkb-text-blue">and escaped end:## and real end:</span> black';
  expected += '</p>';

  expect(result).toEqual(expected);
});

test('markdown removes non-matching syntax starts and ends', async () => {
  const nodeProcessor = getNewDefaultNodeProcessor();
  const indexPath = 'index.md';
  const syntaxToTest = 'end without start ## and start without end #g# green text\n\nnot green text';

  const result = await nodeProcessor.process(indexPath, syntaxToTest);

  let expected = '<p>';
  expected += 'end without start  and start without end ';
  expected += '<span class="mkb-text-green"> green text</span></p>\n';
  expected += '<p>not green text</p>';

  expect(result).toEqual(expected);
});

test('markdown inline colour syntax works with code blocks', async () => {
  const nodeProcessor = getNewDefaultNodeProcessor();
  const indexPath = 'index.md';
  const syntaxToTest = '```#y#not yellow text##```';

  const result = await nodeProcessor.process(indexPath, syntaxToTest);

  let expected = '<p><code class="hljs inline no-lang" v-pre>';
  expected += '#y#not yellow text##';
  expected += '</code></p>';

  expect(result).toEqual(expected);
});

test('page-nav-print syntex converts to div element with class', async () => {
  const nodeProcessor = getNewDefaultNodeProcessor();
  const indexPath = 'index.md';
  let syntaxToTest = '<page-nav-print />';
  syntaxToTest += '<page-nav-print></page-nav-print>';
  syntaxToTest += '<page-nav-print>Table of Content</page-nav-print>';

  const result = await nodeProcessor.process(indexPath, syntaxToTest);

  let expected = '<p><div class="page-nav-print d-none d-print-block" v-pre></div>';
  expected += '<div class="page-nav-print d-none d-print-block" v-pre></div>';
  expected += '<div class="page-nav-print d-none d-print-block" v-pre>Table of Content</div></p>';

  expect(result).toEqual(expected);
});

test('renderFile converts markdown headers to <h1> with an id', async () => {
  const nodeProcessor = getNewDefaultNodeProcessor();
  const indexPath = 'index.md';

  const result = await nodeProcessor.process(indexPath, '# Index');

  const expected = ['<h1 id="index"><span id="index" class="anchor"></span>Index</h1>'].join('\n');

  expect(result).toEqual(expected);
});

test('deprecated vue slot syntax should be converted to updated Vue slot shorthand syntax', async () => {
  // slot="test" converted to #test
  const test = '<panel><div slot="header">test</div><p slot="test">test2</p></panel>';

  const testNode = cheerio.parseHTML(test)[0];

  transformOldSlotSyntax(testNode);

  const expected = '<panel><div #header>test</div><p #test>test2</p></panel>';

  expect(cheerio.html(testNode)).toEqual(expected);
});

test('slot nodes which have tag names other than "template" are shifted one level deeper ', async () => {
  const test = '<panel><div #header>test</div></panel>';

  const testNode = cheerio.parseHTML(test)[0];

  shiftSlotNodeDeeper(testNode);

  const expected = '<panel><template #header><div>test</div></template></panel>';

  expect(cheerio.html(testNode)).toEqual(expected);
});
