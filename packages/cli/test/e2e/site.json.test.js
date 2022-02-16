const fs = require('fs');

const _ = {};
_.cloneDeep = require('lodash/cloneDeep');

describe('Live Preview reload triggered by changes to site.json', () => {
  const SITE_JSON_PATH = 'test/e2e/test_site/site.json';
  const originalJson = JSON.parse(fs.readFileSync(SITE_JSON_PATH, 'utf8'));
  beforeEach(async () => {
    await page.goto('http://localhost:8888/');
  });

  afterEach(async () => {
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(originalJson, null, 2), 'utf8');
  });

  test('faviconPath', async () => {
    await expect(page.content()).resolves.toMatch(
      '<link rel="icon" href="/images/faviconA.ico">');
    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.faviconPath = '/images/faviconB.ico';
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
    await expect(page.content()).resolves.toMatch(
      '<link rel="icon" href="/images/faviconB.ico">');
  });

  test('titlePrefix', async () => {
    await expect(page.title()).resolves.toMatch('original-prefix - original-title');
    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.titlePrefix = 'new-prefix';
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
    await expect(page.title()).resolves.toMatch('new-prefix - original-title');
  });

  test('style.bootstrapTheme', async () => {
    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.style.bootstrapTheme = 'bootswatch-cerulean';
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
  });

  test('style.codeTheme', async () => {
    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.style.codeTheme = 'dark';
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
    await expect(page.content()).resolves.toMatch(
      '<link rel="stylesheet" href="markbind/css/codeblock-dark.min.css">');
  });

  test('style.codeLineNumbers', async () => {
    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.style.codeLineNumbers = true;
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
  });

  test('pages.title', async () => {
    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.pages[0].title = 'new-title';
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
    await expect(page.title()).resolves.toMatch('original-prefix - new-title');
  });

  test('externalScripts', async () => {
    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.externalScripts
      = ['https://cdn.jsdelivr.net/npm/jquery/dist/jquery.min.js'];
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
    await expect(page.content()).resolves.toMatch(
      '<script src="https://cdn.jsdelivr.net/npm/jquery/dist/jquery.min.js">');
  });

  test('deploy', async () => {
    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.deploy.message = 'Site Update!';
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
  });

  test('plugins', async () => {
    await expect(page).toClick({ type: 'xpath', value: '//pre/div/button' });

    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.plugins = [];
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
    await expect(page.content()).resolves.not.toMatch(
      '<button onclick="copyCodeBlock(this)" class="function-btn">');
  });

  test('pluginsContext', async () => {
    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.pluginsContext = {};
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
  });

  test('headingIndexingLevel', async () => {
    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.headingIndexingLevel = 2;
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
  });

  test('enableSearch', async () => {
    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.enableSearch = false;
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
  });

  test('timeZone', async () => {
    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.timeZone = 'Asia/Singapore';
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
  });

  test('locale', async () => {
    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.locale = 'en-SG';
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
  });

  test('intrasiteLinkValidation', async () => {
    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.intrasiteLinkValidation.enabled = true;
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
  });
});
