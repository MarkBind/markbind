import CyclicReferenceError from '../errors/CyclicReferenceError';

export class Context {
  constructor(
    public cwf: string,
    /**
     * Array of cwfs file paths processed so far
     */
    public callStack: string[],
    public variables: Record<string, string>,
    public processingOptions: { omitFrontmatter?: boolean } = {},
  ) {}

  addCwfToCallstack(cwf: string) {
    this.callStack.push(cwf);
  }

  hasExceededMaxCallstackSize() {
    return this.callStack.length > CyclicReferenceError.MAX_RECURSIVE_DEPTH;
  }

  clone() {
    return new Context(this.cwf, this.callStack.map(cwf => cwf), this.variables, this.processingOptions);
  }
}
