const path = require('path');

const { External } = require('./External');

const utils = require('../utils');
const fsUtil = require('../utils/fsUtil');

const _ = {};
_.uniqBy = require('lodash/uniqBy');

/**
 * Manages and generates external files (<panel src="...">) referenced in pages and layouts.
 */
class ExternalManager {
  constructor(config) {
    this.config = config;

    /**
     * @type {Object<string, Promise<External>>}
     */
    this.builtFiles = {};
  }

  reset() {
    this.builtFiles = {};
  }

  /**
   * Generates the dependencies referenced by the dependencies provided, and adds any
   * collected sources to the includedFiles set.
   * @param dependencies
   * @param {Set<string>} includedFiles
   * @return {Promise<unknown[]>}
   */
  async generateDependencies(dependencies, includedFiles) {
    const resolvingExternals = [];

    _.uniqBy(dependencies, d => d.to).forEach((src) => {
      if (utils.isUrl(src.to)) {
        return;
      }

      const relativePath = path.relative(this.config.rootPath, src.asIfTo);
      const resultPath = path.join(this.config.outputPath, relativePath);
      const resultPathWithExternalExt = fsUtil.setExtension(resultPath, '._include_.html');

      if (!(resultPathWithExternalExt in this.builtFiles)) {
        const external = new External(this, src.to);
        this.builtFiles[resultPathWithExternalExt] = external.resolveDependency(src.asIfTo,
                                                                                resultPathWithExternalExt,
                                                                                this.config);
      }

      resolvingExternals.push(this.builtFiles[resultPathWithExternalExt]);
    });

    const externals = await Promise.all(resolvingExternals);
    externals.forEach((external) => {
      external.includedFiles.forEach(filePath => includedFiles.add(filePath));
    });
  }
}

module.exports = {
  ExternalManager,
};
