import type { Directive, DirectiveBinding } from 'vue';

interface FloatElement extends HTMLElement {
  el?: HTMLElement;
}

const FloatDirective: Directive<FloatElement> = {
  beforeMount(el: FloatElement) {
    const wrappingElement = document.createElement('div');
    el.replaceWith(wrappingElement);
    wrappingElement.appendChild(el);
    el.el = el;
  },
  updated(el: FloatElement, binding: DirectiveBinding<string>) {
    const direction = binding.value;
    if (el.el) {
      el.el.style.float = direction;
    }
  },
};

export default FloatDirective;
