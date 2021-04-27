const fs = require('fs-extra');
const path = require('path');
const htmlBeautify = require('js-beautify').html;

const { PageSources } = require('../Page/PageSources');
const { NodeProcessor } = require('../html/NodeProcessor');

const fsUtil = require('../utils/fsUtil');

/**
 * Represents external files (e.g. files referenced by <panel src="...">)
 * not directly included inside the generated page
 */
class External {
  constructor(externalManager, sourceFilePath) {
    /**
     * @type {ExternalManager}
     */
    this.externalManager = externalManager;

    /**
     * @type {string}
     */
    this.sourceFilePath = sourceFilePath;

    /**
     * @type {Set<string>}
     */
    this.includedFiles = new Set([sourceFilePath]);
  }

  /**
   * Generates the content of this External instance
   * @param asIfAtFilePath
   * @param resultPath
   * @param config
   * @return {Promise<External>}
   */
  async resolveDependency(asIfAtFilePath, resultPath, config) {
    const fileConfig = {
      ...config,
      headerIdMap: {},
    };

    const { variableProcessor, pluginManager } = config;

    const pageSources = new PageSources();
    const docId = `ext-${fsUtil.removeExtension(path.basename(asIfAtFilePath))}`;
    const nodeProcessor = new NodeProcessor(fileConfig, pageSources, variableProcessor, pluginManager, docId);

    const nunjucksProcessed = variableProcessor.renderWithSiteVariables(this.sourceFilePath, pageSources);
    const mdHtmlProcessed = await nodeProcessor.process(this.sourceFilePath, nunjucksProcessed,
                                                        asIfAtFilePath);
    const pluginPostRendered = pluginManager.postRender(nodeProcessor.frontMatter, mdHtmlProcessed);

    const outputContentHTML = process.env.TEST_MODE
      ? htmlBeautify(pluginPostRendered, pluginManager.htmlBeautifyOptions)
      : pluginPostRendered;

    await fs.outputFile(resultPath, outputContentHTML);

    pageSources.addAllToSet(this.includedFiles);

    await this.externalManager.generateDependencies(pageSources.getDynamicIncludeSrc(), this.includedFiles);

    return this;
  }
}

module.exports = {
  External,
};
