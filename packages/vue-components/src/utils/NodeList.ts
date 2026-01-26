// TODO: This custom NodeList implementation should be refactored or replaced with standard DOM APIs
// It has naming conflicts with the native NodeList and extensive use of 'any' types
// Consider using standard querySelectorAll and modern DOM APIs instead

/* eslint-disable @typescript-eslint/no-use-before-define */
// The code below has circular dependencies between the NodeList class and helper functions
// (flatten, NodeListJS, isNodeList). They reference each other, so we disable the
// no-use-before-define rule for this file.

const ArrayProto = Array.prototype;
const nodeError = new Error('Passed arguments must be of Node');
let blurEvent: ((e: Event) => void) | undefined;
let blurList: Array<{ el: any; callback: any }> = [];
let Events: Array<{ el: any; event: string; callback: any }> = [];

function isNode(val: any): boolean { return val instanceof window.Node; }

function splitWords(val: string): string[] {
  const trimmed = val.trim();
  return trimmed.length ? trimmed.replace(/\s+/, ' ').split(' ') : [];
}
function joinWords(val: string[]): string { return val.length ? val.join(' ') : ''; }

class NodeList {
  [key: string]: any;
  length: number;
  owner?: any;

  constructor(args: any) {
    let nodes = args;
    const firstArg = args[0];
    if (firstArg === window) {
      nodes = [window];
    } else if (typeof firstArg === 'string') { // eslint-disable-line lodash/prefer-lodash-typecheck
      nodes = (args[1] || document).querySelectorAll(firstArg);
      const secondArg = args[1];
      if (secondArg) { this.owner = secondArg; }
    } else if (0 in args && !isNode(firstArg) && firstArg && 'length' in firstArg) {
      const [firstItem, secondItem] = args;
      nodes = firstItem;
      if (secondItem) { this.owner = secondItem; }
    }
    if (nodes) {
      Object.keys(nodes).forEach((i) => {
        this[i] = nodes[i];
      });
      this.length = nodes.length;
    } else {
      this.length = 0;
    }
  }

  concat(...args: any[]) {
    const nodes = ArrayProto.slice.call(this);
    function flattenLocal(arr: any) {
      ArrayProto.forEach.call(arr, (el) => {
        if (isNode(el)) {
          // eslint-disable-next-line lodash/prefer-includes
          if (nodes.indexOf(el) === -1) nodes.push(el);
        } else if (isNodeList(el)) {
          flattenLocal(el);
        }
      });
    }
    ArrayProto.forEach.call(args, (arg) => {
      if (isNode(arg)) {
        // eslint-disable-next-line lodash/prefer-includes
        if (nodes.indexOf(arg) === -1) nodes.push(arg);
      } else if (isNodeList(arg)) {
        flattenLocal(arg);
      } else {
        const errorMsg = 'Concat arguments must be of a Node, NodeList, '
          + 'HTMLCollection, or Array of (Node, NodeList, HTMLCollection, Array)';
        throw Error(errorMsg);
      }
    });
    return NodeListJS(nodes, this);
  }

  delete() {
    const notRemoved = flatten(this).filter((el: any) => {
      if (el.remove) {
        el.remove();
      } else if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
      return document.body.contains(el);
    });
    if (notRemoved.length) {
      // eslint-disable-next-line no-console
      console.warn('NodeList: Some nodes could not be deleted.');
    }
    return notRemoved;
  }

  each(...args: any[]) {
    ArrayProto.forEach.apply(this, args as any);
    return this;
  }

  filter(...args: any[]) {
    return NodeListJS(ArrayProto.filter.apply(this, args as any), this);
  }

  find(element: any) {
    const nodes: any[] = [];
    flatten(this).forEach((node: any) => {
      ArrayProto.push.apply(nodes, node.querySelectorAll(element));
    });
    return flatten(nodes, this.owner);
  }

  findChildren(element?: string) {
    if (element) {
      return this.find(element).filter((el: any) => (
        this.includes(el.parentElement as any)
      ));
    }
    return flatten(this.map((el: any) => el.children), this.owner);
  }

  forEach(...args: any[]) {
    ArrayProto.forEach.apply(this, args as any);
    return this;
  }

  includes(element: any, index?: number) {
    // eslint-disable-next-line lodash/prefer-includes
    return this.indexOf(element, index) !== -1;
  }

  map(...args: any[]) {
    const mapped = ArrayProto.map.apply(this, args as any);
    const hasNodeOrList = mapped.some((el: any) => (isNode(el) || isNodeList(el)));
    return hasNodeOrList ? flatten(mapped, this) : mapped;
  }

  parent() {
    return flatten(this.map((el: any) => el.parentNode), this);
  }

  pop(amount: any) {
    let amountValue = amount;
    if (typeof amountValue !== 'number') { // eslint-disable-line lodash/prefer-lodash-typecheck
      amountValue = 1;
    }
    const nodes = [];
    const pop = ArrayProto.pop.bind(this);
    let remaining = amountValue;
    while (remaining > 0) {
      nodes.push(pop());
      remaining -= 1;
    }
    return NodeListJS(nodes, this);
  }

  push(...args: any[]) {
    ArrayProto.forEach.call(args, (arg: any) => {
      if (!isNode(arg)) throw nodeError;
      // eslint-disable-next-line lodash/prefer-includes
      if (this.indexOf(arg) === -1) ArrayProto.push.call(this, arg);
    });
    return this;
  }

  shift(amount: any) {
    let amountValue = amount;
    if (typeof amountValue !== 'number') { // eslint-disable-line lodash/prefer-lodash-typecheck
      amountValue = 1;
    }
    const nodes = [];
    let remaining = amountValue;
    while (remaining > 0) {
      nodes.push(ArrayProto.shift.call(this));
      remaining -= 1;
    }
    return nodes.length === 1 ? nodes[0] : NodeListJS(nodes, this);
  }

  slice(...args: any[]) {
    return NodeListJS(ArrayProto.slice.apply(this, args as any), this);
  }

  splice(...args: any[]) {
    for (let i = 2, l = args.length; i < l; i += 1) {
      if (!isNode(args[i])) throw nodeError;
    }
    ArrayProto.splice.apply(this, args as any);
    return this;
  }

  unshift(...args: any[]) {
    const unshift = ArrayProto.unshift.bind(this);
    ArrayProto.forEach.call(args, (arg: any) => {
      if (!isNode(arg)) throw nodeError;
      // eslint-disable-next-line lodash/prefer-includes
      if (this.indexOf(arg) === -1) unshift(arg);
    });
    return this;
  }

  addClass(classes: any) {
    return this.toggleClass(classes, true);
  }

  removeClass(classes: any) {
    return this.toggleClass(classes, false);
  }

  toggleClass(classes: any, value: any) {
    let method: string;
    // eslint-disable-next-line lodash/prefer-is-nil
    if (value === undefined || value === null) {
      method = 'toggle';
    } else {
      method = value ? 'add' : 'remove';
    }
    let classList = classes;
    if (typeof classList === 'string') { // eslint-disable-line lodash/prefer-lodash-typecheck
      classList = splitWords(classList);
    }
    this.each((el: any) => {
      let list: string[] | string = splitWords(el.className);
      classList.forEach((c: any) => {
        // eslint-disable-next-line lodash/prefer-includes
        const hasClass = list.indexOf(c) !== -1;
        if (!hasClass && method !== 'remove') (list as string[]).push(c);
        if (hasClass && method !== 'remove') {
          list = (list as string[]).filter(item => (item !== c));
        }
      });
      const finalList = joinWords(list as string[]);
      if (!finalList) el.removeAttribute('class');
      else el.className = finalList; // eslint-disable-line no-param-reassign
    });
    return this;
  }

  get(prop: any) {
    const arr: any[] = [];
    this.each((el: any) => {
      let value = el;
      if (value !== null) { value = value[prop]; }
      arr.push(value);
    });
    return flatten(arr, this);
  }

  set(prop: any, value: any) {
    if (prop.constructor === Object) {
      this.each((el: any) => {
        if (el) {
          Object.keys(prop).forEach((key) => {
            // eslint-disable-next-line no-param-reassign
            if (key in el) { el[key] = prop[key]; }
          });
        }
      });
    } else {
      this.each((el: any) => {
        // eslint-disable-next-line no-param-reassign
        if (prop in el) { el[prop] = value; }
      });
    }
    return this;
  }

  call(...args: any[]) {
    const method = ArrayProto.shift.call(args);
    const arr: any[] = [];
    let returnThis = true;
    this.each((el: any) => {
      let value = el;
      // eslint-disable-next-line lodash/prefer-lodash-typecheck
      if (value && value[method] instanceof Function) {
        value = value[method](...args);
        arr.push(value);
        if (returnThis && value !== undefined) {
          returnThis = false;
        }
      } else {
        arr.push(undefined);
      }
    });
    return returnThis ? this : flatten(arr, this);
  }

  item(index: any) {
    return NodeListJS([this[index]], this);
  }

  get asArray() {
    return ArrayProto.slice.call(this);
  }

  // event handlers
  on(events: any, selector: any, callback: any) {
    let eventList = events;
    // eslint-disable-next-line lodash/prefer-lodash-typecheck
    if (typeof eventList === 'string') { eventList = splitWords(eventList); }
    if (!this || !this.length) return this;
    let callbackFn = callback;
    let selectorValue = selector;
    if (callbackFn === undefined) {
      callbackFn = selectorValue;
      selectorValue = null;
    }
    if (!callbackFn) return this;
    const fn = callbackFn;
    const finalCallback = selectorValue ? function (this: any, e: any) {
      const els = NodeListJS(selectorValue, this);
      if (!els.length) { return; }
      els.some((el: any) => {
        const target = el.contains(e.target);
        if (target) fn.call(el, e, el);
        return target;
      });
    } : function (this: any, e: any) {
      fn.apply(this, [e, this]);
    };
    this.each((el: any) => {
      eventList.forEach((event: any) => {
        if (el === window || isNode(el)) {
          el.addEventListener(event, finalCallback, false);
          Events.push({
            el,
            event,
            callback: finalCallback,
          });
        }
      });
    });
    return this;
  }

  off(events: any, callback: any) {
    let callbackValue = callback;
    let eventList = events;
    // eslint-disable-next-line lodash/prefer-lodash-typecheck
    if (eventList instanceof Function) {
      callbackValue = eventList;
      eventList = null;
    }
    let finalEvents: string[] | null = null;
    // eslint-disable-next-line lodash/prefer-lodash-typecheck
    if (eventList instanceof Array) {
      finalEvents = eventList;
    // eslint-disable-next-line lodash/prefer-lodash-typecheck
    } else if (typeof eventList === 'string') {
      finalEvents = splitWords(eventList);
    }
    this.each((el: any) => {
      Events = Events.filter((e) => {
        const matchesCallback = !callbackValue || callbackValue === e.callback;
        // eslint-disable-next-line lodash/prefer-includes
        const matchesEvent = !finalEvents || finalEvents.indexOf(e.event) !== -1;
        if (e && e.el === el && matchesCallback && matchesEvent) {
          e.el.removeEventListener(e.event, e.callback);
          return false;
        }
        return true;
      });
    });
    return this;
  }

  onBlur(callback: any, enableTriggerByTouchStart = true) {
    if (!this || !this.length) return this;
    if (!callback) return this;
    this.each((el: any) => { blurList.push({ el, callback }); });
    if (!blurEvent) {
      blurEvent = (e: any) => {
        blurList.forEach((item) => {
          if (!item.el) return;
          const target = item.el.contains(e.target) || item.el === e.target;
          if (!target) item.callback.call(item.el, e, item.el);
        });
      };
      document.addEventListener('click', blurEvent, false);
      if (enableTriggerByTouchStart) {
        document.addEventListener('touchstart', blurEvent, false);
      }
    }
    return this;
  }

  offBlur(callback: any) {
    this.each((el: any) => {
      blurList = blurList.filter((blur) => {
        const matches = blur && blur.el === el && (!callback || blur.callback === callback);
        if (matches) {
          return false;
        }
        return true;
      });
    });
    return this;
  }
}

const NL = NodeList.prototype;

// eslint-disable-next-line lodash/prefer-lodash-typecheck
function isNodeList(val: any): boolean {
  return val instanceof window.NodeList
    || val instanceof NodeList
    || val instanceof window.HTMLCollection
    // eslint-disable-next-line lodash/prefer-lodash-typecheck
    || val instanceof Array;
}

function NodeListJS(...args: any[]): NodeList { return new NodeList(args); }

function flatten(arr: any, owner?: any): NodeList {
  const list: any[] = [];
  ArrayProto.forEach.call(arr, (el: any) => {
    if (isNode(el)) {
      // eslint-disable-next-line lodash/prefer-includes
      if (list.indexOf(el) === -1) list.push(el);
    } else if (isNodeList(el)) {
      Object.keys(el).forEach((id) => {
        list.push(el[id]);
      });
    } else if (el !== null) {
      arr.get = NL.get;
      arr.set = NL.set;
      arr.call = NL.call;
      arr.owner = owner;
    }
  });
  return NodeListJS(list, owner);
}

Object.getOwnPropertyNames(ArrayProto).forEach((key) => {
  const nlHasKey = (NL as any)[key] !== undefined;
  if (key !== 'join' && key !== 'copyWithin' && key !== 'fill' && !nlHasKey) {
    (NL as any)[key] = (ArrayProto as any)[key];
  }
});
if (window && window.Symbol && Symbol.iterator) {
  const arrayIterator = (ArrayProto as any)[Symbol.iterator];
  (NL as any)[Symbol.iterator] = arrayIterator;
  (NL as any).values = arrayIterator;
}
const div = document && document.createElement('div');
function setterGetter(prop: any) {
  if ((NL as any)[prop]) return;
  // eslint-disable-next-line lodash/prefer-lodash-typecheck
  if ((div as any)[prop] instanceof Function) {
    (NL as any)[prop] = function (this: any, ...args: any[]) {
      const arr: any[] = [];
      let returnThis = true;
      Object.keys(NL).forEach((i) => {
        let el: any = (NL as any)[i];
        // eslint-disable-next-line lodash/prefer-lodash-typecheck
        if (el && el[prop] instanceof Function) {
          el = el[prop](...args);
          arr.push(el);
          if (returnThis && el !== undefined) {
            returnThis = false;
          }
        } else {
          arr.push(undefined);
        }
      });
      return returnThis ? this : flatten(arr, this);
    };
  } else {
    Object.defineProperty(NL, prop, {
      get(this: any) {
        const arr: any[] = [];
        this.each((el: any) => {
          let value = el;
          if (value !== null) { value = value[prop]; }
          arr.push(value);
        });
        return flatten(arr, this);
      },
      set(this: any, value: any) {
        this.each((el: any) => {
          // eslint-disable-next-line no-param-reassign
          if (el && prop in el) { el[prop] = value; }
        });
      },
    });
  }
}
Object.keys(div).forEach((prop) => {
  setterGetter(prop);
});

if (window) {
  (window as any).NL = NodeListJS;
}

export default NodeListJS;
