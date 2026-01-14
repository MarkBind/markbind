import { Ignore } from 'ignore';

import { SiteAssetsManager } from './SiteAssetsManager';
import { SiteDeployManager } from './SiteDeployManager';
import { SiteGenerationManager } from './SiteGenerationManager';
import { SitePagesManager, AddressablePage, PageCreationConfig } from './SitePagesManager';
import { SiteConfig, SiteConfigPage } from './SiteConfig';
import { Page } from '../Page';
import * as logger from '../utils/logger';
import {
  SITE_CONFIG_NAME,
} from './constants';

// Change when migrated to TypeScript
require('../patches/htmlparser2');

export class Site {
  isDevMode: boolean;
  rootPath: string;
  outputPath: string;

  // Facade Internal Components
  assetsManager: SiteAssetsManager;
  pagesManager: SitePagesManager;
  deployManager: SiteDeployManager;
  generationManager: SiteGenerationManager;

  // Getters for compatibility
  get siteConfig() { return this.generationManager.siteConfig; }
  set siteConfig(config: SiteConfig) {
    this.generationManager.siteConfig = config;
    this.assetsManager.siteConfig = config;
    this.pagesManager.siteConfig = config;
    this.deployManager.siteConfig = config;
  }

  get pages() { return this.pagesManager.pages; }
  get addressablePages() { return this.pagesManager.addressablePages; }
  get addressablePagesSource() { return this.pagesManager.addressablePagesSource; }
  get baseUrlMap() { return this.pagesManager.baseUrlMap; }
  get variableProcessor() { return this.generationManager.variableProcessor; }
  get pluginManager() { return this.generationManager.pluginManager; }
  get siteLinkManager() { return this.generationManager.siteLinkManager; }
  get externalManager() { return this.generationManager.externalManager; }
  get layoutManager() { return this.generationManager.layoutManager; }
  get tempPath() { return this.generationManager.tempPath; }
  get siteAssetsDestPath() { return this.assetsManager.siteAssetsDestPath; }
  get pageTemplatePath() { return this.pagesManager.pageTemplatePath; }
  get pageTemplate() { return this.pagesManager.pageTemplate; }
  get forceReload() { return this.generationManager.forceReload; }
  get siteConfigPath() { return this.generationManager.siteConfigPath; }
  get backgroundBuildMode() { return this.generationManager.backgroundBuildMode; }
  get stopGenerationTimeThreshold() { return this.generationManager.stopGenerationTimeThreshold; }
  get postBackgroundBuildFunc() { return this.generationManager.postBackgroundBuildFunc; }
  get onePagePath() { return this.generationManager.onePagePath; }
  get currentPageViewed() { return this.generationManager.currentPageViewed; }
  get currentOpenedPages() { return this.generationManager.currentOpenedPages; }
  get toRebuild() { return this.generationManager.toRebuild; }

  constructor(rootPath: string, outputPath: string, onePagePath: string, forceReload = false,
              siteConfigPath = SITE_CONFIG_NAME, isDevMode: any, backgroundBuildMode: boolean,
              postBackgroundBuildFunc: () => void) {
    this.isDevMode = !!isDevMode;
    this.rootPath = rootPath;
    this.outputPath = outputPath;

    this.assetsManager = new SiteAssetsManager(rootPath, outputPath);
    this.pagesManager = new SitePagesManager(rootPath, outputPath, this.isDevMode);
    this.deployManager = new SiteDeployManager(rootPath, outputPath);
    this.generationManager = new SiteGenerationManager(rootPath, outputPath, onePagePath, forceReload,
                                                       siteConfigPath, this.isDevMode, backgroundBuildMode,
                                                       postBackgroundBuildFunc);

    // Configure Generator with references
    this.generationManager.configure(this.assetsManager, this.pagesManager);
  }

  createNewPage(page: AddressablePage, faviconUrl: string | undefined) {
    return this.pagesManager.createNewPage(page, faviconUrl);
  }

  static async rejectHandler(error: unknown, removeFolders: string[]) {
    return SiteGenerationManager.rejectHandler(error, removeFolders);
  }

  beforeSiteGenerate() {
    this.generationManager.beforeSiteGenerate();
  }

  changeCurrentPage(normalizedUrl: string) {
    return this.generationManager.changeCurrentPage(normalizedUrl);
  }

  changeCurrentOpenedPages(normalizedUrls: string[]) {
    return this.generationManager.changeCurrentOpenedPages(normalizedUrls);
  }

  async readSiteConfig(baseUrl?: string) {
    const config = await this.generationManager.readSiteConfig(baseUrl);
    this.siteConfig = config;
    return config;
  }

  listAssets(fileIgnore: Ignore) {
    return this.assetsManager.listAssets(fileIgnore);
  }

  createPage(config: PageCreationConfig): Page {
    return this.pagesManager.createPage(config);
  }

  collectAddressablePages() {
    this.pagesManager.collectAddressablePages();
  }

  static printBaseUrlMessage() {
    logger.info('The default base URL of your site is set to /\n'
      + 'You can change the base URL of your site by editing site.json\n'
      + 'Check https://markbind.org/userGuide/siteConfiguration.html for more information.');
  }

  updateAddressablePages() {
    return this.pagesManager.updateAddressablePages();
  }

  getPageGlobPaths(page: SiteConfigPage, pagesExclude: string[]) {
    return this.pagesManager.getPageGlobPaths(page, pagesExclude);
  }

  collectBaseUrl() {
    this.generationManager.collectBaseUrl();
  }

  collectUserDefinedVariablesMap() {
    this.generationManager.collectUserDefinedVariablesMap();
  }

  collectUserDefinedVariablesMapIfNeeded(filePaths: string[]) {
    return this.generationManager.collectUserDefinedVariablesMapIfNeeded(filePaths);
  }

  async generate(baseUrl: string | undefined): Promise<any> {
    return this.generationManager.generate(baseUrl);
  }

  async buildSourceFiles() {
    return this.generationManager.buildSourceFiles();
  }

  lazyBuildAllPagesNotViewed(viewedPages: string | string[]) {
    return this.generationManager.lazyBuildAllPagesNotViewed(viewedPages);
  }

  async lazyBuildSourceFiles() {
    return this.generationManager.lazyBuildSourceFiles();
  }

  copyLazySourceFiles() {
    return this.generationManager.copyLazySourceFiles();
  }

  rebuildAffectedSourceFiles(filePaths: string | string[]) {
    return this.generationManager.rebuildAffectedSourceFiles(filePaths);
  }

  rebuildPagesBeingViewed(normalizedUrls: string | string[]) {
    // Cast to string[] if needed or let wrapper handle
    return this.generationManager.rebuildPagesBeingViewed(normalizedUrls as string[]);
  }

  rebuildSourceFiles() {
    return this.generationManager.rebuildSourceFiles();
  }

  backgroundBuildNotViewedFiles() {
    return this.generationManager.backgroundBuildNotViewedFiles();
  }

  async rebuildRequiredPages() {
    return this.generationManager.rebuildRequiredPages();
  }

  buildAsset(filePaths: string | string[]) {
    return this.assetsManager.buildAsset(filePaths);
  }

  removeAsset(filePaths: string | string[]) {
    return this.assetsManager.removeAsset(filePaths);
  }

  async reloadSiteConfig() {
    await this.generationManager.reloadSiteConfig();
    this.siteConfig = this.generationManager.siteConfig;
  }

  async copyFontAwesomeAsset() { return this.assetsManager.copyFontAwesomeAsset(); }
  copyOcticonsAsset() { return this.assetsManager.copyOcticonsAsset(); }
  copyMaterialIconsAsset() { return this.assetsManager.copyMaterialIconsAsset(); }
  copyCoreWebAsset() { return this.assetsManager.copyCoreWebAsset(); }
  copyBootstrapIconsAsset() { return this.assetsManager.copyBootstrapIconsAsset(); }
  async copyBootstrapTheme(isRebuild: boolean) { return this.assetsManager.copyBootstrapTheme(isRebuild); }
  async deploy(ciTokenVar: string | boolean) {
    const config = await this.readSiteConfig();
    this.deployManager.siteConfig = config;
    return this.deployManager.deploy(ciTokenVar);
  }
}
