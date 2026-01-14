import fs from 'fs-extra';
import ignore, { Ignore } from 'ignore';
import path from 'path';
import walkSync from 'walk-sync';
import Bluebird from 'bluebird';

import { SiteConfig, SiteConfigStyle } from './SiteConfig';
import { delay } from '../utils/delay';
import * as logger from '../utils/logger';
import { TEMPLATE_SITE_ASSET_FOLDER_NAME, _ } from './constants';

function getBootswatchThemePath(theme: string) {
  return require.resolve(`bootswatch/dist/${theme}/bootstrap.min.css`);
}

const SUPPORTED_THEMES_PATHS: Record<string, string> = {
  'bootswatch-cerulean': getBootswatchThemePath('cerulean'),
  'bootswatch-cosmo': getBootswatchThemePath('cosmo'),
  'bootswatch-flatly': getBootswatchThemePath('flatly'),
  'bootswatch-journal': getBootswatchThemePath('journal'),
  'bootswatch-litera': getBootswatchThemePath('litera'),
  'bootswatch-lumen': getBootswatchThemePath('lumen'),
  'bootswatch-lux': getBootswatchThemePath('lux'),
  'bootswatch-materia': getBootswatchThemePath('materia'),
  'bootswatch-minty': getBootswatchThemePath('minty'),
  'bootswatch-pulse': getBootswatchThemePath('pulse'),
  'bootswatch-sandstone': getBootswatchThemePath('sandstone'),
  'bootswatch-simplex': getBootswatchThemePath('simplex'),
  'bootswatch-sketchy': getBootswatchThemePath('sketchy'),
  'bootswatch-spacelab': getBootswatchThemePath('spacelab'),
  'bootswatch-united': getBootswatchThemePath('united'),
  'bootswatch-yeti': getBootswatchThemePath('yeti'),
  'bootswatch-zephyr': getBootswatchThemePath('zephyr'),
};

/**
 * Manages site assets such as CSS, JS, fonts, and images.
 * Handles copying, building, and removing assets, as well as handling style reloads.
 */
export class SiteAssetsManager {
  rootPath: string;
  outputPath: string;
  siteAssetsDestPath: string;
  siteConfig!: SiteConfig;

  constructor(rootPath: string, outputPath: string) {
    this.rootPath = rootPath;
    this.outputPath = outputPath;
    this.siteAssetsDestPath = path.join(outputPath, TEMPLATE_SITE_ASSET_FOLDER_NAME);
  }

  listAssets(fileIgnore: Ignore) {
    const files = walkSync(this.rootPath, { directories: false });
    return fileIgnore.filter(files);
  }

  async _buildMultipleAssets(filePaths: string | string[]) {
    const filePathArray = Array.isArray(filePaths) ? filePaths : [filePaths];
    const uniquePaths = _.uniq(filePathArray);
    const fileIgnore = ignore().add(this.siteConfig.ignore);
    const fileRelativePaths = uniquePaths.map(filePath => path.relative(this.rootPath, filePath));
    const copyAssets = fileIgnore.filter(fileRelativePaths)
      .map(asset => fs.copy(path.join(this.rootPath, asset), path.join(this.outputPath, asset)));
    await Promise.all(copyAssets);
    logger.info('Assets built');
  }

  async _removeMultipleAssets(filePaths: string | string[]) {
    const filePathArray = Array.isArray(filePaths) ? filePaths : [filePaths];
    const uniquePaths = _.uniq(filePathArray);
    const fileRelativePaths = uniquePaths.map(filePath => path.relative(this.rootPath, filePath));
    const filesToRemove = fileRelativePaths.map(
      fileRelativePath => path.join(this.outputPath, fileRelativePath));
    const removeFiles = filesToRemove.map(asset => fs.remove(asset));
    if (removeFiles.length !== 0) {
      await Promise.all(removeFiles);
      logger.debug('Assets removed');
    }
  }

  async buildAssets() {
    logger.info('Building assets...');
    const outputFolder = path.relative(this.rootPath, this.outputPath);
    const fileIgnore = ignore().add([...this.siteConfig.ignore, outputFolder]);

    // Scan and copy assets (excluding ignore files).
    const listOfAssets = this.listAssets(fileIgnore);
    const assetsToCopy = listOfAssets.map(asset =>
      fs.copy(path.join(this.rootPath, asset), path.join(this.outputPath, asset)));
    await Promise.all(assetsToCopy);
    logger.info('Assets built');
  }

  /**
   * Handles the reloading of ignore attributes
   */
  async handleIgnoreReload(oldIgnore: string[]) {
    const assetsToRemove = _.difference(this.siteConfig.ignore, oldIgnore);

    if (!_.isEqual(oldIgnore, this.siteConfig.ignore)) {
      await this._removeMultipleAssets(assetsToRemove);
      await this.buildAssets();
    }
  }

  /**
   * Handles the reloading of the style attribute if it has been modified
   */
  async handleStyleReload(oldStyle: SiteConfigStyle) {
    if (!_.isEqual(oldStyle.bootstrapTheme, this.siteConfig.style.bootstrapTheme)) {
      await this.copyBootstrapTheme(true);
      logger.info('Updated bootstrap theme');
    }
  }

  /**
   * Copies Font Awesome assets to the assets folder
   */
  async copyFontAwesomeAsset() {
    const faRootSrcPath = path.dirname(require.resolve('@fortawesome/fontawesome-free/package.json'));
    const faCssSrcPath = path.join(faRootSrcPath, 'css', 'all.min.css');
    const faCssDestPath = path.join(this.siteAssetsDestPath, 'fontawesome', 'css', 'all.min.css');
    const faFontsSrcPath = path.join(faRootSrcPath, 'webfonts');
    const faFontsDestPath = path.join(this.siteAssetsDestPath, 'fontawesome', 'webfonts');

    await fs.copy(faCssSrcPath, faCssDestPath);
    await fs.copy(faFontsSrcPath, faFontsDestPath);
  }

  /**
   * Copies Octicon assets to the assets folder
   */
  copyOcticonsAsset() {
    const octiconsCssSrcPath = require.resolve('@primer/octicons/build/build.css');
    const octiconsCssDestPath = path.join(this.siteAssetsDestPath, 'css', 'octicons.css');

    return fs.copy(octiconsCssSrcPath, octiconsCssDestPath);
  }

  /**
   * Copies Google Material Icons assets to the assets folder
   */
  copyMaterialIconsAsset() {
    const materialIconsRootSrcPath = path.dirname(require.resolve('material-icons/package.json'));
    const materialIconsCssAndFontsSrcPath = path.join(materialIconsRootSrcPath, 'iconfont');
    const materialIconsCssAndFontsDestPath = path.join(this.siteAssetsDestPath, 'material-icons');

    return fs.copy(materialIconsCssAndFontsSrcPath, materialIconsCssAndFontsDestPath);
  }

  /**
   * Copies core-web bundles and external assets to the assets output folder
   */
  copyCoreWebAsset() {
    const coreWebRootPath = path.dirname(require.resolve('@markbind/core-web/package.json'));
    const coreWebAssetPath = path.join(coreWebRootPath, 'asset');
    fs.copySync(coreWebAssetPath, this.siteAssetsDestPath);

    const dirsToCopy = ['fonts'];
    const filesToCopy = [
      'js/markbind.min.js',
      'css/markbind.min.css',
    ];

    const copyAllFiles = filesToCopy.map((file) => {
      const srcPath = path.join(coreWebRootPath, 'dist', file);
      const destPath = path.join(this.siteAssetsDestPath, file);
      return fs.copy(srcPath, destPath);
    });

    const copyFontsDir = dirsToCopy.map((dir) => {
      const srcPath = path.join(coreWebRootPath, 'dist', dir);
      const destPath = path.join(this.siteAssetsDestPath, 'css', dir);
      return fs.copy(srcPath, destPath);
    });

    return Promise.all([...copyAllFiles, ...copyFontsDir]);
  }

  copyBootstrapIconsAsset() {
    const bootstrapIconsCssSrcPath = require.resolve('bootstrap-icons/font/bootstrap-icons.css');
    const bootstrapIconsFontsSrcPath = path.dirname(bootstrapIconsCssSrcPath);
    const bootstrapIconsFontsDestPath = path.join(this.siteAssetsDestPath, 'bootstrap-icons', 'font');
    return fs.copy(bootstrapIconsFontsSrcPath, bootstrapIconsFontsDestPath);
  }

  /**
   * Copies bootstrapTheme to the assets folder if a valid bootstrapTheme is specified
   * @param isRebuild only true if it is a rebuild
   */
  copyBootstrapTheme(isRebuild: boolean) {
    const { bootstrapTheme } = this.siteConfig.style;

    if ((!isRebuild && !bootstrapTheme)
      || (bootstrapTheme && !_.has(SUPPORTED_THEMES_PATHS, bootstrapTheme))) {
      return _.noop;
    }

    const themeSrcPath = !bootstrapTheme
      ? require.resolve('@markbind/core-web/asset/css/bootstrap.min.css')
      : SUPPORTED_THEMES_PATHS[bootstrapTheme];
    const themeDestPath = path.join(this.siteAssetsDestPath, 'css', 'bootstrap.min.css');

    return fs.copy(themeSrcPath, themeDestPath);
  }

  /**
   * Build/copy assets that are specified in filePaths
   * @param filePaths a single path or an array of paths corresponding to the assets to build
   */
  buildAsset = delay(this._buildMultipleAssets.bind(this) as () => Bluebird<unknown>, 1000);

  /**
   * Remove assets that are specified in filePaths
   * @param filePaths a single path or an array of paths corresponding to the assets to remove
   */
  removeAsset = delay(this._removeMultipleAssets.bind(this) as () => Bluebird<unknown>, 1000);
}
