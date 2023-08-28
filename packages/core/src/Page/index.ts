import cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import { html as htmlBeautify } from 'js-beautify';

import cloneDeep from 'lodash/cloneDeep';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import { pageVueServerRenderer } from './PageVueServerRenderer';

import CyclicReferenceError from '../errors/CyclicReferenceError';
import { PageSources } from './PageSources';
import { NodeProcessor, NodeProcessorConfig } from '../html/NodeProcessor';

import * as logger from '../utils/logger';
import type { PageAssets, PageConfig } from './PageConfig';
import type { SiteConfig } from '../Site/SiteConfig';
import type { FrontMatter } from '../plugins/Plugin';
import type { ExternalManager } from '../External/ExternalManager';
import { MbNode } from '../utils/node';

require('../patches/htmlparser2');

const _ = { cloneDeep, isObject, isArray };

const LockManager = require('../utils/LockManager');

const PACKAGE_VERSION = require('../../package.json').version;

const {
  LAYOUT_DEFAULT_NAME,
} = require('../Layout');

const TITLE_PREFIX_SEPARATOR = ' - ';
const TITLE_SUFFIX_SEPARATOR = ' - ';

const PAGE_NAV_ID = 'mb-page-nav';
const PAGE_NAV_TITLE_CLASS = 'page-nav-title';

cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

export class Page {
  pageConfig: PageConfig;
  siteConfig: SiteConfig;

  // We assert that these properties exist because resetState is called in the constructor to initialise them
  asset!: PageAssets;
  pageUserScriptsAndStyles!: string[];
  frontmatter!: FrontMatter;
  headerIdMap!: Record<string, number>;
  includedFiles!: Set<string>;
  headings!: Record<string, string>;
  keywords!: Record<string, string[]>;
  navigableHeadings!: {
    [id: string]: {
      text: string,
      level: number
    }
  };

  title?: string;
  layout?: string;

  constructor(pageConfig: PageConfig, siteConfig: SiteConfig) {
    /**
     * Page configuration passed from {@link Site}.
     * This should not be mutated.
     */
    this.pageConfig = pageConfig;

    /**
     * Site configuration passed from {@link Site}.
     */
    this.siteConfig = siteConfig;
    this.resetState();
  }

  /**
   * Resets or initialises all stateful variables of the page,
   * which differs from one page generation call to another.
   */
  resetState() {
    /**
     * Object containing asset names as keys and their corresponding file paths,
     * or an array of <link/script> elements extracted from plugins during {@link collectPluginPageNjkAssets}.
     * @type {Object<string, string | Array<string>>}
     */
    this.asset = _.cloneDeep(this.pageConfig.asset);
    /**
     * To collect all the user provided scripts and/or style content.
     */
    this.pageUserScriptsAndStyles = [];
    /**
     * The pure frontmatter of the page as collected in {@link collectFrontmatter}.
     * https://markbind.org/userGuide/tweakingThePageStructure.html#front-matter
     * @type {Object<string, any>}
     */
    this.frontmatter = {};
    /**
     * Map of heading ids to its text content
     */
    this.headings = {};
    /**
     * Stores the next integer to append to a heading id, for resolving heading id conflicts
     */
    this.headerIdMap = {};
    /**
     * Set of included files (dependencies) used for live reload
     * https://markbind.org/userGuide/reusingContents.html#includes
     */
    this.includedFiles = new Set([this.pageConfig.sourcePath]);
    /**
     * Map of heading ids (that closest to the keyword) to the keyword text content
     * https://markbind.org/userGuide/makingTheSiteSearchable.html#keywords
     */
    this.keywords = {};
    /**
     * The title of the page.
     * This is initially set to the title specified in the site configuration,
     * if there is none, we look for one in the frontmatter(s) as well.
     */
    this.title = this.pageConfig.title;

    /*
     * Layouts related properties
     */

    /**
     * The layout to use for this page, which may be further mutated in {@link processFrontmatter}.
     */
    this.layout = this.pageConfig.layout;
    /**
     * Storing the mapping from the navigable headings' id to an
     * object used for page nav generation.
     */
    this.navigableHeadings = {};
  }

  /**
   * Checks if the provided filePath is a dependency of the page
   * @param {string} filePath to check
   */
  isDependency(filePath: string) {
    return this.includedFiles && this.includedFiles.has(filePath);
  }

  prepareTemplateData(content: string) {
    let { title } = this;
    if (this.siteConfig.titlePrefix) {
      title = this.siteConfig.titlePrefix + (title ? TITLE_PREFIX_SEPARATOR + title : '');
    }
    if (this.siteConfig.titleSuffix) {
      title = (title ? title + TITLE_SUFFIX_SEPARATOR : '') + this.siteConfig.titleSuffix;
    }

    const hasPageNavHeadings = Object.keys(this.navigableHeadings).length > 0;

    return {
      asset: { ...this.asset },
      baseUrl: this.siteConfig.baseUrl,
      content,
      pageUserScriptsAndStyles: this.pageUserScriptsAndStyles.join('\n'),
      layoutUserScriptsAndStyles: this.asset.layoutUserScriptsAndStyles.join('\n'),
      hasPageNavHeadings,
      dev: this.pageConfig.dev,
      faviconUrl: this.pageConfig.faviconUrl,
      markBindVersion: `MarkBind ${PACKAGE_VERSION}`,
      title,
      enableSearch: this.siteConfig.enableSearch,
    };
  }

  /**
   * Checks if page.frontmatter has a valid page navigation specifier
   */
  isPageNavigationSpecifierValid() {
    const { pageNav } = this.frontmatter;
    return pageNav && (pageNav === 'default' || Number.isInteger(pageNav));
  }

  /**
   * Generates element selector for page navigation, depending on specifier in frontmatter
   * @param pageNav {string|number} 'default' refers to the configured heading indexing level,
   * otherwise a number that indicates the indexing level.
   */
  generateElementSelectorForPageNav(pageNav: string | number) {
    if (pageNav === 'default') {
      return `${Page.generateHeadingSelector(this.siteConfig.headingIndexingLevel)}, panel`;
    } else if (Number.isInteger(pageNav)) {
      return `${Page.generateHeadingSelector(pageNav as number)}, panel`;
    }
    // Not a valid specifier
    return undefined;
  }

  /**
   * Collect headings outside of models and unexpanded panels.
   * Collects headings from the header slots of unexpanded panels, but not its content.
   * @param content html content of a page
   */
  collectNavigableHeadings(content: string) {
    const { pageNav } = this.frontmatter;
    const elementSelector = this.generateElementSelectorForPageNav(pageNav);
    if (elementSelector === undefined) {
      return;
    }
    const $ = cheerio.load(content);
    $('modal').remove();
    this._collectNavigableHeadings($, $.root()[0], elementSelector);
  }

  _collectNavigableHeadings($: cheerio.Root, context: cheerio.Element, pageNavSelector: string) {
    $(pageNavSelector, context).each((_i, cheerioElem: cheerio.Element) => {
      const elem = cheerioElem as MbNode;
      // Check if heading or panel is already inside an unexpanded panel
      let isInsideUnexpandedPanel = false;
      const panelParents = $(elem).parentsUntil(context).filter('panel').not(elem);
      panelParents.each((_j, elemParent) => {
        if ((elemParent as MbNode).attribs.expanded === undefined) {
          isInsideUnexpandedPanel = true;
          return false;
        }
        return true;
      });
      if (isInsideUnexpandedPanel) {
        return;
      }

      // Check if heading / panel is under a panel's header slots, which is handled specially below.
      const slotParents = $(elem).parentsUntil(context).filter('[\\#header]').not(elem);
      const panelSlotParents = slotParents.parent('panel');
      if (panelSlotParents.length) {
        return;
      }

      if (elem.name === 'panel') {
        // Recurse only on the slot which has priority
        const headings = $(elem).children('[\\#header]');
        if (!headings.length) return;

        this._collectNavigableHeadings($, headings.first() as unknown as cheerio.Element, pageNavSelector);
      } else {
        const headingId = $(elem).attr('id');
        if (headingId && elem.name) {
          // Headings already in content, with a valid ID
          this.navigableHeadings[headingId] = {
            text: $(elem).text(),
            level: parseInt(elem.name.replace('h', ''), 10),
          };
        }
      }
    });
  }

  /**
   * Records headings and keywords inside rendered page into this.headings and this.keywords respectively
   */
  collectHeadingsAndKeywords(pageContent: string) {
    this.collectHeadingsAndKeywordsInContent(pageContent, null, false, []);
  }

  /**
   * Records headings and keywords inside content into this.headings and this.keywords respectively
   */
  collectHeadingsAndKeywordsInContent(content: string | Buffer, lastHeading: cheerio.Element | null,
                                      excludeHeadings: boolean, sourceTraversalStack: string[]) {
    let $ = cheerio.load(content);
    const headingsSelector = Page.generateHeadingSelector(this.siteConfig.headingIndexingLevel);
    $('modal').remove();
    $('panel').not('panel panel')
      .each((_index, panel) => {
        const slotHeader = $(panel).children('[\\#header]');
        if (slotHeader.length) {
          this.collectHeadingsAndKeywordsInContent(slotHeader.html() || '',
                                                   lastHeading, excludeHeadings, sourceTraversalStack);
        }
      })
      .each((_index, cheerioPanel) => {
        const panel = cheerioPanel as MbNode;
        const shouldExcludeHeadings = excludeHeadings || (panel.attribs?.expanded === undefined);
        let closestHeading = Page.getClosestHeading($, headingsSelector, panel);
        if (!closestHeading) {
          closestHeading = lastHeading;
        }
        const slotHeadings = $(panel).children('[\\#header]').find(':header');
        if (slotHeadings.length) {
          closestHeading = slotHeadings.first() as unknown as cheerio.Element;
        }

        if (panel.attribs?.src) {
          const src = panel.attribs.src.split('#')[0];
          const buildInnerDir = path.dirname(this.pageConfig.sourcePath);
          const resultInnerDir = path.dirname(this.pageConfig.resultPath);
          const includeRelativeToBuildRootDirPath = this.siteConfig.baseUrl
            ? path.relative(this.siteConfig.baseUrl, src)
            : src.substring(1);
          const includeAbsoluteToBuildRootDirPath = path.resolve(this.pageConfig.rootPath,
                                                                 includeRelativeToBuildRootDirPath);
          const includeRelativeToInnerDirPath
            = path.relative(buildInnerDir, includeAbsoluteToBuildRootDirPath);
          const includePath = path.resolve(resultInnerDir, includeRelativeToInnerDirPath);
          const includeContent = fs.readFileSync(includePath);
          const childSourceTraversalStack = sourceTraversalStack.slice();
          childSourceTraversalStack.push(includePath);
          if (childSourceTraversalStack.length > CyclicReferenceError.MAX_RECURSIVE_DEPTH) {
            throw new CyclicReferenceError(childSourceTraversalStack);
          }
          if (panel.attribs.fragment) {
            $ = cheerio.load(includeContent);
            this.collectHeadingsAndKeywordsInContent($(`#${panel.attribs.fragment}`).html() || '',
                                                     closestHeading, shouldExcludeHeadings,
                                                     childSourceTraversalStack);
          } else {
            this.collectHeadingsAndKeywordsInContent(includeContent, closestHeading, shouldExcludeHeadings,
                                                     childSourceTraversalStack);
          }
        } else {
          this.collectHeadingsAndKeywordsInContent($(panel).html() || '', closestHeading,
                                                   shouldExcludeHeadings, sourceTraversalStack);
        }
      });
    $ = cheerio.load(content);
    if (this.siteConfig.headingIndexingLevel > 0) {
      $('modal').remove();
      $('panel').remove();
      if (!excludeHeadings) {
        $(headingsSelector).each((_i, heading) => {
          const headingId = $(heading).attr('id');
          if (headingId) this.headings[headingId] = $(heading).text();
        });
      }
      $('.keyword').each((_i, keyword) => {
        let closestHeading = Page.getClosestHeading($, headingsSelector, keyword);
        if (excludeHeadings || !closestHeading) {
          if (!lastHeading) {
            logger.warn(`Missing heading for keyword: ${$(keyword).text()}`);
            return;
          }
          closestHeading = lastHeading;
        }
        this.linkKeywordToHeading($, keyword, closestHeading);
      });
    }
  }

  /**
   * Links a keyword to a heading
   * @param $ a Cheerio object
   * @param keyword to link
   * @param heading to link
   */
  linkKeywordToHeading($: cheerio.Root, keyword: cheerio.Element, heading: cheerio.Element | null) {
    const headingId = $(heading).attr('id');
    if (!headingId) return;
    if (!(headingId in this.keywords)) {
      this.keywords[headingId] = [];
    }
    this.keywords[headingId].push($(keyword).text());
  }

  /**
   * Uses the collected frontmatter from {@link collectFrontmatter} to extract the {@link Page}'s
   * instance configurations.
   * Frontmatter properties always have lower priority than site configuration properties.
   */
  processFrontmatter(frontmatter: FrontMatter) {
    this.frontmatter = {
      ...frontmatter,
      ...this.siteConfig.globalOverride,
      ...this.pageConfig.frontmatterOverride,
    };

    this.title = this.title || this.frontmatter.title;
    this.layout = this.layout || this.frontmatter.layout || LAYOUT_DEFAULT_NAME;
  }

  /**
   *  Generates page navigation's heading list HTML
   *
   *  A stack is used to maintain proper indentation levels for the headings at different heading levels.
   */
  generatePageNavHeadingHtml() {
    let headingHTML = '';
    const headingStack: number[] = [];
    Object.keys(this.navigableHeadings).forEach((key) => {
      const currentHeadingLevel = this.navigableHeadings[key].level;
      const headingText = this.navigableHeadings[key].text;
      // Add v-pre to prevent text interpolation for {{ }} wrapped in {% (end)raw %}
      const currentHeadingHTML = `<a class="nav-link py-1" href="#${key}" v-pre>`
        + `${headingText}&#x200E;</a>\n`;
      const nestedHeadingHTML = '<nav class="nav nav-pills flex-column my-0 nested no-flex-wrap">\n'
        + `${currentHeadingHTML}`;
      if (headingStack.length === 0 || headingStack[headingStack.length - 1] === currentHeadingLevel) {
        // Add heading without nesting, into headingHTML
        headingHTML += currentHeadingHTML;
      } else {
        // Stack has at least 1 other heading level
        let topOfHeadingStack = headingStack[headingStack.length - 1];
        if (topOfHeadingStack < currentHeadingLevel) {
          // Increase nesting level by 1
          headingHTML += nestedHeadingHTML;
        } else {
          // Close any nested list with heading level higher than current
          while (headingStack.length > 1 && topOfHeadingStack > currentHeadingLevel) {
            headingHTML += '</nav>\n';
            headingStack.pop();
            topOfHeadingStack = headingStack[headingStack.length - 1];
          }
          if (topOfHeadingStack < currentHeadingLevel) {
            // Increase nesting level by 1
            headingHTML += nestedHeadingHTML;
          } else {
            headingHTML += currentHeadingHTML;
          }
        }
      }
      // Update heading level stack
      if (headingStack.length === 0 || headingStack[headingStack.length - 1] !== currentHeadingLevel) {
        headingStack.push(currentHeadingLevel);
      }
    });
    // Ensure proper closing for any nested lists towards the end
    while (headingStack.length > 1
    && headingStack[headingStack.length - 1] > headingStack[headingStack.length - 2]) {
      headingHTML += '</nav>\n';
      headingStack.pop();
    }
    return headingHTML;
  }

  /**
   * Generates page navigation's header if specified in this.frontmatter
   * @returns string string
   */
  generatePageNavTitleHtml() {
    const { pageNavTitle } = this.frontmatter;
    // Add v-pre to prevent text interpolation for {{ }} wrapped in {% (end)raw %}
    return pageNavTitle
      ? `<a class="navbar-brand ${PAGE_NAV_TITLE_CLASS}" href="#" v-pre>${pageNavTitle.toString()}</a>`
      : '';
  }

  /**
   *  Builds page navigation bar with headings up to headingIndexingLevel
   */
  buildPageNav(content: string) {
    const isFmPageNavSpecifierValid = this.isPageNavigationSpecifierValid();
    const doesLayoutHavePageNav = this.pageConfig.layoutManager.layoutHasPageNav(this.layout);

    if (isFmPageNavSpecifierValid && doesLayoutHavePageNav) {
      this.navigableHeadings = {};
      this.collectNavigableHeadings(content);
      const pageNavTitleHtml = this.generatePageNavTitleHtml();
      const pageNavHeadingHTML = this.generatePageNavHeadingHtml();

      if (!pageNavTitleHtml && !pageNavHeadingHTML) {
        return '';
      }

      /*
       Similar to siteAndPageNavProcessor#addSitePageNavPortal,
       wrap the auto generated page nav with an overlay-source vue component for
       portal-ing it into the mobile page nav.
       */
      return `${pageNavTitleHtml}\n`
        + `<overlay-source id="${PAGE_NAV_ID}" tag-name="nav" to="${PAGE_NAV_ID}"`
            + ' class="nav nav-pills flex-column my-0 small no-flex-wrap">\n'
          + `${pageNavHeadingHTML}\n`
          + '</overlay-source>\n';
    }

    return '';
  }

  async generate(externalManager: ExternalManager) {
    this.resetState(); // Reset for live reload

    const fileConfig: NodeProcessorConfig = {
      baseUrl: this.siteConfig.baseUrl,
      ignore: this.siteConfig.ignore,
      intrasiteLinkValidation: this.siteConfig.intrasiteLinkValidation,
      codeLineNumbers: this.siteConfig.style.codeLineNumbers,

      baseUrlMap: this.pageConfig.baseUrlMap,
      rootPath: this.pageConfig.rootPath,
      addressablePagesSource: this.pageConfig.addressablePagesSource,

      headerIdMap: this.headerIdMap,
      outputPath: externalManager.config.outputPath,
      plantumlCheck: this.siteConfig.plantumlCheck,
    };

    const {
      variableProcessor, layoutManager, pluginManager, siteLinkManager,
    } = this.pageConfig;
    const pageSources = new PageSources();
    const nodeProcessor = new NodeProcessor(fileConfig, pageSources, variableProcessor,
                                            pluginManager, siteLinkManager, this.pageUserScriptsAndStyles);

    let content = variableProcessor.renderWithSiteVariables(this.pageConfig.sourcePath, pageSources);
    content = await nodeProcessor.process(this.pageConfig.sourcePath, content) as string;
    this.processFrontmatter(nodeProcessor.frontmatter);
    content = pluginManager.postRender(this.frontmatter, content);
    const pageContent = content;

    pluginManager.collectPluginPageNjkAssets(this.frontmatter, content, this.asset);

    await layoutManager.generateLayoutIfNeeded(this.layout);
    const pageNav = this.buildPageNav(content);
    content = layoutManager.combineLayoutWithPage(this.layout, content, pageNav, this.includedFiles);
    this.asset = {
      ...this.asset,
      ...layoutManager.getLayoutPageNjkAssets(this.layout),
    };

    pageSources.addAllToSet(this.includedFiles);
    await externalManager.generateDependencies(pageSources.getDynamicIncludeSrc(), this.includedFiles);

    this.collectHeadingsAndKeywords(pageContent);

    content = `<div id="app">${content}</div>`;

    // Compile the page into Vue application and outputs the render function into script for browser
    const compiledVuePage = await pageVueServerRenderer.compileVuePageAndCreateScript(
      content, this.pageConfig, this.asset);

    /*
     * Record render functions of built pages that were compiled
     * for fast re-render when MarkBindVue bundle hot-reloads
     */
    const builtPage = {
      page: this,
      compiledVuePage,
      pageNav,
    };
    // Each source path will only contain 1 copy of build/re-build page (the latest one)
    pageVueServerRenderer.pageEntries[this.pageConfig.sourcePath] = builtPage;

    // Wait for all pages resources to be generated before writing to disk
    await LockManager.waitForLockRelease();

    /*
     * Server-side render Vue page app into actual html.
     *
     * However, for automated testings (e.g. snapshots), we will not do SSR as we want to retain the
     * unrendered DOM for easier reference and checking.
     */
    if (process.env.TEST_MODE) {
      await this.outputPageHtml(content);
    } else {
      const vueSsrHtml = await pageVueServerRenderer.renderVuePage(compiledVuePage);
      await this.outputPageHtml(vueSsrHtml);
    }
  }

  async outputPageHtml(content: string) {
    const renderedTemplate = this.pageConfig.template.render(
      this.prepareTemplateData(content)); // page.njk

    const outputTemplateHTML = process.env.TEST_MODE
      ? htmlBeautify(renderedTemplate, this.pageConfig.pluginManager.htmlBeautifyOptions)
      : renderedTemplate;

    await fs.outputFile(this.pageConfig.resultPath, outputTemplateHTML);
  }

  /**
   * Generates a selector for headings with level inside the headingIndexLevel
   * or with the index attribute, that do not also have the noindex attribute
   * @param headingIndexingLevel to generate
   */
  static generateHeadingSelector(headingIndexingLevel: number) {
    let headingsSelectors = ['.always-index:header', 'h1'];
    for (let i = 2; i <= headingIndexingLevel; i += 1) {
      headingsSelectors.push(`h${i}`);
    }
    headingsSelectors = headingsSelectors.map(selector => `${selector}:not(.no-index)`);
    return headingsSelectors.join(',');
  }

  /**
   * Gets the closest heading to an element
   * @param $ a Cheerio object
   * @param headingsSelector jQuery selector for selecting headings
   * @param element to find closest heading
   */
  static getClosestHeading($: cheerio.Root, headingsSelector: string,
                           element: cheerio.Element): cheerio.Element | null {
    const prevElements = $(element).prevAll();
    for (let i = 0; i < prevElements.length; i += 1) {
      const currentElement = $(prevElements[i]);
      if (currentElement.is(headingsSelector)) {
        return currentElement as unknown as cheerio.Element;
      }
      const childHeadings = currentElement.find(headingsSelector);
      if (childHeadings.length > 0) {
        return childHeadings.last() as unknown as cheerio.Element;
      }
    }
    if ($(element).parent().length === 0) {
      return null;
    }
    return Page.getClosestHeading($, headingsSelector, $(element).parent() as unknown as cheerio.Element);
  }
}
