var path = require('path');
var ensurePosix = require('ensure-posix-path');
require('../patches/nunjucks'); // load patch first
var nunjucks = require('nunjucks');
var _a = require('../lib/nunjucks-extensions'), dateFilter = _a.dateFilter, SetExternalExtension = _a.SetExternalExtension;
var unescapedEnv = nunjucks.configure({ autoescape: false })
    .addFilter('date', dateFilter);
/**
 * Wrapper class over a nunjucks environment configured for the respective (sub)site.
 */
var VariableRenderer = /** @class */ (function () {
    function VariableRenderer(siteRootPath) {
        var _this = this;
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
        this.nj.on('load', function (name, source) {
            _this.pageSources.staticIncludeSrc.push({ to: source.path });
        });
    }
    /**
     * Processes content with the instance's nunjucks environment.
     * @param content to process
     * @param variables to render the content with
     * @param {PageSources} pageSources to add dependencies found during nunjucks rendering to
     * @return {String} nunjucks processed content
     */
    VariableRenderer.prototype.renderString = function (content, variables, pageSources) {
        this.pageSources = pageSources;
        return this.nj.renderString(content, variables);
    };
    /**
     * Processes file content with the instance's nunjucks environment.
     * @param contentFilePath to process
     * @param variables to render the content with
     * @param {PageSources} pageSources to add dependencies found during nunjucks rendering to
     * @return {String} nunjucks processed content
     */
    VariableRenderer.prototype.renderFile = function (contentFilePath, variables, pageSources) {
        this.pageSources = pageSources;
        var templateName = ensurePosix(path.relative(this.siteRootPath, contentFilePath));
        return this.nj.render(templateName, variables);
    };
    /**
     Invalidate the internal nunjucks template cache
     */
    VariableRenderer.prototype.invalidateCache = function () {
        this.nj.invalidateCache();
    };
    /**
     * Compiles a template specified at src independent of the template directory.
     * This is used for the page template file (page.njk), where none of nunjucks' features
     * involving path resolving are used.
     * @param templatePath of the template to compile
     */
    VariableRenderer.compile = function (templatePath) {
        return nunjucks.compile(templatePath, unescapedEnv);
    };
    return VariableRenderer;
}());
module.exports = VariableRenderer;
