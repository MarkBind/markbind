import { SiteAssetsManager } from './SiteAssetsManager.js';
import { SiteDeployManager } from './SiteDeployManager.js';
import { SiteGenerationManager } from './SiteGenerationManager.js';
import { SitePagesManager } from './SitePagesManager.js';
import { SiteConfig } from './SiteConfig.js';
import * as logger from '../utils/logger.js';
import {
  SITE_CONFIG_NAME,
} from './constants.js';

import '../patches/htmlparser2.js';

export class Site {
  isDevMode: boolean;
  rootPath: string;
  outputPath: string;
  siteConfigPath: string;

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

  constructor(rootPath: string, outputPath: string, onePagePath: string, forceReload = false,
              siteConfigPath = SITE_CONFIG_NAME, isDevMode: any, backgroundBuildMode: boolean,
              postBackgroundBuildFunc: () => void) {
    this.isDevMode = !!isDevMode;
    this.rootPath = rootPath;
    this.outputPath = outputPath;
    this.siteConfigPath = siteConfigPath;

    this.assetsManager = new SiteAssetsManager(rootPath, outputPath);
    this.pagesManager = new SitePagesManager(rootPath, outputPath, this.isDevMode);
    this.deployManager = new SiteDeployManager(rootPath, outputPath);
    this.generationManager = new SiteGenerationManager(rootPath, outputPath, onePagePath, forceReload,
                                                       siteConfigPath, this.isDevMode, backgroundBuildMode,
                                                       postBackgroundBuildFunc);

    // Configure Generator with references
    this.generationManager.configure(this.assetsManager, this.pagesManager);
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

  static printBaseUrlMessage() {
    logger.info('The default base URL of your site is set to /\n'
      + 'You can change the base URL of your site by editing site.json\n'
      + 'Check https://markbind.org/userGuide/siteConfiguration.html for more information.');
  }

  async generate(baseUrl: string | undefined): Promise<any> {
    return this.generationManager.generate(baseUrl);
  }

  async buildSourceFiles() {
    return this.generationManager.buildSourceFiles();
  }

  rebuildAffectedSourceFiles(filePaths: string | string[]) {
    return this.generationManager.rebuildAffectedSourceFiles(filePaths);
  }

  rebuildSourceFiles() {
    return this.generationManager.rebuildSourceFiles();
  }

  async updatePagefindIndex(filePaths: string | string[]): Promise<boolean> {
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
    const pages = this.generationManager.sitePages.pages.filter(page =>
      paths.some(p => page.pageConfig.sourcePath === p),
    );
    return this.generationManager.updatePagefindIndex(pages);
  }

  buildAsset(filePaths: string | string[]) {
    return this.assetsManager.buildAsset(filePaths);
  }

  removeAsset(filePaths: string | string[]) {
    return this.assetsManager.removeAsset(filePaths);
  }

  isFilepathAPage(filePath: string) {
    return this.pagesManager.isFilepathAPage(filePath);
  }

  isDependencyOfPage(filePath: string) {
    return this.pagesManager.isDependencyOfPage(filePath);
  }

  async reloadSiteConfig() {
    await this.generationManager.reloadSiteConfig();
    this.siteConfig = this.generationManager.siteConfig;
  }

  /**
   * Deploys the site to the specified deployment platform.
   * @param ciTokenVar The CI token variable to use for authentication.
   * @returns A promise that resolves when the deployment is complete.
   */
  async deploy(ciTokenVar: string | boolean) {
    const config = await this.readSiteConfig();
    this.deployManager.siteConfig = config;
    return this.deployManager.deploy(ciTokenVar);
  }
}
