import { v4 as uuidv4 } from 'uuid';

import { PageSources } from '../Page/PageSources';
import { NodeProcessor, NodeProcessorConfig } from '../html/NodeProcessor';

import * as logger from '../utils/logger';
import { VariableProcessor } from '../variables/VariableProcessor';
import { PluginManager } from '../plugins/PluginManager';
import { SiteLinkManager } from '../html/SiteLinkManager';
import { ExternalManager } from '../External/ExternalManager';

const LAYOUT_PAGE_BODY_VARIABLE = 'content';

export type LayoutConfig = {
  pluginManager: PluginManager;
  siteLinkManager: SiteLinkManager;
  variableProcessor: VariableProcessor;
  externalManager: ExternalManager;
} & NodeProcessorConfig;

export class Layout {
  sourceFilePath: string;
  config: LayoutConfig;

  includedFiles: Set<string>;
  layoutProcessed: string;
  layoutPageBodyVariable: string;
  layoutPageNavUuid: string;
  headTop: string[];
  headBottom: string[];
  scriptBottom: string[];
  layoutUserScriptsAndStyles: string[];

  generatePromise?: Promise<any>;

  constructor(sourceFilePath: string, config: LayoutConfig) {
    this.sourceFilePath = sourceFilePath;
    this.config = config;

    this.includedFiles = new Set([this.sourceFilePath]);
    this.layoutProcessed = '';
    this.layoutPageBodyVariable = '';
    this.layoutPageNavUuid = '';
    this.headTop = [];
    this.headBottom = [];
    this.scriptBottom = [];
    this.layoutUserScriptsAndStyles = [];
  }

  shouldRegenerate(filePaths: string[]) {
    return filePaths.some(filePath => this.includedFiles.has(filePath));
  }

  async generate() {
    let triesLeft = 10;
    let numBodyVars;
    let pageSources;
    let nodeProcessor;

    do {
      const fileConfig = {
        ...this.config,
        headerIdMap: {},
      };
      pageSources = new PageSources();
      this.layoutPageBodyVariable = `{{${uuidv4()}-${uuidv4()}}}`;
      const layoutVariables = { [LAYOUT_PAGE_BODY_VARIABLE]: this.layoutPageBodyVariable };

      const { variableProcessor, pluginManager, siteLinkManager } = this.config;

      const nunjucksProcessed = variableProcessor.renderWithSiteVariables(
        this.sourceFilePath, pageSources, layoutVariables);
      nodeProcessor = new NodeProcessor(fileConfig, pageSources, variableProcessor,
                                        pluginManager, siteLinkManager, this.layoutUserScriptsAndStyles,
                                        'layout');
      // eslint-disable-next-line no-await-in-loop
      this.layoutProcessed = (await nodeProcessor.process(this.sourceFilePath, nunjucksProcessed,
                                                          this.sourceFilePath, layoutVariables)) as string;

      this.layoutPageNavUuid = nodeProcessor.pageNavProcessor.getUuid();

      this.layoutProcessed = pluginManager.postRender(nodeProcessor.frontmatter, this.layoutProcessed);

      const pageBodyVarRegex = new RegExp(this.layoutPageBodyVariable, 'g');
      const bodyVarMatch = this.layoutProcessed.match(pageBodyVarRegex);
      numBodyVars = bodyVarMatch ? bodyVarMatch.length : 0;

      triesLeft -= 1;
    } while (triesLeft > 0 && numBodyVars > 1);

    if (triesLeft === 0) {
      logger.error(
        `Layout ${this.sourceFilePath} uses more than one {{ ${LAYOUT_PAGE_BODY_VARIABLE} }} variable.`);
      return;
    }

    this.headTop = nodeProcessor.headTop;
    this.headBottom = nodeProcessor.headBottom;
    this.scriptBottom = nodeProcessor.scriptBottom;

    pageSources.addAllToSet(this.includedFiles);
    await this.config.externalManager.generateDependencies(pageSources.getDynamicIncludeSrc(),
                                                           this.includedFiles);
  }

  insertPage(pageContent: string, pageNav: string, pageIncludedFiles: Set<string>) {
    this.includedFiles.forEach(filePath => pageIncludedFiles.add(filePath));

    // Use function for .replace, in case string contains special patterns (e.g. $$, $&, $1, ...)
    return this.layoutProcessed
      .replace(this.layoutPageBodyVariable, () => pageContent)
      .replace(this.layoutPageNavUuid, () => pageNav);
  }

  getPageNjkAssets() {
    return {
      headTop: this.headTop,
      headBottom: this.headBottom,
      scriptBottom: this.scriptBottom,
      layoutUserScriptsAndStyles: this.layoutUserScriptsAndStyles,
    };
  }
}
