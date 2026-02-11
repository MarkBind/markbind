/* eslint-disable @typescript-eslint/no-explicit-any */

// coerce convert some types of data into another type
export const coerce = {
  // Convert a string to boolean. Otherwise, return the value without modification,
  // so if is not boolean, Vue throws a warning.
  boolean: (val: any): boolean | any => (typeof val === 'string'
    ? val === '' || val === 'true'
      ? true
      : (val === 'false' || val === 'null' || val === 'undefined' ? false : val)
    : val),
  // Attempt to convert a string value to a Number. Otherwise, return alt.
  number: (val: any, alt: number | null = null): number | null => (typeof val === 'number'
    ? val
    : val === undefined || val === null || isNaN(Number(val))
      ? alt
      : Number(val)),
  // Attempt to convert to string any value, except for null or undefined.
  string: (val: any): string => (val === undefined || val === null ? '' : val + ''),
  // Pattern accept RegExp, function, or string (converted to RegExp). Otherwise return null.
  pattern: (val: any): Function | RegExp | null => (val instanceof Function || val instanceof RegExp
    ? val
    : typeof val === 'string'
      ? new RegExp(val)
      : null),
};

export function toBoolean(val: any): boolean | any {
  return (typeof val === 'string')
    ? ((val === '' || val === 'true')
      ? true
      : ((val === 'false' || val === 'null' || val === 'undefined')
        ? false
        : val))
    : val;
}

export function toNumber(val: any): number | null {
  return (typeof val === 'number')
    ? val
    : ((val === undefined || val === null || isNaN(Number(val)))
      ? null
      : Number(val));
}

export function getJSON(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const request = new window.XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState === 4) {
        if (request.status === 200) {
          try {
            const data = JSON.parse(request.responseText);
            resolve(data);
          } catch (err) {
            reject(err);
          }
        } else {
          reject({ status: request.status });
        }
      }
    };
    request.open('GET', url);
    request.setRequestHeader('Accept', 'application/json');
    request.send();
  });
}

export function getScrollBarWidth(): number {
  if (document.documentElement.scrollHeight <= document.documentElement.clientHeight) {
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

// delayer: set a function that executes after a delay
// @params (function, delay_prop or value, default_value)
export function delayer(
  fn: (...args: any[]) => void,
  varTimer: string | number,
  ifNaN: number = 100,
): (this: any, ...args: any[]) => void {
  function toInt(el: string | number): number | null {
    return /^[0-9]+$/.test(String(el)) ? Number(el) || 1 : null;
  }
  let timerId: ReturnType<typeof setTimeout> | undefined;
  return function (this: any, ...args: any[]) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, toInt(varTimer) || toInt(this[varTimer]) || ifNaN);
  };
}

export function getFragmentByHash(url: string): string {
  const type = url.split('#');
  let hash = '';
  if (type.length > 1) {
    hash = type[1];
  }
  return hash;
}

// Fix a vue instance Lifecycle to vue 1/2 (just the basic elements, is not a real parser,
// so this work only if your code is compatible with both)
export function VueFixer(vue: Record<string, any>): Record<string, any> {
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

// Used in the Box component to classify the different styles used by bootstrap from the user input.
// @params (the user input type of the box)
export function classifyBootstrapStyle(
  type: string,
  theme: string,
): { style: string; icon: string } {
  const defaultStyles
    = ['warning', 'info', 'definition', 'success', 'danger', 'tip', 'important', 'wrong'];
  const colorStyles
    = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

  const typeStyle = defaultStyles.includes(type) ? type : '';
  const themeStyle = colorStyles.includes(theme) ? theme : '';

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
