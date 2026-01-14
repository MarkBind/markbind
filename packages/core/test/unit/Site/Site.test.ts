import path from 'path';
import fs from 'fs-extra';
import ghpages from 'gh-pages';
import { Site } from '../../../src/Site';
import { Template } from '../../../src/Site/template';

import {
  INDEX_MD_DEFAULT, PAGE_NJK, SITE_JSON_DEFAULT, getDefaultTemplateFileFullPath,
} from '../utils/data';
import { SiteConfig } from '../../../src/Site/SiteConfig';

const DEFAULT_TEMPLATE = 'default';
const mockFs = fs as any;
const mockGhPages = ghpages as any;
type SiteArguments = [string, string, string, undefined, undefined, any, boolean, () => void];
const siteArguments: SiteArguments = ['./', '_site', '', undefined, undefined, undefined, false, () => {}];

jest.mock('fs');
jest.mock('walk-sync');
jest.mock('gh-pages');
jest.mock('../../../src/Page');
jest.mock('../../../src/plugins/PluginManager');
jest.mock('simple-git', () => () => ({
  ...jest.requireActual('simple-git')(),
  // A test file should reduce dependencies on external libraries; use pure js functions instead.
  // eslint-disable-next-line lodash/prefer-constant
  catFile: jest.fn(() => 'mock-test-website.com'),
  // eslint-disable-next-line lodash/prefer-constant
  remote: jest.fn(() => 'https://github.com/mockName/mockRepo.git'),
}));

afterEach(() => mockFs.vol.reset());

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

test('Site removeAsync removes the correct asset', async () => {
  const json = {
    ...PAGE_NJK,
    '_site/toRemove.jpg': '',
    '_site/dontRemove.png': '',
    'toRemove.html': '',
  };
  mockFs.vol.fromJSON(json, '');

  const site = new Site(...siteArguments);
  await site.removeAsset('toRemove.jpg');
  expect(fs.existsSync(path.resolve('_site/toRemove.jpg'))).toEqual(false);
  expect(fs.existsSync(path.resolve('_site/dontRemove.png'))).toEqual(true);
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

test('Site deploys with default settings', async () => {
  const json = {
    ...PAGE_NJK,
    'site.json': SITE_JSON_DEFAULT,
    _site: {},
  };
  mockFs.vol.fromJSON(json, '');
  const site = new Site(...siteArguments);
  await site.deploy(false);
  expect(mockGhPages.dir).toEqual('_site');
  expect(mockGhPages.options)
    .toEqual({
      branch: 'gh-pages',
      message: 'Site Update. [skip ci]',
      repo: '',
      remote: 'origin',
    });
});

test('Site deploys with custom settings', async () => {
  const customConfig = JSON.parse(SITE_JSON_DEFAULT);
  customConfig.deploy = {
    message: 'Custom Site Update.',
    repo: 'https://github.com/USER/REPO.git',
    branch: 'master',
  };
  const json = {
    ...PAGE_NJK,
    'site.json': JSON.stringify(customConfig),
    _site: {},
  };
  mockFs.vol.fromJSON(json, '');
  const site = new Site(...siteArguments);
  await site.deploy(false);
  expect(mockGhPages.dir).toEqual('_site');
  expect(mockGhPages.options)
    .toEqual({
      branch: 'master',
      message: 'Custom Site Update. [skip ci]',
      repo: 'https://github.com/USER/REPO.git',
      remote: 'origin',
    });
});

test('Site should not deploy without a built site', async () => {
  const json = {
    ...PAGE_NJK,
    'site.json': SITE_JSON_DEFAULT,
  };
  mockFs.vol.fromJSON(json, '');
  const site = new Site(...siteArguments);
  await expect(site.deploy(false))
    .rejects
    .toThrow(
      new Error('The site directory does not exist. '
        + 'Please build the site first before deploy.'));
});

describe('Site deploy with various CI environments', () => {
  // Keep a copy of the original environment as we need to modify it for deploy Travis tests
  const OLD_ENV = { ...process.env };

  beforeEach(() => {
    // Delete all environment variables that affect tests
    delete process.env.GITHUB_TOKEN;
    delete process.env.TRAVIS;
    delete process.env.TRAVIS_REPO_SLUG;
    delete process.env.APPVEYOR;
    delete process.env.APPVEYOR_REPO_NAME;
    delete process.env.GITHUB_ACTIONS;
    delete process.env.GITHUB_REPOSITORY;
    delete process.env.CIRCLECI;
    delete process.env.CIRCLE_PROJECT_USERNAME;
    delete process.env.CIRCLE_PROJECT_REPONAME;
  });

  afterAll(() => {
    // Restore the original environment at the end of deploy Travis tests
    process.env = { ...OLD_ENV };
  });

  /* eslint-disable max-len */
  test.each([
    ['TRAVIS', { reposlug: 'TRAVIS_REPO_SLUG' }, { name: 'Deployment Bot', email: 'deploy@travis-ci.org' }],
    ['APPVEYOR', { reposlug: 'APPVEYOR_REPO_NAME' }, { name: 'AppVeyorBot', email: 'deploy@appveyor.com' }],
    ['GITHUB_ACTIONS', { reposlug: 'GITHUB_REPOSITORY' }, { name: 'github-actions', email: 'github-actions@github.com' }],
    ['CIRCLECI', { username: 'CIRCLE_PROJECT_USERNAME', reponame: 'CIRCLE_PROJECT_REPONAME' }, { name: 'circleci-bot', email: 'deploy@circleci.com' }],
  ])('Site deploy -c/--ci deploys with default settings',
  /* eslint-enable max-len */
     async (ciIdentifier, repoSlugIdentifier, deployBotUser) => {
       process.env[ciIdentifier] = 'true';
       process.env.GITHUB_TOKEN = 'githubToken';
       const genericRepoSlug = 'GENERIC_USER/GENERIC_REPO';
       if ((repoSlugIdentifier as { reposlug: string }).reposlug) {
         process.env[(repoSlugIdentifier as { reposlug: string }).reposlug] = genericRepoSlug;
       } else {
         const repoSlugIdentifierCasted = repoSlugIdentifier as { username: string, reponame: string };
         process.env[repoSlugIdentifierCasted.username] = 'GENERIC_USER';
         process.env[repoSlugIdentifierCasted.reponame] = 'GENERIC_REPO';
       }

       const json = {
         ...PAGE_NJK,
         'site.json': SITE_JSON_DEFAULT,
         _site: {},
       };
       mockFs.vol.fromJSON(json, '');
       const site = new Site(...siteArguments);
       await site.deploy(true);
       expect(mockGhPages.options.repo)
         .toEqual(`https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/${genericRepoSlug}.git`);
       expect(mockGhPages.options.user).toEqual(deployBotUser);
     });

  test.each([
    ['TRAVIS', { reposlug: 'TRAVIS_REPO_SLUG' }],
    ['APPVEYOR', { reposlug: 'APPVEYOR_REPO_NAME' }],
    ['GITHUB_ACTIONS', { reposlug: 'GITHUB_REPOSITORY' }],
    ['CIRCLECI', { username: 'CIRCLE_PROJECT_USERNAME', reponame: 'CIRCLE_PROJECT_REPONAME' }],
  ])('Site deploy -c/--ci deploys with custom GitHub repo',
     async (ciIdentifier, repoSlugIdentifier) => {
       process.env[ciIdentifier] = 'true';
       process.env.GITHUB_TOKEN = 'githubToken';
       if ((repoSlugIdentifier as { reposlug: string }).reposlug) {
         process.env[(repoSlugIdentifier as { reposlug: string }).reposlug] = 'GENERIC_USER/GENERIC_REPO';
       } else {
         const repoSlugIdentifierCasted = repoSlugIdentifier as { username: string, reponame: string };
         process.env[repoSlugIdentifierCasted.username] = 'GENERIC_USER';
         process.env[repoSlugIdentifierCasted.reponame] = 'GENERIC_REPO';
       }

       const customRepoConfig = JSON.parse(SITE_JSON_DEFAULT);
       customRepoConfig.deploy.repo = 'https://github.com/USER/REPO.git';
       const json = {
         ...PAGE_NJK,
         'site.json': JSON.stringify(customRepoConfig),
         _site: {},
       };
       mockFs.vol.fromJSON(json, '');
       const site = new Site(...siteArguments);
       await site.deploy(true);
       expect(mockGhPages.options.repo)
         .toEqual(`https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/USER/REPO.git`);
     });

  test.each([
    ['TRAVIS', { reposlug: 'TRAVIS_REPO_SLUG' }],
    ['APPVEYOR', { reposlug: 'APPVEYOR_REPO_NAME' }],
    ['GITHUB_ACTIONS', { reposlug: 'GITHUB_REPOSITORY' }],
    ['CIRCLECI', { username: 'CIRCLE_PROJECT_USERNAME', reponame: 'CIRCLE_PROJECT_REPONAME' }],
  ])('Site deploy -c/--ci deploys to correct repo when .git is in repo name',
     async (ciIdentifier, repoSlugIdentifier) => {
       process.env[ciIdentifier] = 'true';
       process.env.GITHUB_TOKEN = 'githubToken';
       const genericRepoSlug = 'GENERIC_USER/GENERIC_REPO.github.io';
       if ((repoSlugIdentifier as { reposlug: string }).reposlug) {
         process.env[(repoSlugIdentifier as { reposlug: string }).reposlug] = genericRepoSlug;
       } else {
         const repoSlugIdentifierCasted = repoSlugIdentifier as { username: string, reponame: string };
         process.env[repoSlugIdentifierCasted.username] = 'GENERIC_USER';
         process.env[repoSlugIdentifierCasted.reponame] = 'GENERIC_REPO.github.io';
       }

       const json = {
         ...PAGE_NJK,
         'site.json': SITE_JSON_DEFAULT,
         _site: {},
       };
       mockFs.vol.fromJSON(json, '');
       const site = new Site(...siteArguments);
       await site.deploy(true);
       expect(mockGhPages.options.repo)
         // eslint-disable-next-line max-len
         .toEqual(`https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/${genericRepoSlug}.git`);
     });

  test('Site deploy -c/--ci should not deploy if not in CI environment', async () => {
    process.env.GITHUB_TOKEN = 'githubToken';

    const json = {
      ...PAGE_NJK,
      'site.json': SITE_JSON_DEFAULT,
      _site: {},
    };
    mockFs.vol.fromJSON(json, '');
    const site = new Site(...siteArguments);
    await expect(site.deploy(true))
      .rejects
      .toThrow(new Error('-c/--ci should only be run in CI environments.'));
  });

  test.each([
    ['TRAVIS'],
    ['APPVEYOR'],
    ['GITHUB_ACTIONS'],
    ['CIRCLECI'],
  ])('Site deploy -c/--ci should not deploy without authentication token', async (ciIdentifier) => {
    process.env[ciIdentifier] = 'true';

    const json = {
      ...PAGE_NJK,
      'site.json': SITE_JSON_DEFAULT,
      _site: {},
    };
    mockFs.vol.fromJSON(json, '');
    const site = new Site(...siteArguments);
    await expect(site.deploy(true))
      .rejects
      .toThrow(new Error('The environment variable GITHUB_TOKEN does not exist.'));
  });

  test.each([
    ['TRAVIS'],
    ['APPVEYOR'],
    ['GITHUB_ACTIONS'],
    ['CIRCLECI'],
  ])('Site deploy -c/--ci should not deploy if custom repository is not on GitHub', async (ciIdentifier) => {
    process.env[ciIdentifier] = 'true';
    process.env.GITHUB_TOKEN = 'githubToken';

    const invalidRepoConfig = JSON.parse(SITE_JSON_DEFAULT);
    invalidRepoConfig.deploy.repo = 'INVALID_GITHUB_REPO';
    const json = {
      ...PAGE_NJK,
      'site.json': JSON.stringify(invalidRepoConfig),
      _site: {},
    };
    mockFs.vol.fromJSON(json, '');
    const site = new Site(...siteArguments);
    await expect(site.deploy(true))
      .rejects
      .toThrow(new Error('-c/--ci expects a GitHub repository.\n'
        + `The specified repository ${invalidRepoConfig.deploy.repo} is not valid.`));
  });
});

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
        searchable: undefined,
        layout: 'Layout',
        title: 'Title',
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
        searchable: false,
        layout: 'Layout',
      },
    ],
  },
  {
    name: 'Site.json page has priority over glob',
    pages: [
      {
        glob: '*.md',
        layout: 'Wrong',
      },
      {
        src: 'index.md',
        layout: 'Layout',
      },
      {
        glob: '*.md',
        layout: 'Wrong',
      },
    ],
    expected: [
      {
        src: 'index.md',
        searchable: undefined,
        layout: 'Layout',
      },
    ],
  },
  {
    name: 'Site.json glob latest match has priority',
    pages: [
      {
        glob: '*.md',
        layout: 'Wrong',
        searchable: false,
      },
      {
        glob: '*.md',
        layout: 'Layout',
        searchable: true,
      },
    ],
    expected: [
      {
        src: 'index.md',
        searchable: true,
        layout: 'Layout',
      },
    ],
  },
  {
    name: 'Site.json passes fileExtension property',
    pages: [
      {
        glob: '*.md',
        fileExtension: '.json',
      },
    ],
    expected: [
      {
        src: 'index.md',
        fileExtension: '.json',
        searchable: undefined,
      },
    ],
  },
  {
    name: 'Site.json merges valid fileExtension property with src',
    pages: [
      {
        src: 'index.md',
        fileExtension: '.json',
      },
    ],
    expected: [
      {
        src: 'index.md',
        fileExtension: '.json',
        searchable: undefined,
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
    mockFs.vol.fromJSON(json, '');

    const site = new Site(...siteArguments);
    site.siteConfig = customSiteConfig as unknown as SiteConfig;
    site.collectAddressablePages();
    expect(site.addressablePages)
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
  mockFs.vol.fromJSON(json, '');

  const site = new Site(...siteArguments);
  site.siteConfig = customSiteConfig as unknown as SiteConfig;
  expect(() => site.collectAddressablePages())
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
    mockFs.vol.fromJSON(json, '');

    const site = new Site(...siteArguments);
    site.siteConfig = customSiteConfig as unknown as SiteConfig;
    site.collectAddressablePages();
    expect(site.addressablePages)
      .toEqual(testCase.expected);
  });
});

test('createPage generates correct page config with fileExtension', async () => {
  const json = {
    ...PAGE_NJK,
    'site.json': SITE_JSON_DEFAULT,
    'test.md': '',
  };
  mockFs.vol.fromJSON(json, '');

  const site = new Site(...siteArguments);
  await site.readSiteConfig();
  const config = {
    pageSrc: 'test.md',
    title: 'Test Page',
    fileExtension: '.json',
    searchable: true,
    frontmatter: {},
    externalScripts: [],
  };
  site.createPage(config);

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
  mockFs.vol.fromJSON(json, '');

  const site = new Site(...siteArguments);
  await site.readSiteConfig();

  const page = {
    src: 'test.md',
    title: 'Test Page',
    layout: 'default',
    frontmatter: {},
    searchable: true,
    fileExtension: '.json',
  };

  site.createNewPage(page as any, undefined);

  // Page is mocked, retrieve the last call to the Page constructor
  const PageMock = jest.requireMock('../../../src/Page').Page;
  const lastCallIndex = PageMock.mock.calls.length - 1;
  const lastPageConfig = PageMock.mock.calls[lastCallIndex][0];

  expect(lastPageConfig.resultPath).toMatch(/test\.json$/);
  expect(lastPageConfig.sourcePath).toMatch(/test\.md$/);
});
