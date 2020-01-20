const path = require('path');
const fs = require('fs-extra-promise');
const ghpages = require('gh-pages');
const Site = require('../../src/Site');

const {
  ABOUT_MD_DEFAULT,
  FOOTER_MD_DEFAULT,
  HEADER_MD_DEFAULT,
  INDEX_MD_DEFAULT,
  PAGE_NJK,
  SITE_JSON_DEFAULT,
  SITE_NAV_MD_DEFAULT,
  TOP_NAV_DEFAULT,
  USER_VARIABLES_DEFAULT,
  LAYOUT_FILES_DEFAULT,
  LAYOUT_SCRIPTS_DEFAULT,
} = require('./utils/data');

const DEFAULT_TEMPLATE = 'default';

jest.mock('fs');
jest.mock('walk-sync');
jest.mock('../../src/Page');
jest.mock('gh-pages');
jest.mock('../../src/util/logger');

afterEach(() => fs.vol.reset());

test('Site Generate builds the correct amount of assets', async () => {
  const json = {
    'src/page.njk': PAGE_NJK,
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

    'node_modules/@fortawesome/fontawesome-free/css/all.min.css': '',
    'node_modules/@fortawesome/fontawesome-free/webfonts/font1.svg': '',
    'node_modules/@fortawesome/fontawesome-free/webfonts/font2.ttf': '',

    'inner/_markbind/layouts/default/footer.md': '',
    'inner/_markbind/layouts/default/head.md': '',
    'inner/_markbind/layouts/default/header.md': '',
    'inner/_markbind/layouts/default/navigation.md': '',
    'inner/_markbind/layouts/default/scripts.js': '',
    'inner/_markbind/layouts/default/styles.css': '',
  };
  fs.vol.fromJSON(json, '');
  const site = new Site('inner/', 'inner/_site');
  await site.generate();
  const paths = Object.keys(fs.vol.toJSON());
  const originalNumFiles = Object.keys(json).length;
  const expectedNumBuilt = 20;
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

  // Font Awesome assets
  expect(fs.existsSync(path.resolve('inner/_site/markbind/fontawesome/css/all.min.css'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/fontawesome/webfonts/font1.svg'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/fontawesome/webfonts/font2.ttf'))).toEqual(true);

  // layouts
  expect(fs.existsSync(path.resolve('inner/_site/markbind/layouts/default/footer.md'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/layouts/default/head.md'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/layouts/default/header.md'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/layouts/default/navigation.md'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/layouts/default/scripts.js'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/layouts/default/styles.css'))).toEqual(true);
});

test('Site Init with invalid template fails', async () => {
  // Mock default template in MemFS without site config
  const json = {
    'src/page.njk': PAGE_NJK,
    'src/template/default/index.md': INDEX_MD_DEFAULT,
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
    'src/page.njk': PAGE_NJK,
    'src/template/default/index.md': INDEX_MD_DEFAULT,
    'src/template/default/site.json': SITE_JSON_DEFAULT,
  };

  fs.vol.fromJSON(json, '');

  // index.md
  expect(fs.readFileSync(path.resolve('index.md'), 'utf8')).toEqual(EXISTING_INDEX_MD);
});

test('Site Init in existing directory generates correct assets', async () => {
  // Mock default template in MemFS
  const json = {
    'src/page.njk': PAGE_NJK,
    'src/template/default/index.md': INDEX_MD_DEFAULT,
    'src/template/default/site.json': SITE_JSON_DEFAULT,
    'src/template/default/_markbind/boilerplates/': '',
    'src/template/default/_markbind/head/': '',
    'src/template/default/_markbind/headers/header.md': HEADER_MD_DEFAULT,
    'src/template/default/_markbind/footers/footer.md': FOOTER_MD_DEFAULT,
    'src/template/default/_markbind/navigation/site-nav.md': SITE_NAV_MD_DEFAULT,
    'src/template/default/_markbind/variables.md': USER_VARIABLES_DEFAULT,
    'src/template/default/_markbind/plugins': '',
    'src/template/default/_markbind/layouts/default/footer.md': '',
    'src/template/default/_markbind/layouts/default/header.md': '',
    'src/template/default/_markbind/layouts/default/head.md': '',
    'src/template/default/_markbind/layouts/default/navigation.md': '',
    'src/template/default/_markbind/layouts/default/styles.css': '',
    'src/template/default/_markbind/layouts/default/scripts.js': LAYOUT_SCRIPTS_DEFAULT,
  };

  fs.vol.fromJSON(json, '');

  await Site.initSite('', DEFAULT_TEMPLATE);
  const paths = Object.keys(fs.vol.toJSON());
  const originalNumFiles = Object.keys(json).length;
  const expectedNumBuilt = 15;
  expect(paths.length).toEqual(originalNumFiles + expectedNumBuilt);

  // _boilerplates
  expect(fs.existsSync(path.resolve('_markbind/boilerplates'))).toEqual(true);

  // footer.md
  expect(fs.readFileSync(path.resolve('_markbind/footers/footer.md'), 'utf8')).toEqual(FOOTER_MD_DEFAULT);

  // head folder
  expect(fs.existsSync(path.resolve('_markbind/head'), 'utf8')).toEqual(true);

  // header.md
  expect(fs.readFileSync(path.resolve('_markbind/headers/header.md'), 'utf8')).toEqual(HEADER_MD_DEFAULT);

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
  expect(fs.readFileSync(path.resolve('_markbind/layouts/default/scripts.js'), 'utf8'))
    .toEqual(LAYOUT_SCRIPTS_DEFAULT);

  // plugins folder
  expect(fs.existsSync(path.resolve('_markbind/plugins'), 'utf8')).toEqual(true);
});

test('Site Init in directory which does not exist generates correct assets', async () => {
  // Mock default template in MemFS
  const json = {
    'src/page.njk': PAGE_NJK,
    'src/template/default/index.md': INDEX_MD_DEFAULT,
    'src/template/default/site.json': SITE_JSON_DEFAULT,
    'src/template/default/_markbind/boilerplates/': '',
    'src/template/default/_markbind/head/': '',
    'src/template/default/_markbind/headers/header.md': HEADER_MD_DEFAULT,
    'src/template/default/_markbind/footers/footer.md': FOOTER_MD_DEFAULT,
    'src/template/default/_markbind/navigation/site-nav.md': SITE_NAV_MD_DEFAULT,
    'src/template/default/_markbind/variables.md': USER_VARIABLES_DEFAULT,
    'src/template/default/_markbind/plugins': '',
    'src/template/default/_markbind/layouts/default/footer.md': '',
    'src/template/default/_markbind/layouts/default/header.md': '',
    'src/template/default/_markbind/layouts/default/head.md': '',
    'src/template/default/_markbind/layouts/default/navigation.md': '',
    'src/template/default/_markbind/layouts/default/styles.css': '',
    'src/template/default/_markbind/layouts/default/scripts.js': LAYOUT_SCRIPTS_DEFAULT,
  };
  fs.vol.fromJSON(json, '');

  await Site.initSite('newDir', DEFAULT_TEMPLATE);
  const paths = Object.keys(fs.vol.toJSON());
  const originalNumFiles = Object.keys(json).length;
  const expectedNumBuilt = 15;

  expect(paths.length).toEqual(originalNumFiles + expectedNumBuilt);

  expect(fs.existsSync(path.resolve('newDir/_markbind/boilerplates'))).toEqual(true);

  // footer.md
  expect(fs.readFileSync(path.resolve('newDir/_markbind/footers/footer.md'), 'utf8'))
    .toEqual(FOOTER_MD_DEFAULT);

  // head folder
  expect(fs.existsSync(path.resolve('newDir/_markbind/head'), 'utf8')).toEqual(true);

  // header.md
  expect(fs.readFileSync(path.resolve('newDir/_markbind/headers/header.md'), 'utf8'))
    .toEqual(HEADER_MD_DEFAULT);

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
  expect(fs.readFileSync(path.resolve('newDir/_markbind/layouts/default/scripts.js'), 'utf8'))
    .toEqual(LAYOUT_SCRIPTS_DEFAULT);

  // plugins folder
  expect(fs.existsSync(path.resolve('newDir/_markbind/plugins'), 'utf8')).toEqual(true);
});

test('Site baseurls are correct for sub nested subsites', async () => {
  const json = {
    'src/page.njk': PAGE_NJK,
    'site.json': SITE_JSON_DEFAULT,
    'sub/site.json': SITE_JSON_DEFAULT,
    'sub/sub/site.json': SITE_JSON_DEFAULT,
    'otherSub/sub/site.json': SITE_JSON_DEFAULT,
  };
  fs.vol.fromJSON(json, '');

  const baseUrlMapExpected = new Set(['', 'sub', 'sub/sub', 'otherSub/sub'].map(url => path.resolve(url)));

  const site = new Site('./', '_site');
  await site.collectBaseUrl();
  expect(site.baseUrlMap).toEqual(baseUrlMapExpected);
});

test('Site removeAsync removes the correct asset', async () => {
  const json = {
    'src/page.njk': PAGE_NJK,
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
    'src/page.njk': PAGE_NJK,
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
    'src/page.njk': PAGE_NJK,
    'site.json': JSON.stringify(customSiteJson),
  };
  fs.vol.fromJSON(json, '');

  const site = new Site('./', '_site');
  await site.readSiteConfig();
  expect(site.siteConfig).toEqual(customSiteJson);
});

test('Site resolves variables referencing other variables', async () => {
  const json = {
    'src/page.njk': PAGE_NJK,
    'site.json': SITE_JSON_DEFAULT,
    '_markbind/variables.md':
    '<variable name="level1">variable</variable>'
    + '<variable name="level2">{{level1}}</variable>'
    + '<variable name="level3"><span style="color: blue">Blue text</span></variable>'
    + '<variable name="level4">{{level3}}</variable>',
  };
  fs.vol.fromJSON(json, '');

  const site = new Site('./', '_site');
  await site.collectBaseUrl();
  await site.collectUserDefinedVariablesMap();

  const root = site.userDefinedVariablesMap[path.resolve('')];

  // check all variables
  expect(root.level1).toEqual('variable');
  expect(root.level2).toEqual('variable');
  const expectedTextSpan = '<span style="color: blue">Blue text</span>';
  const expectedTextSpanEscaped = expectedTextSpan
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  expect(root.level3).toEqual(expectedTextSpan);
  expect(root.level4).toEqual(expectedTextSpanEscaped);
});

test('Site read correct user defined variables', async () => {
  const json = {
    'src/page.njk': PAGE_NJK,
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

test('Site convert generates correct assets', async () => {
  // Mock default template in MemFS
  const json = {
    'src/page.njk': PAGE_NJK,
    'src/template/default/index.md': INDEX_MD_DEFAULT,
    'src/template/default/site.json': SITE_JSON_DEFAULT,
    'src/template/default/_markbind/boilerplates/': '',
    'src/template/default/_markbind/head/': '',
    'src/template/default/_markbind/headers/header.md': HEADER_MD_DEFAULT,
    'src/template/default/_markbind/footers/footer.md': FOOTER_MD_DEFAULT,
    'src/template/default/_markbind/navigation/site-nav.md': SITE_NAV_MD_DEFAULT,
    'src/template/default/_markbind/variables.md': USER_VARIABLES_DEFAULT,
    'src/template/default/_markbind/plugins': '',
    'src/template/default/_markbind/layouts/default/footer.md': '',
    'src/template/default/_markbind/layouts/default/header.md': '',
    'src/template/default/_markbind/layouts/default/head.md': '',
    'src/template/default/_markbind/layouts/default/navigation.md': '',
    'src/template/default/_markbind/layouts/default/styles.css': '',
    'src/template/default/_markbind/layouts/default/scripts.js': LAYOUT_SCRIPTS_DEFAULT,
  };
  fs.vol.fromJSON(json, '');
  await Site.initSite('inner/', DEFAULT_TEMPLATE);
  await new Site('inner/', 'inner/_site/').convert();

  // number of files
  const paths = Object.keys(fs.vol.toJSON());
  const originalNumFiles = Object.keys(json).length;
  const expectedNumBuilt = 16;
  expect(paths.length).toEqual(originalNumFiles + expectedNumBuilt);

  // footer
  expect(fs.existsSync(path.resolve('inner/_markbind/layouts/default/footer.md'))).toEqual(true);

  // site navigation
  expect(fs.existsSync(path.resolve('inner/_markbind/layouts/default/navigation.md'))).toEqual(true);

  // top navigation
  expect(fs.readFileSync(path.resolve('inner/_markbind/layouts/default/header.md'), 'utf8'))
    .toEqual(TOP_NAV_DEFAULT);

  // index page
  expect(fs.existsSync(path.resolve('inner/index.md'))).toEqual(true);

  // about page
  expect(fs.readFileSync(path.resolve('inner/about.md'), 'utf8')).toEqual(ABOUT_MD_DEFAULT);

  // site.json
  expect(fs.existsSync(path.resolve('inner/site.json'))).toEqual(true);

  // _markbind directory
  expect(fs.existsSync(path.resolve('inner/_markbind'))).toEqual(true);
});

test('Site convert with custom _Footer.md, no _Sidebar.md, README.md generates correct assets', async () => {
  // Mock default template in MemFS
  const json = {
    'src/page.njk': PAGE_NJK,
    'src/template/default/index.md': INDEX_MD_DEFAULT,
    'src/template/default/site.json': SITE_JSON_DEFAULT,
    'src/template/default/_markbind/boilerplates/': '',
    'src/template/default/_markbind/head/': '',
    'src/template/default/_markbind/headers/header.md': HEADER_MD_DEFAULT,
    'src/template/default/_markbind/footers/footer.md': FOOTER_MD_DEFAULT,
    'src/template/default/_markbind/navigation/site-nav.md': SITE_NAV_MD_DEFAULT,
    'src/template/default/_markbind/variables.md': USER_VARIABLES_DEFAULT,
    'src/template/default/_markbind/plugins': '',
    'src/template/default/_markbind/layouts/default/footer.md': '',
    'src/template/default/_markbind/layouts/default/header.md': '',
    'src/template/default/_markbind/layouts/default/head.md': '',
    'src/template/default/_markbind/layouts/default/navigation.md': '',
    'src/template/default/_markbind/layouts/default/styles.css': '',
    'src/template/default/_markbind/layouts/default/scripts.js': LAYOUT_SCRIPTS_DEFAULT,
    // Custom Footer and README
    'inner/_Footer.md': 'Custom footer.',
    'inner/README.md': 'This is the README',
  };
  fs.vol.fromJSON(json, '');
  await Site.initSite('inner/', DEFAULT_TEMPLATE);
  await new Site('inner/', 'inner/_site/').convert();

  // number of files
  const paths = Object.keys(fs.vol.toJSON());
  const originalNumFiles = Object.keys(json).length;
  const expectedNumBuilt = 16;
  expect(paths.length).toEqual(originalNumFiles + expectedNumBuilt);

  // footer
  const EXPECTED_FOOTER = '<footer>\n\tCustom footer.\n</footer>';
  expect(fs.readFileSync(path.resolve('inner/_markbind/layouts/default/footer.md'), 'utf8'))
    .toEqual(EXPECTED_FOOTER);

  // site navigation
  const EXPECTED_SITE_NAV = '<navigation>\n* [Index]({{ baseUrl }}/index.html)\n'
    + '* [README]({{ baseUrl }}/README.html)\n\n</navigation>';
  expect(fs.readFileSync(path.resolve('inner/_markbind/layouts/default/navigation.md'), 'utf8'))
    .toEqual(EXPECTED_SITE_NAV);

  // top navigation
  expect(fs.readFileSync(path.resolve('inner/_markbind/layouts/default/header.md'), 'utf8'))
    .toEqual(TOP_NAV_DEFAULT);

  // index page
  const EXPECTED_INDEX_PAGE = 'This is the README';
  expect(fs.readFileSync(path.resolve('inner/index.md'), 'utf8'))
    .toEqual(EXPECTED_INDEX_PAGE);

  // about page
  expect(fs.readFileSync(path.resolve('inner/about.md'), 'utf8')).toEqual(ABOUT_MD_DEFAULT);
});

test('Site deploys with default settings', async () => {
  const json = {
    'src/page.njk': PAGE_NJK,
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
    'src/page.njk': PAGE_NJK,
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
    'src/page.njk': PAGE_NJK,
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
      'src/page.njk': PAGE_NJK,
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
      'src/page.njk': PAGE_NJK,
      'site.json': JSON.stringify(customRepoConfig),
      _site: {},
    };
    fs.vol.fromJSON(json, '');
    const site = new Site('./', '_site');
    await site.deploy(true);
    expect(ghpages.options.repo)
      .toEqual(`https://${process.env.GITHUB_TOKEN}@github.com/USER/REPO.git`);
  });

  test('Site deploy -t/--travis deploys to correct repo when .git is in repo name', async () => {
    process.env.TRAVIS = true;
    process.env.GITHUB_TOKEN = 'githubToken';
    process.env.TRAVIS_REPO_SLUG = 'TRAVIS_USER/TRAVIS_REPO.github.io';

    const json = {
      'src/page.njk': PAGE_NJK,
      'site.json': SITE_JSON_DEFAULT,
      _site: {},
    };
    fs.vol.fromJSON(json, '');
    const site = new Site('./', '_site');
    await site.deploy(true);
    expect(ghpages.options.repo)
      .toEqual(`https://${process.env.GITHUB_TOKEN}@github.com/TRAVIS_USER/TRAVIS_REPO.github.io.git`);
  });

  test('Site deploy -t/--travis should not deploy if not in Travis', async () => {
    const json = {
      'src/page.njk': PAGE_NJK,
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
      'src/page.njk': PAGE_NJK,
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
      'src/page.njk': PAGE_NJK,
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
      'src/page.njk': PAGE_NJK,
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
    'src/page.njk': PAGE_NJK,
    'index.md': '',
  };
  fs.vol.fromJSON(json, '');

  const site = new Site('./', '_site');
  site.siteConfig = customSiteConfig;
  expect(site.collectAddressablePages())
    .rejects
    .toThrow(new Error('Duplicate page entries found in site config: index.md'));
});
