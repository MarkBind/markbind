import cheerio from 'cheerio';
import { MbNode } from '../utils/node';
import {
  CONTAINER_HTML,
  doesFunctionBtnContainerExistInNode,
  isFunctionBtnContainer,
} from './codeBlockButtonsAssets/codeBlockButtonsContainer';
import type { PluginContext } from './Plugin';

const CSS_FILE_NAME = 'codeBlockButtonsAssets/codeBlockButtons.css';

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

const COPY_MESSAGE = 'Copy';

const COPY_MESSAGE_SUCCESS = 'Copied!';

const TICK_ICON = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="2 2 22 22"
  >
    <path d="M 19.28125 5.28125 L 9 15.5625 L 4.71875 11.28125 L 3.28125 12.71875 L 8.28125 17.71875 
    L 9 18.40625 L 9.71875 17.71875 L 20.71875 6.71875 Z"></path>
  </svg>
`;

function getButtonHTML() {
  const html = `<button onclick="copyCodeBlock(this)" class="function-btn d-print-none">
    <div class="tooltip-container">
    <span class="tooltiptext">${COPY_MESSAGE}</span>
    <div class="function-btn-body">
    ${COPY_ICON}
    </div>
    </div>
    </button>`;
  return html;
}

const copyCodeBlockScript = `<script>
    function copyCodeBlock(element) {
        const pre = element.parentElement.parentElement;
        const codeElement = pre.querySelector('code');
        const copyButtonBody = element.querySelector('.function-btn-body');
        const tooltipText = element.querySelector(".tooltiptext");

        // create dummy text element to select() the text field
        const textElement = document.createElement('textarea');
        textElement.value = codeElement.textContent;
        document.body.appendChild(textElement);
        textElement.select();

        document.execCommand('copy');
        document.body.removeChild(textElement);
        copyButtonBody.innerHTML = \`${TICK_ICON}\`;
        console.log("Running tooltip");
        tooltipText.innerText  = \`${COPY_MESSAGE_SUCCESS}\`;
        setTimeout(() => {
            copyButtonBody.innerHTML = \`${COPY_ICON}\`;
            tooltipText.innerText  = \`${COPY_MESSAGE}\`;
        }, 3000);
    }
    </script>`;

export = {
  getLinks: () => [`<link rel="stylesheet" href="${CSS_FILE_NAME}">`],
  getScripts: () => [copyCodeBlockScript],
  processNode: (_: PluginContext, node: MbNode) => {
    if (node.name === 'pre' && node.children?.some(child => child.name === 'code')) {
      if (!doesFunctionBtnContainerExistInNode(node)) {
        cheerio(node).append(CONTAINER_HTML);
      }
    } else if (isFunctionBtnContainer(node)) {
      cheerio(node).append(getButtonHTML());
    }
  },
};
