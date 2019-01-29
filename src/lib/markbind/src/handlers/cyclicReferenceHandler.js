const CYCLIC_REFERENCE_ERROR_MESSAGE = 'Cyclic reference detected.';

class CyclicReferenceError extends Error {
  constructor() {
    super(CYCLIC_REFERENCE_ERROR_MESSAGE);
    this.fileStack = [];
  }

  addFileToStack(filePath) {
    if (this.fileStack.length < 5) {
      this.fileStack.push(filePath);
    }
  }

  toString() {
    return `${this.message} \nLast 5 files processed: ${'\n\t'}${this.fileStack.join('\n\t')}`;
  }
}

function handle(err, filePath) {
  if (err.message === 'Maximum call stack size exceeded') {
    const cyclicTrace = new CyclicReferenceError();
    cyclicTrace.addFileToStack(filePath);
    throw cyclicTrace;
  } else if (err instanceof CyclicReferenceError) {
    err.addFileToStack(filePath);
    throw err;
  } else {
    throw err;
  }
}

module.exports = {
  handle,
};
