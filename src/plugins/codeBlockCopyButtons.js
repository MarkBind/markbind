const cheerio = module.parent.require('cheerio');

const COPIED_TO_CLIPBOARD = 'Copied!';
const COPY_ICON = '<svg class="cpy" xmlns="http://www.w3.org/2000/svg" width="15" height="15"'
+ 'viewBox="0 0 24 24"><path d="M13.508 11.504l.93-2.494 2.998 6.268-6.31 2.779.'
+ '894-2.478s-8.271-4.205-7.924-11.58c2.716 5.939 9.412 7.505 9.412 7.505zm7.492-9.'
+ '504v-2h-21v21h2v-19h19zm-14.633 2c.441.757.958 1.422 1.521 2h14.112v16h-16v-8.'
+ '548c-.713-.752-1.4-1.615-2-2.576v13.124h20v-20h-17.633z" class="cpy"/></svg>';
const COPY_TO_CLIPBOARD = 'Copy';

function getButtonHTML() {
  const html = `<button onclick="copyCodeBlock(this)" class="copy-btn" type="button">
    <div class="copy-btn-body">
    ${COPY_ICON}
    <strong class="copy-btn-label">${COPY_TO_CLIPBOARD}</strong>
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
  getScripts: () => copyCodeBlockScript,
  postRender: (content) => {
    const $ = cheerio.load(content, { xmlMode: false });
    const codeBlockSelector = 'pre';
    const buttonHTML = getButtonHTML();
    $(codeBlockSelector).each((i, codeBlock) => {
      $(codeBlock).append(buttonHTML);
    });
    return $.html();
  },
};
