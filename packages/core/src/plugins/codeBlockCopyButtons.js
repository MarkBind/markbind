const cheerio = module.parent.require('cheerio');

const COPIED_TO_CLIPBOARD = '';
// const COPY_ICON = '<svg class="cpy" xmlns="http://www.w3.org/2000/svg" width="15" height="15"'
// + 'viewBox="0 0 24 24"><path d="M13.508 11.504l.93-2.494 2.998 6.268-6.31 2.779.'
// + '894-2.478s-8.271-4.205-7.924-11.58c2.716 5.939 9.412 7.505 9.412 7.505zm7.492-9.'
// + '504v-2h-21v21h2v-19h19zm-14.633 2c.441.757.958 1.422 1.521 2h14.112v16h-16v-8.'
// + '548c-.713-.752-1.4-1.615-2-2.576v13.124h20v-20h-17.633z" class="cpy"/></svg>';
const COPY_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="18" height="18" viewBox="0 0 18 18" version="1.1">
<g id="surface1">
<path d="M 11.273438 0 L 2.546875 0 C 1.746094 0 1.089844 0.613281 1.089844 1.363281 L 1.089844 10.910156 L 2.546875 10.910156 L 2.546875 1.363281 L 11.273438 1.363281 Z M 13.453125 2.726562 L 5.453125 2.726562 C 4.65625 2.726562 4 3.339844 4 4.089844 L 4 13.636719 C 4 14.386719 4.65625 15 5.453125 15 L 13.453125 15 C 14.253906 15 14.910156 14.386719 14.910156 13.636719 L 14.910156 4.089844 C 14.910156 3.339844 14.253906 2.726562 13.453125 2.726562 Z M 13.453125 13.636719 L 5.453125 13.636719 L 5.453125 4.089844 L 13.453125 4.089844 Z M 13.453125 13.636719 "/>
</g>
</svg>
`;
const COPY_TO_CLIPBOARD = '';

function getButtonHTML() {
  const html = `<button onclick="copyCodeBlock(this)" id="copy-btn--ua" class="copy-btn">
    <div class="copy-btn-body">
    ${COPY_ICON}
    </div>
    </button>`;
  return html;
}

const copyCodeBlockScript = `<script>
    function copyCodeBlock(element) {
        const pre = element.parentElement;
        const codeElement = pre.querySelector('code');
        const copyButtonLabel = element.querySelector('.copy-btn-label');

        // create dummy text element to select() the text field
        const textElement = document.createElement('textarea');
        textElement.value = codeElement.textContent;
        document.body.appendChild(textElement);
        textElement.select();

        document.execCommand('copy');
        document.body.removeChild(textElement);

        copyButtonLabel.textContent = '${COPIED_TO_CLIPBOARD}';
        setTimeout(function() {
            copyButtonLabel.textContent = '${COPY_TO_CLIPBOARD}';
        }, 2000);
    }
    </script>`;

module.exports = {
  getScripts: () => [copyCodeBlockScript],
  postRender: (content) => {
    const $ = cheerio.load(content);
    const codeBlockSelector = 'pre';
    const buttonHTML = getButtonHTML();
    $(codeBlockSelector).each((i, codeBlock) => {
      $(codeBlock).append(buttonHTML);
    });
    return $.html();
  },
};
