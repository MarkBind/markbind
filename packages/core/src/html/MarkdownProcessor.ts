import md from '../lib/markdown-it';

export class MarkdownProcessor {
  baseDocId: string;
  docId: number;

  constructor(docId: string) {
    // markdown-it-footnotes state
    this.baseDocId = docId; // encapsulates footnotes in externals (<panel src="...">)
    this.docId = 0; // encapsulates footnotes in <include>s
  }

  renderMd(text: string) {
    return md.render(text, this.docId
      ? { docId: `${this.baseDocId}${this.docId}` }
      : { docId: this.baseDocId });
  }

  renderMdInline(text: string) {
    return md.renderInline(text, this.docId
      ? { docId: `${this.baseDocId}${this.docId}` }
      : { docId: this.baseDocId });
  }
}
