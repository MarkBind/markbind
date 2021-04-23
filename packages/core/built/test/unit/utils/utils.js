var path = require('path');
var PageSources = require('../../../src/Page/PageSources').PageSources;
var NodeProcessor = require('../../../src/html/NodeProcessor').NodeProcessor;
var PluginManager = require('../../../src/plugins/PluginManager').PluginManager;
var VariableProcessor = require('../../../src/variables/VariableProcessor');
jest.mock('fs');
jest.mock('../../../src/plugins/PluginManager');
var ROOT_PATH = path.resolve('');
var OUTPUT_PATH = path.resolve('_site');
function getNewDefaultVariableProcessor() {
    var DEFAULT_VARIABLE_PROCESSOR = new VariableProcessor(ROOT_PATH, new Set([ROOT_PATH]));
    DEFAULT_VARIABLE_PROCESSOR.addUserDefinedVariable(ROOT_PATH, 'baseUrl', '{{baseUrl}}');
    return DEFAULT_VARIABLE_PROCESSOR;
}
function getNewPluginManager(plugins, pluginsContext) {
    var fileConfig = {
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
    var fileConfig = {
        baseUrlMap: new Set([ROOT_PATH]),
        baseUrl: '',
        rootPath: ROOT_PATH,
        headerIdMap: {},
        ignore: [],
        addressablePagesSource: [],
    };
    return new NodeProcessor(fileConfig, new PageSources(), getNewDefaultVariableProcessor(), pluginManager);
}
function getNewDefaultNodeProcessor() {
    return getNewNodeProcessor(getNewPluginManager([], {}));
}
module.exports = {
    getNewNodeProcessor: getNewNodeProcessor,
    getNewDefaultNodeProcessor: getNewDefaultNodeProcessor,
    getNewPluginManager: getNewPluginManager,
};
