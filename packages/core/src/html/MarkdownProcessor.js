const md = require('../lib/markdown-it');

const _ = {};
_.has = require('lodash/has');

class MarkdownProcessor {
  constructor(docId) {
    // markdown-it-footnotes state
    this.baseDocId = docId; // encapsulates footnotes in externals (<panel src="...">)
    this.docId = 0; // encapsulates footnotes in <include>s
  }

  renderMd(text) {
    return md.render(text, this.docId
      ? { docId: `${this.baseDocId}${this.docId}` }
      : { docId: this.baseDocId });
  }

  renderMdInline(text) {
    return md.renderInline(text, this.docId
      ? { docId: `${this.baseDocId}${this.docId}` }
      : { docId: this.baseDocId });
  }
}

module.exports = {
  MarkdownProcessor,
};
