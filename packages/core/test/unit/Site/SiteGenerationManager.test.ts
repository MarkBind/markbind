import path from 'path';
import fs from 'fs-extra';
import { SiteGenerationManager } from '../../../src/Site/SiteGenerationManager';
import {
  PAGE_NJK, SITE_JSON_DEFAULT,
  createSiteJsonWithPagefind,
  createMockIndex,
  createMockPagefind,
  createMockPagefindNullIndex,
  createMockPagefindReject,
} from '../utils/data';
import * as logger from '../../../src/utils/logger';

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

jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
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

  describe('normalizeGlobPattern', () => {
    const prototypeMethod = (SiteGenerationManager.prototype as any).normalizeGlobPattern;

    test('should return pattern as-is if it ends with .html', () => {
      const result = prototypeMethod.call(generationManager, 'page.html');
      expect(result).toBe('page.html');
    });

    test('should append /*.html if pattern ends with /**', () => {
      const result = prototypeMethod.call(generationManager, 'dir/**');
      expect(result).toBe('dir/**/*.html');
    });

    test('should append .html if pattern ends with /*', () => {
      const result = prototypeMethod.call(generationManager, 'dir/*');
      expect(result).toBe('dir/*.html');
    });

    test('should append **/*.html if pattern ends with /', () => {
      const result = prototypeMethod.call(generationManager, 'dir/');
      expect(result).toBe('dir/**/*.html');
    });

    test('should append /**/*.html for plain directory names', () => {
      const result = prototypeMethod.call(generationManager, 'dir');
      expect(result).toBe('dir/**/*.html');
    });

    test('should return empty string for invalid path traversal patterns', () => {
      const result = prototypeMethod.call(generationManager, '../../../etc/**');
      expect(result).toBe('');
    });

    test('should return empty string for absolute paths', () => {
      const result = prototypeMethod.call(generationManager, '/etc/passwd');
      expect(result).toBe('');
    });
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

    test('should read glob configuration as string', async () => {
      const customSiteJson = createSiteJsonWithPagefind({
        pagefind: {
          glob: '**/docs/*.html',
        },
      });
      mockFs.vol.fromJSON({
        ...PAGE_NJK,
        'site.json': customSiteJson,
        '_site/index.html': '<html><body>Test</body></html>',
      }, rootPath);

      await generationManager.readSiteConfig();
      expect(generationManager.siteConfig.pagefind).toEqual({
        glob: '**/docs/*.html',
      });
    });

    test('should read glob configuration as array', async () => {
      const customSiteJson = createSiteJsonWithPagefind({
        pagefind: {
          glob: ['**/docs/*.html', '**/guide/*.html'],
        },
      });
      mockFs.vol.fromJSON({
        ...PAGE_NJK,
        'site.json': customSiteJson,
        '_site/index.html': '<html><body>Test</body></html>',
      }, rootPath);

      await generationManager.readSiteConfig();
      expect(generationManager.siteConfig.pagefind).toEqual({
        glob: ['**/docs/*.html', '**/guide/*.html'],
      });
    });

    test('should index site with default configuration', async () => {
      const json = {
        ...PAGE_NJK,
        'site.json': SITE_JSON_DEFAULT,
        '_site/index.html': '<html><body>Test page</body></html>',
      };
      mockFs.vol.fromJSON(json, rootPath);

      const mockPagefind = createMockPagefind(createMockIndex({ page_count: 5, errors: [] }));
      const getPagefindSpy = jest.spyOn(generationManager as any, 'getPagefind')
        .mockResolvedValue(mockPagefind);

      await generationManager.readSiteConfig();
      await generationManager.indexSiteWithPagefind();

      expect(getPagefindSpy).toHaveBeenCalled();
      expect(mockPagefind.createIndex).toHaveBeenCalledWith({
        keepIndexUrl: true,
        verbose: true,
        logfile: 'debug.log',
      });

      getPagefindSpy.mockRestore();
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

      const mockPagefind = createMockPagefind(createMockIndex({ page_count: 1, errors: [] }));
      const getPagefindSpy = jest.spyOn(generationManager as any, 'getPagefind')
        .mockResolvedValue(mockPagefind);

      await generationManager.readSiteConfig();
      await generationManager.indexSiteWithPagefind();

      expect(mockPagefind.createIndex).toHaveBeenCalledWith({
        keepIndexUrl: true,
        verbose: true,
        logfile: 'debug.log',
        excludeSelectors: ['.no-index', '#sidebar'],
      });

      getPagefindSpy.mockRestore();
    });

    test('should handle glob pattern as string', async () => {
      const customSiteJson = createSiteJsonWithPagefind({
        pagefind: {
          glob: '**/docs/*.html',
        },
      });
      mockFs.vol.fromJSON({
        ...PAGE_NJK,
        'site.json': customSiteJson,
        '_site/index.html': '<html><body>Test</body></html>',
      }, rootPath);

      const mockIndex = createMockIndex({ page_count: 3, errors: [] });
      const mockPagefind = createMockPagefind(mockIndex, true); // return index wrapped
      const getPagefindSpy = jest.spyOn(generationManager as any, 'getPagefind')
        .mockResolvedValue(mockPagefind);

      await generationManager.readSiteConfig();
      await generationManager.indexSiteWithPagefind();

      expect(mockIndex.addDirectory).toHaveBeenCalledWith({
        path: outputPath,
        glob: '**/docs/*.html',
      });

      getPagefindSpy.mockRestore();
    });

    test('should handle glob pattern as array', async () => {
      const customSiteJson = createSiteJsonWithPagefind({
        pagefind: {
          glob: ['**/docs/*.html', '**/guide/*.html'],
        },
      });
      mockFs.vol.fromJSON({
        ...PAGE_NJK,
        'site.json': customSiteJson,
        '_site/index.html': '<html><body>Test</body></html>',
      }, rootPath);

      const mockIndex = createMockIndex({ page_count: 2, errors: [] });
      const mockPagefind = createMockPagefind(mockIndex, true); // return index wrapped
      const getPagefindSpy = jest.spyOn(generationManager as any, 'getPagefind')
        .mockResolvedValue(mockPagefind);

      await generationManager.readSiteConfig();
      await generationManager.indexSiteWithPagefind();

      expect(mockIndex.addDirectory).toHaveBeenCalledTimes(2);
      expect(mockIndex.addDirectory).toHaveBeenNthCalledWith(1, {
        path: outputPath,
        glob: '**/docs/*.html',
      });
      expect(mockIndex.addDirectory).toHaveBeenNthCalledWith(2, {
        path: outputPath,
        glob: '**/guide/*.html',
      });

      getPagefindSpy.mockRestore();
    });

    test('should index all HTML files when no glob specified', async () => {
      const json = {
        ...PAGE_NJK,
        'site.json': SITE_JSON_DEFAULT,
        '_site/index.html': '<html><body>Test</body></html>',
      };
      mockFs.vol.fromJSON(json, rootPath);

      const mockIndex = createMockIndex({ page_count: 10, errors: [] });
      const mockPagefind = createMockPagefind(mockIndex, true); // return index wrapped
      const getPagefindSpy = jest.spyOn(generationManager as any, 'getPagefind')
        .mockResolvedValue(mockPagefind);

      await generationManager.readSiteConfig();
      await generationManager.indexSiteWithPagefind();

      expect(mockIndex.addDirectory).toHaveBeenCalledWith({
        path: outputPath,
      });

      getPagefindSpy.mockRestore();
    });

    test('should log errors from addDirectory', async () => {
      const json = {
        ...PAGE_NJK,
        'site.json': SITE_JSON_DEFAULT,
        '_site/index.html': '<html><body>Test</body></html>',
      };
      mockFs.vol.fromJSON(json, rootPath);

      const mockIndex = createMockIndex({ page_count: 1, errors: ['Error 1', 'Error 2'] });
      const mockPagefind = createMockPagefind(mockIndex, true); // return index wrapped
      const getPagefindSpy = jest.spyOn(generationManager as any, 'getPagefind')
        .mockResolvedValue(mockPagefind);
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation();

      await generationManager.readSiteConfig();
      await generationManager.indexSiteWithPagefind();

      expect(errorSpy).toHaveBeenCalledWith('Error 1');
      expect(errorSpy).toHaveBeenCalledWith('Error 2');

      getPagefindSpy.mockRestore();
      errorSpy.mockRestore();
    });

    test('should skip indexing when pagefind import fails', async () => {
      const json = {
        ...PAGE_NJK,
        'site.json': SITE_JSON_DEFAULT,
        '_site/index.html': '<html><body>Test</body></html>',
      };
      mockFs.vol.fromJSON(json, rootPath);

      const mockPagefind = createMockPagefindReject(new Error('Module not found'));
      const getPagefindSpy = jest.spyOn(generationManager as any, 'getPagefind')
        .mockResolvedValue(mockPagefind);
      const warnSpy = jest.spyOn(logger, 'warn').mockImplementation();

      await generationManager.readSiteConfig();
      await generationManager.indexSiteWithPagefind();

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Pagefind indexing skipped'));

      getPagefindSpy.mockRestore();
      warnSpy.mockRestore();
    });

    test('should handle when createIndex returns null index', async () => {
      const json = {
        ...PAGE_NJK,
        'site.json': SITE_JSON_DEFAULT,
        '_site/index.html': '<html><body>Test</body></html>',
      };
      mockFs.vol.fromJSON(json, rootPath);

      const mockPagefind = createMockPagefindNullIndex();
      const getPagefindSpy = jest.spyOn(generationManager as any, 'getPagefind')
        .mockResolvedValue(mockPagefind);
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation();

      await generationManager.readSiteConfig();
      await generationManager.indexSiteWithPagefind();

      expect(errorSpy).toHaveBeenCalledWith('Pagefind failed to create index');

      getPagefindSpy.mockRestore();
      errorSpy.mockRestore();
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
