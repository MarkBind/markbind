var CyclicReferenceError = require('../errors/CyclicReferenceError');
var Context = /** @class */ (function () {
    function Context(cwf, callStack, variables) {
        /**
         * @type {string}
         */
        this.cwf = cwf;
        /**
         * Array of cwfs file paths processed so far
         * @type {Array<string>}
         */
        this.callStack = callStack;
        /**
         * @type {Object}
         */
        this.variables = variables;
    }
    Context.prototype.addCwfToCallstack = function (cwf) {
        this.callStack.push(cwf);
    };
    Context.prototype.hasExceededMaxCallstackSize = function () {
        return this.callStack.length > CyclicReferenceError.MAX_RECURSIVE_DEPTH;
    };
    Context.prototype.clone = function () {
        return new Context(this.cwf, this.callStack.map(function (cwf) { return cwf; }), this.variables);
    };
    return Context;
}());
module.exports = {
    Context: Context,
};
