import path from 'path';
import fs from 'fs-extra';
import { SiteGenerationManager } from '../../../src/Site/SiteGenerationManager';
import {
  PAGE_NJK, SITE_JSON_DEFAULT,
} from '../utils/data';

// We use 'memfs' (via the mocked 'fs' module) to simulate a file system in memory.
// This ensures that no actual files are written to the disk during testing,
// keeping tests fast and isolated.
const mockFs = fs as any;
jest.mock('fs');
jest.mock('walk-sync');
jest.mock('../../../src/Page');
jest.mock('../../../src/plugins/PluginManager');
jest.mock('../../../src/Site/SiteAssetsManager', () => ({
  SiteAssetsManager: jest.fn().mockImplementation(() => ({
    removeAsset: jest.fn(),
    buildAsset: jest.fn(),
    buildAssets: jest.fn(),
    handleIgnoreReload: jest.fn(),
    handleStyleReload: jest.fn(),
  })),
}));

jest.mock('../../../src/Site/SitePagesManager', () => ({
  SitePagesManager: jest.fn().mockImplementation(function (this: any) {
    this.baseUrlMap = new Set();
    this.collectAddressablePages = jest.fn();
    this.setBaseUrlMap = jest.fn().mockImplementation((map) => {
      this.baseUrlMap = map;
    });
    this.createPage = jest.fn();
    this.getFavIconUrl = jest.fn();
    this.mapAddressablePagesToPages = jest.fn();
  }),
}));

// Access mocked constructors to create instances for injection
const { SiteAssetsManager } = require('../../../src/Site/SiteAssetsManager');
const { SitePagesManager } = require('../../../src/Site/SitePagesManager');

const rootPath = '/tmp/test';
const outputPath = '/tmp/test/_site';

afterEach(() => {
  mockFs.vol.reset();
});

describe('SiteGenerationManager', () => {
  let generationManager: SiteGenerationManager;
  let siteAssets: any;
  let sitePages: any;

  beforeEach(() => {
    siteAssets = new SiteAssetsManager();
    sitePages = new SitePagesManager();
    generationManager = new SiteGenerationManager(
      rootPath,
      outputPath,
      '',
      false,
      undefined,
      false,
      false,
      () => {},
    );
    generationManager.configure(siteAssets, sitePages);
  });

  test('collectBaseUrl should collect baseurls correctly for sub nested subsites', async () => {
    const json = {
      ...PAGE_NJK,
      'site.json': SITE_JSON_DEFAULT,
      'sub/site.json': SITE_JSON_DEFAULT,
      'sub/sub/site.json': SITE_JSON_DEFAULT,
      'otherSub/sub/site.json': SITE_JSON_DEFAULT,
    };
    mockFs.vol.fromJSON(json, rootPath);

    const baseUrlMapExpected = new Set(['', 'sub', 'sub/sub', 'otherSub/sub']
      .map(url => path.resolve(rootPath, url)));

    await generationManager.readSiteConfig();
    generationManager.collectBaseUrl();
    expect(generationManager.sitePages.baseUrlMap).toEqual(baseUrlMapExpected);
  });

  test('readSiteConfig should read default site config', async () => {
    const json = {
      ...PAGE_NJK,
      'site.json': SITE_JSON_DEFAULT,
    };
    mockFs.vol.fromJSON(json, rootPath);

    const expectedSiteConfigDefaults = { enableSearch: true };
    const expectedSiteConfig = { ...JSON.parse(SITE_JSON_DEFAULT), ...expectedSiteConfigDefaults };

    const siteConfig = await generationManager.readSiteConfig();

    expect(siteConfig.baseUrl).toEqual(expectedSiteConfig.baseUrl);
    expect(siteConfig.titlePrefix).toEqual(expectedSiteConfig.titlePrefix);
    expect(siteConfig.titleSuffix).toEqual(expectedSiteConfig.titleSuffix);
    expect(siteConfig.ignore).toEqual(expectedSiteConfig.ignore);
    expect(siteConfig.pages).toEqual(expectedSiteConfig.pages);
    expect(siteConfig.deploy).toEqual(expectedSiteConfig.deploy);
    expect(siteConfig.enableSearch).toEqual(expectedSiteConfig.enableSearch);
  });

  test('readSiteConfig should read custom site config', async () => {
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
    mockFs.vol.fromJSON(json, rootPath);

    const siteConfig = await generationManager.readSiteConfig();

    expect(siteConfig.baseUrl).toEqual(customSiteJson.baseUrl);
    expect(siteConfig.pages).toEqual(customSiteJson.pages);
    expect(siteConfig.ignore).toEqual(customSiteJson.ignore);
    expect(siteConfig.deploy).toEqual(customSiteJson.deploy);
    expect(siteConfig.enableSearch).toEqual(customSiteJson.enableSearch);
  });

  test('collectUserDefinedVariablesMap should resolve variables referencing other variables', async () => {
    const json = {
      ...PAGE_NJK,
      'site.json': SITE_JSON_DEFAULT,
      '_markbind/variables.md':
      '<variable name="level1">variable</variable>'
      + '<variable name="level2">{{level1}}</variable>'
      + '<variable name="level3"><span style="color: blue">Blue text</span></variable>'
      + '<variable name="level4">{{level3}}</variable>',
    };
    mockFs.vol.fromJSON(json, rootPath);

    await generationManager.readSiteConfig();
    generationManager.collectBaseUrl();
    generationManager.collectUserDefinedVariablesMap();

    const root = generationManager.variableProcessor.userDefinedVariablesMap[path.resolve(rootPath)];

    expect(root.level1).toEqual('variable');
    expect(root.level2).toEqual('variable');
    const expectedTextSpan = '<span style="color: blue">Blue text</span>';
    expect(root.level3).toEqual(expectedTextSpan);
    expect(root.level4).toEqual(expectedTextSpan);
  });

  test('collectUserDefinedVariablesMap should read correct user defined variables', async () => {
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
    mockFs.vol.fromJSON(json, rootPath);

    await generationManager.readSiteConfig();
    generationManager.collectBaseUrl();
    generationManager.collectUserDefinedVariablesMap();

    const root = generationManager.variableProcessor
      .userDefinedVariablesMap[path.resolve(rootPath)];
    const sub = generationManager.variableProcessor
      .userDefinedVariablesMap[path.resolve(rootPath, 'sub')];
    const subsub = generationManager.variableProcessor
      .userDefinedVariablesMap[path.resolve(rootPath, 'sub/sub')];
    const othersub = generationManager.variableProcessor
      .userDefinedVariablesMap[path.resolve(rootPath, 'otherSub/sub')];

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
});
