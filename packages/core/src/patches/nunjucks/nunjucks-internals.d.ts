/**
 * Module augmentations for nunjucks internals used by MarkBind patches.
 *
 * @types/nunjucks only covers the public API surface. These patches need access
 * to internal classes (Frame, Compiler, Context, Obj) and sub-modules
 * (nunjucks/src/runtime, nunjucks/src/object) that are not typed.
 *
 * Typed against nunjucks v3.2.4 (runtime internals used by the patches only).
 */

// This export makes the file a module, turning 'declare module' blocks below
// into module augmentations (merged with existing declarations) rather than
// ambient module declarations (which would replace existing declarations).
export { };

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

  /** Allow reassignment of Frame for patches - MarkBind patch extension */
  export let Frame: typeof Frame;

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

// ---------------------------------------------------------------------------
// Augment the main 'nunjucks' module with internal properties & sub-modules
// ---------------------------------------------------------------------------
declare module 'nunjucks' {
  import { Frame } from 'nunjucks/src/runtime.js';
  import { Obj } from 'nunjucks/src/object.js';

  // ---- lib namespace additions ----
  namespace lib {
    function isFunction(obj: any): obj is Function;
    function extend(obj1: any, ...objs: any[]): any;
    function keys(obj: any): string[];
    function indexOf<T>(arr: T[], item: T): number;
    function asyncIter(
      arr: any[],
      iter: (item: any, index: number, next: () => void, done: (err?: any, result?: any) => void) => void,
      cb: (err?: any, result?: any) => void,
    ): void;
    function _prettifyError(path: string | null, withInternals: boolean, err: Error): Error;
    function inOperator(key: any, val: any): boolean;
    function isArray(obj: any): obj is any[];
  }

  // ---- nodes namespace (AST node types used by the patches) ----
  namespace nodes {
    class Node {
      lineno: number;
      colno: number;
      fields: string[];
      findAll<T extends Node>(type: new (...args: any[]) => T, results?: T[]): T[];
      iterFields(func: (node: any, fieldName: string) => void): void;
    }

    class Value extends Node {
      value: any;
    }

    class Symbol extends Value {
      value: string;
    }

    class NodeList extends Node {
      children: Node[];
      addChild(node: Node): void;
    }

    class Pair extends Node {
      key: Value;
      value: Value;
    }

    class Dict extends NodeList {
      children: Pair[];
    }

    class Block extends Node {
      name: Value;
      body: NodeList;
    }

    class Import extends Node {
      template: Node;
      target: Value;
      withContext: boolean;
    }

    class FromImport extends Node {
      template: Node;
      names: NodeList;
      withContext: boolean;
    }

    class Macro extends Node {
      name: Value;
      args: NodeList;
      body: NodeList;
    }
  }

  // ---- compiler namespace ----
  namespace compiler {
    function compile(
      src: string,
      asyncFilters: string[],
      extensions: any[],
      name: string,
      opts?: { throwOnUndefined?: boolean },
    ): string;

    class Compiler {
      templateName: string;
      codebuf: string[];
      lastId: number;
      buffer: string | null;
      bufferStack: string[];
      inBlock: boolean;
      throwOnUndefined: boolean;

      init(templateName: string, throwOnUndefined?: boolean): void;
      compile(node: nodes.Node, frame?: Frame): void;
      getCode(): string;
      fail(msg: string, lineno?: number, colno?: number): never;
      assertType(node: nodes.Node, type: Function): void;

      // Code emission
      _emit(code: string): void;
      _emitLine(code: string): void;
      _emitLines(...lines: string[]): void;
      _emitFuncBegin(node: nodes.Node, name: string): void;
      _emitFuncEnd(noReturn?: boolean): void;

      // Scope & buffer management
      _addScopeLevel(): void;
      _tmpid(): string;
      _makeCallback(id: string): string;
      _pushBuffer(): string;
      _popBuffer(): void;
      _withScopedSyntax(func: () => void): void;

      // Compilation helpers
      _compileExpression(node: nodes.Node, frame: Frame): void;
      _compileChildren(node: nodes.Node, frame: Frame): void;
      _compileGetTemplate(
        node: nodes.Node,
        frame: Frame,
        eagerCompile: boolean,
        ignoreMissing: boolean,
      ): string;

      // Methods patched by MarkBind
      compileSymbol(node: nodes.Symbol, frame: Frame): void;
      compileImport(node: nodes.Import, frame: Frame): void;
      compileFromImport(node: nodes.FromImport, frame: Frame): void;
      compileRoot(node: nodes.Node, frame: Frame | undefined): void;
      _compileMacro(node: nodes.Macro, frame: Frame | undefined): string;
    }
  }

  // ---- Environment additions (internal properties) ----
  interface Environment {
    loaders: Array<{
      cache: Record<string, Template>;
      pathsToNames: Record<string, string>;
      noCache: boolean;
      async?: boolean;
      getSource(name: string, cb?: Function): any;
      resolve?(from: string, to: string): string;
    }>;
    globals: Record<string, any>;
    opts: ConfigureOptions & { dev?: boolean };

    resolveTemplate(
      loader: any,
      parentName: string | null,
      name: string,
    ): string;

    getTemplate(
      name: string | Template,
      eagerCompile?: boolean | Function,
      parentName?: string | null | Function,
      ignoreMissing?: boolean | Function,
      cb?: (err: Error | null, tmpl?: Template) => void,
    ): Template | undefined;
  }

  // ---- Template additions (internal properties) ----
  interface Template {
    env: Environment;
    path: string;
    blocks: Record<string, Function[]>;
    rootRenderFunc: (
      env: Environment,
      context: any,
      frame: Frame,
      runtime: typeof import('nunjucks/src/runtime.js'),
      cb: (err: Error | null, res?: string) => void,
    ) => void;

    compile(): void;
  }
}
