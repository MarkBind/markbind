const Site = require('../../lib/Site');
const path = require('path');
const fs = require('fs-extra-promise');
const ghpages = require('gh-pages');
const cloneDeep = require('lodash/cloneDeep');

const {
  FOOTER_MD_DEFAULT,
  INDEX_MD_DEFAULT,
  PAGE_EJS,
  SITE_JSON_DEFAULT,
  SITE_NAV_MD_DEFAULT,
  USER_VARIABLES_DEFAULT,
} = require('./utils/data');

jest.mock('fs');
jest.mock('walk-sync');
jest.mock('../../lib/Page');
jest.mock('gh-pages');
jest.mock('../../lib/util/logger');

afterEach(() => fs.vol.reset());

test('Site Generate builds the correct amount of assets', async () => {
  const json = {
    'lib/asset/glyphicons.csv': '',
    'lib/template/page.ejs': PAGE_EJS,
    'inner/site.json': SITE_JSON_DEFAULT,

    'asset/css/bootstrap.min.css': '',
    'asset/css/github.min.css': '',
    'asset/css/markbind.css': '',
    'asset/css/site-nav.css': '',

    'asset/js/setup.js': '',
    'asset/js/site-nav.js': '',
    'asset/js/vue.min.js': '',
    'asset/js/vue-strap.min.js': '',
  };
  fs.vol.fromJSON(json, '');
  const site = new Site('inner/', 'inner/_site');
  await site.generate();
  const paths = Object.keys(fs.vol.toJSON());
  const originalNumFiles = Object.keys(json).length;
  const expectedNumBuilt = 9;
  expect(paths.length).toEqual(originalNumFiles + expectedNumBuilt);

  // site
  expect(fs.existsSync(path.resolve('inner/_site'))).toEqual(true);

  // siteData
  expect(fs.existsSync(path.resolve('inner/_site/siteData.json'))).toEqual(true);

  // markbind
  expect(fs.existsSync(path.resolve('inner/_site/markbind'))).toEqual(true);

  // css
  expect(fs.existsSync(path.resolve('inner/_site/markbind/css/bootstrap.min.css'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/css/github.min.css'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/css/markbind.css'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/css/site-nav.css'))).toEqual(true);

  // js
  expect(fs.existsSync(path.resolve('inner/_site/markbind/js/setup.js'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/js/site-nav.js'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/js/vue.min.js'))).toEqual(true);
  expect(fs.existsSync(path.resolve('inner/_site/markbind/js/vue-strap.min.js'))).toEqual(true);
});

test('Site Init in existing directory generates correct assets', async () => {
  const json = {
    'lib/template/page.ejs': PAGE_EJS,
  };
  fs.vol.fromJSON(json, '');

  await Site.initSite('');
  const paths = Object.keys(fs.vol.toJSON());
  const originalNumFiles = Object.keys(json).length;
  const expectedNumBuilt = 6;
  expect(paths.length).toEqual(originalNumFiles + expectedNumBuilt);

  // _boilerplates
  expect(fs.existsSync(path.resolve('_markbind/boilerplates'))).toEqual(true);

  // footer.md
  expect(fs.readFileSync(path.resolve('_markbind/footers/footer.md'), 'utf8')).toEqual(FOOTER_MD_DEFAULT);

  // site-nav.md
  expect(fs.readFileSync(path.resolve('_markbind/navigation/site-nav.md'), 'utf8'))
    .toEqual(SITE_NAV_MD_DEFAULT);

  // user defined variables
  expect(fs.readFileSync(path.resolve('_markbind/variables.md'), 'utf8')).toEqual(USER_VARIABLES_DEFAULT);

  // site.json
  expect(fs.readJsonSync(path.resolve('site.json'))).toEqual(JSON.parse(SITE_JSON_DEFAULT));

  // index.md
  expect(fs.readFileSync(path.resolve('index.md'), 'utf8')).toEqual(INDEX_MD_DEFAULT);
});

test('Site Init in directory which does not exist generates correct assets', async () => {
  const json = {
    'lib/template/page.ejs': PAGE_EJS,
  };
  fs.vol.fromJSON(json, '');

  await Site.initSite('newDir');
  const paths = Object.keys(fs.vol.toJSON());
  const originalNumFiles = Object.keys(json).length;
  const expectedNumBuilt = 6;

  expect(paths.length).toEqual(originalNumFiles + expectedNumBuilt);

  expect(fs.existsSync(path.resolve('newDir/_markbind/boilerplates'))).toEqual(true);

  // footer.md
  expect(fs.readFileSync(path.resolve('newDir/_markbind/footers/footer.md'), 'utf8'))
    .toEqual(FOOTER_MD_DEFAULT);

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
});

test('Site baseurls are correct for sub nested subsites', async () => {
  const json = {
    'lib/template/page.ejs': PAGE_EJS,
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
    'lib/template/page.ejs': PAGE_EJS,
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
    'lib/template/page.ejs': PAGE_EJS,
    'site.json': SITE_JSON_DEFAULT,
  };
  fs.vol.fromJSON(json, '');

  const site = new Site('./', '_site');
  await site.readSiteConfig();
  expect(site.siteConfig).toEqual(JSON.parse(SITE_JSON_DEFAULT));
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
  };
  const json = {
    'lib/template/page.ejs': PAGE_EJS,
    'site.json': JSON.stringify(customSiteJson),
  };
  fs.vol.fromJSON(json, '');

  const site = new Site('./', '_site');
  await site.readSiteConfig();
  expect(site.siteConfig).toEqual(customSiteJson);
});

test('Site resolves variables referencing other variables', async () => {
  const json = {
    'lib/asset/glyphicons.csv': 'glyphicon-plus',
    'lib/template/page.ejs': PAGE_EJS,
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
    'lib/asset/glyphicons.csv': '',
    'lib/template/page.ejs': PAGE_EJS,
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

test('gh-pages test', async () => {
  const json = {
    'lib/template/page.ejs': PAGE_EJS,
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

test('Custom deploy settings gh-pages test', async () => {
  const customConfig = cloneDeep(JSON.parse(SITE_JSON_DEFAULT));
  customConfig.deploy = {
    message: 'Custom Site Update.',
    repo: 'https://github.com/USER/REPO.git',
    branch: 'master',
  };
  const json = {
    'lib/template/page.ejs': PAGE_EJS,
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
    'lib/template/page.ejs': PAGE_EJS,
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
