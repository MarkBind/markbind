/**
 * Ambient module declarations for nunjucks internal sub-modules.
 *
 * These sub-modules (nunjucks/src/runtime, nunjucks/src/object) are not typed
 * by @types/nunjucks. This file declares them as ambient external modules
 * so they can be imported with type safety.
 *
 * IMPORTANT: This file must NOT have any top-level import/export statements,
 * otherwise the 'declare module' blocks become augmentations instead of
 * ambient declarations, and TypeScript will not recognize the sub-modules.
 *
 * Typed against nunjucks v3.2.4 (only the internals used by the patches).
 */

// ---------------------------------------------------------------------------
// Sub-module: nunjucks/src/runtime
// ---------------------------------------------------------------------------
declare module 'nunjucks/src/runtime.js' {

  export class Frame {
    variables: Record<string, any>;
    parent: Frame | null | undefined;
    topLevel: boolean;
    isolateWrites: boolean | undefined;

    /** Set of imported names — added by the MarkBind patch */
    imports?: Set<string>;

    constructor(parent?: Frame, isolateWrites?: boolean);

    /**
     * Set a variable in this frame.
     * @param name        Dot-separated variable name (e.g. "a.b.c")
     * @param val         Value to set
     * @param resolveUp   If true, walk up the frame chain and set on the first frame that owns the name
     * @param isImport    MarkBind patch extension — flags the variable as an import
     */
    set(name: string, val: any, resolveUp?: boolean, isImport?: boolean): void;

    /** Get a variable from this frame only (no parent walk). */
    get(name: string): any;

    /**
     * Look up a variable by walking the parent chain.
     * @param checkIfIsImport  MarkBind patch extension — returns undefined for imports
     */
    lookup(name: string, checkIfIsImport?: boolean): any;

    /** Resolve which frame owns a variable. */
    resolve(name: string, forWrite?: boolean): Frame | undefined;

    /** Create a child frame. */
    push(isolateWrites?: boolean): Frame;

    /** Return to the parent frame. */
    pop(): Frame | null | undefined;
  }

  /** Runtime variable resolution: checks frame chain, then context. */
  export function contextOrFrameLookup(context: any, frame: Frame, name: string): any;

  export function makeMacro(
    argNames: string[],
    kwargNames: string[],
    func: (...args: any[]) => any,
  ): (...args: any[]) => any;

  export function makeKeywordArgs(obj: Record<string, any>): Record<string, any>;
  export function numArgs(args: any[]): number;
  export function suppressValue(val: any, autoescape: boolean): string;
  export function ensureDefined(val: any, lineno: number, colno: number): any;
  export function memberLookup(obj: any, val: any): any;
  export function callWrap(obj: any, name: string, context: any, args: any[]): any;
  export function handleError(error: any, lineno: number | null, colno: number | null): Error;
  export function copySafeness(dest: any, target: any): any;
  export function markSafe(val: any): SafeString;
  export function asyncEach(arr: any[], dimen: number, iter: Function, cb: Function): void;
  export function asyncAll(arr: any[], dimen: number, func: Function, cb: Function): void;
  export function fromIterator(arr: any): any[];

  export const isArray: (obj: any) => obj is any[];
  export const keys: (obj: any) => string[];
  export const inOperator: (key: any, val: any) => boolean;

  export class SafeString extends String {
    constructor(val: string);
    val: string;
    length: number;
    valueOf(): string;
    toString(): string;
  }
}

// ---------------------------------------------------------------------------
// Sub-module: nunjucks/src/object
// ---------------------------------------------------------------------------
declare module 'nunjucks/src/object.js' {
  export class Obj {
    constructor(...args: any[]);

    /** Called by the constructor with all constructor arguments. Override in subclasses. */
    init(...args: any[]): void;

    /** Returns this.constructor.name */
    readonly typename: string;

    /** Create a subclass using nunjucks' custom OOP system. */
    static extend<T extends typeof Obj>(
      this: T,
      name: string,
      props?: Record<string, any>,
    ): T;
    static extend<T extends typeof Obj>(
      this: T,
      props: Record<string, any>,
    ): T;
  }

  export class EmitterObj extends Obj {
    on(name: string, func: (...args: any[]) => void): void;
    emit(name: string, ...args: any[]): void;
  }
}
