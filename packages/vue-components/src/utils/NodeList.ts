/* eslint-disable @typescript-eslint/no-explicit-any */

const ArrayProto = Array.prototype;
const nodeError = new Error('Passed arguments must be of Node');
let blurEvent: ((e: Event) => void) | undefined;
let blurList: { el: any; callback: Function }[] = [];
let Events: { el: any; event: string; callback: EventListener }[] = [];

function isNode(val: any): val is Node { return val instanceof window.Node; }
function isNodeList(val: any): boolean {
  return val instanceof window.NodeList
    || val instanceof NodeList
    || val instanceof window.HTMLCollection
    || val instanceof Array;
}

function splitWords(val: string): string[] {
  val = val.trim();
  return val.length ? val.replace(/\s+/, ' ').split(' ') : [];
}
function joinWords(val: string[]): string { return val.length ? val.join(' ') : ''; }

interface EventRecord {
  el: any;
  event: string;
  callback: EventListener;
}

class NodeList {
  [index: number]: any;
  length: number;
  owner?: any;

  // Dynamically added from Array.prototype at the bottom of this file
  indexOf!: (searchElement: any, fromIndex?: number) => number;
  some!: (predicate: (value: any, index: number, array: any[]) => unknown) => boolean;

  constructor(args: any[]) {
    let nodes: any = args;
    if (args[0] === window) {
      nodes = [window];
    } else if (typeof args[0] === 'string') {
      nodes = (args[1] || document).querySelectorAll(args[0]);
      if (args[1]) { this.owner = args[1]; }
    } else if (0 in args && !isNode(args[0]) && args[0] && 'length' in args[0]) {
      nodes = args[0];
      if (args[1]) { this.owner = args[1]; }
    }
    if (nodes) {
      for (const i in nodes) {
        (this as any)[i] = nodes[i];
      }
      this.length = nodes.length;
    } else {
      this.length = 0;
    }
  }

  concat(...args: any[]): NodeList {
    const nodes: any[] = ArrayProto.slice.call(this);
    function flattenInner(arr: any): void {
      ArrayProto.forEach.call(arr, (el: any) => {
        if (isNode(el)) {
          if (!~nodes.indexOf(el)) nodes.push(el);
        } else if (isNodeList(el)) {
          flattenInner(el);
        }
      });
    }
    ArrayProto.forEach.call(args, (arg: any) => {
      if (isNode(arg)) {
        if (!~nodes.indexOf(arg)) nodes.push(arg);
      } else if (isNodeList(arg)) {
        flattenInner(arg);
      } else {
        throw Error(
          'Concat arguments must be of a Node, NodeList, HTMLCollection, '
          + 'or Array of (Node, NodeList, HTMLCollection, Array)',
        );
      }
    });
    return NodeListJS(nodes, this);
  }
  delete(): any[] {
    const notRemoved = flatten(this).filter((el: any) => {
      if (el.remove) {
        el.remove();
      } else if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
      return document.body.contains(el);
    });
    if (notRemoved.length) console.warn('NodeList: Some nodes could not be deleted.');
    return notRemoved;
  }
  each(...args: any[]): this {
    ArrayProto.forEach.apply(this, args as any);
    return this;
  }
  filter(...args: any[]): NodeList {
    return NodeListJS(ArrayProto.filter.apply(this, args as any), this);
  }
  find(element: string): NodeList {
    const nodes: any[] = [];
    flatten(this).forEach((node: any) => {
      ArrayProto.push.apply(nodes, node.querySelectorAll(element));
    });
    return flatten(nodes, this.owner);
  }
  findChildren(element?: string): NodeList {
    if (element) return this.find(element).filter((el: any) => this.includes(el.parentElement));
    return flatten(this.map((el: any) => el.children));
  }
  forEach(...args: any[]): this {
    ArrayProto.forEach.apply(this, args as any);
    return this;
  }
  includes(element: any, index?: number): boolean {
    return !!~(this as any).indexOf(element, index);
  }
  map(...args: any[]): any {
    const mapped = ArrayProto.map.apply(this, args as any);
    return mapped.some((el: any) => (isNode(el) || isNodeList(el)))
      ? flatten(mapped, this)
      : mapped;
  }
  parent(): NodeList {
    return flatten(this.map((el: any) => el.parentNode), this);
  }
  pop(amount?: number): NodeList {
    if (typeof amount !== 'number') { amount = 1; }
    const nodes: any[] = [];
    const pop = ArrayProto.pop.bind(this);
    while (amount--) nodes.push(pop());
    return NodeListJS(nodes, this);
  }
  push(...args: any[]): this {
    ArrayProto.forEach.call(args, (arg: any) => {
      if (!isNode(arg)) throw nodeError;
      if (!~(this as any).indexOf(arg)) ArrayProto.push.call(this, arg);
    });
    return this;
  }
  shift(amount?: number): any {
    if (typeof amount !== 'number') { amount = 1; }
    const nodes: any[] = [];
    while (amount--) nodes.push(ArrayProto.shift.call(this));
    return nodes.length === 1 ? nodes[0] : NodeListJS(nodes, this);
  }
  slice(...args: any[]): NodeList {
    return NodeListJS(ArrayProto.slice.apply(this, args as any), this);
  }
  splice(...args: any[]): this {
    for (let i = 2, l = args.length; i < l; i++) {
      if (!isNode(args[i])) throw nodeError;
    }
    ArrayProto.splice.apply(this, args as any);
    return this;
  }
  unshift(...args: any[]): this {
    const unshift = ArrayProto.unshift.bind(this);
    ArrayProto.forEach.call(args, (arg: any) => {
      if (!isNode(arg)) throw nodeError;
      if (!~(this as any).indexOf(arg)) unshift(arg);
    });
    return this;
  }

  addClass(classes: string | string[]): this {
    return this.toggleClass(classes, true);
  }
  removeClass(classes: string | string[]): this {
    return this.toggleClass(classes, false);
  }
  toggleClass(classes: string | string[], value?: boolean | null): this {
    const method = (value === undefined || value === null) ? 'toggle' : value ? 'add' : 'remove';
    if (typeof classes === 'string') {
      classes = splitWords(classes);
    }
    this.each((el: any) => {
      let list: string[] = splitWords(el.className);
      classes.forEach((c: string) => {
        const hasClass = !!~list.indexOf(c);
        if (!hasClass && method !== 'remove') list.push(c);
        if (hasClass && method !== 'add') { list = list.filter((item: string) => (item !== c)); }
      });
      const joined = joinWords(list);
      if (!joined) el.removeAttribute('class');
      else el.className = joined;
    });
    return this;
  }

  get(prop: string): any {
    const arr: any[] = [];
    this.each((el: any) => {
      if (el !== null) { el = el[prop]; }
      arr.push(el);
    });
    return flatten(arr, this);
  }
  set(prop: any, value?: any): this {
    if (prop.constructor === Object) {
      this.each((el: any) => {
        if (el) {
          for (const key in prop) {
            if (key in el) { el[key] = prop[key]; }
          }
        }
      });
    } else {
      this.each((el: any) => {
        if (prop in el) { el[prop] = value; }
      });
    }
    return this;
  }
  call(...args: any[]): any {
    const method: string = ArrayProto.shift.call(args);
    const arr: any[] = [];
    let returnThis = true;
    this.each((el: any) => {
      if (el && el[method] instanceof Function) {
        el = el[method].apply(el, args);
        arr.push(el);
        if (returnThis && el !== undefined) {
          returnThis = false;
        }
      } else {
        arr.push(undefined);
      }
    });
    return returnThis ? this : flatten(arr, this);
  }
  item(index: number): NodeList {
    return NodeListJS([(this as any)[index]], this);
  }
  get asArray(): any[] {
    return ArrayProto.slice.call(this);
  }

  // event handlers
  on(events: string | string[], selector: any, callback?: Function): this {
    if (typeof events === 'string') { events = splitWords(events); }
    if (!this || !this.length) return this;
    if (callback === undefined) {
      callback = selector;
      selector = null;
    }
    if (!callback) return this;
    const fn = callback;
    const wrappedCallback: EventListener = selector ? function (this: any, e: Event) {
      const els = NodeListJS(selector, this);
      if (!els.length) { return; }
      els.some((el: any) => {
        const target = el.contains(e.target);
        if (target) fn.call(el, e, el);
        return target;
      });
    } : function (this: any, e: Event) {
      fn.apply(this, [e, this]);
    };
    this.each((el: any) => {
      (events as string[]).forEach((event: string) => {
        if (el === window || isNode(el)) {
          el.addEventListener(event, wrappedCallback, false);
          Events.push({
            el,
            event,
            callback: wrappedCallback,
          });
        }
      });
    });
    return this;
  }
  off(events: string | string[] | Function | null, callback?: EventListener): this {
    if (events instanceof Function) {
      callback = events as unknown as EventListener;
      events = null;
    }
    const eventList: string[] | null = events instanceof Array
      ? events
      : typeof events === 'string'
        ? splitWords(events)
        : null;
    this.each((el: any) => {
      Events = Events.filter((e: EventRecord) => {
        if (e && e.el === el
            && (!callback || callback === e.callback)
            && (!eventList || ~eventList.indexOf(e.event))) {
          e.el.removeEventListener(e.event, e.callback);
          return false;
        }
        return true;
      });
    });
    return this;
  }
  onBlur(callback: Function, enableTriggerByTouchStart: boolean = true): this {
    if (!this || !this.length) return this;
    if (!callback) return this;
    this.each((el: any) => { blurList.push({ el, callback }); });
    if (!blurEvent) {
      blurEvent = (e: Event) => {
        blurList.forEach((item) => {
          if (!item.el) return;
          const target = item.el.contains(e.target) || item.el === e.target;
          if (!target) item.callback.call(item.el, e, item.el);
        });
      };
      document.addEventListener('click', blurEvent, false);
      if (enableTriggerByTouchStart) document.addEventListener('touchstart', blurEvent, false);
    }
    return this;
  }
  offBlur(callback?: Function): this {
    this.each((el: any) => {
      blurList = blurList.filter((blur) => {
        if (blur && blur.el === el && (!callback || blur.callback === callback)) {
          return false;
        }
        return true;
      });
    });
    return this;
  }
}

const NL: any = NodeList.prototype;

function flatten(arr: any, owner?: any): any {
  const list: any[] = [];
  ArrayProto.forEach.call(arr, (el: any) => {
    if (isNode(el)) {
      if (!~list.indexOf(el)) list.push(el);
    } else if (isNodeList(el)) {
      for (const id in el) list.push(el[id]);
    } else if (el !== null) {
      arr.get = NL.get;
      arr.set = NL.set;
      arr.call = NL.call;
      arr.owner = owner;
      return arr;
    }
  });
  return NodeListJS(list, owner);
}

Object.getOwnPropertyNames(ArrayProto).forEach((key: string) => {
  if (key !== 'join' && key !== 'copyWithin' && key !== 'fill' && NL[key] === undefined) {
    NL[key] = (ArrayProto as any)[key];
  }
});
if (window && window.Symbol && Symbol.iterator) {
  NL[Symbol.iterator] = NL.values = ArrayProto[Symbol.iterator];
}
const div: HTMLDivElement | null = document && document.createElement('div');
function setterGetter(prop: string): void {
  if (NL[prop]) return;
  if ((div as any)[prop] instanceof Function) {
    NL[prop] = (...args: any[]) => {
      const arr: any[] = [];
      let returnThis = true;
      for (const i in NL) {
        let el = NL[i];
        if (el && el[prop] instanceof Function) {
          el = el[prop].apply(el, args);
          arr.push(el);
          if (returnThis && el !== undefined) {
            returnThis = false;
          }
        } else {
          arr.push(undefined);
        }
      }
      return returnThis ? NL : flatten(arr, NL);
    };
  } else {
    Object.defineProperty(NL, prop, {
      get() {
        const arr: any[] = [];
        this.each((el: any) => {
          if (el !== null) { el = el[prop]; }
          arr.push(el);
        });
        return flatten(arr, this);
      },
      set(value: any) {
        this.each((el: any) => {
          if (el && prop in el) { el[prop] = value; }
        });
      },
    });
  }
}
if (div) {
  for (const prop in div) setterGetter(prop);
}

function NodeListJS(...args: any[]): NodeList { return new NodeList(args); }

if (window) {
  (window as any).NL = NodeListJS;
}

export default NodeListJS;
