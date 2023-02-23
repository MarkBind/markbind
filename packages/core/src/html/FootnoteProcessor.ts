import cheerio from 'cheerio';
import { DomElement } from 'htmlparser2';
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

  processMbTempFootnotes(node: DomElement) {
    const $ = cheerio(node);
    const content = $.html();
    if (content) {
      this.renderedFootnotes.push(content);
    }
    $.remove();
  }

  combineFootnotes(processNode: (nd: DomElement) => any): string {
    let hasFootnote = false;
    const prefix = '<hr class="footnotes-sep">\n<section class="footnotes">\n<ol class="footnotes-list">\n';

    const footnotesWithPopovers = this.renderedFootnotes.map((footNoteBlock) => {
      const $ = cheerio.load(footNoteBlock);
      let popoversHtml = '';

      $('li.footnote-item').each((index, li) => {
        hasFootnote = true;
        const popoverId = `${MARKBIND_FOOTNOTE_POPOVER_ID_PREFIX}${(li as any).attribs.id}`;
        const popoverNode = cheerio.parseHTML(`<popover id="${popoverId}">
            <div #content>
              ${$(li).html()}
            </div>
          </popover>`)[0];
        processNode(popoverNode as unknown as DomElement);

        popoversHtml += cheerio.html(popoverNode as any);
      });

      return `${popoversHtml}\n${footNoteBlock}\n`;
    }).join('\n');

    const suffix = '</ol>\n</section>\n';

    return hasFootnote
      ? prefix + footnotesWithPopovers + suffix
      : '';
  }
}
