import cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import walkSync from 'walk-sync';

import { SiteAssetsManager } from './SiteAssetsManager';
import { SitePagesManager, AddressablePage } from './SitePagesManager';
import { SiteConfig } from './SiteConfig';
import { Page } from '../Page';
import { VariableProcessor } from '../variables/VariableProcessor';
import { ExternalManager } from '../External/ExternalManager';
import { SiteLinkManager } from '../html/SiteLinkManager';
import { PluginManager } from '../plugins/PluginManager';
import { sequentialAsyncForEach } from '../utils/async';
import { delay } from '../utils/delay';
import * as fsUtil from '../utils/fsUtil';
import * as logger from '../utils/logger';
import {
  SITE_CONFIG_NAME, LAZY_LOADING_SITE_FILE_NAME, _,
  TEMP_FOLDER_NAME, SITE_DATA_NAME, USER_VARIABLES_PATH,
} from './constants';
import { LayoutManager } from '../Layout';
import { LayoutConfig } from '../Layout/Layout';
import { ProgressBar } from '../lib/progress';

// Change when migrated to TypeScript
require('../patches/htmlparser2');

const MARKBIND_VERSION = require('../../package.json').version;

const MAX_CONCURRENT_PAGE_GENERATION_PROMISES = 4;

const LAZY_LOADING_BUILD_TIME_RECOMMENDATION_LIMIT = 30000;
const LAZY_LOADING_REBUILD_TIME_RECOMMENDATION_LIMIT = 5000;

const MARKBIND_WEBSITE_URL = 'https://markbind.org/';
const MARKBIND_LINK_HTML = `<a href='${MARKBIND_WEBSITE_URL}'>MarkBind ${MARKBIND_VERSION}</a>`;

type PageGenerationTask = {
  mode: string,
  pages: Page[]
};

type PageGenerationContext = {
  startTime: Date,
  numPagesGenerated: number,
  numPagesToGenerate: number,
  isCompleted: boolean,
};

/**
 * Orchestrates the site generation process.
 * Manages the build lifecycle, variable processing, plugin management,
 * and rebuilding strategies (lazy/background).
 */
export class SiteGenerationManager {
  rootPath: string;
  outputPath: string;
  tempPath: string;
  siteConfig!: SiteConfig;
  siteConfigPath: string;

  // Managers
  variableProcessor!: VariableProcessor;
  pluginManager!: PluginManager;
  siteLinkManager!: SiteLinkManager;
  externalManager!: ExternalManager;
  layoutManager!: LayoutManager;
  sitePages!: SitePagesManager;
  siteAssets!: SiteAssetsManager;

  // Build state
  forceReload: boolean;
  backgroundBuildMode: string | boolean;
  stopGenerationTimeThreshold: Date;
  postBackgroundBuildFunc: () => void;
  onePagePath: string;
  currentPageViewed: string;
  currentOpenedPages: string[];
  toRebuild: Set<string>;

  constructor(rootPath: string, outputPath: string, onePagePath: string, forceReload = false,
              siteConfigPath = SITE_CONFIG_NAME, isDevMode: any, backgroundBuildMode: boolean,
              postBackgroundBuildFunc: () => void) {
    this.rootPath = rootPath;
    this.outputPath = outputPath;
    this.tempPath = path.join(rootPath, TEMP_FOLDER_NAME);
    this.forceReload = forceReload;
    this.siteConfigPath = siteConfigPath;

    // Background build properties
    this.backgroundBuildMode = onePagePath && backgroundBuildMode;
    this.stopGenerationTimeThreshold = new Date();
    this.postBackgroundBuildFunc = postBackgroundBuildFunc || (() => {});

    // Lazy reload properties
    this.onePagePath = onePagePath;
    this.currentPageViewed = onePagePath
      ? path.resolve(this.rootPath, fsUtil.removeExtension(onePagePath))
      : '';
    this.currentOpenedPages = [];
    this.toRebuild = new Set();
  }

  configure(siteAssets: SiteAssetsManager, sitePages: SitePagesManager) {
    this.siteAssets = siteAssets;
    this.sitePages = sitePages;
  }

  static async rejectHandler(error: unknown, removeFolders: string[]) {
    logger.warn(error);
    try {
      await Promise.all(removeFolders.map(folder => fs.remove(folder)));
    } catch (err) {
      logger.error(`Failed to remove generated files after error!\n${(err as Error).message}`);
    }
  }

  beforeSiteGenerate() {
    this.variableProcessor.invalidateCache();
    this.externalManager.reset();
    this.pluginManager.beforeSiteGenerate();
  }

  /**
   * Changes the site variable of the current page being viewed, building it if necessary.
   * @param normalizedUrl BaseUrl-less and extension-less url of the page
   * @return Boolean of whether the page needed to be rebuilt
   */
  changeCurrentPage(normalizedUrl: string) {
    this.currentPageViewed = path.join(this.rootPath, normalizedUrl);

    if (this.toRebuild.has(this.currentPageViewed)) {
      this.beforeSiteGenerate();
      /*
       Lazy loading only builds the page being viewed, but the user may be quick enough
       to trigger multiple page builds before the first one has finished building,
       hence we need to take this into account by using the delayed variant of the method.
       */
      this.rebuildPagesBeingViewed(this.currentPageViewed);
      return true;
    }

    return false;
  }

  /**
   * Changes the list of current opened pages
   * @param normalizedUrls Collection of normalized url of pages taken from the clients
   * ordered from most-to-least recently opened
   */
  changeCurrentOpenedPages(normalizedUrls: string[]) {
    if (!this.onePagePath) {
      return;
    }

    const openedPages = normalizedUrls.map(normalizedUrl => path.join(this.rootPath, normalizedUrl));
    this.currentOpenedPages = _.uniq(openedPages);

    if (this.currentOpenedPages.length > 0) {
      logger.info('Current opened pages, from most-to-least recent:');
      this.currentOpenedPages.forEach((pagePath, idx) => {
        logger.info(`${idx + 1}. ${fsUtil.ensurePosix(path.relative(this.rootPath, pagePath))}`);
      });
    } else {
      logger.info('No pages are currently opened');
    }
  }

  /**
   * Read and stores the site config from site.json, in Site, SitePages and SiteAssets.
   * Overwrite the default base URL if it's specified by the user.
   * @param baseUrl user defined base URL (if exists)
   */
  async readSiteConfig(baseUrl?: string) {
    this.siteConfig = await SiteConfig.readSiteConfig(this.rootPath, this.siteConfigPath, baseUrl);
    this.sitePages.siteConfig = this.siteConfig;
    this.siteAssets.siteConfig = this.siteConfig;
    return this.siteConfig;
  }

  /**
   * Collects the base url map in the site/subsites
   */
  collectBaseUrl() {
    const candidates = walkSync(this.rootPath, { directories: false })
      .filter(x => x.endsWith(this.siteConfigPath))
      .map(x => path.resolve(this.rootPath, x));

    const baseUrlMap = new Set(candidates.map(candidate => path.dirname(candidate)));
    this.variableProcessor = new VariableProcessor(this.rootPath, baseUrlMap);
    this.sitePages.setBaseUrlMap(baseUrlMap);

    this.buildManagers(baseUrlMap);
  }

  /**
   * Set up the managers used with the configurations.
   */
  buildManagers(baseUrlMap: Set<string>) {
    const config: LayoutConfig = {
      baseUrlMap,
      baseUrl: this.siteConfig.baseUrl,
      rootPath: this.rootPath,
      outputPath: this.outputPath,
      ignore: this.siteConfig.ignore,
      addressablePagesSource: this.sitePages.addressablePagesSource,
      variableProcessor: this.variableProcessor,
      intrasiteLinkValidation: this.siteConfig.intrasiteLinkValidation,
      codeLineNumbers: this.siteConfig.style.codeLineNumbers,
      plantumlCheck: this.siteConfig.plantumlCheck,
      headerIdMap: {},
      siteLinkManager: this.siteLinkManager,
      pluginManager: this.pluginManager,
      externalManager: this.externalManager,
    };
    this.siteLinkManager = new SiteLinkManager(config);
    config.siteLinkManager = this.siteLinkManager;

    this.pluginManager = new PluginManager(config, this.siteConfig.plugins, this.siteConfig.pluginsContext);
    config.pluginManager = this.pluginManager;

    this.externalManager = new ExternalManager(config);
    config.externalManager = this.externalManager;

    this.layoutManager = new LayoutManager(config);

    // Propagate managers to SitePages
    this.sitePages.variableProcessor = this.variableProcessor;
    this.sitePages.pluginManager = this.pluginManager;
    this.sitePages.siteLinkManager = this.siteLinkManager;
    this.sitePages.externalManager = this.externalManager;
    this.sitePages.layoutManager = this.layoutManager;
  }

  /**
   * Collects the user defined variables map in the site/subsites
   */
  collectUserDefinedVariablesMap() {
    this.variableProcessor.resetUserDefinedVariablesMap();

    this.sitePages.baseUrlMap.forEach((base) => {
      const userDefinedVariablesPath = path.resolve(base, USER_VARIABLES_PATH);
      let content;
      try {
        content = fs.readFileSync(userDefinedVariablesPath, 'utf8');
      } catch (e) {
        content = '';
        logger.warn((e as Error).message);
      }

      /*
       We retrieve the baseUrl of the (sub)site by appending the relative to the configured base url
       i.e. We ignore the configured baseUrl of the sub sites.
       */
      const siteRelativePathFromRoot = fsUtil.ensurePosix(path.relative(this.rootPath, base));
      const siteBaseUrl = siteRelativePathFromRoot === ''
        ? this.siteConfig.baseUrl
        : path.posix.join(this.siteConfig.baseUrl || '/', siteRelativePathFromRoot);
      this.variableProcessor.addUserDefinedVariable(base, 'baseUrl', siteBaseUrl);
      this.variableProcessor.addUserDefinedVariable(base, 'MarkBind', MARKBIND_LINK_HTML);

      const $ = cheerio.load(content, { decodeEntities: false });
      $('variable,span').each((_index, element) => {
        const name = $(element).attr('name') || $(element).attr('id');

        this.variableProcessor.renderAndAddUserDefinedVariable(base, name, $(element).html());
      });
    });
  }

  /**
   * Collects the user defined variables map in the site/subsites
   * if there is a change in the variables file
   * @param filePaths array of paths corresponding to files that have changed
   */
  collectUserDefinedVariablesMapIfNeeded(filePaths: string[]) {
    const variablesPath = path.resolve(this.rootPath, USER_VARIABLES_PATH);
    if (filePaths.includes(variablesPath)) {
      this.collectUserDefinedVariablesMap();
      return true;
    }
    return false;
  }

  /**
   * Generate the website.
   * @param baseUrl user defined base URL (if exists)
   */
  async generate(baseUrl: string | undefined): Promise<any> {
    const startTime = new Date();
    // Create the .tmp folder for storing intermediate results.
    fs.emptydirSync(this.tempPath);
    // Clean the output folder; create it if not exist.
    fs.emptydirSync(this.outputPath);
    const lazyWebsiteGenerationString = this.onePagePath ? '(lazy) ' : '';
    logger.info(`Website generation ${lazyWebsiteGenerationString}started at ${
      startTime.toLocaleTimeString()}`);

    try {
      await this.readSiteConfig(baseUrl);
      this.sitePages.collectAddressablePages();
      this.collectBaseUrl();
      this.collectUserDefinedVariablesMap();
      await this.siteAssets.buildAssets();
      await (this.onePagePath ? this.lazyBuildSourceFiles() : this.buildSourceFiles());
      await this.siteAssets.copyCoreWebAsset();
      await this.siteAssets.copyBootstrapIconsAsset();
      await this.siteAssets.copyBootstrapTheme(false);
      await this.siteAssets.copyFontAwesomeAsset();
      await this.siteAssets.copyOcticonsAsset();
      await this.siteAssets.copyMaterialIconsAsset();
      await this.writeSiteData();
      this.calculateBuildTimeForGenerate(startTime, lazyWebsiteGenerationString);
      if (this.backgroundBuildMode) {
        this.backgroundBuildNotViewedFiles();
      }
    } catch (error) {
      await SiteGenerationManager.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  /**
   * Helper function for generate().
   */
  calculateBuildTimeForGenerate(startTime: Date, lazyWebsiteGenerationString: string) {
    const endTime = new Date();
    const totalBuildTime = (endTime.getTime() - startTime.getTime()) / 1000;
    logger.info(`Website generation ${lazyWebsiteGenerationString}complete! Total build time: ${
      totalBuildTime}s`);

    if (!this.onePagePath && totalBuildTime > LAZY_LOADING_BUILD_TIME_RECOMMENDATION_LIMIT) {
      logger.info('Your site took quite a while to build...'
          + ' Have you considered using markbind serve -o when writing content to speed things up?');
    }
  }

  /**
   * Build all pages of the site
   */
  async buildSourceFiles() {
    this.beforeSiteGenerate();
    logger.info('Generating pages...');

    try {
      await this.generatePages();
      await fs.remove(this.tempPath);
      logger.info('Pages built');
    } catch (error) {
      await SiteGenerationManager.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  /**
   * Adds all pages except the viewed pages to toRebuild, flagging them for lazy building later.
   */
  async lazyBuildAllPagesNotViewed(viewedPages: string | string[]) {
    const viewedPagesArray = Array.isArray(viewedPages) ? viewedPages : [viewedPages];
    this.sitePages.pages.forEach((page) => {
      const normalizedUrl = fsUtil.removeExtension(page.pageConfig.sourcePath);
      if (!viewedPagesArray.some(viewedPage => normalizedUrl === viewedPage)) {
        this.toRebuild.add(normalizedUrl);
      }
    });
  }

  /**
   * Only build landing page of the site, building more as the author goes to different links.
   */
  async lazyBuildSourceFiles() {
    this.beforeSiteGenerate();
    logger.info('Generating landing page...');

    try {
      await this.generateLandingPage();
      await this.copyLazySourceFiles();
      await fs.remove(this.tempPath);
      await this.lazyBuildAllPagesNotViewed(this.currentPageViewed);
      logger.info('Landing page built, other pages will be built as you navigate to them!');
    } catch (error) {
      await SiteGenerationManager.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  /**
   * Helper function for lazyBuildSourceFiles().
   */
  copyLazySourceFiles() {
    const lazyLoadingSpinnerHtmlFilePath = path.join(__dirname, LAZY_LOADING_SITE_FILE_NAME);
    const outputSpinnerHtmlFilePath = path.join(this.outputPath, LAZY_LOADING_SITE_FILE_NAME);

    return fs.copy(lazyLoadingSpinnerHtmlFilePath, outputSpinnerHtmlFilePath);
  }

  async _rebuildAffectedSourceFiles(filePaths: string | string[]) {
    if (this.backgroundBuildMode) {
      this.stopOngoingBuilds();
    }

    const filePathArray = Array.isArray(filePaths) ? filePaths : [filePaths];
    const uniquePaths = _.uniq(filePathArray);
    this.beforeSiteGenerate();

    try {
      await this.layoutManager.updateLayouts(filePathArray);
      await this.regenerateAffectedPages(uniquePaths);
      await fs.remove(this.tempPath);
      if (this.backgroundBuildMode) {
        this.backgroundBuildNotViewedFiles();
      }
    } catch (error) {
      await SiteGenerationManager.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  async _rebuildPagesBeingViewed(normalizedUrls: string[]) {
    const startTime = new Date();
    const normalizedUrlArray = Array.isArray(normalizedUrls) ? normalizedUrls : [normalizedUrls];
    const uniqueUrls = _.uniq(normalizedUrlArray);
    uniqueUrls.forEach(normalizedUrl => logger.info(
      `Building ${normalizedUrl} as some of its dependencies were changed since the last visit`));

    const pagesToRebuild = this.sitePages.pages.filter(page =>
      uniqueUrls.some(pageUrl => fsUtil.removeExtension(page.pageConfig.sourcePath) === pageUrl));
    const pageGenerationTask = {
      mode: 'async',
      pages: pagesToRebuild,
    };

    try {
      this._setTimestampVariable();
      await this.runPageGenerationTasks([pageGenerationTask]);
      await this.writeSiteData();
      SiteGenerationManager.calculateBuildTimeForRebuildPagesBeingViewed(startTime);
    } catch (err) {
      await SiteGenerationManager.rejectHandler(err, [this.tempPath, this.outputPath]);
    }

    await fs.remove(this.tempPath);
  }

  /**
   * Helper function for _rebuildPagesBeingViewed().
   */
  static calculateBuildTimeForRebuildPagesBeingViewed(startTime: Date) {
    const endTime = new Date();
    const totalBuildTime = (endTime.getTime() - startTime.getTime()) / 1000;
    return logger.info(`Lazy website regeneration complete! Total build time: ${totalBuildTime}s`);
  }

  async _backgroundBuildNotViewedFiles() {
    if (this.toRebuild.size === 0) {
      return;
    }

    logger.info('Building files that are not viewed in the background...');
    const isCompleted = await this.generatePagesMarkedToRebuild();
    if (isCompleted) {
      logger.info('Background building completed!');
      this.postBackgroundBuildFunc();
    }
  }

  /**
   * Generates pages that are marked to be built/rebuilt.
   * @returns A Promise that resolves once all pages are generated.
   */
  async generatePagesMarkedToRebuild(): Promise<boolean> {
    const pagesToRebuild = this.sitePages.pages.filter((page) => {
      const normalizedUrl = fsUtil.removeExtension(page.pageConfig.sourcePath);
      return this.toRebuild.has(normalizedUrl);
    });

    const pageRebuildTask = {
      mode: 'async',
      pages: pagesToRebuild,
    };
    return this.runPageGenerationTasks([pageRebuildTask]);
  }

  async _rebuildSourceFiles() {
    if (this.backgroundBuildMode) {
      this.stopOngoingBuilds();
    }

    logger.info('Pages or site config modified, updating pages...');
    this.beforeSiteGenerate();

    this.layoutManager.removeLayouts();

    const removedPageFilePaths = this.sitePages.updateAddressablePages();
    try {
      await this.siteAssets.removeAsset(removedPageFilePaths);
      await this.rebuildRequiredPages();
      if (this.backgroundBuildMode) {
        this.backgroundBuildNotViewedFiles();
      }
    } catch (error) {
      await SiteGenerationManager.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  /**
   * Helper function for _rebuildSourceFiles().
   */
  async rebuildRequiredPages() {
    if (this.onePagePath) {
      this.sitePages
        .mapAddressablePagesToPages(this.sitePages.addressablePages || [], this.sitePages.getFavIconUrl());

      await this._rebuildPagesBeingViewed(this.currentOpenedPages);
      await this.lazyBuildAllPagesNotViewed(this.currentOpenedPages);
      return;
    }

    logger.warn('Rebuilding all pages...');
    await this.buildSourceFiles();
  }

  /**
   * Writes the site data to siteData.json
   * @param verbose Flag to emit logs of the operation
   */
  async writeSiteData(verbose: boolean = true) {
    const siteDataPath = path.join(this.outputPath, SITE_DATA_NAME);
    const siteData = {
      enableSearch: this.siteConfig.enableSearch,
      pages: this.sitePages.pages.filter(page => page.pageConfig.searchable && page.headings)
        .map(page => ({
          src: page.pageConfig.src,
          title: page.title,
          headings: page.headings,
          headingKeywords: page.keywords,
          frontmatterKeywords: page.frontmatter.keywords,
        })),
    };

    try {
      await fs.outputJson(siteDataPath, siteData, { spaces: 2 });
      if (verbose) {
        logger.info('Site data built');
      }
    } catch (error) {
      await SiteGenerationManager.rejectHandler(error, [this.tempPath, this.outputPath]);
    }
  }

  stopOngoingBuilds() {
    this.stopGenerationTimeThreshold = new Date();
  }

  /**
   * Runs the supplied page generation tasks according to the specified mode of each task.
   * A page generation task can be a sequential generation or an asynchronous generation.
   * @param pageGenerationTasks Array of page generation tasks
   * @returns A Promise that resolves to a boolean which indicates whether the generation
   * ran to completion
   */
  async runPageGenerationTasks(pageGenerationTasks: PageGenerationTask[]): Promise<boolean> {
    const pagesCount = pageGenerationTasks.reduce((acc, task) => acc + task.pages.length, 0);
    const progressBar = new ProgressBar(`[:bar] :current / ${pagesCount} pages built`, { total: pagesCount });
    progressBar.render();
    logger.setProgressBar(progressBar);

    const startTime = new Date();
    let isCompleted = true;
    await sequentialAsyncForEach(pageGenerationTasks, async (task) => {
      if (this.backgroundBuildMode && startTime < this.stopGenerationTimeThreshold) {
        logger.info('Page generation stopped');
        logger.debug('Page generation stopped at generation task queue');
        isCompleted = false;
        return;
      }

      if (task.mode === 'sequential') {
        isCompleted = await this.generatePagesSequential(task.pages, progressBar);
      } else {
        isCompleted = await this.generatePagesAsyncThrottled(task.pages, progressBar) as boolean;
      }

      logger.removeProgressBar();
      this.siteLinkManager.validateAllIntralinks();
    });
    return isCompleted;
  }

  /**
   * Generate pages sequentially. That is, the pages are generated
   * one-by-one in order.
   * @param pages Pages to be generated
   * @param progressBar Progress bar of the overall generation process
   * @returns A Promise that resolves to a boolean which indicates whether the generation
   * ran to completion
   */
  async generatePagesSequential(pages: Page[], progressBar: ProgressBar): Promise<boolean> {
    const startTime = new Date();
    let isCompleted = true;
    await sequentialAsyncForEach(pages, async (page) => {
      if (this.backgroundBuildMode && startTime < this.stopGenerationTimeThreshold) {
        logger.info('Page generation stopped');
        logger.debug('Page generation stopped at sequential generation');
        isCompleted = false;
        return;
      }

      try {
        await page.generate(this.externalManager);
        this.toRebuild.delete(fsUtil.removeExtension(page.pageConfig.sourcePath));
        if (this.backgroundBuildMode) {
          await this.writeSiteData(false);
        }
        progressBar.tick();
      } catch (err) {
        throw new Error(`Error while generating ${page.pageConfig.sourcePath}: ${err}`);
      }
    });
    return isCompleted;
  }

  /**
   * Creates the supplied pages' page generation promises at a throttled rate.
   * This is done to avoid pushing too many callbacks into the event loop at once. (#1245)
   * @param pages Pages to be generated
   * @param progressBar Progress bar of the overall generation process
   * @returns A Promise that resolves to a boolean which indicates whether the generation
   * ran to completion
   */
  generatePagesAsyncThrottled(pages: Page[], progressBar: ProgressBar): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const context: PageGenerationContext = {
        startTime: new Date(),
        numPagesGenerated: 0,
        numPagesToGenerate: pages.length,
        isCompleted: true,
      };

      // Map pages into array of callbacks for delayed execution
      const pageGenerationQueue = pages.map(page => async () => {
        // Pre-generate guard to ensure no newly executed callbacks start on stop
        if (this.backgroundBuildMode && context.startTime < this.stopGenerationTimeThreshold) {
          if (context.isCompleted) {
            logger.info('Page generation stopped');
            logger.debug('Page generation stopped at asynchronous generation');
            context.isCompleted = false;
            resolve(false);
          }
          return;
        }

        try {
          await page.generate(this.externalManager);
          this.toRebuild.delete(fsUtil.removeExtension(page.pageConfig.sourcePath));
          if (this.backgroundBuildMode) {
            await this.writeSiteData(false);
          }
          this.generateProgressBarStatus(progressBar, context, pageGenerationQueue, resolve);
        } catch (err) {
          logger.error(err);
          reject(new Error(`Error while generating ${page.pageConfig.sourcePath}`));
        }
      });

      /*
       Take the first MAX_CONCURRENT_PAGE_GENERATION_PROMISES callbacks and execute them.
       Whenever a page generation callback resolves,
       it pops the next unprocessed callback off pageGenerationQueue and executes it.
       */
      pageGenerationQueue.splice(0, MAX_CONCURRENT_PAGE_GENERATION_PROMISES)
        .forEach(generatePage => generatePage());
    });
  }

  /**
   * Helper function for generatePagesAsyncThrottled().
   */
  generateProgressBarStatus(progressBar: ProgressBar, context: PageGenerationContext,
                            pageGenerationQueue: (() => Promise<void>)[], resolve: ((arg0: boolean) => any)) {
    // Post-generate guard to ensure no new callbacks are executed on stop
    if (this.backgroundBuildMode && context.startTime < this.stopGenerationTimeThreshold) {
      if (context.isCompleted) {
        logger.info('Page generation stopped');
        logger.debug('Page generation stopped at asynchronous generation');
        context.isCompleted = false;
        resolve(false);
      }
      return;
    }
    progressBar.tick();
    context.numPagesGenerated += 1;

    if (pageGenerationQueue.length) {
      pageGenerationQueue.pop()!();
    } else if (context.numPagesGenerated === context.numPagesToGenerate) {
      resolve(true);
    }
  }

  /**
   * Renders all pages specified in site configuration file to the output folder
   */
  generatePages() {
    // Run MarkBind include and render on each source file.
    // Render the final rendered page to the output folder.
    const addressablePages = this.sitePages.addressablePages || [];
    const faviconUrl = this.sitePages.getFavIconUrl();

    this._setTimestampVariable();
    this.sitePages.mapAddressablePagesToPages(addressablePages, faviconUrl);

    const pageGenerationTask = {
      mode: 'async',
      pages: this.sitePages.pages,
    };
    return this.runPageGenerationTasks([pageGenerationTask]);
  }

  /**
   * Renders only the starting page for lazy loading to the output folder.
   */
  async generateLandingPage() {
    const addressablePages = this.sitePages.addressablePages || [];
    const faviconUrl = this.sitePages.getFavIconUrl();

    this._setTimestampVariable();
    this.sitePages.mapAddressablePagesToPages(addressablePages, faviconUrl);

    const landingPage = this.sitePages.pages.find(page => page.pageConfig.src === this.onePagePath);
    if (!landingPage) {
      throw new Error(`${this.onePagePath} is not specified in the site configuration.`);
    }

    await landingPage.generate(this.externalManager);
  }

  async regenerateAffectedPages(filePaths: string[]) {
    const startTime = new Date();

    const shouldRebuildAllPages = this.collectUserDefinedVariablesMapIfNeeded(filePaths) || this.forceReload;
    if (shouldRebuildAllPages) {
      logger.warn('Rebuilding all pages as variables file was changed, or the --force-reload flag was set');
    }
    this._setTimestampVariable();

    let openedPagesToRegenerate: Page[] = [];
    const asyncPagesToRegenerate = this.sitePages.pages.filter((page) => {
      const doFilePathsHaveSourceFiles = filePaths.some(filePath => page.isDependency(filePath));

      if (shouldRebuildAllPages || doFilePathsHaveSourceFiles) {
        if (this.onePagePath) {
          const normalizedSource = fsUtil.removeExtension(page.pageConfig.sourcePath);
          const openIdx = this.currentOpenedPages.findIndex(pagePath => pagePath === normalizedSource);
          const isRecentlyViewed = openIdx !== -1;

          if (!isRecentlyViewed) {
            this.toRebuild.add(normalizedSource);
          } else {
            openedPagesToRegenerate[openIdx] = page;
          }

          return false;
        }

        return true;
      }

      return false;
    });

    /*
     * As a side effect of doing assignment to an empty array, some elements might be
     * undefined if it has not been assigned to anything. We filter those out here.
     */
    openedPagesToRegenerate = openedPagesToRegenerate.filter(page => page);

    const totalPagesToRegenerate = openedPagesToRegenerate.length + asyncPagesToRegenerate.length;
    if (totalPagesToRegenerate === 0) {
      logger.info('No pages needed to be rebuilt');
      return;
    }
    logger.info(`Rebuilding ${totalPagesToRegenerate} pages`);

    const pageGenerationTasks = [];
    if (openedPagesToRegenerate.length > 0) {
      const recentPagesGenerationTask = {
        mode: 'sequential',
        pages: openedPagesToRegenerate,
      };
      pageGenerationTasks.push(recentPagesGenerationTask);
    }

    if (asyncPagesToRegenerate.length > 0) {
      const asyncPagesGenerationTask = {
        mode: 'async',
        pages: asyncPagesToRegenerate,
      };
      pageGenerationTasks.push(asyncPagesGenerationTask);
    }

    try {
      await this.runPageGenerationTasks(pageGenerationTasks);
      await this.writeSiteData();
      logger.info('Pages rebuilt');
      this.calculateBuildTimeForRegenerateAffectedPages(startTime);
    } catch (err) {
      await SiteGenerationManager.rejectHandler(err, [this.tempPath, this.outputPath]);
    }
  }

  /**
   * Helper function for regenerateAffectedPages().
   */
  calculateBuildTimeForRegenerateAffectedPages(startTime: Date) {
    const endTime = new Date();
    const totalBuildTime = (endTime.getTime() - startTime.getTime()) / 1000;
    logger.info(`Website regeneration complete! Total build time: ${totalBuildTime}s`);
    if (!this.onePagePath && totalBuildTime > LAZY_LOADING_REBUILD_TIME_RECOMMENDATION_LIMIT) {
      logger.info('Your pages took quite a while to rebuild...'
          + ' Have you considered using markbind serve -o when writing content to speed things up?');
    }
  }

  private _setTimestampVariable() {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: this.siteConfig.timeZone,
      timeZoneName: 'short',
    };
    const time = new Date().toLocaleTimeString(this.siteConfig.locale, options);
    this.variableProcessor.addUserDefinedVariableForAllSites('timestamp', time);
  }

  rebuildPagesBeingViewed = delay(
    this._rebuildPagesBeingViewed.bind(this) as (args: string[]) => Promise<void>,
    1000,
  );

  /**
   * Rebuild pages that are affected by changes in filePaths
   * @param filePaths a single path or an array of paths corresponding to the files that have changed
   */
  rebuildAffectedSourceFiles = delay(
    this._rebuildAffectedSourceFiles.bind(this) as (args: string[]) => Promise<void>,
    1000,
  );

  /**
   * Rebuild all pages
   */
  rebuildSourceFiles = delay(
    this._rebuildSourceFiles.bind(this) as (args: string[]) => Promise<void>,
    1000,
  );

  /**
   * Builds pages that are yet to build/rebuild in the background
   */
  backgroundBuildNotViewedFiles = delay(
    this._backgroundBuildNotViewedFiles.bind(this) as (args: string[]) => Promise<void>,
    1000,
  );

  async reloadSiteConfig() {
    if (this.backgroundBuildMode) {
      this.stopOngoingBuilds();
    }

    const oldSiteConfig = this.siteConfig;
    const oldAddressablePages = this.sitePages.addressablePages.slice();
    const oldPagesSrc = oldAddressablePages.map(page => page.src);
    await this.readSiteConfig();
    await this.siteAssets.handleIgnoreReload(oldSiteConfig.ignore);
    await this.handlePageReload(oldAddressablePages, oldPagesSrc, oldSiteConfig);
    await this.siteAssets.handleStyleReload(oldSiteConfig.style);
    if (this.backgroundBuildMode) {
      this.backgroundBuildNotViewedFiles();
    }
  }

  /**
   * Handles the rebuilding of modified pages
   */
  async handlePageReload(oldAddressablePages: AddressablePage[], oldPagesSrc: string[],
                         oldSiteConfig: SiteConfig) {
    this.sitePages.collectAddressablePages();

    // Comparator for the _differenceWith comparison below
    const isNewPage = (newPage: AddressablePage, oldPage: AddressablePage) =>
      _.isEqual(newPage, oldPage) || newPage.src === oldPage.src;

    const addedPages = _.differenceWith(this.sitePages.addressablePages, oldAddressablePages, isNewPage);
    const removedPages = _.differenceWith(oldAddressablePages, this.sitePages.addressablePages, isNewPage)
      .map(filePath => fsUtil.setExtension(filePath.src as string, '.html'));

    // Checks if any attributes of site.json requiring a global rebuild are modified
    const isGlobalConfigModified = () => !_.isEqual(oldSiteConfig.faviconPath, this.siteConfig.faviconPath)
        || !_.isEqual(oldSiteConfig.titlePrefix, this.siteConfig.titlePrefix)
        || !_.isEqual(oldSiteConfig.titleSuffix, this.siteConfig.titleSuffix)
        || !_.isEqual(oldSiteConfig.style, this.siteConfig.style)
        || !_.isEqual(oldSiteConfig.externalScripts, this.siteConfig.externalScripts)
        || !_.isEqual(oldSiteConfig.globalOverride, this.siteConfig.globalOverride)
        || !_.isEqual(oldSiteConfig.plugins, this.siteConfig.plugins)
        || !_.isEqual(oldSiteConfig.pluginsContext, this.siteConfig.pluginsContext)
        || !_.isEqual(oldSiteConfig.headingIndexingLevel, this.siteConfig.headingIndexingLevel)
        || !_.isEqual(oldSiteConfig.enableSearch, this.siteConfig.enableSearch)
        || !_.isEqual(oldSiteConfig.timeZone, this.siteConfig.timeZone)
        || !_.isEqual(oldSiteConfig.locale, this.siteConfig.locale)
        || !_.isEqual(oldSiteConfig.intrasiteLinkValidation, this.siteConfig.intrasiteLinkValidation)
        || !_.isEqual(oldSiteConfig.plantumlCheck, this.siteConfig.plantumlCheck);

    if (isGlobalConfigModified() || !_.isEmpty(addedPages) || !_.isEmpty(removedPages)) {
      await this.siteAssets.removeAsset(removedPages);
      this.buildManagers(this.sitePages.baseUrlMap);
      await this.rebuildSourceFiles();
      await this.writeSiteData();
    } else {
      // Get pages with edited attributes but with the same src
      const editedPages = _.differenceWith(
        this.sitePages.addressablePages,
        oldAddressablePages,
        (newPage, oldPage) => _.isEqual(newPage, oldPage) || !oldPagesSrc.includes(newPage.src),
      );
      this.sitePages.updatePages(editedPages);
      const siteConfigDirectory = path.dirname(path.join(this.rootPath, this.siteConfigPath));
      this.regenerateAffectedPages(editedPages.map(page => path.join(siteConfigDirectory, page.src)));
    }
  }
}
