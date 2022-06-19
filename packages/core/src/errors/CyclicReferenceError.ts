class CyclicReferenceError extends Error {
  static MAX_RECURSIVE_DEPTH = 100;

  constructor(callStack: string[]) {
    super();
    const fileStack = callStack.slice(Math.max(callStack.length - 5, 0));
    this.message = 'Cyclic reference detected.\n'
        + `Last 5 files processed:${'\n\t'}${fileStack.join('\n\t')}`;
  }
}

export = CyclicReferenceError;
