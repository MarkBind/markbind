const path = require('path');
const ensurePosix = require('ensure-posix-path');

require('../patches/nunjucks'); // load patch first
const nunjucks = require('nunjucks');
const {
  dateFilter,
  SetExternalExtension,
} = require('../lib/nunjucks-extensions');

const unescapedEnv = nunjucks.configure({ autoescape: false })
  .addFilter('date', dateFilter);

/**
 * Wrapper class over a nunjucks environment configured for the respective (sub)site.
 */
class VariableRenderer {
  constructor(siteRootPath) {
    /**
     * @type {string}
     */
    this.siteRootPath = siteRootPath;
    /**
     * @type {PageSources}
     */
    this.pageSources = undefined;

    this.nj = nunjucks.configure(siteRootPath, { autoescape: false });
    this.nj.addFilter('date', dateFilter);
    this.nj.addExtension('SetExternalExtension', new SetExternalExtension(siteRootPath, this.nj));
    this.nj.on('load', (name, source) => {
      this.pageSources.staticIncludeSrc.push({ to: source.path });
    });
  }

  /**
   * Processes content with the instance's nunjucks environment.
   * @param content to process
   * @param variables to render the content with
   * @param {PageSources} pageSources to add dependencies found during nunjucks rendering to
   * @return {String} nunjucks processed content
   */
  renderString(content, variables, pageSources) {
    this.pageSources = pageSources;
    return this.nj.renderString(content, variables);
  }

  /**
   * Processes file content with the instance's nunjucks environment.
   * @param contentFilePath to process
   * @param variables to render the content with
   * @param {PageSources} pageSources to add dependencies found during nunjucks rendering to
   * @return {String} nunjucks processed content
   */
  renderFile(contentFilePath, variables, pageSources) {
    this.pageSources = pageSources;
    const templateName = ensurePosix(path.relative(this.siteRootPath, contentFilePath));
    return this.nj.render(templateName, variables);
  }

  /**
   Invalidate the internal nunjucks template cache
   */
  invalidateCache() {
    this.nj.invalidateCache();
  }

  /**
   * Compiles a template specified at src independent of the template directory.
   * This is used for the page template file (page.njk), where none of nunjucks' features
   * involving path resolving are used.
   * @param templatePath of the template to compile
   */
  static compile(templatePath) {
    return nunjucks.compile(templatePath, unescapedEnv);
  }
}

module.exports = VariableRenderer;
