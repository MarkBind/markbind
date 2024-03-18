import fs from 'fs-extra';
import path from 'path';
import walkSync from 'walk-sync';
import * as fsUtil from '../utils/fsUtil';
import { INDEX_MARKDOWN_FILE, SITE_CONFIG_NAME, _ } from './constants';
import { SiteConfig, SiteConfigPage } from './SiteConfig';
import { VariableRenderer } from '../variables/VariableRenderer';
import * as logger from '../utils/logger';

import { LAYOUT_DEFAULT_NAME, LAYOUT_FOLDER_PATH } from '../Layout';

const requiredFiles = ['index.md', 'site.json', '_markbind/'];

const PATH_TO_TEMPLATE = '../../template';
const ABOUT_MARKDOWN_FILE = 'about.md';
const ABOUT_MARKDOWN_DEFAULT = '# About\n'
  + 'Welcome to your **About Us** page.\n';
const CONFIG_FOLDER_NAME = '_markbind';
const SITE_FOLDER_NAME = '_site';
const WIKI_SITE_NAV_PATH = '_Sidebar.md';
const WIKI_FOOTER_PATH = '_Footer.md';

type NaviagablePage = {
  src: string,
  title?: string,
};

export class Template {
  rootPath: string;
  templatePath: string;
  siteConfig!: SiteConfig;
  siteConfigPath: string = SITE_CONFIG_NAME;
  navigablePages!: NaviagablePage[];

  constructor(rootPath: string, templatePath: string) {
    this.rootPath = rootPath;
    this.templatePath = path.join(__dirname, PATH_TO_TEMPLATE, templatePath);
  }

  validateTemplateFromPath() {
    for (let i = 0; i < requiredFiles.length; i += 1) {
      const requiredFile = requiredFiles[i];
      const requiredFilePath = path.join(this.templatePath, requiredFile);

      if (!fs.existsSync(requiredFilePath)) {
        return false;
      }
    }

    return true;
  }

  generateSiteWithTemplate() {
    return new Promise((resolve, reject) => {
      fs.access(this.rootPath)
        .catch(() => fs.mkdirSync(this.rootPath))
        .then(() => fsUtil.copySyncWithOptions(this.templatePath, this.rootPath, { overwrite: false }))
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * A method for initializing a markbind site according to the given template.
   * Generate the site.json and an index.md file.
   */
  async init() {
    if (!this.validateTemplateFromPath()) {
      throw new Error('Template validation failed. Required files does not exist.');
    }

    return new Promise((resolve, reject) => {
      this.generateSiteWithTemplate()
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Converts an existing GitHub wiki or docs folder to a MarkBind website.
   */
  async convert() {
    this.siteConfig = await SiteConfig.readSiteConfig(this.rootPath, this.siteConfigPath);
    this.collectNavigablePages();
    await this.addIndexPage();
    await this.addAboutPage();
    this.addDefaultLayoutFiles();
    await this.addDefaultLayoutToSiteConfig();
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
   * Collects the paths to be traversed as navigable pages
   */
  collectNavigablePages() {
    const { pages, pagesExclude } = this.siteConfig;
    const pagesFromGlobs = _.flatMap(pages.filter(page => page.glob),
                                     page => this.getPageGlobPaths(page, pagesExclude)
                                       .map(filePath => ({
                                         src: filePath,
                                         title: page.title,
                                       }))) as NaviagablePage[];

    this.navigablePages = pagesFromGlobs;
  }

  /**
   * Copies over README.md or Home.md to default index.md if present.
   */
  async addIndexPage() {
    const indexPagePath = path.join(this.rootPath, INDEX_MARKDOWN_FILE);
    const fileNames = ['README.md', 'Home.md'];
    const filePath = fileNames.find(fileName => fs.existsSync(path.join(this.rootPath, fileName)));
    // if none of the files exist, do nothing
    if (_.isUndefined(filePath)) return;
    try {
      await fs.copy(path.join(this.rootPath, filePath), indexPagePath);
    } catch (error) {
      throw new Error(`Failed to copy over ${filePath}`);
    }
  }

  /**
   * Adds an about page to site if not present.
   */
  async addAboutPage() {
    const aboutPath = path.join(this.rootPath, ABOUT_MARKDOWN_FILE);
    try {
      await fs.access(aboutPath);
    } catch (error) {
      if (fs.existsSync(aboutPath)) {
        return;
      }
      await fs.outputFile(aboutPath, ABOUT_MARKDOWN_DEFAULT);
    }
  }

  /**
   * Adds a footer to default layout of site.
   */
  addDefaultLayoutFiles() {
    const wikiFooterPath = path.join(this.rootPath, WIKI_FOOTER_PATH);
    let footer;
    if (fs.existsSync(wikiFooterPath)) {
      logger.info(`Copied over the existing ${WIKI_FOOTER_PATH} file to the converted layout`);
      footer = `\n${fs.readFileSync(wikiFooterPath, 'utf8')}`;
    }

    const wikiSiteNavPath = path.join(this.rootPath, WIKI_SITE_NAV_PATH);
    let siteNav;
    if (fs.existsSync(wikiSiteNavPath)) {
      logger.info(`Copied over the existing ${WIKI_SITE_NAV_PATH} file to the converted layout\n`
        + 'Check https://markbind.org/userGuide/tweakingThePageStructure.html#site-navigation-menus\n'
        + 'for information on site navigation menus.');
      siteNav = fs.readFileSync(wikiSiteNavPath, 'utf8');
    } else {
      siteNav = this.buildSiteNav();
    }

    const convertedLayoutTemplate = VariableRenderer.compile(
      fs.readFileSync(path.join(__dirname, 'siteConvertLayout.njk'), 'utf8'));
    const renderedLayout = convertedLayoutTemplate.render({
      footer,
      siteNav,
    });
    const layoutOutputPath = path.join(this.rootPath, LAYOUT_FOLDER_PATH, LAYOUT_DEFAULT_NAME);

    fs.writeFileSync(layoutOutputPath, renderedLayout, 'utf-8');
  }

  /**
   * Builds a site navigation file from the directory structure of the site.
   */
  buildSiteNav() {
    let siteNavContent = '';
    this.navigablePages
      .filter(navigablePage => !navigablePage.src.startsWith('_'))
      .forEach((page) => {
        const navigablePagePath = path.join(this.rootPath, page.src);
        const relativePagePathWithoutExt = fsUtil.removeExtensionPosix(
          path.relative(this.rootPath, navigablePagePath));
        const pageName = _.startCase(fsUtil.removeExtension(path.basename(navigablePagePath)));
        const pageUrl = `{{ baseUrl }}/${relativePagePathWithoutExt}.html`;
        siteNavContent += `* [${pageName}](${pageUrl})\n`;
      });

    return siteNavContent.trimEnd();
  }

  /**
   * Applies the default layout to all addressable pages by modifying the site config file.
   */
  async addDefaultLayoutToSiteConfig() {
    const configPath = path.join(this.rootPath, SITE_CONFIG_NAME);
    const config = await fs.readJson(configPath);
    await Template.writeToSiteConfig(config, configPath);
  }

  /**
   * Helper function for addDefaultLayoutToSiteConfig().
   */
  static async writeToSiteConfig(config: SiteConfig, configPath: string) {
    const layoutObj: SiteConfigPage = { glob: '**/*.md', layout: LAYOUT_DEFAULT_NAME };
    config.pages.push(layoutObj);
    await fs.outputJson(configPath, config);
  }
}
