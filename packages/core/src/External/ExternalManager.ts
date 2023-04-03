import path from 'path';
import uniqBy from 'lodash/uniqBy';
import { External } from './External';
import * as fsUtil from '../utils/fsUtil';
import * as urlUtil from '../utils/urlUtil';
import type { DynamicSrc } from '../Page/PageSources';
import type { VariableProcessor } from '../variables/VariableProcessor';
import type { SiteLinkManager } from '../html/SiteLinkManager';
import type { PluginManager } from '../plugins/PluginManager';
import { NodeProcessorConfig } from '../html/NodeProcessor';

const _ = {
  uniqBy,
};

export type ExternalManagerConfig = NodeProcessorConfig & {
  variableProcessor: VariableProcessor,
  siteLinkManager: SiteLinkManager,
  pluginManager: PluginManager,
};

/**
 * Manages and generates external files (<panel src="...">) referenced in pages and layouts.
 */
export class ExternalManager {
  config: ExternalManagerConfig;
  builtFiles: Record<string, Promise<External>>;

  constructor(cfg: ExternalManagerConfig) {
    this.config = cfg;
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
  async generateDependencies(dependencies: DynamicSrc[], includedFiles: Set<string>) {
    const resolvingExternals: Promise<External>[] = [];

    _.uniqBy(dependencies, d => d.asIfTo).forEach((src) => {
      if (urlUtil.isUrl(src.to)) {
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
