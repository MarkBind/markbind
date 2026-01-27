// coerce convert som types of data into another type
export const coerce = {
  // Convert a string to boolean. Otherwise, return the value without modification,
  // so if is not boolean, Vue throw a warning.
  // eslint-disable-next-line lodash/prefer-lodash-typecheck
  boolean: (val: unknown): boolean | unknown => {
    // eslint-disable-next-line lodash/prefer-lodash-typecheck
    if (typeof val !== 'string') {
      return val;
    }
    if (val === '' || val === 'true') {
      return true;
    }
    if (val === 'false' || val === 'null' || val === 'undefined') {
      return false;
    }
    return val;
  },
  // Attempt to convert a string value to a Number. Otherwise, return 0.
  // eslint-disable-next-line lodash/prefer-lodash-typecheck
  number: (val: unknown, alt: number | null = null): number | null => {
    // eslint-disable-next-line lodash/prefer-lodash-typecheck
    if (typeof val === 'number') {
      return val;
    }
    // eslint-disable-next-line lodash/prefer-is-nil
    if (val === undefined || val === null || Number.isNaN(Number(val))) {
      return alt;
    }
    return Number(val);
  },
  // Attempt to convert to string any value, except for null or undefined.
  string: (val: unknown): string => (
    // eslint-disable-next-line lodash/prefer-is-nil
    val === undefined || val === null ? '' : `${val}`
  ),
  // Pattern accept RegExp, function, or string (converted to RegExp).
  // Otherwise return null.
  // eslint-disable-next-line lodash/prefer-lodash-typecheck
  pattern: (val: unknown): RegExp | Function | null => {
    // eslint-disable-next-line lodash/prefer-lodash-typecheck
    if (val instanceof Function || val instanceof RegExp) {
      return val;
    }
    // eslint-disable-next-line lodash/prefer-lodash-typecheck
    if (typeof val === 'string') {
      return new RegExp(val);
    }
    return null;
  },
};

export function toBoolean(val: unknown): boolean | unknown {
  // eslint-disable-next-line lodash/prefer-lodash-typecheck
  if (typeof val !== 'string') {
    return val;
  }
  if (val === '' || val === 'true') {
    return true;
  }
  if (val === 'false' || val === 'null' || val === 'undefined') {
    return false;
  }
  return val;
}

export function toNumber(val: unknown): number | null {
  // eslint-disable-next-line lodash/prefer-lodash-typecheck
  if (typeof val === 'number') {
    return val;
  }
  // eslint-disable-next-line lodash/prefer-is-nil
  if (val === undefined || val === null || Number.isNaN(Number(val))) {
    return null;
  }
  return Number(val);
}

// TODO: This custom Promise-like implementation is deprecated.
// Consider replacing with native fetch() API for modern browsers.
type PromiseLike = {
  then(
    fn1: (value: unknown) => unknown,
    fn2?: (error: unknown) => unknown
  ): PromiseLike;
  catch(fn: (error: unknown) => unknown): PromiseLike;
  always(fn: () => unknown): PromiseLike;
  done(fn: (value: unknown) => unknown): PromiseLike;
  fail(fn: (error: unknown) => unknown): PromiseLike;
};

export function getJSON(url: string): PromiseLike {
  const request = new window.XMLHttpRequest();
  const data: Record<string, Array<(value: unknown) => unknown>> = {};
  // p (-simulated- promise)
  const p: PromiseLike = {
    then(
      fn1: (value: unknown) => unknown,
      fn2?: (error: unknown) => unknown,
    ) {
      return p.done(fn1).fail(fn2 || (() => {}));
    },
    catch(fn: (error: unknown) => unknown) {
      return p.fail(fn);
    },
    always(fn: () => unknown) {
      return p.done(fn).fail(fn);
    },
    done: (fn: (value: unknown) => unknown) => {
      // eslint-disable-next-line lodash/prefer-lodash-typecheck
      if (fn instanceof Function) data.done.push(fn);
      return p;
    },
    fail: (fn: (error: unknown) => unknown) => {
      // eslint-disable-next-line lodash/prefer-lodash-typecheck
      if (fn instanceof Function) data.fail.push(fn);
      return p;
    },
  };
  ['done', 'fail'].forEach((name: string) => {
    data[name] = [];
  });
  p.done((text: unknown) => JSON.parse(text as string));
  request.onreadystatechange = () => {
    if (request.readyState === 4) {
      const e = { status: request.status };
      if (request.status === 200) {
        try {
          let response: string | unknown = request.responseText;
          // eslint-disable-next-line no-restricted-syntax, guard-for-in
          for (const i in data.done) {
            const value = data.done[i](response);
            if (value !== undefined) { response = value; }
          }
        } catch (err) {
          data.fail.forEach(fail => fail(err));
        }
      } else {
        data.fail.forEach(fail => fail(e));
      }
    }
  };
  request.open('GET', url);
  request.setRequestHeader('Accept', 'application/json');
  request.send();
  return p;
}

export function getScrollBarWidth(): number {
  const docElement = document.documentElement;
  if (docElement.scrollHeight <= docElement.clientHeight) {
    return 0;
  }
  const inner = document.createElement('p');
  inner.style.width = '100%';
  inner.style.height = '200px';

  const outer = document.createElement('div');
  outer.style.position = 'absolute';
  outer.style.top = '0px';
  outer.style.left = '0px';
  outer.style.visibility = 'hidden';
  outer.style.width = '200px';
  outer.style.height = '150px';
  outer.style.overflow = 'hidden';
  outer.appendChild(inner);

  document.body.appendChild(outer);
  const w1 = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  let w2 = inner.offsetWidth;
  if (w1 === w2) w2 = outer.clientWidth;

  document.body.removeChild(outer);

  return (w1 - w2);
}

// delayer: set a function that execute after a delay
// @params (function, delay_prop or value, default_value)
export function delayer(
  fn: (...args: any[]) => void,
  varTimer: number | string,
  ifNaN = 100,
): (...args: any[]) => void {
  function toInt(el: string | number): number | null {
    return /^[0-9]+$/.test(String(el)) ? Number(el) || 1 : null;
  }
  let timerId: ReturnType<typeof setTimeout> | undefined;
  return function (this: any, ...args: any[]) {
    if (timerId) clearTimeout(timerId);
    const thisRecord = this as Record<string, unknown>;
    const timerValue = toInt(varTimer)
      || toInt(thisRecord[varTimer as string] as string | number)
      || ifNaN;
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, timerValue);
  };
}

export function getFragmentByHash(url: string): string {
  const parts = url.split('#');
  const [, hash = ''] = parts;
  return hash;
}

// TODO: VueFixer is deprecated - only needed for Vue 1/2 compatibility
// MarkBind now uses Vue 3, so this function should not be used
export function VueFixer(vue: any): any {
  const vue2 = !(window as any).Vue || !(window as any).Vue.partial;
  const mixin: Record<string, any> = {
    computed: {
      vue2() { return !(this as any).$dispatch; },
    },
  };
  if (!vue2) {
    if (vue.beforeCreate) {
      mixin.create = vue.beforeCreate;
      delete vue.beforeCreate;
    }
    if (vue.beforeMount) {
      vue.beforeCompile = vue.beforeMount;
      delete vue.beforeMount;
    }
    if (vue.mounted) {
      vue.ready = vue.mounted;
      delete vue.mounted;
    }
  } else {
    if (vue.beforeCompile) {
      vue.beforeMount = vue.beforeCompile;
      delete vue.beforeCompile;
    }
    if (vue.compiled) {
      mixin.compiled = vue.compiled;
      delete vue.compiled;
    }
    if (vue.ready) {
      vue.mounted = vue.ready;
      delete vue.ready;
    }
  }
  if (!vue.mixins) { vue.mixins = []; }
  vue.mixins.unshift(mixin);
  return vue;
}

// Used in the Box component to classify the different styles used by bootstrap
// from the user input.
// @params (the user input type of the box)
export function classifyBootstrapStyle(
  type: string | undefined,
  theme: string | undefined,
): { style: string; icon: string } {
  const defaultStyles = [
    'warning',
    'info',
    'definition',
    'success',
    'danger',
    'tip',
    'important',
    'wrong',
  ];
  const colorStyles = [
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark',
  ];

  const typeStyle = type && defaultStyles.includes(type) ? type : '';
  const themeStyle = theme && colorStyles.includes(theme) ? theme : '';

  let mainStyle: string;
  let iconStyle: string;

  if (themeStyle) {
    mainStyle = themeStyle;
  } else {
    switch (typeStyle) {
    case 'warning':
      mainStyle = 'warning';
      break;
    case 'info':
      mainStyle = 'info';
      break;
    case 'definition':
      mainStyle = 'primary';
      break;
    case 'success':
    case 'tip':
      mainStyle = 'success';
      break;
    case 'important':
    case 'wrong':
      mainStyle = 'danger';
      break;
    default:
      mainStyle = 'default';
      break;
    }
  }

  switch (typeStyle) {
  case 'wrong':
    iconStyle = 'fa-times';
    break;
  case 'warning':
    iconStyle = 'fa-exclamation';
    break;
  case 'info':
    iconStyle = 'fa-info';
    break;
  case 'success':
    iconStyle = 'fa-check';
    break;
  case 'important':
    iconStyle = 'fa-flag';
    break;
  case 'tip':
    iconStyle = 'fa-lightbulb';
    break;
  case 'definition':
    iconStyle = 'fa-atlas';
    break;
  default:
    iconStyle = '';
    break;
  }

  return { style: mainStyle, icon: iconStyle };
}
