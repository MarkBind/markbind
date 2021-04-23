var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var uuidv4 = require('uuid').v4;
var PageSources = require('../Page/PageSources').PageSources;
var NodeProcessor = require('../html/NodeProcessor').NodeProcessor;
var logger = require('../utils/logger');
var LAYOUT_PAGE_BODY_VARIABLE = 'content';
var LAYOUT_PAGE_NAV_VARIABLE = 'pageNav';
var Layout = /** @class */ (function () {
    function Layout(sourceFilePath, config) {
        this.sourceFilePath = sourceFilePath;
        this.config = config;
        this.includedFiles = new Set([this.sourceFilePath]);
        this.layoutProcessed = '';
        this.layoutPageBodyVariable = '';
        this.layoutPageNavVariable = '';
        this.hasPageNav = false;
        this.headTop = [];
        this.headBottom = [];
        this.scriptBottom = [];
        this.generatePromise = undefined;
    }
    Layout.prototype.shouldRegenerate = function (filePaths) {
        var _this = this;
        return filePaths.some(function (filePath) { return _this.includedFiles.has(filePath); });
    };
    Layout.prototype.generate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var triesLeft, numBodyVars, numPageNavVars, pageSources, nodeProcessor, fileConfig, layoutVariables, _a, variableProcessor, pluginManager, nunjucksProcessed, _b, pageBodyVarRegex, pageNavVarRegex, bodyVarMatch, pageNavVarMatch;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        triesLeft = 10;
                        _d.label = 1;
                    case 1:
                        fileConfig = __assign(__assign({}, this.config), { headerIdMap: {} });
                        pageSources = new PageSources();
                        this.layoutPageBodyVariable = "{{" + uuidv4() + "-" + uuidv4() + "}}";
                        this.layoutPageNavVariable = "{{" + uuidv4() + "-" + uuidv4() + "}}";
                        layoutVariables = (_c = {},
                            _c[LAYOUT_PAGE_BODY_VARIABLE] = this.layoutPageBodyVariable,
                            _c[LAYOUT_PAGE_NAV_VARIABLE] = this.layoutPageNavVariable,
                            _c);
                        _a = this.config, variableProcessor = _a.variableProcessor, pluginManager = _a.pluginManager;
                        nunjucksProcessed = variableProcessor.renderWithSiteVariables(this.sourceFilePath, pageSources, layoutVariables);
                        nodeProcessor = new NodeProcessor(fileConfig, pageSources, variableProcessor, pluginManager, 'layout');
                        // eslint-disable-next-line no-await-in-loop
                        _b = this;
                        return [4 /*yield*/, nodeProcessor.process(this.sourceFilePath, nunjucksProcessed, this.sourceFilePath, layoutVariables)];
                    case 2:
                        // eslint-disable-next-line no-await-in-loop
                        _b.layoutProcessed = _d.sent();
                        this.layoutProcessed = pluginManager.postRender(nodeProcessor.frontMatter, this.layoutProcessed);
                        pageBodyVarRegex = new RegExp(this.layoutPageBodyVariable, 'g');
                        pageNavVarRegex = new RegExp(this.layoutPageNavVariable, 'g');
                        bodyVarMatch = this.layoutProcessed.match(pageBodyVarRegex);
                        pageNavVarMatch = this.layoutProcessed.match(pageNavVarRegex);
                        numBodyVars = bodyVarMatch ? bodyVarMatch.length : 0;
                        numPageNavVars = pageNavVarMatch ? pageNavVarMatch.length : 0;
                        triesLeft -= 1;
                        _d.label = 3;
                    case 3:
                        if (triesLeft > 0 && (numBodyVars > 1 || numPageNavVars > 1)) return [3 /*break*/, 1];
                        _d.label = 4;
                    case 4:
                        if (triesLeft === 0) {
                            logger.error("Layout " + this.sourceFilePath + " uses more than one {{ " + LAYOUT_PAGE_BODY_VARIABLE + " }} or {{ " + LAYOUT_PAGE_NAV_VARIABLE + " }} variable.");
                            return [2 /*return*/];
                        }
                        this.hasPageNav = numPageNavVars === 1;
                        this.headTop = nodeProcessor.headTop;
                        this.headBottom = nodeProcessor.headBottom;
                        this.scriptBottom = nodeProcessor.scriptBottom;
                        pageSources.addAllToSet(this.includedFiles);
                        return [4 /*yield*/, this.config.externalManager.generateDependencies(pageSources.getDynamicIncludeSrc(), this.includedFiles)];
                    case 5:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Layout.prototype.insertPage = function (pageContent, pageNav, pageIncludedFiles) {
        this.includedFiles.forEach(function (filePath) { return pageIncludedFiles.add(filePath); });
        // Use function for .replace, in case string contains special patterns (e.g. $$, $&, $1, ...)
        return this.layoutProcessed
            .replace(this.layoutPageBodyVariable, function () { return pageContent; })
            .replace(this.layoutPageNavVariable, function () { return pageNav; });
    };
    Layout.prototype.getPageNjkAssets = function () {
        return {
            headTop: this.headTop,
            headBottom: this.headBottom,
            scriptBottom: this.scriptBottom,
        };
    };
    return Layout;
}());
module.exports = {
    Layout: Layout,
};
