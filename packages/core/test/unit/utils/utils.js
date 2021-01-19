const path = require('path');

const { PageSources } = require('../../../src/Page/PageSources');
const { NodeProcessor } = require('../../../src/html/NodeProcessor');
const { PluginManager } = require('../../../src/plugins/PluginManager');
const VariableProcessor = require('../../../src/variables/VariableProcessor');

jest.mock('fs');
jest.mock('../../../src/plugins/PluginManager');

const ROOT_PATH = path.resolve('');
const OUTPUT_PATH = path.resolve('_site');
function getNewDefaultVariableProcessor() {
  const DEFAULT_VARIABLE_PROCESSOR = new VariableProcessor(ROOT_PATH, new Set([ROOT_PATH]));
  DEFAULT_VARIABLE_PROCESSOR.addUserDefinedVariable(ROOT_PATH, 'baseUrl', '{{baseUrl}}');

  return DEFAULT_VARIABLE_PROCESSOR;
}

function getNewPluginManager(plugins, pluginsContext) {
  const fileConfig = {
    baseUrlMap: new Set([ROOT_PATH]),
    baseUrl: '',
    rootPath: ROOT_PATH,
    outputPath: OUTPUT_PATH,
    headerIdMap: {},
    ignore: [],
    addressablePagesSource: [],
  };

  return new PluginManager(fileConfig, plugins, pluginsContext);
}

function getNewNodeProcessor(pluginManager) {
  const fileConfig = {
    baseUrlMap: new Set([ROOT_PATH]),
    baseUrl: '',
    rootPath: ROOT_PATH,
    headerIdMap: {},
    ignore: [],
    addressablePagesSource: [],
    intrasiteLinkValidation: { enabled: false },
  };

  return new NodeProcessor(fileConfig, new PageSources(),
                           getNewDefaultVariableProcessor(), pluginManager);
}

function getNewDefaultNodeProcessor() {
  return getNewNodeProcessor(getNewPluginManager([], {}));
}

module.exports = {
  getNewNodeProcessor,
  getNewDefaultNodeProcessor,
  getNewPluginManager,
};
