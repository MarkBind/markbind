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

function buildCopyCodeBlockScript() {
  return `<script src="markbind/js/clipboard.min.js"></script>
    <script>
    console.log('entered the function');
    const clipboard = new ClipboardJS('.copy-btn', {
        target(trigger) {
            return trigger.parentNode.querySelector('code');
        },
    });

    clipboard.on('success', (event) => {
        event.clearSelection();
        const textEl = event.trigger.querySelector('.copy-btn-label');
        textEl.textContent = '${COPIED_TO_CLIPBOARD}';
        setTimeout(function() {
            textEl.textContent = '${COPY_TO_CLIPBOARD}';
        }, 3000);
    });
    </script>
    `;
}


module.exports = {
  getScripts: () => buildCopyCodeBlockScript(),
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
