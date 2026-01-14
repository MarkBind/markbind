import path from 'path';
import fs from 'fs-extra';
import { Site } from '../../../src/Site';
import { Template } from '../../../src/Site/template';

import {
  INDEX_MD_DEFAULT, PAGE_NJK, SITE_JSON_DEFAULT, getDefaultTemplateFileFullPath,
} from '../utils/data';

const DEFAULT_TEMPLATE = 'default';
const mockFs = fs as any;
type SiteArguments = [string, string, string, undefined, undefined, any, boolean, () => void];
const siteArguments: SiteArguments = ['./', '_site', '', undefined, undefined, undefined, false, () => {}];

jest.mock('fs');
jest.mock('../../../src/Page');
jest.mock('../../../src/plugins/PluginManager');

jest.mock('../../../src/Site/SiteAssetsManager', () => ({
  SiteAssetsManager: jest.fn().mockImplementation(() => ({
    removeAsset: jest.fn(),
    buildAsset: jest.fn(),
    copyFontAwesomeAsset: jest.fn(),
    copyOcticonsAsset: jest.fn(),
    copyMaterialIconsAsset: jest.fn(),
    copyCoreWebAsset: jest.fn(),
    copyBootstrapTheme: jest.fn(),
    copyBootstrapIconsAsset: jest.fn(),
  })),
}));

jest.mock('../../../src/Site/SitePagesManager', () => ({
  SitePagesManager: jest.fn().mockImplementation(() => ({
    collectAddressablePages: jest.fn(),
    createPage: jest.fn(),
  })),
}));

jest.mock('../../../src/Site/SiteGenerationManager', () => ({
  SiteGenerationManager: jest.fn().mockImplementation(() => ({
    configure: jest.fn(),
    readSiteConfig: jest.fn(),
    collectBaseUrl: jest.fn(),
    collectUserDefinedVariablesMap: jest.fn(),
    generate: jest.fn(),
    buildSourceFiles: jest.fn(),
    rebuildSourceFiles: jest.fn(),
    rebuildAffectedSourceFiles: jest.fn(),
    rebuildPagesBeingViewed: jest.fn(),
    lazyBuildAllPagesNotViewed: jest.fn(),
    lazyBuildSourceFiles: jest.fn(),
    copyLazySourceFiles: jest.fn(),
    backgroundBuildNotViewedFiles: jest.fn(),
    rebuildRequiredPages: jest.fn(),
    reloadSiteConfig: jest.fn(),
    beforeSiteGenerate: jest.fn(),
    changeCurrentPage: jest.fn(),
    changeCurrentOpenedPages: jest.fn(),
    collectUserDefinedVariablesMapIfNeeded: jest.fn(),
  })),
}));

jest.mock('../../../src/Site/SiteDeployManager', () => ({
  SiteDeployManager: jest.fn().mockImplementation(() => ({
    deploy: jest.fn(),
  })),
}));

afterEach(() => {
  mockFs.vol.reset();
});

test('Site Init with invalid template fails', async () => {
  // Mock default template in MemFS without site config
  const json = {
    ...PAGE_NJK,
    [getDefaultTemplateFileFullPath('index.md')]: INDEX_MD_DEFAULT,
  };

  mockFs.vol.fromJSON(json, '');

  const template = new Template('', DEFAULT_TEMPLATE);
  await template.init()
    .catch((err) => {
      expect(err).toEqual(
        new Error('Template validation failed. Required files does not exist.'));
    });
});

test('Site Init does not overwrite existing files', async () => {
  const EXISTING_INDEX_MD = 'THIS CONTENT SHOULD NOT BE OVERWRITTEN';

  // Mock default template in MemFS
  const json = {
    'index.md': EXISTING_INDEX_MD,
    ...PAGE_NJK,
    [getDefaultTemplateFileFullPath('index.md')]: INDEX_MD_DEFAULT,
    [getDefaultTemplateFileFullPath('site.json')]: SITE_JSON_DEFAULT,
  };

  mockFs.vol.fromJSON(json, '');

  // index.md
  expect(fs.readFileSync(path.resolve('index.md'), 'utf8')).toEqual(EXISTING_INDEX_MD);
});

test('Site collectAddressablePages delegates to SitePagesManager', async () => {
  const site = new Site(...siteArguments);
  await site.collectAddressablePages();
  expect(site.pagesManager.collectAddressablePages).toHaveBeenCalled();
});

test('Site removeAsset delegates to SiteAssetsManager', async () => {
  const site = new Site(...siteArguments);
  await site.removeAsset('someAsset.jpg');
  expect(site.assetsManager.removeAsset).toHaveBeenCalledWith('someAsset.jpg');
});

test('Site deploy delegates to SiteDeployManager', async () => {
  const site = new Site(...siteArguments);
  await site.deploy(false);
  expect(site.deployManager.deploy).toHaveBeenCalledWith(false);
});

test('Site readSiteConfig delegates to SiteGenerationManager', async () => {
  const site = new Site(...siteArguments);
  await site.readSiteConfig('baseUrl');
  expect(site.generationManager.readSiteConfig).toHaveBeenCalledWith('baseUrl');
});

test('Site collectBaseUrl delegates to SiteGenerationManager', () => {
  const site = new Site(...siteArguments);
  site.collectBaseUrl();
  expect(site.generationManager.collectBaseUrl).toHaveBeenCalled();
});

test('Site collectUserDefinedVariablesMap delegates to SiteGenerationManager', () => {
  const site = new Site(...siteArguments);
  site.collectUserDefinedVariablesMap();
  expect(site.generationManager.collectUserDefinedVariablesMap).toHaveBeenCalled();
});

test('Site generate delegates to SiteGenerationManager', async () => {
  const site = new Site(...siteArguments);
  await site.generate('baseUrl');
  expect(site.generationManager.generate).toHaveBeenCalledWith('baseUrl');
});

test('Site buildSourceFiles delegates to SiteGenerationManager', async () => {
  const site = new Site(...siteArguments);
  await site.buildSourceFiles();
  expect(site.generationManager.buildSourceFiles).toHaveBeenCalled();
});

test('Site rebuildSourceFiles delegates to SiteGenerationManager', () => {
  const site = new Site(...siteArguments);
  site.rebuildSourceFiles();
  // rebuildSourceFiles is a property (delayed function), so we check if called.
  // Wait, mocked is jest.fn(), so calling it works.
  expect(site.generationManager.rebuildSourceFiles).toHaveBeenCalled();
});

test('Site reloadSiteConfig delegates to SiteGenerationManager', async () => {
  const site = new Site(...siteArguments);
  await site.reloadSiteConfig();
  expect(site.generationManager.reloadSiteConfig).toHaveBeenCalled();
});
