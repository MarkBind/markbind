class DocIdManager {
  constructor(docId) {
    // markdown-it-footnotes state
    this.baseDocId = docId; // encapsulates footnotes in externals (<panel src="...">)
    this.docId = 0; // encapsulates footnotes in <include>s
  }
}

module.exports = {
  DocIdManager,
};
