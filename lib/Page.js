const html = require('html');
const fs = require('fs-extra-promise');
const Promise = require('bluebird');

const MarkBind = require('markbind');

function Page(pageConfig) {
  this.content = pageConfig.content || '';
  this.title = pageConfig.title || '';
  // the source file for rendering this page
  this.sourcePath = pageConfig.sourcePath;
  // the temp path for writing intermediate result
  this.tempPath = pageConfig.tempPath;
  // the output path of this page
  this.resultPath = pageConfig.resultPath;
  this.template = pageConfig.pageTemplate;
  this.asset = pageConfig.asset;
  this.markbinder = new MarkBind();
}

Page.prototype.prepareTemplateData = function() {
  return {
    content: this.content,
    title: this.title,
    asset: this.asset
  }
};

Page.prototype.generate = function() {
  return new Promise((resolve, reject) => {
    this.markbinder.includeFile(this.sourcePath)
      .then((result) => {
        return fs.outputFileAsync(this.tempPath, result);
      })
      .then(() => {
        return this.markbinder.renderFile(this.tempPath)
      })
      .then((result) => {
        this.content = html.prettyPrint(result, {indent_size: 2});
        return fs.outputFileAsync(this.resultPath, this.template(this.prepareTemplateData()));
      })
      .then(resolve)
      .catch(reject);
  });
};

module.exports = Page;
