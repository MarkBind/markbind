const MAX_RECURSIVE_DEPTH = 200;
const ERROR_MESSAGE = 'Cyclic reference detected.';

class CyclicReferenceError extends Error {
  static get MAX_RECURSIVE_DEPTH() {
    return MAX_RECURSIVE_DEPTH;
  }

  static get ERROR_MESSAGE() {
    return ERROR_MESSAGE;
  }

  constructor(callStack) {
    super();
    const fileStack = callStack.slice(Math.max(callStack.length - 5, 0));
    this.message = `${ERROR_MESSAGE}\n`
        + `Last 5 files processed:${'\n\t'}${fileStack.join('\n\t')}`;
  }
}
module.exports = CyclicReferenceError;
