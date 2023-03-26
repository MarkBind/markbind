import cheerio from 'cheerio';
import { DomElement } from 'htmlparser2';
import type { PluginContext } from './Plugin';
import { FrontMatter } from './Plugin';
import * as logger from '../utils/logger';

const TOAST_CSS_FILE = 'toastAssets/toast.css';

function toBoolean(val: string) {
  if (val === undefined || val === 'false' || val === 'null' || val === 'undefined') {
    return false;
  }
  return true;
}

function createToasts(content: string) {
  const $ = cheerio.load(content);
  const allToasts = $('toast');
  if (allToasts.length === 0) {
    return content;
  }
  const toastContainer = cheerio('<div class="alertify-notifier ajs-right"></div>');
  allToasts.each((_, toast) => {
    if (toast.type !== 'tag') {
      return;
    }

    const $toastNode = cheerio(`<box>${cheerio.html(toast)}</box>`);
    $toastNode.addClass('ajs-message ajs-visible');
    if (toast.attribs != null) {
      if (!toBoolean(toast.attribs.dismissible) && toBoolean(toast.attribs['no-timeout'])) {
        logger.error('Toast does not have a way to be dismissed');
      }
      Object.entries(toast.attribs).forEach(([key, value]) => {
        $toastNode.attr(key, value);
      });
      $toastNode.removeAttr('v-pre');
    }
    toastContainer.append($toastNode);
  });
  allToasts.remove();
  return $.html() + cheerio.html(toastContainer);
}

const toastTimeout = `
<script>
    const allToasts = document.querySelectorAll('.ajs-message');
    allToasts.forEach((toast) => {
        if (toast.attributes.getNamedItem('no-timeout') !== null) {
            return;
        }
        const timeoutDuration = toast.attributes.getNamedItem('duration')
            ? toast.attributes.getNamedItem('duration').value
            : 2000;
        setTimeout(() => {
            toast.remove();
        }, timeoutDuration)
    })
</script>`;

export = {
  getScripts: () => [toastTimeout],
  getLinks: () => [`<link rel="stylesheet" href="${TOAST_CSS_FILE}">`],
  processNode: (_: PluginContext, node: cheerio.Element & DomElement) => {
    // Needed for vue to ignore this node to prevent SSR issues
    if (node.name === 'toast') {
      cheerio(node).attr('v-pre', 'true');
    }
  },
  postRender: (_: PluginContext, frontmatter: FrontMatter, content: string) => createToasts(content),
};
