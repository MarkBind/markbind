// eslint-disable-next-line import/no-extraneous-dependencies
import { notify } from 'alertifyjs';

Object.defineProperty(Vue.prototype, '$notify', { value: notify });
