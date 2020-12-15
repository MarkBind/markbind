var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var path = require('path');
var cheerio = require('cheerio');
var htmlparser = require('htmlparser2');
var getNewDefaultNodeProcessor = require('../utils/utils').getNewDefaultNodeProcessor;
var testData = require('./NodeProcessor.data');
var Context = require('../../../src/html/Context').Context;
/**
 * Runs the processNode or postProcessNode method of NodeProcessor on the provided
 * template, verifying it with the expected result.
 * @param template The html template, which should only have one root element
 * @param expectedTemplate The expected result template
 * @param postProcess Boolean of whether to run postProcessNode instead of processNode.
 *                  Defaults to false
 */
var processAndVerifyTemplate = function (template, expectedTemplate, postProcess) {
    if (postProcess === void 0) { postProcess = false; }
    var handler = new htmlparser.DomHandler(function (error, dom) {
        expect(error).toBeFalsy();
        var nodeProcessor = getNewDefaultNodeProcessor();
        if (postProcess) {
            dom.forEach(function (node) { return nodeProcessor.postProcessNode(node); });
        }
        else {
            dom.forEach(function (node) { return nodeProcessor.processNode(node, new Context(path.resolve(''))); });
        }
        var result = cheerio.html(dom);
        expect(result).toEqual(expectedTemplate);
    });
    var htmlParser = new htmlparser.Parser(handler);
    htmlParser.parseComplete(template);
};
test('processNode processes panel attributes and inserts into dom as slots correctly', function () {
    processAndVerifyTemplate(testData.PROCESS_PANEL_ATTRIBUTES, testData.PROCESS_PANEL_ATTRIBUTES_EXPECTED);
    processAndVerifyTemplate(testData.PROCESS_PANEL_HEADER_NO_OVERRIDE, testData.PROCESS_PANEL_HEADER_NO_OVERRIDE_EXPECTED);
});
test('processNode processes question attributes and inserts into dom as slots correctly', function () {
    processAndVerifyTemplate(testData.PROCESS_QUESTION_ATTRIBUTES, testData.PROCESS_QUESTION_ATTRIBUTES_EXPECTED);
    processAndVerifyTemplate(testData.PROCESS_QUESTION_ATTRIBUTES_NO_OVERRIDE, testData.PROCESS_QUESTION_ATTRIBUTES_NO_OVERRIDE_EXPECTED);
});
test('processNode processes q-option attributes and inserts into dom as slots correctly', function () {
    processAndVerifyTemplate(testData.PROCESS_QOPTION_ATTRIBUTES, testData.PROCESS_QOPTION_ATTRIBUTES_EXPECTED);
    processAndVerifyTemplate(testData.PROCESS_QOPTION_ATTRIBUTES_NO_OVERRIDE, testData.PROCESS_QOPTION_ATTRIBUTES_NO_OVERRIDE_EXPECTED);
});
test('processNode processes quiz attributes and inserts into dom as slots correctly', function () {
    processAndVerifyTemplate(testData.PROCESS_QUIZ_ATTRIBUTES_EXPECTED, testData.PROCESS_QUIZ_ATTRIBUTES_EXPECTED);
    processAndVerifyTemplate(testData.PROCESS_QUIZ_ATTRIBUTES_NO_OVERRIDE, testData.PROCESS_QUIZ_ATTRIBUTES_NO_OVERRIDE_EXPECTED);
});
test('processNode processes popover attributes and inserts into dom as slots correctly', function () {
    processAndVerifyTemplate(testData.PROCESS_POPOVER_ATTRIBUTES, testData.PROCESS_POPOVER_ATTRIBUTES_EXPECTED);
    processAndVerifyTemplate(testData.PROCESS_POPOVER_ATTRIBUTES_NO_OVERRIDE, testData.PROCESS_POPOVER_ATTRIBUTES_NO_OVERRIDE_EXPECTED);
    // todo remove these once 'title' for popover is fully deprecated
    processAndVerifyTemplate(testData.PROCESS_POPOVER_TITLE, testData.PROCESS_POPOVER_TITLE_EXPECTED);
    processAndVerifyTemplate(testData.PROCESS_POPOVER_TITLE_NO_OVERRIDE, testData.PROCESS_POPOVER_TITLE_NO_OVERRIDE_EXPECTED);
});
test('processNode processes tooltip attributes and inserts into dom as slots correctly', function () {
    processAndVerifyTemplate(testData.PROCESS_TOOLTIP_CONTENT, testData.PROCESS_TOOLTIP_CONTENT_EXPECTED);
});
test('processNode processes modal attributes and inserts into dom as slots correctly', function () {
    processAndVerifyTemplate(testData.PROCESS_MODAL_HEADER, testData.PROCESS_MODAL_HEADER_EXPECTED);
    // todo remove these once 'title' for modals is fully deprecated
    processAndVerifyTemplate(testData.PROCESS_MODAL_TITLE, testData.PROCESS_MODAL_TITLE_EXPECTED);
    processAndVerifyTemplate(testData.PROCESS_MODAL_TITLE_NO_OVERRIDE, testData.PROCESS_MODAL_TITLE_NO_OVERRIDE_EXPECTED);
    // todo remove these once 'modal-header' / 'modal-footer' for modal is fully deprecated
    processAndVerifyTemplate(testData.PROCESS_MODAL_SLOTS_RENAMING, testData.PROCESS_MODAL_SLOTS_RENAMING_EXPECTED);
    // when the ok-text attr is set, footer shouldn't be disabled and ok-only attr should be added
    processAndVerifyTemplate(testData.PROCESS_MODAL_OK_TEXT, testData.PROCESS_MODAL_OK_TEXT_EXPECTED);
});
test('processNode processes tab & tab-group attributes and inserts into dom as slots correctly', function () {
    processAndVerifyTemplate(testData.PROCESS_TAB_HEADER, testData.PROCESS_TAB_HEADER_EXPECTED);
    processAndVerifyTemplate(testData.PROCESS_TAB_GROUP_HEADER, testData.PROCESS_TAB_GROUP_HEADER_EXPECTED);
});
test('processNode processes box attributes and inserts into dom as slots correctly', function () {
    processAndVerifyTemplate(testData.PROCESS_BOX_ICON, testData.PROCESS_BOX_ICON_EXPECTED);
    processAndVerifyTemplate(testData.PROCESS_BOX_HEADER, testData.PROCESS_BOX_HEADER_EXPECTED);
    processAndVerifyTemplate(testData.PROCESS_BOX_HEADING, testData.PROCESS_BOX_HEADING_EXPECTED);
});
test('postProcessNode assigns the correct header id to panels', function () {
    processAndVerifyTemplate(testData.POST_PROCESS_PANEL_ID_ASSIGNED_USING_HEADER_SLOT, testData.POST_PROCESS_PANEL_ID_ASSIGNED_USING_HEADER_SLOT_EXPECTED, true);
});
test('processNode processes dropdown header attribute and inserts into DOM as _header slot correctly', function () {
    processAndVerifyTemplate(testData.PROCESS_DROPDOWN_HEADER, testData.PROCESS_DROPDOWN_HEADER_EXPECTED);
});
test('processNode processes dropdown text attribute and inserts into DOM as _header slot correctly', function () {
    processAndVerifyTemplate(testData.PROCESS_DROPDOWN_TEXT_ATTR, testData.PROCESS_DROPDOWN_TEXT_ATTR_EXPECTED);
});
test('processNode processes dropdown with header taking priority over text attribute', function () {
    processAndVerifyTemplate(testData.PROCESS_DROPDOWN_HEADER_SHADOWS_TEXT, testData.PROCESS_DROPDOWN_HEADER_SHADOWS_TEXT_EXPECTED);
});
test('processNode processes dropdown with header slot taking priority over header attribute', function () {
    processAndVerifyTemplate(testData.PROCESS_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY, testData.PROCESS_DROPDOWN_HEADER_SLOT_TAKES_PRIORITY_EXPECTED);
});
test('renderFile converts markdown headers to <h1> with an id', function () { return __awaiter(_this, void 0, void 0, function () {
    var nodeProcessor, indexPath, result, expected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                nodeProcessor = getNewDefaultNodeProcessor();
                indexPath = 'index.md';
                return [4 /*yield*/, nodeProcessor.process(indexPath, '# Index')];
            case 1:
                result = _a.sent();
                expected = ['<h1 id="index"><span id="index" class="anchor"></span>Index</h1>'].join('\n');
                expect(result).toEqual(expected);
                return [2 /*return*/];
        }
    });
}); });
