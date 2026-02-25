import fs from 'fs-extra';
import ignore from 'ignore';
import { SitePagesManager } from '../../../src/Site/SitePagesManager';
import { SiteConfig } from '../../../src/Site/SiteConfig';
import { PAGE_NJK, SITE_JSON_DEFAULT } from '../utils/data';
import * as fsUtil from '../../../src/utils/fsUtil';

const mockFs = fs as any;

jest.mock('fs');
jest.mock('../../../src/utils/fsUtil', () => {
  const originalModule = jest.requireActual('../../../src/utils/fsUtil');

  return {
    __esModule: true,
    ...originalModule,
    getFilePaths: jest.fn(),
    getPageGlobPaths: jest.fn(),
  };
});
jest.mock('../../../src/Page');
jest.mock('../../../src/plugins/PluginManager');

afterEach(() => {
  mockFs.vol.reset();
});

const rootPath = '/';
const outputPath = '_site';

describe('SitePagesManager', () => {
  const siteJsonResolvePropertiesTestCases = [
    {
      name: 'Site.json merge page and glob properties',
      pages: [
        {
          src: 'index.md',
          title: 'Title',
        },
        {
          glob: '*.md',
          layout: 'Layout',
        },
      ],
      expected: [
        {
          src: 'index.md',
          title: 'Title',
          layout: 'Layout',
        },
      ],
    },
    {
      name: 'Site.json merge glob properties',
      pages: [
        {
          glob: '*.md',
          layout: 'Layout',
        },
        {
          glob: '*.md',
          searchable: false,
        },
      ],
      expected: [
        {
          src: 'index.md',
          layout: 'Layout',
          searchable: false,
        },
      ],
    },
    {
      name: 'Site.json page has priority over glob',
      pages: [
        {
          glob: '*.md',
          layout: 'Layout',
        },
        {
          src: 'index.md',
          layout: 'PageLayout',
        },
      ],
      expected: [
        {
          src: 'index.md',
          layout: 'PageLayout',
        },
      ],
    },
    {
      name: 'Site.json glob latest match has priority',
      pages: [
        {
          glob: '*.md',
          layout: 'Layout',
        },
        {
          glob: '*.md',
          layout: 'Layout2',
        },
      ],
      expected: [
        {
          src: 'index.md',
          layout: 'Layout2',
        },
      ],
    },
    {
      name: 'Site.json passes fileExtension property',
      pages: [
        {
          src: 'index.md',
          fileExtension: '.html',
        },
      ],
      expected: [
        {
          src: 'index.md',
          fileExtension: '.html',
        },
      ],
    },
    {
      name: 'Site.json merges valid fileExtension property with src',
      pages: [
        {
          src: 'index.md',
        },
        {
          glob: '*.md',
          fileExtension: '.html',
        },
      ],
      expected: [
        {
          src: 'index.md',
          fileExtension: '.html',
        },
      ],
    },
  ];

  siteJsonResolvePropertiesTestCases.forEach((testCase) => {
    test(testCase.name, async () => {
      const customSiteConfig = {
        baseUrl: '',
        pages: testCase.pages,
        pagesExclude: [],
        ignore: [
          '_site/*',
          '*.json',
          '*.md',
        ],
        deploy: {
          message: 'Site Update.',
        },
      };
      const json = {
        ...PAGE_NJK,
        'index.md': '',
      };
      mockFs.vol.fromJSON(json, rootPath);

      const manager = new SitePagesManager(rootPath, outputPath, false);
      manager.siteConfig = customSiteConfig as unknown as SiteConfig;

      (fsUtil.getPageGlobPaths as jest.Mock).mockReturnValue(['index.md']);

      manager.collectAddressablePages();
      expect(manager.addressablePages)
        .toEqual(testCase.expected);
    });
  });

  test('Site config throws error on duplicate page src', async () => {
    const customSiteConfig = {
      baseUrl: '',
      pages: [
        {
          src: 'index.md',
          layout: 'Layout',
        },
        {
          src: 'index.md',
          title: 'Title',
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
    };
    const json = {
      ...PAGE_NJK,
      'index.md': '',
    };
    mockFs.vol.fromJSON(json, rootPath);

    const manager = new SitePagesManager(rootPath, outputPath, false);
    manager.siteConfig = customSiteConfig as unknown as SiteConfig;

    (fsUtil.getPageGlobPaths as jest.Mock).mockReturnValue(['index.md']);

    expect(() => manager.collectAddressablePages())
      .toThrow(new Error('Duplicate page entries found in site config: index.md'));
  });

  const siteJsonPageExclusionTestCases = [
    {
      name: 'Site.json excludes pages by glob exclude',
      pages: [
        {
          glob: '*.md',
          globExclude: ['exclude.md'],
        },
      ],
      expected: [
        {
          src: 'index.md',
        },
      ],
    },
    {
      name: 'Site.json excludes pages by pages exclude',
      pages: [
        {
          glob: '*.md',
        },
      ],
      pagesExclude: ['exclude.md'],
      expected: [
        {
          src: 'index.md',
        },
      ],
    },
    {
      name: 'Site.json excludes pages by combination of pages exclude and glob exclude',
      pages: [
        {
          glob: '*.md',
          globExclude: ['exclude.md'],
        },
      ],
      pagesExclude: ['index.md'],
      expected: [],
    },
  ];

  siteJsonPageExclusionTestCases.forEach((testCase) => {
    test(testCase.name, async () => {
      const customSiteConfig = {
        baseUrl: '',
        pages: testCase.pages,
        pagesExclude: testCase.pagesExclude || [],
        ignore: [
          '_site/*',
          '*.json',
          '*.md',
        ],
        deploy: {
          message: 'Site Update.',
        },
      };
      const json = {
        ...PAGE_NJK,
        'index.md': '',
        'exclude.md': '',
      };
      mockFs.vol.fromJSON(json, rootPath);
      const manager = new SitePagesManager(rootPath, outputPath, false);
      manager.siteConfig = customSiteConfig as unknown as SiteConfig;

      const allFiles = ['index.md', 'exclude.md'];
      (fsUtil.getPageGlobPaths as jest.Mock).mockImplementation(
        (_root: string, _globs: string[], ignPaths: string[]) => {
          const ig = ignore();
          ig.add(ignPaths);
          return allFiles.filter(f => !ig.ignores(f));
        },
      );

      manager.collectAddressablePages();
      expect(manager.addressablePages)
        .toEqual(testCase.expected);
    });
  });

  test('createPage generates correct page config with fileExtension', async () => {
    const json = {
      ...PAGE_NJK,
      'site.json': SITE_JSON_DEFAULT,
      'test.md': '',
    };
    mockFs.vol.fromJSON(json, rootPath);

    const manager = new SitePagesManager(rootPath, outputPath, false);
    manager.siteConfig = {
      ...JSON.parse(SITE_JSON_DEFAULT),
      style: { codeTheme: 'dark' },
    } as any;

    // Assign mock managers
    manager.pluginManager = {} as any;
    manager.siteLinkManager = {} as any;
    manager.variableProcessor = {} as any;
    manager.layoutManager = {} as any;

    const config = {
      pageSrc: 'test.md',
      title: 'Test Page',
      fileExtension: '.json',
      searchable: true,
      frontmatter: {},
      externalScripts: [],
    };
    manager.createPage(config);

    // Page is mocked
    const PageMock = jest.requireMock('../../../src/Page').Page;
    const pageConfig = PageMock.mock.calls[0][0];

    expect(pageConfig.resultPath).toMatch(/test\.json$/);
    expect(pageConfig.sourcePath).toMatch(/test\.md$/);
  });

  test('createNewPage generates correct page config', async () => {
    const json = {
      ...PAGE_NJK,
      'site.json': SITE_JSON_DEFAULT,
      'test.md': '',
    };
    mockFs.vol.fromJSON(json, rootPath);

    const manager = new SitePagesManager(rootPath, outputPath, false);
    manager.siteConfig = {
      ...JSON.parse(SITE_JSON_DEFAULT),
      style: { codeTheme: 'dark' },
    } as any;

    // Assign mock managers
    manager.pluginManager = {} as any;
    manager.siteLinkManager = {} as any;
    manager.variableProcessor = {} as any;
    manager.layoutManager = {} as any;

    const page = {
      src: 'test.md',
      title: 'Test Page',
      layout: 'default',
      frontmatter: {},
      searchable: true,
      fileExtension: '.json',
    };

    manager.createNewPage(page as any, undefined);

    // Page is mocked, retrieve the last call to the Page constructor
    const PageMock = jest.requireMock('../../../src/Page').Page;
    const lastCallIndex = PageMock.mock.calls.length - 1;
    // Ensure we have at least one call
    expect(lastCallIndex).toBeGreaterThanOrEqual(0);
    const lastPageConfig = PageMock.mock.calls[lastCallIndex][0];

    expect(lastPageConfig.resultPath).toMatch(/test\.json$/);
    expect(lastPageConfig.sourcePath).toMatch(/test\.md$/);
  });
});
