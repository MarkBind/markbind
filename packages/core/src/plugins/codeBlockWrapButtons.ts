// NOTE: this code is a modified copy of codeBlockCopyButtons.js

import cheerio from 'cheerio';
import { MbNode } from '../utils/node';
import {
  CONTAINER_HTML,
  isFunctionBtnContainer,
  doesFunctionBtnContainerExistInNode,
} from './codeBlockButtonsAssets/codeBlockButtonsContainer';
import type { PluginContext } from './Plugin';

const WRAP_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="18" height="18" viewBox="0 0 18 18" version="1.1">
    <g id="surface1">
      <path id="path17964" d="M 1.109375 0 L 1.109375 2.5351562 L 2.0410156 2.5351562 L
      2.0410156 0.93164062 L 4.8203125 0.93164062 L 4.8203125 9.3222656 L 3.4746094
      9.3222656 L 3.4746094 10.144531 L 8.8027344 10.144531 L 8.8027344 9.3222656 L
      7.4492188 9.3222656 L 7.4492188 0.93164062 L 10.25 0.93164062 L 10.25 2.5351562 L
      11.166016 2.5351562 L 11.166016 0 L 1.109375 0 z M 10.84375 5.1054688 L 10.84375
      6.6074219 C 12.268027 6.6074219 13.40625 7.7456444 13.40625 9.1699219 C 13.40625
      10.185673 12.827237 11.055036 11.978516 11.470703 L 11.978516 9.5175781 L 7.1386719
      12.3125 L 11.978516 15.105469 L 11.978516 13.072266 C 13.66701 12.577757 14.910156
      11.012746 14.910156 9.1699219 C 14.910156 6.9333638 13.080308 5.1054688 10.84375
      5.1054688 z " />
    </g>
</svg>
`;

function getButtonHTML() {
  const html = `<button onclick="toggleCodeBlockWrap(this)" class="function-btn">
    <div class="function-btn-body">
      ${WRAP_ICON}
    </div>
    </button>`;
  return html;
}

const wrapCodeBlockScript = `<script>
    function toggleCodeBlockWrap(element) {
      const pre = element.parentElement.parentElement;
      const classList = pre.querySelector('code').classList; 
      if (classList.contains('wrap')) {
          classList.remove('wrap');
      } else {
          classList.add('wrap')
      }
    }
    </script>`;

export = {
  getScripts: () => [wrapCodeBlockScript],
  processNode: (_: PluginContext, node: MbNode) => {
    if (node.name === 'pre' && !doesFunctionBtnContainerExistInNode(node)) {
      cheerio(node).append(CONTAINER_HTML);
    } else if (isFunctionBtnContainer(node)) {
      cheerio(node).append(getButtonHTML());
    }
  },
};
