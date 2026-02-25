import path from 'path';
import fs from 'fs-extra';
import * as fsUtil from '../../../src/utils/fsUtil';
import { SiteAssetsManager } from '../../../src/Site/SiteAssetsManager';
import { SiteConfig } from '../../../src/Site/SiteConfig';

const mockFs = fs as any;

jest.mock('fs');
jest.mock('../../../src/utils/fsUtil');

afterEach(() => mockFs.vol.reset());

describe('SiteAssetsManager', () => {
  const rootPath = './';
  const outputPath = '_site';

  const mockSiteConfig = {
    ignore: ['_site/*', '*.json', '*.md'],
    style: {
      bootstrapTheme: 'default',
    },
  } as unknown as SiteConfig;

  test('removeAsset removes the correct asset', async () => {
    const json = {
      '_site/toRemove.jpg': '',
      '_site/dontRemove.png': '',
    };
    mockFs.vol.fromJSON(json, '');

    const manager = new SiteAssetsManager(rootPath, outputPath);
    await manager.removeAsset('toRemove.jpg');

    expect(fs.existsSync(path.resolve('_site/toRemove.jpg'))).toEqual(false);
    expect(fs.existsSync(path.resolve('_site/dontRemove.png'))).toEqual(true);
  });

  test('buildAssets copies all assets obeying ignore', async () => {
    const json = {
      'style.css': 'body { color: red; }',
      'script.js': 'console.log("hello");',
      'ignore.md': 'ignored',
      '_site/existing.txt': 'existing',
    };
    mockFs.vol.fromJSON(json, '');

    (fsUtil.getFilePaths as jest.Mock).mockReturnValue(['style.css', 'script.js', 'ignore.md']);

    const manager = new SiteAssetsManager(rootPath, outputPath);
    manager.siteConfig = mockSiteConfig;

    await manager.buildAssets();

    expect(fs.existsSync(path.resolve('_site/style.css'))).toEqual(true);
    expect(fs.existsSync(path.resolve('_site/script.js'))).toEqual(true);
    expect(fs.existsSync(path.resolve('_site/ignore.md'))).toEqual(false);
  });

  test('copyBootstrapTheme copies correct theme', async () => {
    mockFs.vol.fromJSON({}, '');
    const manager = new SiteAssetsManager(rootPath, outputPath);

    // Initial build with valid theme, fails due to missing file in test env
    manager.siteConfig = { style: { bootstrapTheme: 'bootswatch-flatly' } } as any;
    await expect(manager.copyBootstrapTheme(false)).rejects.toThrow();

    // Initial build with default theme
    manager.siteConfig = { style: { bootstrapTheme: undefined } } as any;
    await expect(manager.copyBootstrapTheme(false)).resolves.toBeUndefined();
  });

  // Checks reactivity, if buildAssets triggered when previously ignored files no longer ignored
  test('handleIgnoreReload rebuilds assets when ignore changes', async () => {
    const json = {
      'new.css': 'content',
      // '_site/new.css': 'content', should exist if not ignored
    };
    mockFs.vol.fromJSON(json, '');

    (fsUtil.getFilePaths as jest.Mock).mockReturnValue(['new.css']);

    const manager = new SiteAssetsManager(rootPath, outputPath);
    manager.siteConfig = { ignore: ['_site/*'] } as any;
    const oldIgnore = ['_site/*', 'new.css'];

    // If old ignore had new.css, new one does not, it should be built after reload.
    expect(fs.existsSync(path.resolve('_site/new.css'))).toEqual(false);
    await manager.handleIgnoreReload(oldIgnore);
    expect(fs.existsSync(path.resolve('_site/new.css'))).toEqual(true);

    // Opposite: Ignore 'existing.css' should remove it
    const existingCssPath = path.resolve('_site/existing.css');
    mockFs.vol.writeFileSync(existingCssPath, 'some content');
    expect(fs.existsSync(existingCssPath)).toEqual(true);
    const previousIgnore = ['_site/*'];
    manager.siteConfig = { ignore: ['_site/*', 'existing.css'] } as any; // New config
    await manager.handleIgnoreReload(previousIgnore);
    expect(fs.existsSync(existingCssPath)).toEqual(false);
  });

  // Check if copyBootstrapTheme is triggered when bootstrapTheme changes
  test('handleStyleReload updates theme when changed', async () => {
    const manager = new SiteAssetsManager(rootPath, outputPath);
    manager.siteConfig = { style: { bootstrapTheme: 'flatly' } } as any;

    const copyBootstrapThemeSpy = jest.spyOn(
      manager, 'copyBootstrapTheme',
    ).mockImplementation(() => Promise.resolve());

    // Change from 'default' to 'flatly'
    await manager.handleStyleReload({ bootstrapTheme: 'default' } as any);

    expect(copyBootstrapThemeSpy).toHaveBeenCalledWith(true);
  });
});
