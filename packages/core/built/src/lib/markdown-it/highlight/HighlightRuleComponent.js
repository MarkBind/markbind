var LINESLICE_REGEX = new RegExp('(\\d+)\\[(\\d*):(\\d*)]');
var HighlightRuleComponent = /** @class */ (function () {
    function HighlightRuleComponent(lineNumber, isSlice, bounds) {
        this.lineNumber = lineNumber;
        this.isSlice = isSlice || false;
        this.bounds = bounds || [];
    }
    HighlightRuleComponent.parseRuleComponent = function (compString) {
        // tries to match with the line slice pattern
        var matches = compString.match(LINESLICE_REGEX);
        if (matches) {
            var groups = matches.slice(1); // keep the capturing group matches only
            var lineNumber_1 = parseInt(groups.shift(), 10);
            var isUnbounded = groups.every(function (x) { return x === ''; });
            if (isUnbounded) {
                return new HighlightRuleComponent(lineNumber_1, true);
            }
            var bounds = groups.map(function (x) { return x !== '' ? parseInt(x, 10) : -1; });
            return new HighlightRuleComponent(lineNumber_1, true, bounds);
        }
        // match fails, so it is just line numbers
        var lineNumber = parseInt(compString, 10);
        return new HighlightRuleComponent(lineNumber);
    };
    HighlightRuleComponent.prototype.offsetLineNumber = function (offset) {
        this.lineNumber += offset;
    };
    /**
     * Compares the component's line number to a given line number.
     *
     * @param lineNumber The line number to compare
     * @returns {number} A negative number, zero, or a positive number when the given line number
     *  is after, at, or before the component's line number
     */
    HighlightRuleComponent.prototype.compareLine = function (lineNumber) {
        return this.lineNumber - lineNumber;
    };
    HighlightRuleComponent.prototype.isUnboundedSlice = function () {
        return this.isSlice && this.bounds.length === 0;
    };
    return HighlightRuleComponent;
}());
module.exports = {
    HighlightRuleComponent: HighlightRuleComponent
};
