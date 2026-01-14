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
jest.mock('walk-sync');
jest.mock('gh-pages');
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

jest.mock('simple-git', () => () => ({
  ...jest.requireActual('simple-git')(),
  // A test file should reduce dependencies on external libraries; use pure js functions instead.
  // eslint-disable-next-line lodash/prefer-constant
  catFile: jest.fn(() => 'mock-test-website.com'),
  // eslint-disable-next-line lodash/prefer-constant
  remote: jest.fn(() => 'https://github.com/mockName/mockRepo.git'),
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

test('Site collectAddressablePages delegates to SitePagesManager', async () => {
  const site = new Site(...siteArguments);
  const mockCollectAddressablePages = site.pagesManager.collectAddressablePages;
  await site.collectAddressablePages();
  expect(mockCollectAddressablePages).toHaveBeenCalled();
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

test('Site baseurls are correct for sub nested subsites', async () => {
  const json = {
    ...PAGE_NJK,
    'site.json': SITE_JSON_DEFAULT,
    'sub/site.json': SITE_JSON_DEFAULT,
    'sub/sub/site.json': SITE_JSON_DEFAULT,
    'otherSub/sub/site.json': SITE_JSON_DEFAULT,
  };
  mockFs.vol.fromJSON(json, '');

  const baseUrlMapExpected = new Set(['', 'sub', 'sub/sub', 'otherSub/sub'].map(url => path.resolve(url)));

  const site = new Site(...siteArguments);
  await site.readSiteConfig();
  site.collectBaseUrl();
  expect(site.baseUrlMap).toEqual(baseUrlMapExpected);
});

test('Site removeAsset delegates to SiteAssetsManager', async () => {
  mockFs.vol.fromJSON({ ...PAGE_NJK, 'site.json': SITE_JSON_DEFAULT }, '');
  const site = new Site(...siteArguments);
  await site.removeAsset('someAsset.jpg');

  expect(site.assetsManager.removeAsset).toHaveBeenCalledWith('someAsset.jpg');
});

test('Site read site config for default', async () => {
  const json = {
    ...PAGE_NJK,
    'site.json': SITE_JSON_DEFAULT,
  };
  mockFs.vol.fromJSON(json, '');

  const expectedSiteConfigDefaults = { enableSearch: true };
  const expectedSiteConfig = { ...JSON.parse(SITE_JSON_DEFAULT), ...expectedSiteConfigDefaults };
  const site = new Site(...siteArguments);
  const siteConfig = await site.readSiteConfig();

  expect(siteConfig.baseUrl).toEqual(expectedSiteConfig.baseUrl);
  expect(siteConfig.titlePrefix).toEqual(expectedSiteConfig.titlePrefix);
  expect(siteConfig.titleSuffix).toEqual(expectedSiteConfig.titleSuffix);
  expect(siteConfig.ignore).toEqual(expectedSiteConfig.ignore);
  expect(siteConfig.pages).toEqual(expectedSiteConfig.pages);
  expect(siteConfig.deploy).toEqual(expectedSiteConfig.deploy);
  expect(siteConfig.enableSearch).toEqual(expectedSiteConfig.enableSearch);
});

test('Site read site config for custom site config', async () => {
  const customSiteJson = {
    baseUrl: '',
    pages: [
      {
        src: 'index.md',
        title: 'My MarkBind Website',
      },
    ],
    ignore: [
      '_site/*',
      '*.json',
      '*.md',
    ],
    deploy: {
      message: 'Site Update.',
    },
    enableSearch: true,
  };
  const json = {
    ...PAGE_NJK,
    'site.json': JSON.stringify(customSiteJson),
  };
  mockFs.vol.fromJSON(json, '');

  const site = new Site(...siteArguments);
  const siteConfig = await site.readSiteConfig();

  expect(siteConfig.baseUrl).toEqual(customSiteJson.baseUrl);
  expect(siteConfig.pages).toEqual(customSiteJson.pages);
  expect(siteConfig.ignore).toEqual(customSiteJson.ignore);
  expect(siteConfig.deploy).toEqual(customSiteJson.deploy);
  expect(siteConfig.enableSearch).toEqual(customSiteJson.enableSearch);
});

test('Site resolves variables referencing other variables', async () => {
  const json = {
    ...PAGE_NJK,
    'site.json': SITE_JSON_DEFAULT,
    '_markbind/variables.md':
    '<variable name="level1">variable</variable>'
    + '<variable name="level2">{{level1}}</variable>'
    + '<variable name="level3"><span style="color: blue">Blue text</span></variable>'
    + '<variable name="level4">{{level3}}</variable>',
  };
  mockFs.vol.fromJSON(json, '');

  const site = new Site(...siteArguments);
  await site.readSiteConfig();
  site.collectBaseUrl();
  site.collectUserDefinedVariablesMap();

  const root = site.variableProcessor.userDefinedVariablesMap[path.resolve('')];

  // check all variables
  expect(root.level1).toEqual('variable');
  expect(root.level2).toEqual('variable');
  const expectedTextSpan = '<span style="color: blue">Blue text</span>';
  expect(root.level3).toEqual(expectedTextSpan);
  expect(root.level4).toEqual(expectedTextSpan);
});

test('Site read correct user defined variables', async () => {
  const json = {
    ...PAGE_NJK,
    'site.json': SITE_JSON_DEFAULT,
    'sub/site.json': SITE_JSON_DEFAULT,
    'sub/sub/site.json': SITE_JSON_DEFAULT,
    'otherSub/sub/site.json': SITE_JSON_DEFAULT,
    '_markbind/variables.md':
      '<variable name="variable">variable</variable>'
      + '<variable name="number">2</variable>',
    'sub/_markbind/variables.md': '<variable name="variable">sub_variable</variable>',
    'sub/sub/_markbind/variables.md': '<variable name="number">9999</variable>',
    'otherSub/sub/_markbind/variables.md': '<variable name="variable">other_variable</variable>',
  };
  mockFs.vol.fromJSON(json, '');

  const site = new Site(...siteArguments);
  await site.readSiteConfig();
  site.collectBaseUrl();
  site.collectUserDefinedVariablesMap();

  const root = site.variableProcessor.userDefinedVariablesMap[path.resolve('')];
  const sub = site.variableProcessor.userDefinedVariablesMap[path.resolve('sub')];
  const subsub = site.variableProcessor.userDefinedVariablesMap[path.resolve('sub/sub')];
  const othersub = site.variableProcessor.userDefinedVariablesMap[path.resolve('otherSub/sub')];

  // check all baseUrls
  expect(root.baseUrl).toEqual('');
  expect(sub.baseUrl).toEqual('/sub');
  expect(subsub.baseUrl).toEqual('/sub/sub');
  expect(othersub.baseUrl).toEqual('/otherSub/sub');

  // check other variables
  expect(root.variable).toEqual('variable');
  expect(root.number).toEqual('2');

  expect(sub.variable).toEqual('sub_variable');

  expect(othersub.variable).toEqual('other_variable');
  expect(subsub.number).toEqual('9999');
});

test('Site deploy delegates to SiteDeployManager', async () => {
  const json = {
    'site.json': SITE_JSON_DEFAULT,
  };
  mockFs.vol.fromJSON(json, '');
  const site = new Site(...siteArguments);
  const deploySpy = jest.spyOn(site.deployManager, 'deploy');
  deploySpy.mockImplementation(() => Promise.resolve(null));

  await site.deploy(false);
  expect(deploySpy).toHaveBeenCalledWith(false);
});
