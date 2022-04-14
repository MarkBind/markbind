class CyclicReferenceError extends Error {
  constructor(callStack) {
    super();
    const fileStack = callStack.slice(Math.max(callStack.length - 5, 0));
    this.message = 'Cyclic reference detected.\n'
        + `Last 5 files processed:${'\n\t'}${fileStack.join('\n\t')}`;
  }
}
CyclicReferenceError.MAX_RECURSIVE_DEPTH = 200;
module.exports = CyclicReferenceError;
