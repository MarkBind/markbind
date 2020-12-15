var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CyclicReferenceError = /** @class */ (function (_super) {
    __extends(CyclicReferenceError, _super);
    function CyclicReferenceError(callStack) {
        var _this = _super.call(this) || this;
        var fileStack = callStack.slice(Math.max(callStack.length - 5, 0));
        _this.message = 'Cyclic reference detected.\n'
            + ("Last 5 files processed:" + '\n\t' + fileStack.join('\n\t'));
        return _this;
    }
    return CyclicReferenceError;
}(Error));
CyclicReferenceError.MAX_RECURSIVE_DEPTH = 200;
module.exports = CyclicReferenceError;
