var HighlightRuleComponent = require('./HighlightRuleComponent.js').HighlightRuleComponent;
var HighlightRule = /** @class */ (function () {
    function HighlightRule(ruleComponents) {
        /**
         * @type Array<HighlightRuleComponent>
         */
        this.ruleComponents = ruleComponents;
    }
    HighlightRule.parseRule = function (ruleString) {
        var components = ruleString.split('-').map(HighlightRuleComponent.parseRuleComponent);
        return new HighlightRule(components);
    };
    HighlightRule.prototype.offsetLines = function (offset) {
        this.ruleComponents.forEach(function (comp) { return comp.offsetLineNumber(offset); });
    };
    HighlightRule.prototype.shouldApplyHighlight = function (lineNumber) {
        var compares = this.ruleComponents.map(function (comp) { return comp.compareLine(lineNumber); });
        if (this.isLineRange()) {
            var withinRangeStart = compares[0] <= 0;
            var withinRangeEnd = compares[1] >= 0;
            return withinRangeStart && withinRangeEnd;
        }
        var atLineNumber = compares[0] === 0;
        return atLineNumber;
    };
    HighlightRule.prototype.applyHighlight = function (line) {
        var isLineSlice = this.ruleComponents.length === 1 && this.ruleComponents[0].isSlice;
        if (this.isLineRange()) {
            var shouldWholeLine = this.ruleComponents.some(function (comp) { return comp.isUnboundedSlice(); });
            return shouldWholeLine
                ? HighlightRule._highlightWholeLine(line)
                : HighlightRule._highlightTextOnly(line);
        }
        if (isLineSlice) {
            // TODO: Implement slice-index based highlighting
            return HighlightRule._highlightWholeLine(line);
        }
        return HighlightRule._highlightTextOnly(line);
    };
    HighlightRule._highlightWholeLine = function (codeStr) {
        return "<span class=\"highlighted\">" + codeStr + "\n</span>";
    };
    HighlightRule._splitCodeAndIndentation = function (codeStr) {
        var codeStartIdx = codeStr.search(/\S|$/);
        var indents = codeStr.substr(0, codeStartIdx);
        var content = codeStr.substr(codeStartIdx);
        return [indents, content];
    };
    HighlightRule._highlightTextOnly = function (codeStr) {
        var _a = HighlightRule._splitCodeAndIndentation(codeStr), indents = _a[0], content = _a[1];
        return "<span>" + indents + "<span class=\"highlighted\">" + content + "</span>\n</span>";
    };
    HighlightRule.prototype.isLineRange = function () {
        return this.ruleComponents.length === 2;
    };
    return HighlightRule;
}());
module.exports = {
    HighlightRule: HighlightRule
};
