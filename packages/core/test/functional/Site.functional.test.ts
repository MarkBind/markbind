import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import { Site } from '../../src/Site';
import * as logger from '../../src/utils/logger';
import { SITE_JSON_DEFAULT, INDEX_MD_DEFAULT } from '../unit/utils/data';

describe('Site Functional Tests', () => {
  jest.setTimeout(20000); // Functional tests involving file I/O can be slow
  let site: Site;
  let tmpDir: string;
  let rootPath: string;
  let outputPath: string;

  beforeEach(async () => {
    // Create a temporary directory for the test
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'markbind-test-'));
    rootPath = tmpDir;
    outputPath = path.join(rootPath, '_site');

    // Writes essential MarkBind site files
    await fs.outputFile(path.join(rootPath, 'site.json'), SITE_JSON_DEFAULT);
    await fs.outputFile(path.join(rootPath, 'index.md'), `${INDEX_MD_DEFAULT}\n{{ hello }}`);
    await fs.outputFile(
      path.join(rootPath, '_markbind/variables.md'),
      '<variable name="hello">World</variable>');
    await fs.outputFile(path.join(rootPath, '_markbind/layouts/default.md'), '{{ content }}');

    // Spies to suppress output
    jest.spyOn(logger, 'error').mockImplementation(() => {});
    jest.spyOn(logger, 'warn').mockImplementation(() => {});
    jest.spyOn(logger, 'info').mockImplementation(() => {});

    // constructor(rootPath, outputPath, onePagePath, forceReload, siteConfigPath, isDevMode,
    // backgroundBuildMode, postBackgroundBuildFunc)
    site = new Site(rootPath, outputPath, '', false, 'site.json', false, false, () => {});
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    try {
      await fs.remove(tmpDir);
    } catch (e) {
      logger.error(`Failed to cleanup temp dir: ${e}`);
    }
  });

  test('generate() should create index.html with correct content', async () => {
    await site.generate(undefined);

    const indexPath = path.join(outputPath, 'index.html');
    const exists = await fs.pathExists(indexPath);
    expect(exists).toBe(true);

    const content = await fs.readFile(indexPath, 'utf8');
    expect(content).toContain('Hello World');
    expect(content).toContain('<!DOCTYPE html>');
  });

  test('rebuildAffectedSourceFiles() should update pages depending on modified file', async () => {
    // Initial generation to build dependency graph
    await site.generate(undefined);

    // Verify initial content
    const indexPath = path.join(outputPath, 'index.html');
    let content = await fs.readFile(indexPath, 'utf8');
    expect(content).toContain('World');

    // Update the dependency (variables.md)
    const variablePath = path.join(rootPath, '_markbind/variables.md');
    await fs.outputFile(variablePath, '<variable name="hello">Modified World</variable>');

    // Rebuild affected files
    await site.rebuildAffectedSourceFiles(variablePath);

    // Verify updated content
    content = await fs.readFile(indexPath, 'utf8');
    expect(content).toContain('Modified World');
  });

  test('reloadSiteConfig() should reflect changes in site.json', async () => {
    // Initialize site
    await site.generate(undefined);

    // Initial check
    let config = await site.readSiteConfig() as any;
    expect(config.titlePrefix).toBe('');

    // Modify site.json to add a titlePrefix
    const siteJsonPath = path.join(rootPath, 'site.json');
    // Ensure we parse the default properly or just use a fresh object
    const newConfig = { ...JSON.parse(SITE_JSON_DEFAULT), titlePrefix: 'My New Title Prefix' };
    await fs.writeJson(siteJsonPath, newConfig);

    // Reload config
    await site.reloadSiteConfig();

    // Verify config update
    config = site.siteConfig as any;
    expect(config.titlePrefix).toBe('My New Title Prefix');
  });

  test('buildAsset() should generate output for new pages', async () => {
    // Initialize site
    await site.generate(undefined);

    // Add a new page
    const newPagePath = path.join(rootPath, 'newPage.md');
    await fs.outputFile(newPagePath, '# New Page Content');

    // Simulate CLI calls rebuildSourceFiles() or buildAsset() when a file is added.
    await site.rebuildSourceFiles();

    const newPageHtmlPath = path.join(outputPath, 'newPage.html');
    const exists = await fs.pathExists(newPageHtmlPath);
    expect(exists).toBe(true);

    const content = await fs.readFile(newPageHtmlPath, 'utf8');
    expect(content).toContain('New Page Content');
  });

  test('buildAsset() should copy new asset files', async () => {
    // Initialize site
    await site.generate(undefined);

    const assetPath = path.join(rootPath, 'assets', 'image.png');
    await fs.outputFile(assetPath, 'fake image content');

    await site.buildAsset(assetPath);

    const outputAssetPath = path.join(outputPath, 'assets', 'image.png');
    const exists = await fs.pathExists(outputAssetPath);
    expect(exists).toBe(true);

    const content = await fs.readFile(outputAssetPath, 'utf8');
    expect(content).toBe('fake image content');
  });
});
