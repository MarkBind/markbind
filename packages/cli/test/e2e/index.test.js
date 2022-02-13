const fs = require('fs');

const _ = {};
_.cloneDeep = require('lodash/cloneDeep');

describe('Live Preview reload triggered by changes to index.md', () => {
  const INDEX_PATH = 'test/e2e/test_site/index.md';
  const originalIndexMd = fs.readFileSync(INDEX_PATH, 'utf8');
  beforeEach(async () => {
    await page.goto('http://localhost:8888/');
  });

  afterEach(async () => {
    fs.writeFileSync(INDEX_PATH, originalIndexMd, 'utf8');
  });

  test('add', async () => {
    const ADD_TEXT = 'Now it appears in the preview.';
    await expect(page.content()).resolves.not.toMatch(ADD_TEXT);
    let updatedIndexMd = _.cloneDeep(originalIndexMd);
    updatedIndexMd += `\n${ADD_TEXT}`;
    fs.writeFileSync(INDEX_PATH, updatedIndexMd, 'utf8');
    await page.waitForNavigation();
    await expect(page.content()).resolves.toMatch(ADD_TEXT);
  });

  test('delete', async () => {
    const DELETE_TEXT = 'This is originally in the page.';
    await expect(page.content()).resolves.toMatch(DELETE_TEXT);
    const updatedIndexMd = _.cloneDeep(originalIndexMd);
    fs.writeFileSync(INDEX_PATH, updatedIndexMd.replace(DELETE_TEXT, ''), 'utf8');
    await page.waitForNavigation();
    await expect(page.content()).resolves.not.toMatch(DELETE_TEXT);
  });

  test('edit', async () => {
    const EDIT_TEXT = 'To Edit';
    const EDITED_TEXT = 'Now edited';
    await expect(page.content()).resolves.toMatch(EDIT_TEXT);
    const updatedIndexMd = _.cloneDeep(originalIndexMd);
    fs.writeFileSync(INDEX_PATH, updatedIndexMd.replace(EDIT_TEXT, EDITED_TEXT), 'utf8');
    await page.waitForNavigation();
    await expect(page.content()).resolves.not.toMatch(EDIT_TEXT);
    await expect(page.content()).resolves.toMatch(EDITED_TEXT);
  });
});
