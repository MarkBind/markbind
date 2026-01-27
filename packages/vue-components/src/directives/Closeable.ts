import type { Directive } from 'vue';

const CloseableDirective: Directive<HTMLElement> = {
  mounted(el: HTMLElement) {
    el.dataset.isShown = 'true';
    el.style.position = 'relative';

    const content = document.createElement('div');
    content.classList.add('content');
    Array.from(el.children).forEach(child => content.append(child));
    el.replaceChildren();
    el.append(content);
    el.classList.add('closeable-wrapper');

    const message = el.getAttribute('alt') || 'Expand Content';

    // Forward declarations to satisfy linting
    let closeButton: HTMLSpanElement;
    let showLabel: HTMLAnchorElement;

    function onClose() {
      el.dataset.isShown = 'false';
      showLabel.style.display = '';
      closeButton.style.display = 'none';
      content.style.display = 'none';
    }

    function onShow() {
      el.dataset.isShown = 'true';
      showLabel.style.display = 'none';
      content.style.display = '';
    }

    function createCloseButton(): HTMLSpanElement {
      const btn = document.createElement('span');
      btn.classList.add('closeable-button', 'label', 'label-default', 'hidden-print');
      btn.style.cssText += 'display: none; position: absolute; top: 0; '
        + 'left: 0; cursor: pointer;background: #d9534f';
      btn.innerHTML = '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
      btn.addEventListener('click', onClose);
      return btn;
    }

    function createShowLabel(labelMessage: string): HTMLAnchorElement {
      const label = document.createElement('a');
      label.classList.add('closeable-show', 'hidden-print');
      label.style.cssText += 'display: none; cursor: pointer;text-decoration: underline';
      label.innerHTML = labelMessage;
      label.addEventListener('click', onShow);
      return label;
    }

    closeButton = createCloseButton();
    el.append(closeButton);

    showLabel = createShowLabel(message);
    el.append(showLabel);

    function onMouseOver() {
      if (el.dataset.isShown === 'false') {
        return;
      }
      closeButton.style.display = '';
    }

    function onMouseOut() {
      if (el.dataset.isShown === 'false') {
        return;
      }
      closeButton.style.display = 'none';
    }

    el.addEventListener('mouseover', onMouseOver);
    el.addEventListener('mouseout', onMouseOut);
  },
};

export default CloseableDirective;
