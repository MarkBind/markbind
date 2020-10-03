const cheerio = require('cheerio'); require('../patches/htmlparser2');
const fm = require('fastmatter');
const fs = require('fs-extra');
const htmlBeautify = require('js-beautify').html;
const path = require('path');
const Promise = require('bluebird');

const _ = {};
_.cloneDeep = require('lodash/cloneDeep');
_.isString = require('lodash/isString');
_.isObject = require('lodash/isObject');
_.isArray = require('lodash/isArray');

const { CyclicReferenceError } = require('../errors');
const { PageSources } = require('./PageSources');
const { ComponentPreprocessor } = require('../preprocessors/ComponentPreprocessor');
const { ComponentParser } = require('../parsers/ComponentParser');
const md = require('../lib/markdown-it');

const FsUtil = require('../utils/fsUtil');
const utils = require('../utils');
const logger = require('../utils/logger');

const PACKAGE_VERSION = require('../../package.json').version;

const {
  FOOTERS_FOLDER_PATH,
  HEAD_FOLDER_PATH,
  HEADERS_FOLDER_PATH,
  LAYOUT_FOOTER,
  LAYOUT_HEAD,
  LAYOUT_HEADER,
  LAYOUT_PAGE,
  LAYOUT_PAGE_BODY_VARIABLE,
  LAYOUT_NAVIGATION,
  NAVIGATION_FOLDER_PATH,
  CONTENT_WRAPPER_ID,
  FRONT_MATTER_FENCE,
  FRONT_MATTER_NONE_ATTR,
  PAGE_NAV_ID,
  PAGE_NAV_TITLE_CLASS,
  SITE_NAV_ID,
  SITE_NAV_EMPTY_LINE_REGEX,
  SITE_NAV_LIST_ITEM_CLASS,
  SITE_NAV_DEFAULT_LIST_ITEM_CLASS,
  SITE_NAV_LIST_CLASS,
  SITE_NAV_LIST_CLASS_ROOT,
  SITE_NAV_CUSTOM_LIST_ITEM_CLASS,
  SITE_NAV_DROPDOWN_EXPAND_KEYWORD_REGEX,
  SITE_NAV_DROPDOWN_ICON_HTML,
  SITE_NAV_DROPDOWN_ICON_ROTATED_HTML,
  TITLE_PREFIX_SEPARATOR,
  TEMP_NAVBAR_CLASS,
  TEMP_DROPDOWN_CLASS,
  TEMP_DROPDOWN_PLACEHOLDER_CLASS,
} = require('./constants');

const {
  LAYOUT_DEFAULT_NAME,
  LAYOUT_FOLDER_PATH,
  PLUGIN_SITE_ASSET_FOLDER_NAME,
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
     * or an array of <link/script> elements extracted from plugins during {@link collectPluginsAssets}.
     * @type {Object<string, string | Array<string>>}
     */
    this.asset = _.cloneDeep(this.pageConfig.asset);
    /**
     * @type {string}
     */
    this.content = '';
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
     * A map from page section id to HTML content of that section.
     * @type {Object<string, string>}
     */
    this.pageSectionsHtml = {};
    /**
     * Set of included files (dependencies) from plugins used for live reload
     * https://markbind.org/userGuide/usingPlugins.html
     * @type {Set<string>}
     */
    this.pluginSourceFiles = new Set();
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
     * Footer file path for the page, or false if none.
     * The footer may be from a layout, or from the _markbind/footers directory.
     * @type {string | boolean}
     */
    this.footer = false;
    /**
     * Head file from the layout, or false if none.
     * @type {Array<string> | boolean}
     */
    this.head = false;
    /**
     * Content as collected from the head file, to be inserted right before the closing </head> tag.
     * @type {string}
     */
    this.headFileBottomContent = '';
    /**
     * Content as collected from the head file, to be inserted right after the starting <head> tag.
     * @type {string}
     */
    this.headFileTopContent = '';
    /**
     * Header file path for the page, or false if none.
     * The header may be from a layout, or from the _markbind/headers directory.
     * @type {string | boolean}
     */
    this.header = false;
    /**
     * An object storing the mapping from the navigable headings' id to an
     * object of {text: NAV_TEXT, level: NAV_LEVEL}.
     * Used for page nav generation.
     * @type {Object<string, Object>}
     */
    this.navigableHeadings = {};
    /**
     * Site navigation file path for the page, or false if none.
     * The site nav may be from a layout, or from the _markbind/navigation directory.
     * @type {string | boolean}
     */
    this.siteNav = false;
  }

  /**
   * Checks if the provided filePath is a dependency of the page
   * @param {string} filePath to check
   */
  isDependency(filePath) {
    return (this.includedFiles
      && this.includedFiles.has(filePath))
      || (this.pluginSourceFiles
      && this.pluginSourceFiles.has(filePath));
  }

  /**
   * A template data object.
   * @typedef {Object<string, any>} TemplateData
   * @property {Object<string, any>} asset
   * @property {string} baseUrl
   * @property {string} content
   * @property {string} faviconUrl
   * @property {string} footerHtml
   * @property {string} headerHtml
   * @property {string} headFileBottomContent
   * @property {string} headFileTopContent
   * @property {string} markBindVersion A string of format `MarkBind {VERSION}`
   * @property {boolean} pageNav true iff the page navigation is enabled.
   * @property {string} pageNavHtml
   * @property {boolean} siteNav true iff the site navigation is enabled.
   * @property {string} siteNavHtml
   * @property {string} title if title prefix is specified,
   * this will be the prefixed title,
   * otherwise the title itself.
   * @property {boolean} searchable
   * /

  /**
   * @returns {TemplateData} templateData
   */
  prepareTemplateData() {
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
      content: this.content,
      dev: this.pageConfig.dev,
      faviconUrl: this.pageConfig.faviconUrl,
      footerHtml: this.pageSectionsHtml.footer || '',
      headerHtml: this.pageSectionsHtml.header || '',
      headFileBottomContent: this.headFileBottomContent,
      headFileTopContent: this.headFileTopContent,
      markBindVersion: `MarkBind ${PACKAGE_VERSION}`,
      pageNav: this.isPageNavigationSpecifierValid(),
      pageNavHtml: this.pageSectionsHtml[`#${PAGE_NAV_ID}`] || '',
      siteNav: this.siteNav,
      siteNavHtml: this.pageSectionsHtml[`#${SITE_NAV_ID}`] || '',
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
      const slotParents = $(elem).parentsUntil(context).filter('[slot="header"]').not(elem);
      const panelSlotParents = slotParents.parent('panel');
      if (panelSlotParents.length) {
        return;
      }

      if (elem.name === 'panel') {
        // Recurse only on the slot which has priority
        const headings = $(elem).children('[slot="header"]');
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
  collectHeadingsAndKeywords() {
    const $ = cheerio.load(fs.readFileSync(this.pageConfig.resultPath));
    this.collectHeadingsAndKeywordsInContent($(`#${CONTENT_WRAPPER_ID}`).html(), null, false, []);
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
        const slotHeader = $(panel).children('[slot="header"]');
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
        const slotHeadings = $(panel).children('[slot="header"]').find(':header');
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
   * Records the dynamic or static included files into this.includedFiles
   * @param dependencies array of maps of the external dependency and where it is included
   */
  collectIncludedFiles(dependencies) {
    dependencies.forEach(dependency => this.includedFiles.add(dependency.to));
  }

  /**
   * Records the front matter into this.frontMatter
   * @param includedPage a page with its dependencies included
   */
  collectFrontMatter(includedPage) {
    const $ = cheerio.load(includedPage);
    const frontMatter = $('frontmatter');
    let pageFrontMatter = {};
    if (frontMatter.text().trim()) {
      // Retrieves the front matter from either the first frontmatter element
      // or from a frontmatter element that includes from another file
      // The latter case will result in the data being wrapped in a div
      const frontMatterData = frontMatter.find('div').length
        ? frontMatter.find('div')[0].children[0].data
        : frontMatter[0].children[0].data;
      const frontMatterWrapped = `${FRONT_MATTER_FENCE}\n${frontMatterData}\n${FRONT_MATTER_FENCE}`;

      pageFrontMatter = fm(frontMatterWrapped).attributes;
    }

    this.frontMatter = {
      ...pageFrontMatter,
      ...this.pageConfig.globalOverride,
      ...this.pageConfig.frontmatterOverride,
    };
  }

  /**
   * Uses the collected frontmatter from {@link collectFrontMatter} to extract the {@link Page}'s
   * instance configurations.
   * FrontMatter properties always have lower priority than site configuration properties.
   */
  processFrontMatter() {
    this.title = this.title || this.frontMatter.title || '';
    this.layout = this.layout || this.frontMatter.layout || LAYOUT_DEFAULT_NAME;

    /*
     Set to false if the frontMatter attribute is 'none',
     set it to the filePath of the layout file specified by the frontMatter (if present),
     otherwise set it to the filePath of the layout file of {@code this.layout}.
     */
    this.header = this.frontMatter.header !== FRONT_MATTER_NONE_ATTR
      && (this.frontMatter.header
        ? path.join(this.pageConfig.rootPath, HEADERS_FOLDER_PATH, this.frontMatter.header)
        : path.join(this.pageConfig.rootPath, LAYOUT_FOLDER_PATH, this.layout, LAYOUT_HEADER));
    this.footer = this.frontMatter.footer !== FRONT_MATTER_NONE_ATTR
      && (this.frontMatter.footer
        ? path.join(this.pageConfig.rootPath, FOOTERS_FOLDER_PATH, this.frontMatter.footer)
        : path.join(this.pageConfig.rootPath, LAYOUT_FOLDER_PATH, this.layout, LAYOUT_FOOTER));
    this.siteNav = this.frontMatter.siteNav !== FRONT_MATTER_NONE_ATTR
      && (this.frontMatter.siteNav
        ? path.join(this.pageConfig.rootPath, NAVIGATION_FOLDER_PATH, this.frontMatter.siteNav)
        : path.join(this.pageConfig.rootPath, LAYOUT_FOLDER_PATH, this.layout, LAYOUT_NAVIGATION));
    this.head = this.frontMatter.head !== FRONT_MATTER_NONE_ATTR
      && (this.frontMatter.head
        ? this.frontMatter.head.split(/ *, */).map(file => path.join(this.pageConfig.rootPath,
                                                                     HEAD_FOLDER_PATH, file))
        : [path.join(this.pageConfig.rootPath, LAYOUT_FOLDER_PATH, this.layout, LAYOUT_HEAD)]);
  }

  /**
   * Removes the front matter from an included page
   * @param includedPage a page with its dependencies included
   */
  static removeFrontMatter(includedPage) {
    const $ = cheerio.load(includedPage);
    const frontMatter = $('frontmatter');
    frontMatter.remove();
    return $.html();
  }

  /**
   * Renders expressive layouts by inserting page data into pre-specified layout
   * @param pageData a page with its front matter collected
   * @param {FileConfig} fileConfig
   * @param {ComponentPreprocessor} componentPreprocessor for running {@link includeFile} on the layout
   * @param {PageSources} pageSources to add dependencies found during nunjucks rendering to
   */
  generateExpressiveLayout(pageData, fileConfig, componentPreprocessor, pageSources) {
    const layoutPath = path.join(this.pageConfig.rootPath, LAYOUT_FOLDER_PATH, this.layout);
    const layoutPagePath = path.join(layoutPath, LAYOUT_PAGE);

    if (!fs.existsSync(layoutPagePath)) {
      return pageData;
    }

    // Set expressive layout file as an includedFile
    this.includedFiles.add(layoutPagePath);
    return fs.readFile(layoutPagePath, 'utf8')
      /*
       Render {{ MAIN_CONTENT_BODY }} and {% raw/endraw %} back to itself first,
       which is then dealt with in the call below to {@link renderSiteVariables}.
       */
      .then(result => this.pageConfig.variableProcessor.renderPage(layoutPagePath, result, pageSources, {
        [LAYOUT_PAGE_BODY_VARIABLE]: `{{${LAYOUT_PAGE_BODY_VARIABLE}}}`,
      }, true))
      // Include file with the cwf set to the layout page path
      .then(result => componentPreprocessor.includeFile(layoutPagePath, result))
      // Note: The {% raw/endraw %}s previously kept are removed here.
      .then(result => this.pageConfig.variableProcessor.renderSiteVariables(
        this.pageConfig.rootPath, result, pageSources, {
          [LAYOUT_PAGE_BODY_VARIABLE]: pageData,
        }));
  }

  /**
   * Inserts the page layout's header to the start of the page
   * Determines if a fixed header is present, update the page config accordingly
   * @param pageData a page with its front matter collected
   * @param {PageSources} pageSources to add dependencies found during nunjucks rendering to
   */
  insertHeaderFile(pageData, pageSources) {
    if (!this.header || !fs.existsSync(this.header)) {
      return pageData;
    }
    // Retrieve Markdown file contents
    const headerContent = fs.readFileSync(this.header, 'utf8');
    this.includedFiles.add(this.header);

    const renderedHeader = this.pageConfig.variableProcessor.renderSiteVariables(this.pageConfig.sourcePath,
                                                                                 headerContent, pageSources);
    return `<div data-included-from="${this.header}">${renderedHeader}</div>${pageData}`;
  }

  /**
   * Inserts the footer specified in front matter to the end of the page
   * @param pageData a page with its front matter collected
   * @param {PageSources} pageSources to add dependencies found during nunjucks rendering to
   */
  insertFooterFile(pageData, pageSources) {
    if (!this.footer || !fs.existsSync(this.footer)) {
      return pageData;
    }
    // Retrieve Markdown file contents
    const footerContent = fs.readFileSync(this.footer, 'utf8');
    // Set footer file as an includedFile
    this.includedFiles.add(this.footer);

    const renderedFooter = this.pageConfig.variableProcessor.renderSiteVariables(this.pageConfig.sourcePath,
                                                                                 footerContent, pageSources);
    return `<div data-included-from="${this.footer}">${renderedFooter}</div>${pageData}`;
  }

  /**
   * Inserts a site navigation bar using the file specified in the front matter
   * @param pageData, a page with its front matter collected
   * @param {PageSources} pageSources to add dependencies found during nunjucks rendering to
   * @throws (Error) if there is more than one instance of the <navigation> tag
   */
  insertSiteNav(pageData, pageSources) {
    if (!this.siteNav || !fs.existsSync(this.siteNav)) {
      this.siteNav = false;
      return pageData;
    }

    const siteNavContent = fs.readFileSync(this.siteNav, 'utf8').trim();
    if (siteNavContent === '') {
      this.siteNav = false;
      return pageData;
    }
    this.includedFiles.add(this.siteNav);

    const siteNavMappedData = this.pageConfig.variableProcessor.renderSiteVariables(
      this.pageConfig.sourcePath, siteNavContent, pageSources);

    // Check navigation elements
    const $ = cheerio.load(siteNavMappedData);
    const navigationElements = $('navigation');
    if (navigationElements.length > 1) {
      throw new Error(`More than one <navigation> tag found in ${this.siteNav}`);
    }
    const siteNavHtml = md.render(navigationElements.length === 0
      ? siteNavMappedData.replace(SITE_NAV_EMPTY_LINE_REGEX, '\n')
      : navigationElements.html().replace(SITE_NAV_EMPTY_LINE_REGEX, '\n'));
    const $nav = cheerio.load(siteNavHtml);

    // Add anchor classes and highlight current page's anchor, if any.
    const currentPageHtmlPath = this.pageConfig.src.replace(/\.(md|mbd)$/, '.html');
    const currentPageRegex = new RegExp(`${this.pageConfig.baseUrl}/${currentPageHtmlPath}`);
    $nav('a[href]').each((i, elem) => {
      if (currentPageRegex.test($nav(elem).attr('href'))) {
        $nav(elem).addClass('current');
      }
    });

    $nav('ul').each((i1, ulElem) => {
      const nestingLevel = $nav(ulElem).parents('ul').length;
      $nav(ulElem).addClass(SITE_NAV_LIST_CLASS);
      if (nestingLevel === 0) {
        $nav(ulElem).addClass(SITE_NAV_LIST_CLASS_ROOT);
      }
      const listItemLevelClass = `${SITE_NAV_LIST_ITEM_CLASS}-${nestingLevel}`;
      const defaultListItemClass = `${SITE_NAV_DEFAULT_LIST_ITEM_CLASS} ${listItemLevelClass}`;
      const customListItemClasses = `${SITE_NAV_CUSTOM_LIST_ITEM_CLASS} ${listItemLevelClass}`;

      $nav(ulElem).children('li').each((i2, liElem) => {
        const nestedLists = $nav(liElem).children('ul');
        const nestedAnchors = $nav(liElem).children('a');
        if (nestedLists.length === 0 && nestedAnchors.length === 0) {
          $(liElem).addClass(customListItemClasses);
          return;
        }

        const listItemContent = $nav(liElem).contents().not('ul');
        const listItemContentHtml = $nav.html(listItemContent);
        listItemContent.remove();
        $nav(liElem).prepend(`<div class="${defaultListItemClass}" onclick="handleSiteNavClick(this)">`
          + `${listItemContentHtml}</div>`);
        if (nestedLists.length === 0) {
          return;
        }

        // Found nested list, render dropdown menu
        const listItemParent = $nav(liElem).children().first();

        const hasExpandedKeyword = SITE_NAV_DROPDOWN_EXPAND_KEYWORD_REGEX.test(listItemContentHtml);
        const isParentListOfCurrentPage = !!nestedLists.find('a.current').length;
        const shouldExpandDropdown = hasExpandedKeyword || isParentListOfCurrentPage;
        if (shouldExpandDropdown) {
          nestedLists.addClass('site-nav-dropdown-container site-nav-dropdown-container-open');
          listItemParent.html(listItemContentHtml.replace(SITE_NAV_DROPDOWN_EXPAND_KEYWORD_REGEX, ''));
          listItemParent.append(SITE_NAV_DROPDOWN_ICON_ROTATED_HTML);
        } else {
          nestedLists.addClass('site-nav-dropdown-container');
          listItemParent.append(SITE_NAV_DROPDOWN_ICON_HTML);
        }
      });
    });

    let formattedHtml;
    if (navigationElements.length === 0) {
      formattedHtml = $nav.html();
    } else {
      $('navigation').replaceWith($nav.root());
      formattedHtml = $.html();
    }

    // Wrap sections and append page content
    const wrappedSiteNav = `${`<nav id="${SITE_NAV_ID}" class="navbar navbar-light bg-transparent">\n`
      + '<div class="border-right-grey nav-inner position-sticky slim-scroll">\n'}${formattedHtml}\n</div>\n`
      + '</nav>\n';
    return `<div data-included-from="${this.siteNav}">${wrappedSiteNav}</div>${pageData}`;
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
  buildPageNav() {
    if (this.isPageNavigationSpecifierValid()) {
      const $ = cheerio.load(this.content);
      this.navigableHeadings = {};
      this.collectNavigableHeadings($(`#${CONTENT_WRAPPER_ID}`).html());
      const pageNavTitleHtml = this.generatePageNavTitleHtml();
      const pageNavHeadingHTML = this.generatePageNavHeadingHtml();
      this.pageSectionsHtml[`#${PAGE_NAV_ID}`]
        = `<nav id="${PAGE_NAV_ID}" class="navbar navbar-light bg-transparent">\n`
          + '<div class="border-left-grey nav-inner position-sticky slim-scroll">\n'
          + `${pageNavTitleHtml}\n`
          + '<nav class="nav nav-pills flex-column my-0 small no-flex-wrap">\n'
          + `${pageNavHeadingHTML}\n`
          + '</nav>\n'
          + '</div>\n'
          + '</nav>\n';
    }
  }

  /**
   * Collect head files into {@link headFileTopContent} and {@link headFileBottomContent}
   * @param {PageSources} pageSources to add dependencies found during nunjucks rendering to
   */
  collectHeadFiles(pageSources) {
    if (!this.head) {
      this.headFileTopContent = '';
      this.headFileBottomContent = '';
      return;
    }

    const collectedTopContent = [];
    const collectedBottomContent = [];
    this.head.forEach((headFilePath) => {
      if (!fs.existsSync(headFilePath)) {
        return;
      }
      const headFileContent = fs.readFileSync(headFilePath, 'utf8');
      // Set head file as an includedFile
      this.includedFiles.add(headFilePath);

      const headFileMappedData = this.pageConfig.variableProcessor.renderSiteVariables(
        this.pageConfig.sourcePath, headFileContent, pageSources).trim();
      // Split top and bottom contents
      const $ = cheerio.load(headFileMappedData);
      if ($('head-top').length) {
        collectedTopContent.push($('head-top').html().trim().replace(/\n\s*\n/g, '\n')
          .replace(/\n/g, '\n    '));
        $('head-top').remove();
      }
      collectedBottomContent.push($.html().trim().replace(/\n\s*\n/g, '\n').replace(/\n/g, '\n    '));
    });
    this.headFileTopContent = collectedTopContent.join('\n    ');
    this.headFileBottomContent = collectedBottomContent.join('\n    ');
  }

  static insertTemporaryStyles(pageData) {
    const $ = cheerio.load(pageData);
    // inject temporary navbar styles
    $('navbar').addClass(TEMP_NAVBAR_CLASS);
    // inject temporary dropdown styles
    $('dropdown').each((i, element) => {
      const attributes = element.attribs;
      // TODO remove attributes.text once text attribute is fully deprecated
      const placeholder = `<div>${attributes.header || attributes.text || ''}</div>`;
      $(element).before(placeholder);
      $(element).prev().addClass(attributes.class).addClass(TEMP_DROPDOWN_PLACEHOLDER_CLASS);
      $(element).addClass(TEMP_DROPDOWN_CLASS);
    });
    return $.html();
  }

  collectPageSection(section) {
    const $ = cheerio.load(this.content);
    const pageSection = $(section);
    if (pageSection.length === 0) {
      return;
    }
    this.pageSectionsHtml[section] = $.html(section);
    pageSection.remove();
    this.content = $.html();
  }

  collectAllPageSections() {
    this.pageSectionsHtml = {}; // This resets the pageSectionsHTML whenever we collect.
    this.collectPageSection('header');
    this.collectPageSection(`#${SITE_NAV_ID}`);
    this.collectPageSection('footer');
  }

  /**
   * A file configuration object.
   * @typedef {Object<string, any>} FileConfig
   * @property {Set<string>} baseUrlMap the set of urls representing the sites' base directories
   * @property {string} rootPath
   * @property {VariableProcessor} variableProcessor
   * @property {Object<string, number>} headerIdMap
   */

  generate(builtFiles) {
    this.resetState(); // Reset for live reload

    /**
     * @type {FileConfig}
     */
    const fileConfig = {
      baseUrlMap: this.pageConfig.baseUrlMap,
      baseUrl: this.pageConfig.baseUrl,
      rootPath: this.pageConfig.rootPath,
      headerIdMap: this.headerIdMap,
    };
    const pageSources = new PageSources();
    const componentPreprocessor = new ComponentPreprocessor(fileConfig, this.pageConfig.variableProcessor,
                                                            pageSources);
    const componentParser = new ComponentParser(fileConfig);

    return fs.readFile(this.pageConfig.sourcePath, 'utf-8')
      .then(result => this.pageConfig.variableProcessor.renderPage(this.pageConfig.sourcePath,
                                                                   result, pageSources))
      .then(result => componentPreprocessor.includeFile(this.pageConfig.sourcePath, result))
      .then((result) => {
        this.collectFrontMatter(result);
        this.processFrontMatter();
        return Page.removeFrontMatter(result);
      })
      .then(result => this.generateExpressiveLayout(result, fileConfig, componentPreprocessor, pageSources))
      .then(result => Page.removePageHeaderAndFooter(result))
      .then(result => Page.addScrollToTopButton(result))
      .then(result => Page.addContentWrapper(result))
      .then(result => this.collectPluginSources(result))
      .then(result => this.preRender(result))
      .then(result => this.insertSiteNav(result, pageSources))
      .then(result => this.insertHeaderFile(result, pageSources))
      .then(result => this.insertFooterFile(result, pageSources))
      .then(result => Page.insertTemporaryStyles(result))
      .then(result => componentParser.render(this.pageConfig.sourcePath, result))
      .then(result => this.postRender(result))
      .then(result => this.collectPluginsAssets(result))
      .then(result => Page.unwrapIncludeSrc(result))
      .then((result) => {
        this.addLayoutScriptsAndStyles();
        this.collectHeadFiles(pageSources);

        this.content = result;

        this.collectAllPageSections();
        this.buildPageNav();

        const renderedTemplate = this.pageConfig.template.render(this.prepareTemplateData());
        const outputTemplateHTML = this.pageConfig.disableHtmlBeautify
          ? renderedTemplate
          : htmlBeautify(renderedTemplate, Page.htmlBeautifyOptions);

        return fs.outputFile(this.pageConfig.resultPath, outputTemplateHTML);
      })
      .then(() => {
        const resolvingFiles = [];
        Page.unique(pageSources.getDynamicIncludeSrc()).forEach((source) => {
          if (!FsUtil.isUrl(source.to)) {
            resolvingFiles.push(this.resolveDependency(source, builtFiles));
          }
        });
        return Promise.all(resolvingFiles);
      })
      .then(() => {
        this.collectIncludedFiles(pageSources.getDynamicIncludeSrc());
        this.collectIncludedFiles(pageSources.getStaticIncludeSrc());
        this.collectIncludedFiles(pageSources.getMissingIncludeSrc());
        this.collectHeadingsAndKeywords();
      });
  }

  /**
   * A plugin configuration object.
   * @typedef {Object<string, any>} PluginConfig
   * @property {number} headingIndexingLevel
   * @property {boolean} searchable
   * @property {string} rootPath
   * @property {string} sourcePath
   * @property {Set<string>} includedFiles
   * @property {string} resultPath
   */

  /**
   * Retrieves page config for plugins
   * @return {PluginConfig} pluginConfig
   */
  getPluginConfig() {
    return {
      baseUrl: this.pageConfig.baseUrl,
      headingIndexingLevel: this.pageConfig.headingIndexingLevel,
      searchable: this.pageConfig.searchable,
      rootPath: this.pageConfig.rootPath,
      siteOutputPath: this.pageConfig.siteOutputPath,
      sourcePath: this.pageConfig.sourcePath,
      includedFiles: this.includedFiles,
      resultPath: this.pageConfig.resultPath,
    };
  }

  /**
   * Collects file sources provided by plugins for the page for live reloading
   */
  collectPluginSources(content) {
    const self = this;

    Object.entries(self.pageConfig.plugins)
      .forEach(([pluginName, plugin]) => {
        if (!plugin.getSources) {
          return;
        }

        const result = plugin.getSources(content, self.pageConfig.pluginsContext[pluginName] || {},
                                         self.frontMatter, self.getPluginConfig());

        let pageContextSources;
        let domTagSourcesMap;

        if (_.isArray(result)) {
          pageContextSources = result;
        } else if (_.isObject(result)) {
          pageContextSources = result.sources;
          domTagSourcesMap = result.tagMap;
        } else {
          logger.warn(`${pluginName} returned unsupported type for ${self.pageConfig.sourcePath}`);
          return;
        }

        if (pageContextSources) {
          pageContextSources.forEach((src) => {
            if (src === undefined || src === '' || utils.isUrl(src)) {
              return;
            } else if (path.isAbsolute(src)) {
              self.pluginSourceFiles.add(path.resolve(src));
              return;
            }

            // Resolve relative paths from the current page source
            const originalSrcFolder = path.dirname(self.pageConfig.sourcePath);
            const resolvedResourcePath = path.resolve(originalSrcFolder, src);

            self.pluginSourceFiles.add(resolvedResourcePath);
          });
        }

        if (domTagSourcesMap) {
          const $ = cheerio.load(content);

          domTagSourcesMap.forEach(([tagName, attrName]) => {
            if (!_.isString(tagName) || !_.isString(attrName)) {
              logger.warn(`Invalid tag or attribute provided in tagMap by ${pluginName} plugin.`);
              return;
            }

            const selector = `${tagName}[${attrName}]`;
            $(selector)
              .each((i, el) => {
                const elem = $(el);

                let src = elem.attr(attrName);

                src = utils.ensurePosix(src);
                if (src === '' || utils.isUrl(src)) {
                  return;
                } else if (path.isAbsolute(src)) {
                  self.pluginSourceFiles.add(path.resolve(src));
                  return;
                }

                // Resolve relative paths from the include page source, or current page source otherwise
                const firstParent = elem.closest('div[data-included-from], span[data-included-from]');
                const originalSrc = firstParent.attr('data-included-from') || self.pageConfig.sourcePath;
                const originalSrcFolder = path.dirname(originalSrc);
                const resolvedResourcePath = path.resolve(originalSrcFolder, src);

                self.pluginSourceFiles.add(resolvedResourcePath);
              });
          });
        }
      });

    return content;
  }

  /**
   * Entry point for plugin pre-render
   */
  preRender(content) {
    let preRenderedContent = content;
    Object.entries(this.pageConfig.plugins).forEach(([pluginName, plugin]) => {
      if (plugin.preRender) {
        preRenderedContent = plugin.preRender(preRenderedContent,
                                              this.pageConfig.pluginsContext[pluginName] || {},
                                              this.frontMatter, this.getPluginConfig());
      }
    });
    return preRenderedContent;
  }

  /**
   * Entry point for plugin post-render
   */
  postRender(content) {
    let postRenderedContent = content;
    Object.entries(this.pageConfig.plugins).forEach(([pluginName, plugin]) => {
      if (plugin.postRender) {
        postRenderedContent = plugin.postRender(postRenderedContent,
                                                this.pageConfig.pluginsContext[pluginName] || {},
                                                this.frontMatter, this.getPluginConfig());
      }
    });
    return postRenderedContent;
  }

  /**
   * Resolves a resource specified as an attribute in a html asset tag
   * (eg. '<script>' or '<link>') provided by a plugin, and copies said asset
   * into the plugin's asset output folder.
   * Does nothing if the resource is a url.
   * @param assetElementHtml The asset element html, as a string, such as '<script src="...">'
   * @param tagName The name of the resource tag
   * @param attrName The attribute name where the resource is specified in the tag
   * @param plugin The plugin object from which to retrieve its asset src and output paths
   * @param pluginName The name of the plugin, used to determine a unique output path for the plugin
   * @return String html of the element, with the attribute's asset resolved
   */
  getResolvedAssetElement(assetElementHtml, tagName, attrName, plugin, pluginName) {
    const $ = cheerio.load(assetElementHtml);
    const el = $(`${tagName}[${attrName}]`);

    el.attr(attrName, (i, assetPath) => {
      if (!assetPath || utils.isUrl(assetPath)) {
        return assetPath;
      }

      const srcPath = path.resolve(plugin._pluginAbsolutePath, assetPath);
      const srcBaseName = path.basename(srcPath);

      fs.ensureDir(plugin._pluginAssetOutputPath)
        .then(() => {
          const outputPath = path.join(plugin._pluginAssetOutputPath, srcBaseName);
          fs.copySync(srcPath, outputPath, { overwrite: false });
        })
        .catch(err => logger.error(`Failed to copy asset ${assetPath} for plugin ${pluginName}\n${err}`));

      return path.posix.join(this.pageConfig.baseUrl || '/', PLUGIN_SITE_ASSET_FOLDER_NAME,
                             pluginName, srcBaseName);
    });

    return $.html();
  }

  /**
   * Collect page content inserted by plugins
   */
  collectPluginsAssets(content) {
    let links = [];
    let scripts = [];
    const linkUtils = {
      buildStylesheet: href => `<link rel="stylesheet" href="${href}">`,
    };
    const scriptUtils = {
      buildScript: src => `<script src="${src}"></script>`,
    };
    Object.entries(this.pageConfig.plugins).forEach(([pluginName, plugin]) => {
      if (plugin.getLinks) {
        const pluginLinks = plugin.getLinks(content, this.pageConfig.pluginsContext[pluginName],
                                            this.frontMatter, linkUtils);
        const resolvedPluginLinks = pluginLinks.map(linkHtml =>
          this.getResolvedAssetElement(linkHtml, 'link', 'href', plugin, pluginName));
        links = links.concat(resolvedPluginLinks);
      }

      if (plugin.getScripts) {
        const pluginScripts = plugin.getScripts(content, this.pageConfig.pluginsContext[pluginName],
                                                this.frontMatter, scriptUtils);
        const resolvedPluginScripts = pluginScripts.map(scriptHtml =>
          this.getResolvedAssetElement(scriptHtml, 'script', 'src', plugin, pluginName));
        scripts = scripts.concat(resolvedPluginScripts);
      }
    });
    this.asset.pluginLinks = links;
    this.asset.pluginScripts = scripts;
    return content;
  }

  /**
   * Adds linked layout files to page assets
   */
  addLayoutScriptsAndStyles() {
    this.asset.layoutScript = path.join(this.pageConfig.layoutsAssetPath, this.layout, 'scripts.js');
    this.asset.layoutStyle = path.join(this.pageConfig.layoutsAssetPath, this.layout, 'styles.css');
    this.includedFiles.add(
      path.join(this.pageConfig.rootPath, LAYOUT_FOLDER_PATH, this.layout, 'scripts.js'));
    this.includedFiles.add(
      path.join(this.pageConfig.rootPath, LAYOUT_FOLDER_PATH, this.layout, 'styles.css'));
  }

  /**
   * Pre-render an external dynamic dependency
   * Does not pre-render if file is already pre-rendered by another page during site generation
   * @param dependency a map of the external dependency and where it is included
   * @param {Object<string, Promise>} builtFiles map of dynamic dependencies' filepaths
   *                                  to its generation promises
   */
  resolveDependency(dependency, builtFiles) {
    const file = dependency.asIfTo;
    const resultDir = path.dirname(path.resolve(this.pageConfig.resultPath,
                                                path.relative(this.pageConfig.sourcePath, file)));
    const resultPath = path.join(resultDir, FsUtil.setExtension(path.basename(file), '._include_.html'));

    // Return existing generation promise if any, otherwise create a new one
    builtFiles[resultPath] = builtFiles[resultPath] || new Promise((resolve, reject) => {
      /**
       * @type {FileConfig}
       */
      const fileConfig = {
        baseUrlMap: this.pageConfig.baseUrlMap,
        baseUrl: this.pageConfig.baseUrl,
        rootPath: this.pageConfig.rootPath,
        headerIdMap: {},
      };
      const pageSources = new PageSources();
      const componentPreprocessor = new ComponentPreprocessor(fileConfig, this.pageConfig.variableProcessor,
                                                              pageSources);
      const componentParser = new ComponentParser(fileConfig);

      return fs.readFile(dependency.to, 'utf-8')
        .then(result => this.pageConfig.variableProcessor.renderPage(dependency.to, result, pageSources))
        .then(result => componentPreprocessor.includeFile(dependency.to, result, file))
        .then(result => Page.removeFrontMatter(result))
        .then(result => this.collectPluginSources(result))
        .then(result => this.preRender(result))
        .then(result => componentParser.render(dependency.to, result, file))
        .then(result => this.postRender(result))
        .then(result => this.collectPluginsAssets(result))
        .then(result => Page.unwrapIncludeSrc(result))
        .then((result) => {
          const outputContentHTML = this.pageConfig.disableHtmlBeautify
            ? result
            : htmlBeautify(result, Page.htmlBeautifyOptions);
          return fs.outputFile(resultPath, outputContentHTML);
        })
        .then(() => {
          // Recursion call to resolve nested dependency
          const resolvingFiles = [];
          Page.unique(pageSources.getDynamicIncludeSrc()).forEach((src) => {
            if (!FsUtil.isUrl(src.to)) {
              resolvingFiles.push(this.resolveDependency(src, builtFiles));
            }
          });
          return Promise.all(resolvingFiles);
        })
        .then(() => {
          this.collectIncludedFiles(pageSources.getDynamicIncludeSrc());
          this.collectIncludedFiles(pageSources.getStaticIncludeSrc());
          this.collectIncludedFiles(pageSources.getMissingIncludeSrc());
        })
        .then(resolve)
        .catch(reject);
    });

    return builtFiles[resultPath];
  }

  static addContentWrapper(pageData) {
    const $ = cheerio.load(pageData);
    $(`#${CONTENT_WRAPPER_ID}`).removeAttr('id');
    return `<div id="${CONTENT_WRAPPER_ID}">\n\n${$.html()}\n</div>`;
  }

  static addScrollToTopButton(pageData) {
    const button = '<i class="fa fa-arrow-circle-up fa-lg" id="scroll-top-button" '
    + 'onclick="handleScrollTop()" aria-hidden="true"/>';
    return `${pageData}\n${button}`;
  }

  static removePageHeaderAndFooter(pageData) {
    const $ = cheerio.load(pageData);
    const pageHeaderAndFooter = $('header', 'footer');
    if (pageHeaderAndFooter.length === 0) {
      return pageData;
    }
    // Remove preceding footers
    pageHeaderAndFooter.remove();
    return $.html();
  }

  static unwrapIncludeSrc(html) {
    const $ = cheerio.load(html);
    // TODO combine {@link ComponentPreprocessor} and {@link ComponentParser} processes so we don't need this
    $('div[data-included-from], span[data-included-from]').each(function () {
      $(this).replaceWith($(this).contents());
    });
    return $.html();
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

  static unique(array) {
    return [...new Set(array)];
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
