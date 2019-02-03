const Site = require('../../src/Site');
const path = require('path');
const fs = require('fs-extra-promise');
const ghpages = require('gh-pages');

const {
  FOOTER_MD_DEFAULT,
  INDEX_MD_DEFAULT,
  PAGE_EJS,
  SITE_JSON_DEFAULT,
  SITE_NAV_MD_DEFAULT,
  USER_VARIABLES_DEFAULT,
  LAYOUT_FILES_DEFAULT,
} = require('./utils/data');

jest.mock('fs');
jest.mock('walk-sync');
jest.mock('../../src/Page');
jest.mock('gh-pages');
jest.mock('../../src/util/logger');

afterEach(() => fs.vol.reset());

test('Site Generate builds the correct amount of assets', async () => {
  const json = {
    'src/asset/font-awesome.csv': '',
    'src/asset/glyphicons.csv': '',
    'src/template/page.ejs': PAGE_EJS,
    'inner/site.json': SITE_JSON_DEFAULT,

    'asset/css/bootstrap.min.css': '',
    'asset/css/bootstrap.min.css.map': '',
    'asset/css/github.min.css': '',
    'asset/css/markbind.css': '',
    'asset/css/page-nav.css': '',
    'asset/css/site-nav.css': '',

    'asset/js/bootstrap-utility.min.js': '',
    'asset/js/setup.js': '',
    'asset/js/vue.min.js': '',
    'asset/js/vue-strap.min.js': '',

    'inner/_markbind/layouts/default/footer.md': '',
    'inner/_markbind/layouts/default/head.md': '',
    'inner/_markbind/layouts/default/navigation.md': '',
    'inner/_markbind/layouts/default/scripts.js': '',
    'inner/_markbind/layouts/default/styles.css': '',
  };
  fs.vol.fromJSON(json, '');
  const site = new Site('inner/', 'inner/_site');
  await site.generate();
  const paths = Object.keys(fs.vol.toJSON());
  const originalNumFiles = Object.keys(json).length;
  const expectedNumBuilt = 16;
  expect(paths.length).toEqual(originalNumFiles + expectedNumBuilt);

  // site
  expect(fs.existsSync(path.resolve('inner/_site'))).toEqual(true);

  // siteData
  expect(fs.existsSync(path.resolve('inner/_site/siteData.json'))).toEqual(true);

  // markbind
  expect(fs.existsSync(path.resolve('inner/_site/markbind'))).toEqual(true);

  // css
  expect(fs.existsSync(path.resolve('inner/_site/markbind/css/bootstrap.min.css'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/css/bootstrap.min.css.map'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/css/github.min.css'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/css/markbind.css'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/css/page-nav.css'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/css/site-nav.css'))).toEqual(true);

  // js
  expect(fs.existsSync(path.resolve('inner/_site/markbind/js/setup.js'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/js/vue.min.js'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/js/vue-strap.min.js'))).toEqual(true);

  // layouts
  expect(fs.existsSync(path.resolve('inner/_site/markbind/layouts/default/footer.md'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/layouts/default/head.md'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/layouts/default/navigation.md'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/layouts/default/scripts.js'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/layouts/default/styles.css'))).toEqual(true);
});

test('Site Init in existing directory generates correct assets', async () => {
  const json = {
    'src/template/page.ejs': PAGE_EJS,
  };
  fs.vol.fromJSON(json, '');

  await Site.initSite('');
  const paths = Object.keys(fs.vol.toJSON());
  const originalNumFiles = Object.keys(json).length;
  const expectedNumBuilt = 12;
  expect(paths.length).toEqual(originalNumFiles + expectedNumBuilt);

  // _boilerplates
  expect(fs.existsSync(path.resolve('_markbind/boilerplates'))).toEqual(true);

  // footer.md
  expect(fs.readFileSync(path.resolve('_markbind/footers/footer.md'), 'utf8')).toEqual(FOOTER_MD_DEFAULT);

  // head folder
  expect(fs.existsSync(path.resolve('_markbind/head'), 'utf8')).toEqual(true);

  // site-nav.md
  expect(fs.readFileSync(path.resolve('_markbind/navigation/site-nav.md'), 'utf8'))
    .toEqual(SITE_NAV_MD_DEFAULT);

  // user defined variables
  expect(fs.readFileSync(path.resolve('_markbind/variables.md'), 'utf8')).toEqual(USER_VARIABLES_DEFAULT);

  // site.json
  expect(fs.readJsonSync(path.resolve('site.json'))).toEqual(JSON.parse(SITE_JSON_DEFAULT));

  // index.md
  expect(fs.readFileSync(path.resolve('index.md'), 'utf8')).toEqual(INDEX_MD_DEFAULT);

  // layout defaults
  LAYOUT_FILES_DEFAULT.forEach(layoutFile =>
    expect(fs.readFileSync(path.resolve(`_markbind/layouts/default/${layoutFile}`), 'utf8')).toEqual(''));
});

test('Site Init in directory which does not exist generates correct assets', async () => {
  const json = {
    'src/template/page.ejs': PAGE_EJS,
  };
  fs.vol.fromJSON(json, '');

  await Site.initSite('newDir');
  const paths = Object.keys(fs.vol.toJSON());
  const originalNumFiles = Object.keys(json).length;
  const expectedNumBuilt = 12;

  expect(paths.length).toEqual(originalNumFiles + expectedNumBuilt);

  expect(fs.existsSync(path.resolve('newDir/_markbind/boilerplates'))).toEqual(true);

  // footer.md
  expect(fs.readFileSync(path.resolve('newDir/_markbind/footers/footer.md'), 'utf8'))
    .toEqual(FOOTER_MD_DEFAULT);

  // head folder
  expect(fs.existsSync(path.resolve('newDir/_markbind/head'), 'utf8')).toEqual(true);

  // site-nav.md
  expect(fs.readFileSync(path.resolve('newDir/_markbind/navigation/site-nav.md'), 'utf8'))
    .toEqual(SITE_NAV_MD_DEFAULT);

  // user defined variables
  expect(fs.readFileSync(path.resolve('newDir/_markbind/variables.md'), 'utf8'))
    .toEqual(USER_VARIABLES_DEFAULT);

  // site.json
  expect(fs.readJsonSync(path.resolve('newDir/site.json'))).toEqual(JSON.parse(SITE_JSON_DEFAULT));

  // index.md
  expect(fs.readFileSync(path.resolve('newDir/index.md'), 'utf8')).toEqual(INDEX_MD_DEFAULT);

  // layout defaults
  LAYOUT_FILES_DEFAULT.forEach(layoutFile =>
    expect(fs.readFileSync(path.resolve(`newDir/_markbind/layouts/default/${layoutFile}`), 'utf8'))
      .toEqual(''));
});

test('Site baseurls are correct for sub nested subsites', async () => {
  const json = {
    'src/template/page.ejs': PAGE_EJS,
    'site.json': SITE_JSON_DEFAULT,
    'sub/site.json': SITE_JSON_DEFAULT,
    'sub/sub/site.json': SITE_JSON_DEFAULT,
    'otherSub/sub/site.json': SITE_JSON_DEFAULT,
  };
  fs.vol.fromJSON(json, '');

  const baseUrlMapExpected = {};
  baseUrlMapExpected[path.resolve('')] = true;
  baseUrlMapExpected[path.resolve('sub')] = true;
  baseUrlMapExpected[path.resolve('sub/sub')] = true;
  baseUrlMapExpected[path.resolve('otherSub/sub')] = true;

  const site = new Site('./', '_site');
  await site.collectBaseUrl();
  expect(site.baseUrlMap).toEqual(baseUrlMapExpected);
});

test('Site removeAsync removes the correct asset', async () => {
  const json = {
    'src/template/page.ejs': PAGE_EJS,
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
    'src/template/page.ejs': PAGE_EJS,
    'site.json': SITE_JSON_DEFAULT,
  };
  fs.vol.fromJSON(json, '');

  const siteConfigDefaults = { enableSearch: true };
  const expectedSiteConfig = { ...JSON.parse(SITE_JSON_DEFAULT), ...siteConfigDefaults };
  const site = new Site('./', '_site');
  await site.readSiteConfig();
  expect(site.siteConfig).toEqual(expectedSiteConfig);
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
    'src/template/page.ejs': PAGE_EJS,
    'site.json': JSON.stringify(customSiteJson),
  };
  fs.vol.fromJSON(json, '');

  const site = new Site('./', '_site');
  await site.readSiteConfig();
  expect(site.siteConfig).toEqual(customSiteJson);
});

test('Site resolves variables referencing other variables', async () => {
  const json = {
    'src/asset/font-awesome.csv': '',
    'src/asset/glyphicons.csv': 'glyphicon-plus',
    'src/template/page.ejs': PAGE_EJS,
    'site.json': SITE_JSON_DEFAULT,
    '_markbind/variables.md':
    '<span id="level1">variable</span>'
    + '<span id="level2">{{level1}}</span>'
    + '<span id="level3">{{glyphicon_plus}}</span>'
    + '<span id="level4">{{level3 | safe}}</span>',
  };
  fs.vol.fromJSON(json, '');

  const site = new Site('./', '_site');
  await site.collectBaseUrl();
  await site.collectUserDefinedVariablesMap();

  const root = site.userDefinedVariablesMap[path.resolve('')];

  // check all variables
  expect(root.level1).toEqual('variable');
  expect(root.level2).toEqual('variable');
  const expectedGlyphiconSpan = '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>'
    .replace(/"/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  expect(root.level3).toEqual(expectedGlyphiconSpan);
  expect(root.level4).toEqual(expectedGlyphiconSpan);
});

test('Site read correct user defined variables', async () => {
  const json = {
    'src/asset/font-awesome.csv': '',
    'src/asset/glyphicons.csv': '',
    'src/template/page.ejs': PAGE_EJS,
    'site.json': SITE_JSON_DEFAULT,
    'sub/site.json': SITE_JSON_DEFAULT,
    'sub/sub/site.json': SITE_JSON_DEFAULT,
    'otherSub/sub/site.json': SITE_JSON_DEFAULT,
    '_markbind/variables.md':
      '<span id="variable">variable</span>'
      + '<span id="number">2</span>',
    'sub/_markbind/variables.md': '<span id="variable">sub_variable</span>',
    'sub/sub/_markbind/variables.md': '<span id="number">9999</span>',
    'otherSub/sub/_markbind/variables.md': '<span id="variable">other_variable</span>',
  };
  fs.vol.fromJSON(json, '');

  const site = new Site('./', '_site');
  await site.collectBaseUrl();
  await site.collectUserDefinedVariablesMap();

  const root = site.userDefinedVariablesMap[path.resolve('')];
  const sub = site.userDefinedVariablesMap[path.resolve('sub')];
  const subsub = site.userDefinedVariablesMap[path.resolve('sub/sub')];
  const othersub = site.userDefinedVariablesMap[path.resolve('otherSub/sub')];

  // check all baseUrls
  const baseUrl = '{{baseUrl}}';
  expect(root.baseUrl).toEqual(baseUrl);
  expect(sub.baseUrl).toEqual(baseUrl);
  expect(subsub.baseUrl).toEqual(baseUrl);
  expect(othersub.baseUrl).toEqual(baseUrl);

  // check other variables
  expect(root.variable).toEqual('variable');
  expect(root.number).toEqual('2');

  expect(sub.variable).toEqual('sub_variable');

  expect(othersub.variable).toEqual('other_variable');
  expect(subsub.number).toEqual('9999');
});

test('Site deploys with default settings', async () => {
  const json = {
    'src/template/page.ejs': PAGE_EJS,
    'site.json': SITE_JSON_DEFAULT,
    _site: {},
  };
  fs.vol.fromJSON(json, '');
  const site = new Site('./', '_site');
  await site.deploy();
  expect(ghpages.dir).toEqual('_site');
  expect(ghpages.options)
    .toEqual({ branch: 'gh-pages', message: 'Site Update.', repo: '' });
});

test('Site deploys with custom settings', async () => {
  const customConfig = JSON.parse(SITE_JSON_DEFAULT);
  customConfig.deploy = {
    message: 'Custom Site Update.',
    repo: 'https://github.com/USER/REPO.git',
    branch: 'master',
  };
  const json = {
    'src/template/page.ejs': PAGE_EJS,
    'site.json': JSON.stringify(customConfig),
    _site: {},
  };
  fs.vol.fromJSON(json, '');
  const site = new Site('./', '_site');
  await site.deploy();
  expect(ghpages.dir).toEqual('_site');
  expect(ghpages.options)
    .toEqual({ branch: 'master', message: 'Custom Site Update.', repo: 'https://github.com/USER/REPO.git' });
});

test('Site should not deploy without a built site', async () => {
  const json = {
    'src/template/page.ejs': PAGE_EJS,
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

describe('Site deploy with Travis', () => {
  // Keep a copy of the original environment as we need to modify it for deploy Travis tests
  const OLD_ENV = { ...process.env };

  beforeEach(() => {
    // Delete all environment variables that affect tests
    delete process.env.TRAVIS;
    delete process.env.GITHUB_TOKEN;
    delete process.env.TRAVIS_REPO_SLUG;
  });

  afterAll(() => {
    // Restore the original environment at the end of deploy Travis tests
    process.env = { ...OLD_ENV };
  });

  test('Site deploy -t/--travis deploys with default settings', async () => {
    process.env.TRAVIS = true;
    process.env.GITHUB_TOKEN = 'githubToken';
    process.env.TRAVIS_REPO_SLUG = 'TRAVIS_USER/TRAVIS_REPO';

    const json = {
      'src/template/page.ejs': PAGE_EJS,
      'site.json': SITE_JSON_DEFAULT,
      _site: {},
    };
    fs.vol.fromJSON(json, '');
    const site = new Site('./', '_site');
    await site.deploy(true);
    expect(ghpages.options.repo)
      .toEqual(`https://${process.env.GITHUB_TOKEN}@github.com/${process.env.TRAVIS_REPO_SLUG}.git`);
    expect(ghpages.options.user).toEqual({ name: 'Deployment Bot', email: 'deploy@travis-ci.org' });
  });

  test('Site deploy -t/--travis deploys with custom GitHub repo', async () => {
    process.env.TRAVIS = true;
    process.env.GITHUB_TOKEN = 'githubToken';
    process.env.TRAVIS_REPO_SLUG = 'TRAVIS_USER/TRAVIS_REPO.git';

    const customRepoConfig = JSON.parse(SITE_JSON_DEFAULT);
    customRepoConfig.deploy.repo = 'https://github.com/USER/REPO.git';
    const json = {
      'src/template/page.ejs': PAGE_EJS,
      'site.json': JSON.stringify(customRepoConfig),
      _site: {},
    };
    fs.vol.fromJSON(json, '');
    const site = new Site('./', '_site');
    await site.deploy(true);
    expect(ghpages.options.repo)
      .toEqual(`https://${process.env.GITHUB_TOKEN}@github.com/USER/REPO.git`);
  });

  test('Site deploy -t/--travis should not deploy if not in Travis', async () => {
    const json = {
      'src/template/page.ejs': PAGE_EJS,
      'site.json': SITE_JSON_DEFAULT,
      _site: {},
    };
    fs.vol.fromJSON(json, '');
    const site = new Site('./', '_site');
    await expect(site.deploy(true))
      .rejects
      .toThrow(new Error('-t/--travis should only be run in Travis CI.'));
  });

  test('Site deploy -t/--travis should not deploy without authentication token', async () => {
    process.env.TRAVIS = true;

    const json = {
      'src/template/page.ejs': PAGE_EJS,
      'site.json': SITE_JSON_DEFAULT,
      _site: {},
    };
    fs.vol.fromJSON(json, '');
    const site = new Site('./', '_site');
    await expect(site.deploy(true))
      .rejects
      .toThrow(new Error('The environment variable GITHUB_TOKEN does not exist.'));
  });

  test('Site deploy -t/--travis should not deploy if custom repository is not on GitHub', async () => {
    process.env.TRAVIS = true;
    process.env.GITHUB_TOKEN = 'githubToken';

    const invalidRepoConfig = JSON.parse(SITE_JSON_DEFAULT);
    invalidRepoConfig.deploy.repo = 'INVALID_GITHUB_REPO';
    const json = {
      'src/template/page.ejs': PAGE_EJS,
      'site.json': JSON.stringify(invalidRepoConfig),
      _site: {},
    };
    fs.vol.fromJSON(json, '');
    const site = new Site('./', '_site');
    await expect(site.deploy(true))
      .rejects
      .toThrow(new Error('-t/--travis expects a GitHub repository.\n'
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
      'src/template/page.ejs': PAGE_EJS,
      'index.md': '',
    };
    fs.vol.fromJSON(json, '');

    const site = new Site('./', '_site');
    site.siteConfig = customSiteConfig;
    await site.collectAddressablePages();
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
    'src/template/page.ejs': PAGE_EJS,
    'index.md': '',
  };
  fs.vol.fromJSON(json, '');

  const site = new Site('./', '_site');
  site.siteConfig = customSiteConfig;
  expect(site.collectAddressablePages())
    .rejects
    .toThrow(new Error('Duplicate page entries found in site config: index.md'));
});
