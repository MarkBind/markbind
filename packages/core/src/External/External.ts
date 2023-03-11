import fs from 'fs-extra';
import path from 'path';
import * as jsBeautify from 'js-beautify';
import { PageSources } from '../Page/PageSources';
import { NodeProcessor } from '../html/NodeProcessor';
import * as fsUtil from '../utils/fsUtil';
import type { ExternalManager, ExternalManagerConfig } from './ExternalManager';

const htmlBeautify = jsBeautify.html;

/**
 * Represents external files (e.g. files referenced by <panel src="...">)
 * not directly included inside the generated page
 */
export class External {
  externalManager: ExternalManager;
  sourceFilePath: string;
  includedFiles: Set<string>;

  constructor(em: ExternalManager, srcFilePath: string) {
    this.externalManager = em;
    this.sourceFilePath = srcFilePath;
    this.includedFiles = new Set([srcFilePath]);
  }

  /**
   * Generates the content of this External instance
   * @param asIfAtFilePath
   * @param resultPath
   * @param config
   * @return {Promise<External>}
   */
  async resolveDependency(asIfAtFilePath: string, resultPath: string, config: ExternalManagerConfig):
  Promise<External> {
    const fileConfig = {
      ...config,
      headerIdMap: {},
    };

    const { variableProcessor, pluginManager, siteLinkManager } = config;

    const pageSources = new PageSources();
    const docId = `ext-${fsUtil.removeExtension(path.basename(asIfAtFilePath))}`;
    const nodeProcessor = new NodeProcessor(fileConfig, pageSources, variableProcessor,
                                            pluginManager, siteLinkManager, undefined, docId);

    const nunjucksProcessed = variableProcessor.renderWithSiteVariables(this.sourceFilePath, pageSources);
    const mdHtmlProcessed = await nodeProcessor.process(this.sourceFilePath, nunjucksProcessed,
                                                        asIfAtFilePath) as string;
    const pluginPostRendered = pluginManager.postRender(nodeProcessor.frontmatter, mdHtmlProcessed);

    const outputContentHTML = process.env.TEST_MODE
      ? htmlBeautify(pluginPostRendered, pluginManager.htmlBeautifyOptions)
      : pluginPostRendered;

    await fs.outputFile(resultPath, outputContentHTML);

    pageSources.addAllToSet(this.includedFiles);

    await this.externalManager.generateDependencies(pageSources.getDynamicIncludeSrc(), this.includedFiles);

    return this;
  }
}
