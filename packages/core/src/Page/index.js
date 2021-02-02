const cheerio = require('cheerio'); require('../patches/htmlparser2');
const fs = require('fs-extra');
const htmlBeautify = require('js-beautify').html;
const path = require('path');

const _ = {};
_.cloneDeep = require('lodash/cloneDeep');
_.isString = require('lodash/isString');
_.isObject = require('lodash/isObject');
_.isArray = require('lodash/isArray');

const { CyclicReferenceError } = require('../errors');
const { PageSources } = require('./PageSources');
const { NodeProcessor } = require('../html/NodeProcessor');

const utils = require('../utils');
const logger = require('../utils/logger');

const PACKAGE_VERSION = require('../../package.json').version;

const {
  PAGE_NAV_ID,
  PAGE_NAV_TITLE_CLASS,
  TITLE_PREFIX_SEPARATOR,
} = require('./constants');

const {
  LAYOUT_DEFAULT_NAME,
} = require('../constants');

cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

class Page {
  /**
   * @param {PageConfig} pageConfig
   */
  constructor(pageConfig) {
    /**
     * Page configuration passed from {@link Site}.
     * This should not be mutated.
     * @type {PageConfig}
     */
    this.pageConfig = pageConfig;
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
     * The pure frontMatter of the page as collected in {@link collectFrontMatter}.
     * https://markbind.org/userGuide/tweakingThePageStructure.html#front-matter
     * @type {Object<string, any>}
     */
    this.frontMatter = {};
    /**
     * Map of heading ids to its text content
     * @type {Object<string, string>}
     */
    this.headings = {};
    /**
     * Stores the next integer to append to a heading id, for resolving heading id conflicts
     * @type {Object<string, number>}
     */
    this.headerIdMap = {};
    /**
     * Set of included files (dependencies) used for live reload
     * https://markbind.org/userGuide/reusingContents.html#includes
     * @type {Set<string>}
     */
    this.includedFiles = new Set([this.pageConfig.sourcePath]);
    /**
     * Map of heading ids (that closest to the keyword) to the keyword text content
     * https://markbind.org/userGuide/makingTheSiteSearchable.html#keywords
     * @type {Object<string, Array>}
     */
    this.keywords = {};
    /**
     * The title of the page.
     * This is initially set to the title specified in the site configuration,
     * if there is none, we look for one in the frontMatter(s) as well.
     * @type {string}
     */
    this.title = this.pageConfig.title || '';

    /*
     * Layouts related properties
     */

    /**
     * The layout to use for this page, which may be further mutated in {@link processFrontMatter.}
     * @type {string}
     */
    this.layout = this.pageConfig.layout;
    /**
     * An object storing the mapping from the navigable headings' id to an
     * object of {text: NAV_TEXT, level: NAV_LEVEL}.
     * Used for page nav generation.
     * @type {Object<string, Object>}
     */
    this.navigableHeadings = {};
  }

  /**
   * Checks if the provided filePath is a dependency of the page
   * @param {string} filePath to check
   */
  isDependency(filePath) {
    return this.includedFiles && this.includedFiles.has(filePath);
  }

  prepareTemplateData(content, hasPageNav) {
    const prefixedTitle = this.pageConfig.titlePrefix
      ? this.pageConfig.titlePrefix + (this.title ? TITLE_PREFIX_SEPARATOR + this.title : '')
      : this.title;
    // construct temporary asset object with only POSIX-style paths
    const asset = {};
    Object.entries(this.asset).forEach(([key, value]) => {
      asset[key] = _.isString(value) ? utils.ensurePosix(value) : value;
    });
    return {
      asset,
      baseUrl: this.pageConfig.baseUrl,
      content,
      hasPageNav,
      dev: this.pageConfig.dev,
      faviconUrl: this.pageConfig.faviconUrl,
      markBindVersion: `MarkBind ${PACKAGE_VERSION}`,
      title: prefixedTitle,
      enableSearch: this.pageConfig.enableSearch,
    };
  }

  /**
   * Checks if page.frontMatter has a valid page navigation specifier
   */
  isPageNavigationSpecifierValid() {
    const { pageNav } = this.frontMatter;
    return pageNav && (pageNav === 'default' || Number.isInteger(pageNav));
  }

  /**
   * Generates element selector for page navigation, depending on specifier in front matter
   * @param pageNav {string|number} 'default' refers to the configured heading indexing level,
   * otherwise a number that indicates the indexing level.
   */
  generateElementSelectorForPageNav(pageNav) {
    if (pageNav === 'default') {
      return `${Page.generateHeadingSelector(this.pageConfig.headingIndexingLevel)}, panel`;
    } else if (Number.isInteger(pageNav)) {
      return `${Page.generateHeadingSelector(parseInt(pageNav, 10))}, panel`;
    }
    // Not a valid specifier
    return undefined;
  }

  /**
   * Collect headings outside of models and unexpanded panels.
   * Collects headings from the header slots of unexpanded panels, but not its content.
   * @param content html content of a page
   */
  collectNavigableHeadings(content) {
    const { pageNav } = this.frontMatter;
    const elementSelector = this.generateElementSelectorForPageNav(pageNav);
    if (elementSelector === undefined) {
      return;
    }
    const $ = cheerio.load(content);
    $('b-modal').remove();
    this._collectNavigableHeadings($, $.root()[0], elementSelector);
  }

  _collectNavigableHeadings($, context, pageNavSelector) {
    $(pageNavSelector, context).each((i, elem) => {
      // Check if heading or panel is already inside an unexpanded panel
      let isInsideUnexpandedPanel = false;
      const panelParents = $(elem).parentsUntil(context).filter('panel').not(elem);
      panelParents.each((j, elemParent) => {
        if (elemParent.attribs.expanded === undefined) {
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

        this._collectNavigableHeadings($, headings.first(), pageNavSelector);
      } else if ($(elem).attr('id') !== undefined) {
        // Headings already in content, with a valid ID
        this.navigableHeadings[$(elem).attr('id')] = {
          text: $(elem).text(),
          level: elem.name.replace('h', ''),
        };
      }
    });
  }

  /**
   * Records headings and keywords inside rendered page into this.headings and this.keywords respectively
   */
  collectHeadingsAndKeywords(pageContent) {
    this.collectHeadingsAndKeywordsInContent(pageContent, null, false, []);
  }

  /**
   * Records headings and keywords inside content into this.headings and this.keywords respectively
   * @param content that contains the headings and keywords
   * @param lastHeading
   * @param excludeHeadings
   * @param sourceTraversalStack
   */
  collectHeadingsAndKeywordsInContent(content, lastHeading, excludeHeadings, sourceTraversalStack) {
    let $ = cheerio.load(content);
    const headingsSelector = Page.generateHeadingSelector(this.pageConfig.headingIndexingLevel);
    $('b-modal').remove();
    $('panel').not('panel panel')
      .each((index, panel) => {
        const slotHeader = $(panel).children('[\\#header]');
        if (slotHeader.length) {
          this.collectHeadingsAndKeywordsInContent(slotHeader.html(),
                                                   lastHeading, excludeHeadings, sourceTraversalStack);
        }
      })
      .each((index, panel) => {
        const shouldExcludeHeadings = excludeHeadings || (panel.attribs.expanded === undefined);
        let closestHeading = Page.getClosestHeading($, headingsSelector, panel);
        if (!closestHeading) {
          closestHeading = lastHeading;
        }
        const slotHeadings = $(panel).children('[\\#header]').find(':header');
        if (slotHeadings.length) {
          closestHeading = slotHeadings.first();
        }

        if (panel.attribs.src) {
          const src = panel.attribs.src.split('#')[0];
          const buildInnerDir = path.dirname(this.pageConfig.sourcePath);
          const resultInnerDir = path.dirname(this.pageConfig.resultPath);
          const includeRelativeToBuildRootDirPath = this.pageConfig.baseUrl
            ? path.relative(this.pageConfig.baseUrl, src)
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
            this.collectHeadingsAndKeywordsInContent($(`#${panel.attribs.fragment}`).html(), closestHeading,
                                                     shouldExcludeHeadings, childSourceTraversalStack);
          } else {
            this.collectHeadingsAndKeywordsInContent(includeContent, closestHeading, shouldExcludeHeadings,
                                                     childSourceTraversalStack);
          }
        } else {
          this.collectHeadingsAndKeywordsInContent($(panel).html(), closestHeading,
                                                   shouldExcludeHeadings, sourceTraversalStack);
        }
      });
    $ = cheerio.load(content);
    if (this.pageConfig.headingIndexingLevel > 0) {
      $('b-modal').remove();
      $('panel').remove();
      if (!excludeHeadings) {
        $(headingsSelector).each((i, heading) => {
          this.headings[$(heading).attr('id')] = $(heading).text();
        });
      }
      $('.keyword').each((i, keyword) => {
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
  linkKeywordToHeading($, keyword, heading) {
    const headingId = $(heading).attr('id');
    if (!(headingId in this.keywords)) {
      this.keywords[headingId] = [];
    }
    this.keywords[headingId].push($(keyword).text());
  }

  /**
   * Uses the collected frontmatter from {@link collectFrontMatter} to extract the {@link Page}'s
   * instance configurations.
   * FrontMatter properties always have lower priority than site configuration properties.
   */
  processFrontMatter(frontMatter) {
    this.frontMatter = {
      ...frontMatter,
      ...this.pageConfig.globalOverride,
      ...this.pageConfig.frontmatterOverride,
    };

    this.title = this.title || this.frontMatter.title || '';
    this.layout = this.layout || this.frontMatter.layout || LAYOUT_DEFAULT_NAME;
  }

  /**
   *  Generates page navigation's heading list HTML
   *
   *  A stack is used to maintain proper indentation levels for the headings at different heading levels.
   */
  generatePageNavHeadingHtml() {
    let headingHTML = '';
    const headingStack = [];
    Object.keys(this.navigableHeadings).forEach((key) => {
      const currentHeadingLevel = this.navigableHeadings[key].level;
      const currentHeadingHTML = `<a class="nav-link py-1" href="#${key}">`
        + `${this.navigableHeadings[key].text}&#x200E;</a>\n`;
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
   * Generates page navigation's header if specified in this.frontMatter
   * @returns string string
   */
  generatePageNavTitleHtml() {
    const { pageNavTitle } = this.frontMatter;
    return pageNavTitle
      ? `<a class="navbar-brand ${PAGE_NAV_TITLE_CLASS}" href="#">${pageNavTitle.toString()}</a>`
      : '';
  }

  /**
   *  Builds page navigation bar with headings up to headingIndexingLevel
   */
  buildPageNav(content) {
    const isFmPageNavSpecifierValid = this.isPageNavigationSpecifierValid();
    const doesLayoutHavePageNav = this.pageConfig.layoutManager.layoutHasPageNav(this.layout);

    if (isFmPageNavSpecifierValid && doesLayoutHavePageNav) {
      this.navigableHeadings = {};
      this.collectNavigableHeadings(content);
      const pageNavTitleHtml = this.generatePageNavTitleHtml();
      const pageNavHeadingHTML = this.generatePageNavHeadingHtml();
      return `${pageNavTitleHtml}\n`
          + `<nav id="${PAGE_NAV_ID}" class="nav nav-pills flex-column my-0 small no-flex-wrap">\n`
          + `${pageNavHeadingHTML}\n`
          + '</nav>\n';
    }

    return '';
  }

  /**
   * A file configuration object.
   * @typedef {Object<string, any>} FileConfig
   * @property {Set<string>} baseUrlMap the set of urls representing the sites' base directories
   * @property {string} rootPath
   * @property {VariableProcessor} variableProcessor
   * @property {Object<string, number>} headerIdMap
   */

  async generate(externalManager) {
    this.resetState(); // Reset for live reload

    /**
     * @type {FileConfig}
     */
    const fileConfig = {
      baseUrlMap: this.pageConfig.baseUrlMap,
      baseUrl: this.pageConfig.baseUrl,
      rootPath: this.pageConfig.rootPath,
      headerIdMap: this.headerIdMap,
      ignore: this.pageConfig.ignore,
      addressablePagesSource: this.pageConfig.addressablePagesSource,
      intrasiteLinkValidation: this.pageConfig.intrasiteLinkValidation,
    };

    const { variableProcessor, layoutManager, pluginManager } = this.pageConfig;

    const pageSources = new PageSources();
    const nodeProcessor = new NodeProcessor(fileConfig, pageSources, variableProcessor, pluginManager);

    let content = variableProcessor.renderWithSiteVariables(this.pageConfig.sourcePath, pageSources);
    content = await nodeProcessor.process(this.pageConfig.sourcePath, content);
    this.processFrontMatter(nodeProcessor.frontMatter);
    content = Page.addScrollToTopButton(content);
    content = pluginManager.postRender(this.frontMatter, content);
    const pageContent = content;

    pluginManager.collectPluginPageNjkAssets(this.frontMatter, content, this.asset);

    await layoutManager.generateLayoutIfNeeded(this.layout);
    const pageNav = this.buildPageNav(content);
    content = layoutManager.combineLayoutWithPage(this.layout, content, pageNav, this.includedFiles);
    this.asset = {
      ...this.asset,
      ...layoutManager.getLayoutPageNjkAssets(this.layout),
    };

    const renderedTemplate = this.pageConfig.template.render(
      this.prepareTemplateData(content, !!pageNav)); // page.njk
    const outputTemplateHTML = this.pageConfig.disableHtmlBeautify
      ? renderedTemplate
      : htmlBeautify(renderedTemplate, pluginManager.htmlBeautifyOptions);

    await fs.outputFile(this.pageConfig.resultPath, outputTemplateHTML);

    pageSources.addAllToSet(this.includedFiles);
    await externalManager.generateDependencies(pageSources.getDynamicIncludeSrc(), this.includedFiles);

    this.collectHeadingsAndKeywords(pageContent);
  }

  static addScrollToTopButton(pageData) {
    const button = '<i class="fa fa-arrow-circle-up fa-lg d-print-none" id="scroll-top-button" '
    + 'onclick="handleScrollTop()" aria-hidden="true"></i>';
    return `${pageData}\n${button}`;
  }

  /**
   * Generates a selector for headings with level inside the headingIndexLevel
   * or with the index attribute, that do not also have the noindex attribute
   * @param headingIndexingLevel to generate
   */
  static generateHeadingSelector(headingIndexingLevel) {
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
  static getClosestHeading($, headingsSelector, element) {
    const prevElements = $(element).prevAll();
    for (let i = 0; i < prevElements.length; i += 1) {
      const currentElement = $(prevElements[i]);
      if (currentElement.is(headingsSelector)) {
        return currentElement;
      }
      const childHeadings = currentElement.find(headingsSelector);
      if (childHeadings.length > 0) {
        return childHeadings.last();
      }
    }
    if ($(element).parent().length === 0) {
      return null;
    }
    return Page.getClosestHeading($, headingsSelector, $(element).parent());
  }
}

module.exports = Page;
