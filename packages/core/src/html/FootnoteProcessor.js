const cheerio = require('cheerio');
const { MARKBIND_FOOTNOTE_POPOVER_ID_PREFIX } = require('./constants');

/*
 * Footnotes of the main content and <include>s are stored, then combined by NodeProcessor at the end
 */
class FootnoteProcessor {
  constructor() {
    // Store footnotes of <include>s and the main content
    this.renderedFootnotes = [];
  }

  processMbTempFootnotes(node) {
    const $ = cheerio(node);
    this.renderedFootnotes.push($.html());
    $.remove();
  }

  combineFootnotes(processNode) {
    let hasFootnote = false;
    const prefix = '<hr class="footnotes-sep">\n<section class="footnotes">\n<ol class="footnotes-list">\n';

    const footnotesWithPopovers = this.renderedFootnotes.map((footNoteBlock) => {
      const $ = cheerio.load(footNoteBlock);
      let popoversHtml = '';

      $('li.footnote-item').each((index, li) => {
        hasFootnote = true;
        const popoverId = `${MARKBIND_FOOTNOTE_POPOVER_ID_PREFIX}${li.attribs.id}`;
        const popoverNode = cheerio.parseHTML(`<popover id="${popoverId}">
            <div #content>
              ${$(li).html()}
            </div>
          </popover>`)[0];
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

module.exports = {
  FootnoteProcessor,
};
