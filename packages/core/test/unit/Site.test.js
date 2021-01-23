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

const DEFAULT_GITHUB_TOKEN = 'githubToken';
const DEFAULT_TRAVIS_REPO_SLUG = 'TRAVIS_USER/TRAVIS_REPO';
const DEFAULT_APPVEYOR_REPO_SLUG = 'APPVEYOR_USER/APPVEYOR_REPO';
const DEFAULT_TRAVIS_USER = {
  name: 'Deployment Bot',
  email: 'deploy@travis-ci.org',
};
const DEFAULT_APPVEYOR_USER = {
  name: 'AppVeyorBot',
  email: 'deploy@appveyor.com',
};

test.each(
  [
    // default settings
    [
      true,
      DEFAULT_TRAVIS_REPO_SLUG,
      false,
      DEFAULT_APPVEYOR_REPO_SLUG,
      DEFAULT_GITHUB_TOKEN,
      false,
      false,
      true,
      'https://githubToken@github.com/TRAVIS_USER/TRAVIS_REPO.git',
      DEFAULT_TRAVIS_USER,
    ],
    // custom Github repo
    [
      true,
      DEFAULT_TRAVIS_REPO_SLUG,
      false,
      DEFAULT_APPVEYOR_REPO_SLUG,
      DEFAULT_GITHUB_TOKEN,
      true,
      false,
      true,
      'https://githubToken@github.com/USER/REPO.git',
      DEFAULT_TRAVIS_USER,
    ],
    // .git in repo name
    [
      true,
      'TRAVIS_USER/TRAVIS_REPO.github.io',
      false,
      DEFAULT_APPVEYOR_REPO_SLUG,
      DEFAULT_GITHUB_TOKEN,
      false,
      false,
      true,
      'https://githubToken@github.com/TRAVIS_USER/TRAVIS_REPO.github.io.git',
      DEFAULT_TRAVIS_USER,
    ],
    // should not deploy if not in Travis
    [
      false,
      DEFAULT_TRAVIS_REPO_SLUG,
      false,
      DEFAULT_APPVEYOR_REPO_SLUG,
      DEFAULT_GITHUB_TOKEN,
      false,
      false,
      false,
      '-c/--ci should only be run in CI environments.',
      DEFAULT_TRAVIS_USER,
    ],
    // should not deploy without auth token
    [
      true,
      DEFAULT_TRAVIS_REPO_SLUG,
      false,
      DEFAULT_APPVEYOR_REPO_SLUG,
      null,
      false,
      false,
      false,
      'The environment variable GITHUB_TOKEN does not exist.',
      DEFAULT_TRAVIS_USER,
    ],
    [
      true,
      DEFAULT_TRAVIS_REPO_SLUG,
      false,
      DEFAULT_APPVEYOR_REPO_SLUG,
      DEFAULT_GITHUB_TOKEN,
      false,
      true,
      false,
      '-c/--ci expects a GitHub repository.\nThe specified repository INVALID_GITHUB_REPO is not valid.',
      DEFAULT_TRAVIS_USER,
    ],
    // default settings
    [
      false,
      DEFAULT_TRAVIS_REPO_SLUG,
      true,
      DEFAULT_APPVEYOR_REPO_SLUG,
      DEFAULT_GITHUB_TOKEN,
      false,
      false,
      true,
      'https://githubToken@github.com/APPVEYOR_USER/APPVEYOR_REPO.git',
      DEFAULT_APPVEYOR_USER,
    ],
    // custom Github repo
    [
      false,
      DEFAULT_TRAVIS_REPO_SLUG,
      true,
      DEFAULT_APPVEYOR_REPO_SLUG,
      DEFAULT_GITHUB_TOKEN,
      true,
      false,
      true,
      'https://githubToken@github.com/USER/REPO.git',
      DEFAULT_APPVEYOR_USER,
    ],
    // .git in repo name
    [
      false,
      DEFAULT_TRAVIS_REPO_SLUG,
      true,
      'APPVEYOR_USER/APPVEYOR_REPO.github.io',
      DEFAULT_GITHUB_TOKEN,
      false,
      false,
      true,
      'https://githubToken@github.com/APPVEYOR_USER/APPVEYOR_REPO.github.io.git',
      DEFAULT_APPVEYOR_USER,
    ],
    // not in appveyor
    [
      false,
      DEFAULT_TRAVIS_REPO_SLUG,
      false,
      DEFAULT_APPVEYOR_REPO_SLUG,
      DEFAULT_GITHUB_TOKEN,
      false,
      false,
      false,
      '-c/--ci should only be run in CI environments.',
      DEFAULT_APPVEYOR_USER,
    ],
    // no github token
    [
      false,
      DEFAULT_TRAVIS_REPO_SLUG,
      false,
      DEFAULT_APPVEYOR_REPO_SLUG,
      null,
      false,
      false,
      false,
      'The environment variable GITHUB_TOKEN does not exist.',
      DEFAULT_APPVEYOR_USER,
    ],
    // custom repo not on Github
    [
      false,
      DEFAULT_TRAVIS_REPO_SLUG,
      true,
      DEFAULT_APPVEYOR_REPO_SLUG,
      DEFAULT_GITHUB_TOKEN,
      false,
      true,
      false,
      '-c/--ci expects a GitHub repository.\nThe specified repository INVALID_GITHUB_REPO is not valid.',
      DEFAULT_APPVEYOR_USER,
    ],
  ],
)(`
  TRAVIS: %s, 
  TRAVIS_REPO_SLUG: %s, 
  APPVEYOR: %s, 
  APPVEYOR_REPO_NAME: %s,
  GITHUB_TOKEN: %s, 
  IS_CUSTOM_REPO: %s, 
  IS_INVALID_REPO: %s, 
  SHOULD_PASS: %s,
  EXPECTED_MSG: %s, 
  USER: %j
  `,
  async (
    TRAVIS,
    TRAVIS_REPO_SLUG,
    APPVEYOR,
    APPVEYOR_REPO_NAME,
    GITHUB_TOKEN,
    IS_CUSTOM_REPO,
    IS_INVALID_REPO,
    SHOULD_PASS,
    EXPECTED_MSG,
    USER,
  ) => {
    const OLD_ENV = { ...process.env };
    process.env.TRAVIS = TRAVIS;
    process.env.APPVEYOR = APPVEYOR;
    process.env.TRAVIS_REPO_SLUG = TRAVIS_REPO_SLUG;
    process.env.APPVEYOR_REPO_NAME = APPVEYOR_REPO_NAME;
    process.env.GITHUB_TOKEN = GITHUB_TOKEN;

    const siteConfig = JSON.parse(SITE_JSON_DEFAULT);
    if (IS_CUSTOM_REPO) {
      siteConfig.deploy.repo = 'https://github.com/USER/REPO.git';
    }

    if (IS_INVALID_REPO) {
      siteConfig.deploy.repo = 'INVALID_GITHUB_REPO';
    }

    const json = {
      ...PAGE_NJK,
      // eslint-disable-next-line no-nested-ternary
      'site.json': (IS_CUSTOM_REPO || IS_INVALID_REPO) ? JSON.stringify(siteConfig) : SITE_JSON_DEFAULT,
      _site: {},
    };
    fs.vol.fromJSON(json, '');
    const site = new Site('./', '_site');

    if (SHOULD_PASS) {
      await site.deploy(true);
      expect(ghpages.options.repo).toEqual(EXPECTED_MSG);
      expect(ghpages.options.user).toEqual(USER);
    } else {
      await expect(site.deploy(true))
        .rejects
        .toThrow(new Error(EXPECTED_MSG));
    }

    process.env = { ...OLD_ENV };
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
