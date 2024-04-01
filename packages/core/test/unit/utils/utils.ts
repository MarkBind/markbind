import path from 'path';

import { PageSources } from '../../../src/Page/PageSources';
import { NodeProcessor, NodeProcessorConfig } from '../../../src/html/NodeProcessor';
import { PluginManager } from '../../../src/plugins/PluginManager';
import { SiteLinkManager } from '../../../src/html/SiteLinkManager';
import { VariableProcessor } from '../../../src/variables/VariableProcessor';
import { PluginContext } from '../../../src/plugins/Plugin';

jest.mock('fs');
jest.mock('../../../src/plugins/PluginManager');

const ROOT_PATH = path.resolve('');
const OUTPUT_PATH = path.resolve('_site');
function getNewDefaultVariableProcessor() {
  const DEFAULT_VARIABLE_PROCESSOR = new VariableProcessor(ROOT_PATH, new Set([ROOT_PATH]));
  DEFAULT_VARIABLE_PROCESSOR.addUserDefinedVariable(ROOT_PATH, 'baseUrl', '{{baseUrl}}');

  return DEFAULT_VARIABLE_PROCESSOR;
}

export function getNewPluginManager(plugins: string[], pluginsContext: PluginContext) {
  const fileConfig: NodeProcessorConfig = {
    baseUrlMap: new Set([ROOT_PATH]),
    baseUrl: '',
    rootPath: ROOT_PATH,
    outputPath: OUTPUT_PATH,
    headerIdMap: {},
    ignore: [],
    addressablePagesSource: [],
    intrasiteLinkValidation: {
      enabled: false,
    },
    codeLineNumbers: false,
    plantumlCheck: false,
  };

  return new PluginManager(fileConfig, plugins, pluginsContext);
}

class TestableSiteLinkManager extends SiteLinkManager {
  public constructor(config: NodeProcessorConfig) {
    super(config);
  }

  public getIntralinkCollection() {
    return this.intralinkCollection;
  }

  public getFilePathToHashesMap() {
    return this.filePathToHashesMap;
  }

  public getConfig() {
    return this.config;
  }
}

export function getNewSiteLinkManager(intrasiteLinkValidationEnabled: boolean = false) {
  const fileConfig: NodeProcessorConfig = {
    baseUrlMap: new Set([ROOT_PATH]),
    baseUrl: '',
    rootPath: ROOT_PATH,
    outputPath: OUTPUT_PATH,
    headerIdMap: {},
    ignore: [],
    addressablePagesSource: [],
    intrasiteLinkValidation: {
      enabled: intrasiteLinkValidationEnabled,
    },
    codeLineNumbers: false,
    plantumlCheck: false,
  };

  return new TestableSiteLinkManager(fileConfig);
}

export function getNewNodeProcessor(pluginManager: PluginManager) {
  const fileConfig: NodeProcessorConfig = {
    baseUrlMap: new Set([ROOT_PATH]),
    baseUrl: '',
    rootPath: ROOT_PATH,
    headerIdMap: {},
    ignore: [],
    addressablePagesSource: [],
    intrasiteLinkValidation: { enabled: false },
    codeLineNumbers: false,
    outputPath: '',
    plantumlCheck: false,
  };

  return new NodeProcessor(fileConfig, new PageSources(), getNewDefaultVariableProcessor(),
                           pluginManager, getNewSiteLinkManager(), [], '');
}

export function getNewDefaultNodeProcessor() {
  return getNewNodeProcessor(getNewPluginManager([], {}));
}
