import cheerio from 'cheerio';
import { MbNode } from '../utils/node';
import {
  CONTAINER_HTML,
  doesFunctionBtnContainerExistInNode,
  isFunctionBtnContainer,
} from './codeBlockButtonsAssets/codeBlockButtonsContainer';
import type { PluginContext } from './Plugin';

const COPY_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="18" height="18" viewBox="0 0 18 18" version="1.1">
    <g id="surface1">
      <path d="M 11.273438 0 L 2.546875 0 C 1.746094 0 1.089844 0.613281 1.089844
      1.363281 L 1.089844 10.910156 L 2.546875 10.910156 L 2.546875 1.363281 L 11.273438
      1.363281 Z M 13.453125 2.726562 L 5.453125 2.726562 C 4.65625 2.726562 4 3.339844 4
      4.089844 L 4 13.636719 C 4 14.386719 4.65625 15 5.453125 15 L 13.453125 15 C 14.253906
      15 14.910156 14.386719 14.910156 13.636719 L 14.910156 4.089844 C 14.910156 3.339844
      14.253906 2.726562 13.453125 2.726562 Z M 13.453125 13.636719 L 5.453125 13.636719 L
      5.453125 4.089844 L 13.453125 4.089844 Z M 13.453125 13.636719 "/>
    </g>
</svg>
`;

function getButtonHTML() {
  const html = `<button onclick="copyCodeBlock(this)" class="function-btn">
    <div class="function-btn-body">
    ${COPY_ICON}
    </div>
    </button>`;
  return html;
}

const copyCodeBlockScript = `<script>
    function copyCodeBlock(element) {
        const pre = element.parentElement.parentElement;
        const codeElement = pre.querySelector('code');

        // create dummy text element to select() the text field
        const textElement = document.createElement('textarea');
        textElement.value = codeElement.textContent;
        document.body.appendChild(textElement);
        textElement.select();

        document.execCommand('copy');
        document.body.removeChild(textElement);
    }
    </script>`;

export = {
  getScripts: () => [copyCodeBlockScript],
  processNode: (_: PluginContext, node: MbNode) => {
    if (node.name === 'pre' && !doesFunctionBtnContainerExistInNode(node)) {
      cheerio(node).append(CONTAINER_HTML);
    } else if (isFunctionBtnContainer(node)) {
      cheerio(node).append(getButtonHTML());
    }
  },
};
