import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import { Site } from '../../src/Site';
import * as logger from '../../src/utils/logger';
import { SITE_JSON_DEFAULT, INDEX_MD_DEFAULT } from '../unit/utils/data';

describe('Site Functional Tests', () => {
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
    await fs.outputFile(path.join(rootPath, 'index.md'), INDEX_MD_DEFAULT);
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

  test('readSiteConfig() should read the config correctly', async () => {
    // Refer to SITE_JSON_DEFAULT
    const config = await site.readSiteConfig();
    expect(config.baseUrl).toBe('');
    expect(config.enableSearch).toBe(true);
  });
});
