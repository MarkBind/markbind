import path from 'path';
import fs from 'fs-extra';
import * as pagefind from 'pagefind';
import { SiteGenerationManager } from '../../../src/Site/SiteGenerationManager.js';
import {
  PAGE_NJK, SITE_JSON_DEFAULT,
  createSiteJsonWithPagefind,
  createMockIndex,
  createMockPagefind,
  createMockPagefindNullIndex,
} from '../utils/data.js';
import * as logger from '../../../src/utils/logger.js';

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
    this.addressablePages = [];
    this.pages = [];
    this.collectAddressablePages = jest.fn().mockImplementation(() => {
      // Do nothing - preserve the manually set addressablePages for testing
    });
    this.setBaseUrlMap = jest.fn().mockImplementation((map) => {
      this.baseUrlMap = map;
    });
    this.createPage = jest.fn();
    this.getFavIconUrl = jest.fn();
    this.mapAddressablePagesToPages = jest.fn();
  }),
}));

jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Access mocked constructors to create instances for injection
const { SiteAssetsManager } = require('../../../src/Site/SiteAssetsManager.js');
const { SitePagesManager } = require('../../../src/Site/SitePagesManager.js');

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

  describe('indexSiteWithPagefind', () => {
    beforeEach(() => {
      const json = {
        ...PAGE_NJK,
        'site.json': SITE_JSON_DEFAULT,
        '_site/index.html': '<html><body>Test page</body></html>',
        '_site/page1.html': '<html><body>Page 1</body></html>',
      };
      mockFs.vol.fromJSON(json, rootPath);
    });

    test('should use default pagefind configuration when not specified', async () => {
      // This test verifies that readSiteConfig properly sets up the siteConfig.pagefind
      await generationManager.readSiteConfig();
      expect(generationManager.siteConfig.pagefind).toBeUndefined();
    });

    test('should read pagefind configuration from site.json', async () => {
      const customSiteJson = createSiteJsonWithPagefind({
        pagefind: {
          exclude_selectors: ['.no-index', '#sidebar'],
        },
      });
      mockFs.vol.fromJSON({
        ...PAGE_NJK,
        'site.json': customSiteJson,
        '_site/index.html': '<html><body>Test</body></html>',
      }, rootPath);

      await generationManager.readSiteConfig();
      expect(generationManager.siteConfig.pagefind).toEqual({
        exclude_selectors: ['.no-index', '#sidebar'],
      });
    });

    test('should index site with default configuration', async () => {
      const json = {
        ...PAGE_NJK,
        'site.json': SITE_JSON_DEFAULT,
        '_site/index.html': '<html><body>Test page</body></html>',
      };
      mockFs.vol.fromJSON(json, rootPath);

      const mockPagefindInstance = createMockPagefind(createMockIndex({ page_count: 5, errors: [] }));
      const pagefindSpy = jest.spyOn(pagefind, 'createIndex').mockResolvedValue(
        mockPagefindInstance.createIndex({}) as any,
      );

      await generationManager.readSiteConfig();
      await generationManager.indexSiteWithPagefind();

      expect(pagefindSpy).toHaveBeenCalledWith({
        keepIndexUrl: true,
        verbose: true,
        logfile: 'debug.log',
      });

      pagefindSpy.mockRestore();
    });

    test('should use excludeSelectors from pagefind config', async () => {
      const customSiteJson = createSiteJsonWithPagefind({
        pagefind: {
          exclude_selectors: ['.no-index', '#sidebar'],
        },
      });
      mockFs.vol.fromJSON({
        ...PAGE_NJK,
        'site.json': customSiteJson,
        '_site/index.html': '<html><body>Test</body></html>',
      }, rootPath);

      const mockPagefindInstance = createMockPagefind(createMockIndex({ page_count: 1, errors: [] }));
      const pagefindSpy = jest.spyOn(pagefind, 'createIndex').mockResolvedValue(
        mockPagefindInstance.createIndex({}) as any,
      );

      await generationManager.readSiteConfig();
      await generationManager.indexSiteWithPagefind();

      expect(pagefindSpy).toHaveBeenCalledWith({
        keepIndexUrl: true,
        verbose: true,
        logfile: 'debug.log',
        excludeSelectors: ['.no-index', '#sidebar'],
      });

      pagefindSpy.mockRestore();
    });

    test('should index searchable pages using addHTMLFile', async () => {
      const json = {
        ...PAGE_NJK,
        'site.json': SITE_JSON_DEFAULT,
        '_site/index.html': '<html><body>Test</body></html>',
      };
      mockFs.vol.fromJSON(json, rootPath);

      const mockIndex = createMockIndex({ page_count: 1, errors: [] }, { errors: [] });
      const mockPagefindInstance = createMockPagefind(mockIndex, true);
      const pagefindSpy = jest.spyOn(pagefind, 'createIndex').mockResolvedValue(
        mockPagefindInstance.createIndex({}) as any,
      );

      generationManager.siteConfig = { pagefind: { enablePagefind: true }, pages: [] } as any;
      const pageConfig = { resultPath: path.join(outputPath, 'index.html'), searchable: true };
      generationManager.sitePages.pages = [{ pageConfig }] as any;

      await generationManager.indexSiteWithPagefind();

      expect(mockIndex.addHTMLFile).toHaveBeenCalledWith({
        sourcePath: 'index.html',
        content: '<html><body>Test</body></html>',
      });

      pagefindSpy.mockRestore();
    });

    test('should log errors from addHTMLFile', async () => {
      const json = {
        ...PAGE_NJK,
        'site.json': SITE_JSON_DEFAULT,
        '_site/index.html': '<html><body>Test</body></html>',
      };
      mockFs.vol.fromJSON(json, rootPath);

      const mockIndex = createMockIndex(
        { page_count: 0, errors: [] },
        { errors: ['Error 1', 'Error 2'] },
      );
      const mockPagefindInstance = createMockPagefind(mockIndex, true);
      const pagefindSpy = jest.spyOn(pagefind, 'createIndex').mockResolvedValue(
        mockPagefindInstance.createIndex({}) as any,
      );
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation();

      generationManager.siteConfig = { pagefind: { enablePagefind: true }, pages: [] } as any;
      const pageConfig2 = { resultPath: path.join(outputPath, 'index.html'), searchable: true };
      generationManager.sitePages.pages = [{ pageConfig: pageConfig2 }] as any;

      await generationManager.indexSiteWithPagefind();

      expect(errorSpy).toHaveBeenCalledWith('Error 1');
      expect(errorSpy).toHaveBeenCalledWith('Error 2');

      pagefindSpy.mockRestore();
      errorSpy.mockRestore();
    });

    test('should skip indexing when pagefind import fails', async () => {
      const json = {
        ...PAGE_NJK,
        'site.json': SITE_JSON_DEFAULT,
        '_site/index.html': '<html><body>Test</body></html>',
      };
      mockFs.vol.fromJSON(json, rootPath);

      const pagefindSpy = jest.spyOn(pagefind, 'createIndex').mockRejectedValue(
        new Error('Module not found'),
      );
      const warnSpy = jest.spyOn(logger, 'warn').mockImplementation();

      await generationManager.readSiteConfig();
      await generationManager.indexSiteWithPagefind();

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Pagefind indexing skipped'));

      pagefindSpy.mockRestore();
      warnSpy.mockRestore();
    });

    test('should handle when createIndex returns null index', async () => {
      const json = {
        ...PAGE_NJK,
        'site.json': SITE_JSON_DEFAULT,
        '_site/index.html': '<html><body>Test</body></html>',
      };
      mockFs.vol.fromJSON(json, rootPath);

      const mockPagefindInstance = createMockPagefindNullIndex();
      const pagefindSpy = jest.spyOn(pagefind, 'createIndex').mockResolvedValue(
        mockPagefindInstance.createIndex({}) as any,
      );
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation();

      await generationManager.readSiteConfig();
      await generationManager.indexSiteWithPagefind();

      expect(errorSpy).toHaveBeenCalledWith('Pagefind failed to create index');

      pagefindSpy.mockRestore();
      errorSpy.mockRestore();
    });

    test('should skip missing pages in onePage mode without error', async () => {
      const generationManagerOnePage = new SiteGenerationManager(
        rootPath,
        outputPath,
        'index.md',
        false,
        undefined,
        false,
        false,
        () => {},
      );
      generationManagerOnePage.configure(siteAssets, sitePages);

      const json = {
        ...PAGE_NJK,
        'site.json': SITE_JSON_DEFAULT,
        '_site/index.html': '<html><body>Existing page</body></html>',
      };
      mockFs.vol.fromJSON(json, rootPath);

      const mockIndex = createMockIndex({ page_count: 1, errors: [] }, { errors: [] });
      const mockPagefindInstance = createMockPagefind(mockIndex, true);
      const pagefindSpy = jest.spyOn(pagefind, 'createIndex').mockResolvedValue(
        mockPagefindInstance.createIndex({}) as any,
      );
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation();

      generationManagerOnePage.siteConfig = { pagefind: { enablePagefind: true }, pages: [] } as any;
      generationManagerOnePage.sitePages.pages = [
        { pageConfig: { resultPath: path.join(outputPath, 'index.html'), searchable: true } },
        { pageConfig: { resultPath: path.join(outputPath, 'page2.html'), searchable: true } },
      ] as any;

      await generationManagerOnePage.indexSiteWithPagefind();

      expect(mockIndex.addHTMLFile).toHaveBeenCalledTimes(1);
      expect(mockIndex.addHTMLFile).toHaveBeenCalledWith({
        sourcePath: 'index.html',
        content: '<html><body>Existing page</body></html>',
      });

      expect(errorSpy).not.toHaveBeenCalled();

      pagefindSpy.mockRestore();
      errorSpy.mockRestore();
    });

    test('should calculate searchable page count from addressablePages', async () => {
      const json = {
        ...PAGE_NJK,
        'site.json': SITE_JSON_DEFAULT,
        '_site/index.html': '<html><body>Test page</body></html>',
        '_site/page1.html': '<html><body>Page 1</body></html>',
        '_site/page2.html': '<html><body>Page 2</body></html>',
      };
      mockFs.vol.fromJSON(json, rootPath);

      const mockIndex = createMockIndex({ page_count: 3, errors: [] }, { errors: [] });
      const mockPagefindInstance = createMockPagefind(mockIndex, true);
      const pagefindSpy = jest.spyOn(pagefind, 'createIndex').mockResolvedValue(
        mockPagefindInstance.createIndex({}) as any,
      );
      const infoSpy = jest.spyOn(logger, 'info').mockImplementation();

      generationManager.siteConfig = { pagefind: { enablePagefind: true }, pages: [] } as any;
      generationManager.sitePages.pages = [
        { pageConfig: { resultPath: path.join(outputPath, 'index.html'), searchable: true } },
        { pageConfig: { resultPath: path.join(outputPath, 'page1.html'), searchable: true } },
        { pageConfig: { resultPath: path.join(outputPath, 'page2.html'), searchable: false } },
      ] as any;

      await generationManager.indexSiteWithPagefind();

      expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(/Pagefind indexed 2 pages in/));

      pagefindSpy.mockRestore();
      infoSpy.mockRestore();
    });

    test('should handle searchable as string "no"', async () => {
      const json = {
        ...PAGE_NJK,
        'site.json': SITE_JSON_DEFAULT,
        '_site/index.html': '<html><body>Test page</body></html>',
        '_site/page1.html': '<html><body>Page 1</body></html>',
      };
      mockFs.vol.fromJSON(json, rootPath);

      const mockIndex = createMockIndex({ page_count: 1, errors: [] }, { errors: [] });
      const mockPagefindInstance = createMockPagefind(mockIndex, true);
      const pagefindSpy = jest.spyOn(pagefind, 'createIndex').mockResolvedValue(
        mockPagefindInstance.createIndex({}) as any,
      );
      const infoSpy = jest.spyOn(logger, 'info').mockImplementation();

      generationManager.siteConfig = { pagefind: { enablePagefind: true }, pages: [] } as any;
      generationManager.sitePages.pages = [
        { pageConfig: { resultPath: path.join(outputPath, 'index.html'), searchable: false } },
        { pageConfig: { resultPath: path.join(outputPath, 'page1.html'), searchable: true } },
      ] as any;

      await generationManager.indexSiteWithPagefind();

      expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(/Pagefind indexed 1 pages in/));

      pagefindSpy.mockRestore();
      infoSpy.mockRestore();
    });

    test('should handle all pages non-searchable', async () => {
      const json = {
        ...PAGE_NJK,
        'site.json': SITE_JSON_DEFAULT,
        '_site/index.html': '<html><body>Test page</body></html>',
      };
      mockFs.vol.fromJSON(json, rootPath);

      const mockIndex = createMockIndex({ page_count: 1, errors: [] });
      const mockPagefindInstance = createMockPagefind(mockIndex, true);
      const pagefindSpy = jest.spyOn(pagefind, 'createIndex').mockResolvedValue(
        mockPagefindInstance.createIndex({}) as any,
      );
      const infoSpy = jest.spyOn(logger, 'info').mockImplementation();

      generationManager.siteConfig = { pagefind: { enablePagefind: true } } as any;
      generationManager.sitePages.addressablePages = [{ src: 'index.md', searchable: false }];

      await generationManager.indexSiteWithPagefind();

      expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(/Pagefind indexed 0 pages in/));

      pagefindSpy.mockRestore();
      infoSpy.mockRestore();
    });
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
