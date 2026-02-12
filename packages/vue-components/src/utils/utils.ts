/* eslint-disable @typescript-eslint/no-explicit-any */

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
