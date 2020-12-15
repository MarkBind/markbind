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
var fs = require('fs');
var getNewDefaultNodeProcessor = require('../utils/utils').getNewDefaultNodeProcessor;
jest.mock('fs');
afterEach(function () { return fs.vol.reset(); });
test('includeFile replaces <include> with <div>', function () { return __awaiter(_this, void 0, void 0, function () {
    var indexPath, includePath, index, include, json, nodeProcessor, result, expected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                indexPath = path.resolve('index.md');
                includePath = path.resolve('include.md');
                index = [
                    '# Index',
                    '<include src="include.md" />',
                    '',
                ].join('\n');
                include = ['# Include'].join('\n');
                json = {
                    'include.md': include,
                };
                fs.vol.fromJSON(json, '');
                nodeProcessor = getNewDefaultNodeProcessor();
                return [4 /*yield*/, nodeProcessor.process(indexPath, index)];
            case 1:
                result = _a.sent();
                expected = [
                    '# Index',
                    '<div>'
                        + ("<div data-included-from=\"" + includePath + "\">"),
                    '',
                    '# Include',
                    '</div></div>',
                    '',
                ].join('\n');
                expect(result).toEqual(expected);
                return [2 /*return*/];
        }
    });
}); });
test('includeFile replaces <include src="exist.md" optional> with <div>', function () { return __awaiter(_this, void 0, void 0, function () {
    var indexPath, index, exist, json, nodeProcessor, result, expected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                indexPath = path.resolve('index.md');
                index = [
                    '# Index',
                    '<include src="exist.md" optional/>',
                    '',
                ].join('\n');
                exist = ['# Exist'].join('\n');
                json = {
                    'index.md': index,
                    'exist.md': exist,
                };
                fs.vol.fromJSON(json, '');
                nodeProcessor = getNewDefaultNodeProcessor();
                return [4 /*yield*/, nodeProcessor.process(indexPath, index)];
            case 1:
                result = _a.sent();
                expected = [
                    '# Index',
                    '<div>'
                        + '<div>',
                    '',
                    '# Exist',
                    '</div></div>',
                    '',
                ].join('\n');
                expect(result).toEqual(expected);
                return [2 /*return*/];
        }
    });
}); });
test('includeFile replaces <include src="doesNotExist.md" optional> with empty <div>', function () { return __awaiter(_this, void 0, void 0, function () {
    var indexPath, index, json, nodeProcessor, result, expected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                indexPath = path.resolve('index.md');
                index = [
                    '# Index',
                    '<include src="doesNotExist.md" optional/>',
                    '',
                ].join('\n');
                json = {
                    'index.md': index,
                };
                fs.vol.fromJSON(json, '');
                nodeProcessor = getNewDefaultNodeProcessor();
                return [4 /*yield*/, nodeProcessor.process(indexPath, index)];
            case 1:
                result = _a.sent();
                expected = [
                    '# Index',
                    '<div></div>',
                    '',
                ].join('\n');
                expect(result).toEqual(expected);
                return [2 /*return*/];
        }
    });
}); });
test('includeFile replaces <include src="include.md#exists"> with <div>', function () { return __awaiter(_this, void 0, void 0, function () {
    var indexPath, index, include, json, nodeProcessor, result, expected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                indexPath = path.resolve('index.md');
                index = [
                    '# Index',
                    '<include src="include.md#exists"/>',
                    '',
                ].join('\n');
                include = [
                    '# Include',
                    '<seg id="exists">existing segment</seg>',
                ].join('\n');
                json = {
                    'index.md': index,
                    'include.md': include,
                };
                fs.vol.fromJSON(json, '');
                nodeProcessor = getNewDefaultNodeProcessor();
                return [4 /*yield*/, nodeProcessor.process(indexPath, index)];
            case 1:
                result = _a.sent();
                expected = [
                    '# Index',
                    '<div>'
                        + '<div>',
                    '',
                    'existing segment',
                    '</div></div>',
                    '',
                ].join('\n');
                expect(result).toEqual(expected);
                return [2 /*return*/];
        }
    });
}); });
test('includeFile replaces <include src="include.md#exists" inline> with inline content', function () { return __awaiter(_this, void 0, void 0, function () {
    var indexPath, index, include, json, nodeProcessor, result, expected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                indexPath = path.resolve('index.md');
                index = [
                    '# Index',
                    '<include src="include.md#exists" inline/>',
                    '',
                ].join('\n');
                include = [
                    '# Include',
                    '<seg id="exists">existing segment</seg>',
                ].join('\n');
                json = {
                    'index.md': index,
                    'include.md': include,
                };
                fs.vol.fromJSON(json, '');
                nodeProcessor = getNewDefaultNodeProcessor();
                return [4 /*yield*/, nodeProcessor.process(indexPath, index)];
            case 1:
                result = _a.sent();
                expected = [
                    '# Index',
                    '<span>'
                        + '<span>existing segment</span></span>',
                    '',
                ].join('\n');
                expect(result).toEqual(expected);
                return [2 /*return*/];
        }
    });
}); });
test('includeFile replaces <include src="include.md#exists" trim> with trimmed content', function () { return __awaiter(_this, void 0, void 0, function () {
    var indexPath, index, include, json, nodeProcessor, result, expected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                indexPath = path.resolve('index.md');
                index = [
                    '# Index',
                    '<include src="include.md#exists" trim/>',
                    '',
                ].join('\n');
                include = [
                    '# Include',
                    '<seg id="exists">\t\texisting segment\t\t</seg>',
                ].join('\n');
                json = {
                    'index.md': index,
                    'include.md': include,
                };
                fs.vol.fromJSON(json, '');
                nodeProcessor = getNewDefaultNodeProcessor();
                return [4 /*yield*/, nodeProcessor.process(indexPath, index)];
            case 1:
                result = _a.sent();
                expected = [
                    '# Index',
                    '<div>'
                        + '<div>',
                    '',
                    'existing segment',
                    '</div></div>',
                    '',
                ].join('\n');
                expect(result).toEqual(expected);
                return [2 /*return*/];
        }
    });
}); });
test('includeFile replaces <include src="include.md#doesNotExist"> with error <div>', function () { return __awaiter(_this, void 0, void 0, function () {
    var indexPath, includePath, index, include, expectedErrorMessage, json, nodeProcessor, result, expected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                indexPath = path.resolve('index.md');
                includePath = path.resolve('include.md');
                index = [
                    '# Index',
                    '<include src="include.md#doesNotExist"/>',
                    '',
                ].join('\n');
                include = ['# Include'].join('\n');
                expectedErrorMessage = "No such segment 'doesNotExist' in file: " + includePath
                    + ("\nMissing reference in " + indexPath);
                json = {
                    'index.md': index,
                    'include.md': include,
                };
                fs.vol.fromJSON(json, '');
                nodeProcessor = getNewDefaultNodeProcessor();
                return [4 /*yield*/, nodeProcessor.process(indexPath, index)];
            case 1:
                result = _a.sent();
                expected = [
                    '# Index',
                    "<div style=\"color: red\">" + expectedErrorMessage + "</div>",
                    '',
                ].join('\n');
                expect(result).toEqual(expected);
                return [2 /*return*/];
        }
    });
}); });
test('includeFile replaces <include src="include.md#exists" optional> with <div>', function () { return __awaiter(_this, void 0, void 0, function () {
    var indexPath, index, include, json, nodeProcessor, result, expected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                indexPath = path.resolve('index.md');
                index = [
                    '# Index',
                    '<include src="include.md#exists" optional/>',
                    '',
                ].join('\n');
                include = [
                    '# Include',
                    '<seg id="exists">existing segment</seg>',
                ].join('\n');
                json = {
                    'index.md': index,
                    'include.md': include,
                };
                fs.vol.fromJSON(json, '');
                nodeProcessor = getNewDefaultNodeProcessor();
                return [4 /*yield*/, nodeProcessor.process(indexPath, index)];
            case 1:
                result = _a.sent();
                expected = [
                    '# Index',
                    '<div>'
                        + '<div>',
                    '',
                    'existing segment',
                    '</div></div>',
                    '',
                ].join('\n');
                expect(result).toEqual(expected);
                return [2 /*return*/];
        }
    });
}); });
test('includeFile replaces <include src="include.md#doesNotExist" optional> with empty <div>', function () { return __awaiter(_this, void 0, void 0, function () {
    var indexPath, includePath, index, include, json, nodeProcessor, result, expected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                indexPath = path.resolve('index.md');
                includePath = path.resolve('include.md');
                index = [
                    '# Index',
                    '<include src="include.md#doesNotExist" optional/>',
                    '',
                ].join('\n');
                include = ['# Include'].join('\n');
                json = {
                    'index.md': index,
                    'include.md': include,
                };
                fs.vol.fromJSON(json, '');
                nodeProcessor = getNewDefaultNodeProcessor();
                return [4 /*yield*/, nodeProcessor.process(indexPath, index)];
            case 1:
                result = _a.sent();
                expected = [
                    '# Index',
                    "<div cwf=\"" + indexPath + "\">"
                        + ("<div data-included-from=\"" + includePath + "\" cwf=\"" + includePath + "\">"),
                    '',
                    '',
                    '</div></div>',
                    '',
                ].join('\n');
                expect(result).toEqual(expected);
                return [2 /*return*/];
        }
    });
}); });
test('includeFile detects cyclic references for static cyclic includes', function () { return __awaiter(_this, void 0, void 0, function () {
    var indexPath, includePath, index, include, json, expectedErrorMessage, nodeProcessor, result, expected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                indexPath = path.resolve('index.md');
                includePath = path.resolve('include.md');
                index = [
                    '# Index',
                    '<include src="include.md" />',
                    '',
                ].join('\n');
                include = [
                    '# Include',
                    '<include src="index.md" />',
                    '',
                ].join('\n');
                json = {
                    'index.md': index,
                    'include.md': include,
                };
                fs.vol.fromJSON(json, '');
                expectedErrorMessage = [
                    'Cyclic reference detected.',
                    'Last 5 files processed:',
                    "\t" + indexPath,
                    "\t" + includePath,
                    "\t" + indexPath,
                    "\t" + includePath,
                    "\t" + indexPath,
                ].join('\n');
                nodeProcessor = getNewDefaultNodeProcessor();
                return [4 /*yield*/, nodeProcessor.process(indexPath, index)];
            case 1:
                result = _a.sent();
                expected = "<div style=\"color: red\">" + expectedErrorMessage + "</div>";
                expect(result).toContain(expected);
                return [2 /*return*/];
        }
    });
}); });
