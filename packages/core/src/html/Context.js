const CyclicReferenceError = require('../errors/CyclicReferenceError');

class Context {
  constructor(cwf, callStack, variables) {
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

  addCwfToCallstack(cwf) {
    this.callStack.push(cwf);
  }

  hasExceededMaxCallstackSize() {
    return this.callStack.length > CyclicReferenceError.MAX_RECURSIVE_DEPTH;
  }

  clone() {
    return new Context(this.cwf, this.callStack.map(cwf => cwf), this.variables);
  }
}

module.exports = {
  Context,
};
