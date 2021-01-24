const path = require('path');
const fs = require('fs-extra');
const ghpages = require('gh-pages');
const Site = require('../../src/Site');

const {
  INDEX_MD_DEFAULT,
  PAGE_NJK,
  SITE_JSON_DEFAULT,
  getDefaultTemplateFileFullPath,
} = require('./utils/data');

const DEFAULT_TEMPLATE = 'default';

jest.mock('fs');
jest.mock('walk-sync');
jest.mock('gh-pages');
jest.mock('../../src/Page');
jest.mock('../../src/plugins/PluginManager');
jest.mock('simple-git', () => () => ({
  ...jest.requireActual('simple-git')(),
  // A test file should reduce dependencies on external libraries; use pure js functions instead.
  // eslint-disable-next-line lodash/prefer-constant
  catFile: jest.fn(() => 'mock-test-website.com'),
  // eslint-disable-next-line lodash/prefer-constant
  remote: jest.fn(() => 'https://github.com/mockName/mockRepo.git'),
}));

afterEach(() => fs.vol.reset());

test('Site Init with invalid template fails', async () => {
  // Mock default template in MemFS without site config
  const json = {
    ...PAGE_NJK,
    [getDefaultTemplateFileFullPath('index.md')]: INDEX_MD_DEFAULT,
  };

  fs.vol.fromJSON(json, '');

  Site.initSite('', DEFAULT_TEMPLATE)
    .catch((err) => {
      expect(err).toEqual(
        new Error('Template validation failed. Required files does not exist'));
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

  fs.vol.fromJSON(json, '');

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
  fs.vol.fromJSON(json, '');

  const baseUrlMapExpected = new Set(['', 'sub', 'sub/sub', 'otherSub/sub'].map(url => path.resolve(url)));

  const site = new Site('./', '_site');
  await site.readSiteConfig();
  await site.collectBaseUrl();
  expect(site.baseUrlMap).toEqual(baseUrlMapExpected);
});

test('Site removeAsync removes the correct asset', async () => {
  const json = {
    ...PAGE_NJK,
    '_site/toRemove.jpg': '',
    '_site/dontRemove.png': '',
    'toRemove.html': '',
  };
  fs.vol.fromJSON(json, '');

  const site = new Site('./', '_site');
  await site.removeAsset('toRemove.jpg');
  expect(fs.existsSync(path.resolve('_site/toRemove.jpg'))).toEqual(false);
  expect(fs.existsSync(path.resolve('_site/dontRemove.png'))).toEqual(true);
});

test('Site read site config for default', async () => {
  const json = {
    ...PAGE_NJK,
    'site.json': SITE_JSON_DEFAULT,
  };
  fs.vol.fromJSON(json, '');

  const expectedSiteConfigDefaults = { enableSearch: true };
  const expectedSiteConfig = { ...JSON.parse(SITE_JSON_DEFAULT), ...expectedSiteConfigDefaults };
  const site = new Site('./', '_site');
  const siteConfig = await site.readSiteConfig();

  expect(siteConfig.baseUrl).toEqual(expectedSiteConfig.baseUrl);
  expect(siteConfig.titlePrefix).toEqual(expectedSiteConfig.titlePrefix);
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
        title: 'My Markbind Website',
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
  fs.vol.fromJSON(json, '');

  const site = new Site('./', '_site');
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
  fs.vol.fromJSON(json, '');

  const site = new Site('./', '_site');
  await site.readSiteConfig();
  await site.collectBaseUrl();
  await site.collectUserDefinedVariablesMap();

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
  fs.vol.fromJSON(json, '');

  const site = new Site('./', '_site');
  await site.readSiteConfig();
  await site.collectBaseUrl();
  await site.collectUserDefinedVariablesMap();

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
  fs.vol.fromJSON(json, '');
  const site = new Site('./', '_site');
  await site.deploy();
  expect(ghpages.dir).toEqual('_site');
  expect(ghpages.options)
    .toEqual({
      branch: 'gh-pages',
      message: 'Site Update.',
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
  fs.vol.fromJSON(json, '');
  const site = new Site('./', '_site');
  await site.deploy();
  expect(ghpages.dir).toEqual('_site');
  expect(ghpages.options)
    .toEqual({
      branch: 'master',
      message: 'Custom Site Update.',
      repo: 'https://github.com/USER/REPO.git',
      remote: 'origin',
    });
});

test('Site should not deploy without a built site', async () => {
  const json = {
    ...PAGE_NJK,
    'site.json': SITE_JSON_DEFAULT,
  };
  fs.vol.fromJSON(json, '');
  const site = new Site('./', '_site');
  await expect(site.deploy())
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
    delete process.env.TRAVIS;
    delete process.env.GITHUB_TOKEN;
    delete process.env.TRAVIS_REPO_SLUG;
    delete process.env.APPVEYOR;
    delete process.env.APPVEYOR_REPO_NAME;
  });

  afterAll(() => {
    // Restore the original environment at the end of deploy Travis tests
    process.env = { ...OLD_ENV };
  });

  test.each([
    ['TRAVIS', 'TRAVIS_REPO_SLUG', { name: 'Deployment Bot', email: 'deploy@travis-ci.org' }],
    ['APPVEYOR', 'APPVEYOR_REPO_NAME', { name: 'AppVeyorBot', email: 'deploy@appveyor.com' }],
  ])('Site deploy -c/--ci deploys with default settings',
     async (ciIdentifier, repoSlugIdentifier, deployBotUser) => {
       process.env[ciIdentifier] = true;
       process.env[repoSlugIdentifier] = 'GENERIC_USER/GENERIC_REPO';
       process.env.GITHUB_TOKEN = 'githubToken';

       const json = {
         ...PAGE_NJK,
         'site.json': SITE_JSON_DEFAULT,
         _site: {},
       };
       fs.vol.fromJSON(json, '');
       const site = new Site('./', '_site');
       await site.deploy(true);
       expect(ghpages.options.repo)
         .toEqual(`https://${process.env.GITHUB_TOKEN}@github.com/${process.env[repoSlugIdentifier]}.git`);
       expect(ghpages.options.user).toEqual(deployBotUser);
     });

  test.each([
    ['TRAVIS', 'TRAVIS_REPO_SLUG'],
    ['APPVEYOR', 'APPVEYOR_REPO_NAME'],
  ])('Site deploy -c/--ci deploys with custom GitHub repo',
     async (ciIdentifier, repoSlugIdentifier) => {
       process.env[ciIdentifier] = true;
       process.env[repoSlugIdentifier] = 'GENERIC_USER/GENERIC_REPO';
       process.env.GITHUB_TOKEN = 'githubToken';

       const customRepoConfig = JSON.parse(SITE_JSON_DEFAULT);
       customRepoConfig.deploy.repo = 'https://github.com/USER/REPO.git';
       const json = {
         ...PAGE_NJK,
         'site.json': JSON.stringify(customRepoConfig),
         _site: {},
       };
       fs.vol.fromJSON(json, '');
       const site = new Site('./', '_site');
       await site.deploy(true);
       expect(ghpages.options.repo)
         .toEqual(`https://${process.env.GITHUB_TOKEN}@github.com/USER/REPO.git`);
     });

  test.each([
    ['TRAVIS', 'TRAVIS_REPO_SLUG'],
    ['APPVEYOR', 'APPVEYOR_REPO_NAME'],
  ])('Site deploy -c/--ci deploys to correct repo when .git is in repo name',
     async (ciIdentifier, repoSlugIdentifier) => {
       process.env[ciIdentifier] = true;
       process.env[repoSlugIdentifier] = 'GENERIC_USER/GENERIC_REPO.github.io';
       process.env.GITHUB_TOKEN = 'githubToken';

       const json = {
         ...PAGE_NJK,
         'site.json': SITE_JSON_DEFAULT,
         _site: {},
       };
       fs.vol.fromJSON(json, '');
       const site = new Site('./', '_site');
       await site.deploy(true);
       expect(ghpages.options.repo)
         .toEqual(`https://${process.env.GITHUB_TOKEN}@github.com/${process.env[repoSlugIdentifier]}.git`);
     });

  test('Site deploy -c/--ci should not deploy if not in CI environment', async () => {
    process.env.GITHUB_TOKEN = 'githubToken';

    const json = {
      ...PAGE_NJK,
      'site.json': SITE_JSON_DEFAULT,
      _site: {},
    };
    fs.vol.fromJSON(json, '');
    const site = new Site('./', '_site');
    await expect(site.deploy(true))
      .rejects
      .toThrow(new Error('-c/--ci should only be run in CI environments.'));
  });

  test.each([
    ['TRAVIS'],
    ['APPVEYOR'],
  ])('Site deploy -c/--ci should not deploy without authentication token', async (ciIdentifier) => {
    process.env[ciIdentifier] = true;

    const json = {
      ...PAGE_NJK,
      'site.json': SITE_JSON_DEFAULT,
      _site: {},
    };
    fs.vol.fromJSON(json, '');
    const site = new Site('./', '_site');
    await expect(site.deploy(true))
      .rejects
      .toThrow(new Error('The environment variable GITHUB_TOKEN does not exist.'));
  });

  test.each([
    ['TRAVIS'],
    ['APPVEYOR'],
  ])('Site deploy -c/--ci should not deploy if custom repository is not on GitHub', async (ciIdentifier) => {
    process.env[ciIdentifier] = true;
    process.env.GITHUB_TOKEN = 'githubToken';

    const invalidRepoConfig = JSON.parse(SITE_JSON_DEFAULT);
    invalidRepoConfig.deploy.repo = 'INVALID_GITHUB_REPO';
    const json = {
      ...PAGE_NJK,
      'site.json': JSON.stringify(invalidRepoConfig),
      _site: {},
    };
    fs.vol.fromJSON(json, '');
    const site = new Site('./', '_site');
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
    fs.vol.fromJSON(json, '');

    const site = new Site('./', '_site');
    site.siteConfig = customSiteConfig;
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
  fs.vol.fromJSON(json, '');

  const site = new Site('./', '_site');
  site.siteConfig = customSiteConfig;
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
    fs.vol.fromJSON(json, '');

    const site = new Site('./', '_site');
    site.siteConfig = customSiteConfig;
    site.collectAddressablePages();
    expect(site.addressablePages)
      .toEqual(testCase.expected);
  });
});
