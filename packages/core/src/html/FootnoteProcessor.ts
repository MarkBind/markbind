import cheerio from 'cheerio';
import { MbNode, parseHTML } from '../utils/node';
import { MARKBIND_FOOTNOTE_POPOVER_ID_PREFIX } from './constants';

/*
 * Footnotes of the main content and <include>s are stored, then combined by NodeProcessor at the end
 */
export class FootnoteProcessor {
  renderedFootnotes: string[];

  constructor() {
    // Store footnotes of <include>s and the main content
    this.renderedFootnotes = [];
  }

  processMbTempFootnotes(node: MbNode) {
    const $ = cheerio(node);
    const content = $.html();
    if (content) {
      this.renderedFootnotes.push(content);
    }
    $.remove();
  }

  combineFootnotes(processNode: (nd: MbNode) => any): string {
    let hasFootnote = false;
    const prefix = '<hr class="footnotes-sep">\n<section class="footnotes">\n<ol class="footnotes-list">\n';

    const footnotesWithPopovers = this.renderedFootnotes.map((footNoteBlock) => {
      const $ = cheerio.load(footNoteBlock);
      let popoversHtml = '';

      $('li.footnote-item').each((_index, li) => {
        hasFootnote = true;
        const popoverId = `${MARKBIND_FOOTNOTE_POPOVER_ID_PREFIX}${(li as MbNode).attribs.id}`;
        const popoverNode = parseHTML(`<popover id="${popoverId}">
            <div #content>
              ${$(li).html()}
            </div>
          </popover>`)[0] as MbNode;
        processNode(popoverNode);

        popoversHtml += cheerio.html(popoverNode);
      });

      return `${popoversHtml}\n${footNoteBlock}\n`;
    }).join('\n');

    const suffix = '</ol>\n</section>\n';

    return hasFootnote
      ? prefix + footnotesWithPopovers + suffix
      : '';
  }
}
