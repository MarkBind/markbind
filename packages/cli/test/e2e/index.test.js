const fs = require('fs');

const _ = {};
_.cloneDeep = require('lodash/cloneDeep');

describe('Live Preview reload triggered by site.json', () => {
  const SITE_JSON_PATH = 'test/e2e/test_site/site.json';
  const originalJson = JSON.parse(fs.readFileSync(SITE_JSON_PATH, 'utf8'));
  beforeEach(async () => {
    await page.goto('http://localhost:8080/');
  });

  afterEach(async () => {
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(originalJson, null, 2), 'utf8');
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

  test('pages.title', async () => {
    const updatedJson = _.cloneDeep(originalJson);
    updatedJson.pages[0].title = 'new-title';
    fs.writeFileSync(SITE_JSON_PATH, JSON.stringify(updatedJson, null, 2), 'utf8');
    await page.waitForNavigation();
    await expect(page.title()).resolves.toMatch('original-prefix - new-title');
  });
});
