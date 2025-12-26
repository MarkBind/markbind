import path from 'path';
import fs from 'fs-extra';
import { Page } from '../../../src/Page';
import { VariableProcessor } from '../../../src/variables/VariableProcessor';

const mockFs = fs as any;

jest.mock('fs');
jest.mock('walk-sync');
jest.mock('../../../src/Page/PageVueServerRenderer');
jest.mock('../../../src/html/NodeProcessor');
jest.mock('../../../src/variables/VariableProcessor');
jest.mock('../../../src/plugins/PluginManager');
jest.mock('../../../src/html/SiteLinkManager');
jest.mock('../../../src/Layout/LayoutManager');
jest.mock('../../../src/Page/PageSources');
jest.mock('../../../src/External/ExternalManager');

describe('Page', () => {
  const pageConfig = {
    sourcePath: 'test.md',
    resultPath: 'test.json',
  };
  const siteConfig = {
    baseUrl: '/',
    style: {
      codeLineNumbers: false,
    },
    ignore: [],
    intrasiteLinkValidation: {},
    plantumlCheck: false,
  };

  test('generate writes raw content for non-html files', async () => {
    mockFs.vol.fromJSON({
      'test.md': '{"foo": "bar"}',
    });

    // Mock the VariableProcessor instance to return a specific render method.
    // This is necessary because Page.generate uses VariableProcessor internally.
    (VariableProcessor as unknown as jest.Mock).mockImplementation(() => ({
      renderWithSiteVariables: jest.fn().mockReturnValue('{"foo": "bar"}'),
    }));

    // Inject the mocked variableProcessor into the Page configuration.
    // The Page constructor assigns this.pageConfig from the passed argument,
    // and subsequent methods use this.pageConfig.variableProcessor.
    const variableProcessor = {
      renderWithSiteVariables: jest.fn().mockReturnValue('{"foo": "bar"}'),
    };

    const configWithMock = {
      ...pageConfig,
      variableProcessor,
    };

    const page = new Page(configWithMock as any, siteConfig as any);

    const externalManager = {
      config: { outputPath: '_site' },
      generateDependencies: jest.fn(),
    };

    await page.generate(externalManager as any);

    // Verify fs.outputFile was called with correct content
    // Verify file content in mocked filesystem
    const content = fs.readFileSync(path.resolve('test.json'), 'utf8');
    expect(content).toEqual('{"foo": "bar"}');
  });
});
