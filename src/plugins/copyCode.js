const cheerio = module.parent.require('cheerio');

const {
  COPIED_TO_CLIPBOARD,
  COPY_ICON,
  COPY_TO_CLIPBOARD,
} = require('../constants');

function getButtonHTML() {
  const html = `<button class="copy-btn-icon copy-btn" type="button">
    <div class="copy-btn-body">
    ${COPY_ICON}
    <strong class="copy-btn-label">${COPY_TO_CLIPBOARD}</strong>
    </div>
    </button>`;
  return html;
}

function getCopyCodeBlockScript() {
  return `<script>
    document.onclick = ((event) => {
        let element = event.target;
        const elementClassList = [...element.classList];
        const listOfSelectors = ['copy-btn-label', 'copy-btn', 'copy-btn-icon', 'copy-btn-body', 'cpy'];
        let parents = [];
        let copyButton = null;
        while (element) {
            parents.unshift(element);
            let classList = element.classList;
            if (classList) {
                classList.forEach((value, key, obj) => {
                    if (value === 'copy-btn') {
                        copyButton = element;
                    }
                });
            }
            element = element.parentNode;
        }
        
        const copyButtonClicked = listOfSelectors.some(sel => elementClassList.includes(sel));
        if (copyButtonClicked) {
            var pre;
            for (const obj of parents) {
                    if (obj['outerHTML'] && obj['outerHTML'].indexOf('<pre>') === 0) {
                    pre = obj;
                }
            }
            let codeElement = pre.querySelector('code');
            const textElement = document.createElement('textarea');
            textElement.value = codeElement.textContent;
            document.body.appendChild(textElement);
            textElement.select();
            document.execCommand('copy');
            document.body.removeChild(textElement);
            const buttonLabel = copyButton.querySelector('.copy-btn-label');
            buttonLabel.textContent = '${COPIED_TO_CLIPBOARD}';
            setTimeout(function() {
                buttonLabel.textContent = '${COPY_TO_CLIPBOARD}';
            }, 3000);
        }
      });
    </script>`;
}


module.exports = {
  getScripts: () => getCopyCodeBlockScript(),
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
