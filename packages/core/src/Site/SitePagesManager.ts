import fs from 'fs-extra';
import path from 'path';
import walkSync from 'walk-sync';
import { Template as NunjucksTemplate } from 'nunjucks';

import { Page } from '../Page';
import { PageConfig } from '../Page/PageConfig';
import { VariableProcessor } from '../variables/VariableProcessor';
import { VariableRenderer } from '../variables/VariableRenderer';
import { ExternalManager } from '../External/ExternalManager';
import { SiteLinkManager } from '../html/SiteLinkManager';
import { PluginManager } from '../plugins/PluginManager';
import type { FrontMatter } from '../plugins/Plugin';
import {
  TEMPLATE_SITE_ASSET_FOLDER_NAME,
  _,
  CONFIG_FOLDER_NAME,
  SITE_FOLDER_NAME,
  LAYOUT_SITE_FOLDER_NAME,
  FAVICON_DEFAULT_PATH,
  USER_VARIABLES_PATH,
  PAGE_TEMPLATE_NAME,
} from './constants';
import * as fsUtil from '../utils/fsUtil';
import * as logger from '../utils/logger';
import { SiteConfig, SiteConfigPage } from './SiteConfig';
import { LayoutManager } from '../Layout';

const url = {
  join: path.posix.join,
};

const HIGHLIGHT_ASSETS: Record<string, string> = {
  dark: 'codeblock-dark.min.css',
  light: 'codeblock-light.min.css',
};

/*
 * A page configuration object.
 */
export type PageCreationConfig = {
  externalScripts: string[],
  frontmatter: FrontMatter,
  layout?: string,
  pageSrc: string,
  searchable: boolean,
  faviconUrl?: string,
  glob?: string,
  globExclude?: string
  title?: string,
  fileExtension?: string,
};

export type AddressablePage = {
  frontmatter?: FrontMatter,
  layout?: string,
  searchable?: string | boolean,
  src: string,
  externalScripts?: string[],
  faviconUrl?: string,
  title?: string,
  fileExtension?: string,
};

/**
 * Manages the lifecycle and configuration of pages within the site.
 * Handles page creation, collection of addressable pages, and dependency tracking.
 */
export class SitePagesManager {
  rootPath: string;
  outputPath: string;
  pageTemplatePath: string;
  pageTemplate: NunjucksTemplate;
  pages: Page[];
  addressablePages: AddressablePage[];
  addressablePagesSource: string[];
  siteConfig!: SiteConfig;

  // Managers
  variableProcessor!: VariableProcessor;
  pluginManager!: PluginManager;
  siteLinkManager!: SiteLinkManager;
  externalManager!: ExternalManager;
  layoutManager!: LayoutManager;
  baseUrlMap: Set<string>;

  isDevMode: boolean;

  constructor(rootPath: string, outputPath: string, isDevMode: boolean) {
    this.rootPath = rootPath;
    this.outputPath = outputPath;
    this.isDevMode = isDevMode;

    // Page template path
    this.pageTemplatePath = path.join(__dirname, '../Page', PAGE_TEMPLATE_NAME);
    this.pageTemplate = VariableRenderer.compile(fs.readFileSync(this.pageTemplatePath, 'utf8'));
    this.pages = [];
    this.addressablePages = [];
    this.addressablePagesSource = [];
    this.baseUrlMap = new Set();
  }

  /**
   * Create a Page object from the site and page creation config.
   */
  createPage(config: PageCreationConfig): Page {
    const sourcePath = path.join(this.rootPath, config.pageSrc);
    const outputExtension = config.fileExtension || '.html';
    const relativePath = fsUtil.ensurePosix(path.relative(this.rootPath, sourcePath));
    const outputPath = fsUtil.setExtension(relativePath, outputExtension);
    const resultPath = path.join(this.outputPath, outputPath);

    const baseAssetsPath = path.posix.join(
      this.siteConfig.baseUrl || '/', TEMPLATE_SITE_ASSET_FOLDER_NAME,
    );

    const highlightAsset = HIGHLIGHT_ASSETS[this.siteConfig.style.codeTheme];

    const pageConfig = new PageConfig({
      asset: {
        bootstrap: path.posix.join(baseAssetsPath, 'css', 'bootstrap.min.css'),
        externalScripts: _.union(this.siteConfig.externalScripts, config.externalScripts),
        fontAwesome: path.posix.join(baseAssetsPath, 'fontawesome', 'css', 'all.min.css'),
        glyphicons: path.posix.join(baseAssetsPath, 'glyphicons', 'css', 'bootstrap-glyphicons.min.css'),
        octicons: path.posix.join(baseAssetsPath, 'css', 'octicons.css'),
        materialIcons: path.posix.join(baseAssetsPath, 'material-icons', 'material-icons.css'),
        bootstrapIcons: path.posix.join(baseAssetsPath, 'bootstrap-icons', 'font', 'bootstrap-icons.css'),
        highlight: path.posix.join(baseAssetsPath, 'css', highlightAsset),
        markBindCss: path.posix.join(baseAssetsPath, 'css', 'markbind.min.css'),
        markBindJs: path.posix.join(baseAssetsPath, 'js', 'markbind.min.js'),
        pageNavCss: path.posix.join(baseAssetsPath, 'css', 'page-nav.css'),
        siteNavCss: path.posix.join(baseAssetsPath, 'css', 'site-nav.css'),
        bootstrapUtilityJs: path.posix.join(baseAssetsPath, 'js', 'bootstrap-utility.min.js'),
        polyfillJs: path.posix.join(baseAssetsPath, 'js', 'polyfill.min.js'),
        // We use development Vue when MarkBind is served in 'dev' mode so that hydration issues are reported
        vue: this.isDevMode
          ? 'https://cdn.jsdelivr.net/npm/vue@3.3.11/dist/vue.global.min.js'
          : path.posix.join(baseAssetsPath, 'js', 'vue.global.prod.min.js'),
        layoutUserScriptsAndStyles: [],
      },
      baseUrlMap: this.baseUrlMap,
      dev: this.isDevMode,
      faviconUrl: config.faviconUrl,
      frontmatterOverride: config.frontmatter,
      layout: config.layout,
      layoutsAssetPath: path.posix.join(baseAssetsPath, LAYOUT_SITE_FOLDER_NAME),
      pluginManager: this.pluginManager,
      resultPath,
      rootPath: this.rootPath,
      searchable: this.siteConfig.enableSearch && config.searchable,
      siteLinkManager: this.siteLinkManager,
      siteOutputPath: this.outputPath,
      sourcePath,
      src: config.pageSrc,
      title: config.title,
      template: this.pageTemplate,
      variableProcessor: this.variableProcessor,
      addressablePagesSource: this.addressablePagesSource,
      layoutManager: this.layoutManager,
    });
    return new Page(pageConfig, this.siteConfig);
  }

  /**
   * Updates the paths to be traversed as addressable pages and returns a list of filepaths to be deleted
   */
  updateAddressablePages() {
    const oldAddressablePagesSources = this.addressablePages.slice().map(page => page.src);
    this.collectAddressablePages();
    const newAddressablePagesSources = this.addressablePages.map(page => page.src);

    return _.difference(oldAddressablePagesSources, newAddressablePagesSources)
      .map(filePath => fsUtil.setExtension(filePath, '.html'));
  }

  getPageGlobPaths(page: SiteConfigPage, pagesExclude: string[]) {
    const pageGlobs = page.glob ?? [];
    return walkSync(this.rootPath, {
      directories: false,
      globs: Array.isArray(pageGlobs) ? pageGlobs : [pageGlobs],
      ignore: [
        CONFIG_FOLDER_NAME,
        SITE_FOLDER_NAME,
        ...pagesExclude.concat(page.globExclude || []),
      ],
    });
  }

  /**
   * Collects the paths to be traversed as addressable pages
   */
  collectAddressablePages() {
    const { pages, pagesExclude } = this.siteConfig;
    const pagesFromSrc = _.flatMap(pages.filter(page => page.src), page => (Array.isArray(page.src)
      ? page.src.map(pageSrc => ({ ...page, src: pageSrc }))
      : [page])) as unknown as AddressablePage[];
    const set = new Set();
    const duplicatePages = pagesFromSrc
      .filter(page => set.size === set.add(page.src).size)
      .map(page => page.src);
    if (duplicatePages.length > 0) {
      throw new Error(`Duplicate page entries found in site config: ${_.uniq(duplicatePages).join(', ')}`);
    }
    const pagesFromGlobs = _.flatMap(pages.filter(page => page.glob),
                                     page => this.getPageGlobPaths(page, pagesExclude)
                                       .map(filePath => ({
                                         src: filePath,
                                         searchable: page.searchable,
                                         layout: page.layout,
                                         frontmatter: page.frontmatter,
                                         fileExtension: page.fileExtension,
                                       }))) as AddressablePage[];
    /*
     Add pages collected from globs and merge properties for pages
     Page properties collected from src have priority over page properties from globs,
     while page properties from later entries take priority over earlier ones.
     */
    const filteredPages: Record<string, AddressablePage> = {};
    pagesFromGlobs.concat(pagesFromSrc).forEach((page) => {
      const filteredPage = _.omitBy(page, _.isUndefined) as AddressablePage;
      filteredPages[page.src] = page.src in filteredPages
        ? { ...filteredPages[page.src], ...filteredPage }
        : filteredPage;
    });
    this.addressablePages = Object.values(filteredPages);
    this.addressablePagesSource.length = 0;
    this.addressablePages.forEach((page) => {
      this.addressablePagesSource.push(fsUtil.removeExtensionPosix(page.src));
    });
  }

  /**
   * Creates new pages and replaces the original pages with the updated version
   */
  updatePages(pagesToUpdate: AddressablePage[]) {
    pagesToUpdate.forEach((pageToUpdate) => {
      this.pages.forEach((page, index) => {
        if (page.pageConfig.src === pageToUpdate.src) {
          const newPage = this.createNewPage(pageToUpdate, this.getFavIconUrl());
          newPage.resetState();
          this.pages[index] = newPage;
        }
      });
    });
  }

  /**
   * Checks if a specified file path is a dependency of a page
   * @param filePath file path to check
   * @returns whether the file path is a dependency of any of the site's pages
   */
  isDependencyOfPage(filePath: string): boolean {
    return this.pages.some(page => page.isDependency(filePath))
      || fsUtil.ensurePosix(filePath).endsWith(USER_VARIABLES_PATH);
  }

  /**
   * Checks if a specified file path satisfies a src or glob in any of the page configurations.
   * @param filePath file path to check
   * @returns whether the file path is satisfies any glob
   */
  isFilepathAPage(filePath: string): boolean {
    const { pages, pagesExclude } = this.siteConfig;
    const relativeFilePath = fsUtil.ensurePosix(path.relative(this.rootPath, filePath));
    const srcesFromPages = _.flatMap(pages.filter(page => page.src),
                                     page => (Array.isArray(page.src) ? page.src : [page.src]));
    if (srcesFromPages.includes(relativeFilePath)) {
      return true;
    }

    const filePathsFromGlobs = _.flatMap(pages.filter(page => page.glob),
                                         page => this.getPageGlobPaths(page, pagesExclude));
    return filePathsFromGlobs.some(fp => fp === relativeFilePath);
  }

  getFavIconUrl() {
    const { baseUrl, faviconPath } = this.siteConfig;

    if (faviconPath) {
      if (!fs.existsSync(path.join(this.rootPath, faviconPath))) {
        logger.warn(`${faviconPath} does not exist`);
      }
      return url.join('/', baseUrl, faviconPath);
    } else if (fs.existsSync(path.join(this.rootPath, FAVICON_DEFAULT_PATH))) {
      return url.join('/', baseUrl, FAVICON_DEFAULT_PATH);
    }

    return undefined;
  }

  /**
   * Maps an array of addressable pages to an array of Page object
   */
  mapAddressablePagesToPages(addressablePages: AddressablePage[], faviconUrl: string | undefined) {
    this.pages = addressablePages.map(page => this.createNewPage(page, faviconUrl));
  }

  /**
   * Creates and returns a new Page with the given page config details and favicon url
   * @param page config
   * @param faviconUrl of the page
   */
  createNewPage(page: AddressablePage, faviconUrl: string | undefined) {
    return this.createPage({
      faviconUrl,
      pageSrc: page.src,
      title: page.title,
      layout: page.layout,
      frontmatter: page.frontmatter || {},
      searchable: page.searchable !== 'no' && page.searchable !== false,
      externalScripts: page.externalScripts || [],
      fileExtension: page.fileExtension,
    });
  }
}
