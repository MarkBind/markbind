import cheerio from 'cheerio';
import { DomElement } from 'htmlparser2';
import type { PluginContext } from './Plugin';
import { FrontMatter } from './Plugin';

const TOAST_CSS_FILE = 'toastAssets/toast.css';

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
    toast.tagName = 'box';

    const $toastNode = cheerio(`<box>${cheerio.html(toast)}</box>`);
    $toastNode.addClass('ajs-message ajs-visible');
    if (toast.attribs != null) {
      Object.entries(toast.attribs).forEach(([key, value]) => {
        $toastNode.attr(key, value);
      });
    }
    toastContainer.append($toastNode);
  });
  allToasts.remove();
  return content + cheerio.html(toastContainer);
}

const toastTimeout = `
<script>
    const allToasts = document.querySelectorAll('toast');
    allToasts.forEach((toast) => {
        const timeoutDuration = toast.attribs
            ? toast.attribs['duration']
                ? toast.attribs['duration']
                : 2000
            : 2000;
        setTimeout(() => {
            alert('timeout done')
            // const toastParent = $toastNode.parent(); 
            // const allChildren = toastParent.children();
            // const filteredChildren = []; 
            // for (let i = 0; i < allChildren.length; i++) {
            //     if (allChildren[i] === toast) {
            //        
            //         break;
            //     }
            // }
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
