const cheerio = require('cheerio');
const fm = require('fastmatter');
const fs = require('fs-extra-promise');
const htmlBeautify = require('js-beautify').html;
const path = require('path');
const Promise = require('bluebird');
const njUtil = require('./lib/markbind/src/utils/nunjuckUtils');

const _ = {};
_.isString = require('lodash/isString');
_.isObject = require('lodash/isObject');
_.isArray = require('lodash/isArray');

const CyclicReferenceError = require('./lib/markbind/src/handlers/cyclicReferenceError.js');
const { ensurePosix } = require('./lib/markbind/src/utils');
const FsUtil = require('./util/fsUtil');
const logger = require('./util/logger');
const MarkBind = require('./lib/markbind/src/parser');
const md = require('./lib/markbind/src/lib/markdown-it');
const utils = require('./lib/markbind/src/utils');
const urlUtils = require('./lib/markbind/src/utils/urls');

const CLI_VERSION = require('../package.json').version;

const {
  FOOTERS_FOLDER_PATH,
  HEAD_FOLDER_PATH,
  HEADERS_FOLDER_PATH,
  LAYOUT_DEFAULT_NAME,
  LAYOUT_FOLDER_PATH,
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
  SITE_NAV_LIST_CLASS,
  TITLE_PREFIX_SEPARATOR,
  DROPDOWN_BUTTON_ICON_HTML,
  DROPDOWN_EXPAND_KEYWORD,
  TEMP_NAVBAR_CLASS,
  TEMP_DROPDOWN_CLASS,
  TEMP_DROPDOWN_PLACEHOLDER_CLASS,
} = require('./constants');

cheerio.prototype.options.xmlMode = true; // Enable xml mode for self-closing tag
cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

class Page {
  /**
   * A page configuration object.
   * @typedef {Object<string, any>} PageConfig
   * @property {Object<string, any>} asset
   * @property {string} baseUrl
   * @property {Set<string>} baseUrlMap the set of urls representing the sites' base directories
   * @property {string} content
   * @property {string} faviconUrl
   * @property {Object<string, any>} frontmatter
   * @property {string} layout
   * @property {string} layoutsAssetPath
   * @property {string} rootPath
   * @property {boolean} enableSearch
   * @property {boolean} globalOverride whether to globally overrides properties
   * in the front matter of all pages
   * @property {Array} plugins
   * @property {Object<string, Object<string, any>>} pluginsContext
   * @property {boolean} searchable whether to include this page in MarkBind's search functinality
   * @property {string} src source path of the page
   * @property {string} pageTemplate template used for this page
   * @property {string} title
   * @property {string} titlePrefix https://markbind.org/userGuide/siteConfiguration.html#titleprefix
   * @property {Object<string, any>} userDefinedVariablesMap
   * @property {string} sourcePath the source file for rendering this page
   * @property {string} tempPath the temp path for writing intermediate result
   * @property {string} resultPath the output path of this page
   * @property {number} headingIndexingLevel up to which level of headings will be used for searching index
   * (https://markbind.org/userGuide/siteConfiguration.html#headingindexinglevel)
   */

  /**
   * @param {PageConfig} pageConfig
   */
  constructor(pageConfig) {
    /**
     * @type {Object<string, any>}
     */
    this.asset = pageConfig.asset;
    /**
     * @type {string}
     */
    this.baseUrl = pageConfig.baseUrl;
    /**
     * @type {Set<string>} the set of urls representing the sites' base directories
     */
    this.baseUrlMap = pageConfig.baseUrlMap;
    /**
     * @type {string|string}
     */
    this.content = pageConfig.content || '';
    /**
     * @type {string}
     */
    this.faviconUrl = pageConfig.faviconUrl;
    /**
     * @type {Object<string, any>|{}}
     */
    this.frontmatterOverride = pageConfig.frontmatter || {};
    /**
     * @type {boolean}
     */
    this.disableHtmlBeautify = pageConfig.disableHtmlBeautify;
    /**
     * @type {string}
     */
    this.layout = pageConfig.layout;
    /**
     * @type {string}
     */
    this.layoutsAssetPath = pageConfig.layoutsAssetPath;
    /**
     * @type {string}
     */
    this.rootPath = pageConfig.rootPath;
    /**
     * @type {boolean}
     */
    this.enableSearch = pageConfig.enableSearch;
    /**
     * @type {boolean}
     */
    this.globalOverride = pageConfig.globalOverride;
    /**
     * Array of plugins used in this page.
     * @type {Array}
     */
    this.plugins = pageConfig.plugins;
    /**
     * @type {Object<string, Object<string, any>>}
     */
    this.pluginsContext = pageConfig.pluginsContext;
    /**
     * @type {boolean}
     */
    this.searchable = pageConfig.searchable;
    /**
     * @type {string}
     */
    this.src = pageConfig.src;
    /**
     * @type {string}
     */
    this.template = pageConfig.pageTemplate;
    /**
     * @type {string|string}
     */
    this.title = pageConfig.title || '';
    /**
     * @type {string}
     */
    this.titlePrefix = pageConfig.titlePrefix;
    /**
     * @type {Object<string, any>}
     */
    this.userDefinedVariablesMap = pageConfig.userDefinedVariablesMap;

    /**
     * The source file for rendering this page
     * @type {string}
     */
    this.sourcePath = pageConfig.sourcePath;
    /**
     * The output path of this page
     * @type {string}
     */
    this.resultPath = pageConfig.resultPath;

    /**
     * https://markbind.org/userGuide/tweakingThePageStructure.html#front-matter
     * @type {Object<string, any>}
     */
    this.frontMatter = {};
    /**
     * @type {string}
     */
    this.headFileBottomContent = '';
    /**
     * @type {string}
     */
    this.headFileTopContent = '';
    /**
     * @type {Object<string, string>}
     */
    this.headings = {};
    /**
     * https://markbind.org/userGuide/siteConfiguration.html#headingindexinglevel
     * @type {number}
     */
    this.headingIndexingLevel = pageConfig.headingIndexingLevel;
    /**
     * https://markbind.org/userGuide/reusingContents.html#includes
     * @type {Set<string>}
     */
    this.includedFiles = new Set();
    /**
     * https://markbind.org/userGuide/usingPlugins.html
     * @type {Set<string>}
     */
    this.pluginSourceFiles = new Set();
    /**
     * https://markbind.org/userGuide/makingTheSiteSearchable.html#keywords
     * @type {Object<string, Array>}
     */
    this.keywords = {};
    /**
     * An object storing the mapping from the navigable headings' id to an
     * object of {text: NAV_TEXT, level: NAV_LEVEL}.
     * @type {Object<string, Object>}
     */
    this.navigableHeadings = {};
    /**
     * A map from page section id to HTML content of that section.
     * @type {Object<string, string>}
     */
    this.pageSectionsHtml = {};
    /**
     * Related to generating unique IDs for headers, please refer to parser.js.
     * @type {Object<string, number>}
     */
    this.headerIdMap = {};

    /**
     * Flag to indicate whether this page has a site nav.
     * @type {boolean}
     */
    this.hasSiteNav = false;
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
   * @property {boolean} enableSearch
   * /

  /**
   * @returns {TemplateData} templateData
   */
  prepareTemplateData() {
    const prefixedTitle = this.titlePrefix
      ? this.titlePrefix + (this.title ? TITLE_PREFIX_SEPARATOR + this.title : '')
      : this.title;
    // construct temporary asset object with only POSIX-style paths
    const asset = {};
    Object.entries(this.asset)
      .forEach(([key, value]) => {
        asset[key] = _.isString(value) ? ensurePosix(value) : value;
      });
    return {
      asset,
      baseUrl: this.baseUrl,
      content: this.content,
      faviconUrl: this.faviconUrl,
      footerHtml: this.pageSectionsHtml.footer || '',
      headerHtml: this.pageSectionsHtml.header || '',
      headFileBottomContent: this.headFileBottomContent,
      headFileTopContent: this.headFileTopContent,
      markBindVersion: `MarkBind ${CLI_VERSION}`,
      pageNav: this.isPageNavigationSpecifierValid(),
      pageNavHtml: this.pageSectionsHtml[`#${PAGE_NAV_ID}`] || '',
      siteNav: this.hasSiteNav,
      siteNavHtml: this.pageSectionsHtml[`#${SITE_NAV_ID}`] || '',
      title: prefixedTitle,
      enableSearch: this.enableSearch,
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
      // Use specified navigation level or default in this.headingIndexingLevel
      return `${Page.generateHeadingSelector(this.headingIndexingLevel)}, panel`;
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
    $('modal').remove();
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
      const slotParents = $(elem).parentsUntil(context).filter('[slot="header"], [slot="_header"]').not(elem);
      const panelSlotParents = slotParents.parent('panel');
      if (panelSlotParents.length) {
        return;
      }

      if (elem.name === 'panel') {
        // Recurse only on the slot which has priority
        let headings = $(elem).children('[slot="header"]');
        headings = headings.length ? headings : $(elem).children('[slot="_header"]');
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
    const $ = cheerio.load(fs.readFileSync(this.resultPath));
    // Re-initialise objects in the event of Site.regenerateAffectedPages
    this.headings = {};
    this.keywords = {};
    // Collect headings and keywords
    this.collectHeadingsAndKeywordsInContent($(`#${CONTENT_WRAPPER_ID}`)
      .html(), null, false, []);
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
    const headingsSelector = Page.generateHeadingSelector(this.headingIndexingLevel);
    $('modal').remove();
    $('panel').not('panel panel')
      .each((index, panel) => {
        const slotHeader = $(panel).children('[slot="header"]');
        if (slotHeader.length) {
          this.collectHeadingsAndKeywordsInContent(slotHeader.html(),
                                                   lastHeading, excludeHeadings, sourceTraversalStack);
        } else {
          const headerAttr = $(panel).children('[slot="_header"]');
          if (headerAttr.length) {
            this.collectHeadingsAndKeywordsInContent(headerAttr.html(),
                                                     lastHeading, excludeHeadings, sourceTraversalStack);
          }
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
        } else {
          const attributeHeadings = $(panel).children('[slot="_header"]').find(':header');
          if (attributeHeadings.length) {
            closestHeading = attributeHeadings.first();
          }
        }
        if (panel.attribs.src) {
          const src = panel.attribs.src.split('#')[0];
          const buildInnerDir = path.dirname(this.sourcePath);
          const resultInnerDir = path.dirname(this.resultPath);
          const includeRelativeToBuildRootDirPath
            = this.baseUrl ? path.relative(this.baseUrl, src) : src.substring(1);
          const includeAbsoluteToBuildRootDirPath
            = path.resolve(this.rootPath, includeRelativeToBuildRootDirPath);
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
            this.collectHeadingsAndKeywordsInContent(
              $(`#${panel.attribs.fragment}`)
                .html(),
              closestHeading,
              shouldExcludeHeadings,
              childSourceTraversalStack);
          } else {
            this.collectHeadingsAndKeywordsInContent(
              includeContent,
              closestHeading,
              shouldExcludeHeadings,
              childSourceTraversalStack);
          }
        } else {
          this.collectHeadingsAndKeywordsInContent(
            $(panel)
              .html(),
            closestHeading,
            shouldExcludeHeadings,
            sourceTraversalStack);
        }
      });
    $ = cheerio.load(content);
    if (this.headingIndexingLevel > 0) {
      $('modal')
        .remove();
      $('panel')
        .remove();
      if (!excludeHeadings) {
        $(headingsSelector)
          .each((i, heading) => {
            this.headings[$(heading)
              .attr('id')] = $(heading)
              .text();
          });
      }
      $('.keyword')
        .each((i, keyword) => {
          let closestHeading = Page.getClosestHeading($, headingsSelector, keyword);
          if (excludeHeadings || !closestHeading) {
            if (!lastHeading) {
              logger.warn(`Missing heading for keyword: ${$(keyword)
                .text()}`);
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
    const headingId = $(heading)
      .attr('id');
    if (!(headingId in this.keywords)) {
      this.keywords[headingId] = [];
    }
    this.keywords[headingId].push($(keyword)
      .text());
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
    if (frontMatter.text()
      .trim()) {
      // Retrieves the front matter from either the first frontmatter element
      // or from a frontmatter element that includes from another file
      // The latter case will result in the data being wrapped in a div
      const frontMatterData = frontMatter.find('div').length
        ? frontMatter.find('div')[0].children[0].data
        : frontMatter[0].children[0].data;
      const frontMatterWrapped = `${FRONT_MATTER_FENCE}\n${frontMatterData}\n${FRONT_MATTER_FENCE}`;
      // Parse front matter data
      const parsedData = fm(frontMatterWrapped);
      this.frontMatter = { ...parsedData.attributes };
      this.frontMatter.src = this.src;
      // Title specified in site.json will override title specified in front matter
      this.frontMatter.title = (this.title || this.frontMatter.title || '');
      // Layout specified in site.json will override layout specified in the front matter
      this.frontMatter.layout = (this.layout || this.frontMatter.layout || LAYOUT_DEFAULT_NAME);
      this.frontMatter = { ...this.frontMatter, ...this.globalOverride, ...this.frontmatterOverride };
    } else {
      // Page is addressable but no front matter specified
      const defaultAttributes = {
        src: this.src,
        title: this.title || '',
        layout: LAYOUT_DEFAULT_NAME,
      };
      this.frontMatter = {
        ...defaultAttributes,
        ...this.globalOverride,
        ...this.frontmatterOverride,
      };
    }
    this.title = this.frontMatter.title;
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
   * Produces expressive layouts by inserting page data into pre-specified layout
   * @param pageData a page with its front matter collected
   * @param {FileConfig} fileConfig
   */
  generateExpressiveLayout(pageData, fileConfig) {
    const markbinder = new MarkBind({
      errorHandler: logger.error,
    });
    const template = {};
    template[LAYOUT_PAGE_BODY_VARIABLE] = pageData;
    const { layout } = this.frontMatter;
    const layoutPath = path.join(this.rootPath, LAYOUT_FOLDER_PATH, layout);
    const layoutPagePath = path.join(layoutPath, LAYOUT_PAGE);

    if (!fs.existsSync(layoutPagePath)) {
      return pageData;
    }
    const layoutFileConfig = {
      ...fileConfig,
      cwf: layoutPagePath,
      additionalVariables: {
      },
    };

    layoutFileConfig.additionalVariables[LAYOUT_PAGE_BODY_VARIABLE] = `{{${LAYOUT_PAGE_BODY_VARIABLE}}}`;

    // Set expressive layout file as an includedFile
    this.includedFiles.add(layoutPagePath);
    return new Promise((resolve, reject) => {
    // Retrieve Expressive Layouts page and insert content
      fs.readFileAsync(layoutPagePath, 'utf8')
        .then(result => markbinder.includeData(layoutPagePath, result, layoutFileConfig))
        .then(result => njUtil.renderRaw(result, template, {}, false))
        .then((result) => {
          this.collectIncludedFiles(markbinder.getDynamicIncludeSrc());
          this.collectIncludedFiles(markbinder.getStaticIncludeSrc());
          this.collectIncludedFiles(markbinder.getBoilerplateIncludeSrc());
          this.collectIncludedFiles(markbinder.getMissingIncludeSrc());
          return result;
        })
        .then(resolve)
        .catch(reject);
    });
  }


  /**
   * Inserts the page layout's header to the start of the page
   * @param pageData a page with its front matter collected
   */
  insertHeaderFile(pageData) {
    const { header } = this.frontMatter;
    if (header === FRONT_MATTER_NONE_ATTR) {
      return pageData;
    }

    let headerFile;
    if (header) {
      headerFile = path.join(HEADERS_FOLDER_PATH, header);
    } else {
      headerFile = path.join(LAYOUT_FOLDER_PATH, this.frontMatter.layout, LAYOUT_HEADER);
    }
    const headerPath = path.join(this.rootPath, headerFile);
    if (!fs.existsSync(headerPath)) {
      return pageData;
    }
    // Retrieve Markdown file contents
    const headerContent = fs.readFileSync(headerPath, 'utf8');
    // Set header file as an includedFile
    this.includedFiles.add(headerPath);
    // Map variables
    const parentSite = urlUtils.getParentSiteAbsolutePath(this.sourcePath, this.rootPath, this.baseUrlMap);
    const userDefinedVariables = this.userDefinedVariablesMap[parentSite];
    return `${njUtil.renderRaw(headerContent, userDefinedVariables)}\n${pageData}`;
  }

  /**
   * Inserts the footer specified in front matter to the end of the page
   * @param pageData a page with its front matter collected
   */
  insertFooterFile(pageData) {
    const { footer } = this.frontMatter;
    if (footer === FRONT_MATTER_NONE_ATTR) {
      return pageData;
    }

    let footerFile;
    if (footer) {
      footerFile = path.join(FOOTERS_FOLDER_PATH, footer);
    } else {
      footerFile = path.join(LAYOUT_FOLDER_PATH, this.frontMatter.layout, LAYOUT_FOOTER);
    }
    const footerPath = path.join(this.rootPath, footerFile);
    if (!fs.existsSync(footerPath)) {
      return pageData;
    }
    // Retrieve Markdown file contents
    const footerContent = fs.readFileSync(footerPath, 'utf8');
    // Set footer file as an includedFile
    this.includedFiles.add(footerPath);
    // Map variables
    const parentSite = urlUtils.getParentSiteAbsolutePath(this.sourcePath, this.rootPath, this.baseUrlMap);
    const userDefinedVariables = this.userDefinedVariablesMap[parentSite];
    return `${pageData}\n${njUtil.renderRaw(footerContent, userDefinedVariables)}`;
  }

  /**
   * Inserts a site navigation bar using the file specified in the front matter
   * @param pageData, a page with its front matter collected
   * @throws (Error) if there is more than one instance of the <navigation> tag
   */
  insertSiteNav(pageData) {
    const { siteNav } = this.frontMatter;
    if (siteNav === FRONT_MATTER_NONE_ATTR) {
      return pageData;
    }

    let siteNavFile;
    if (siteNav) {
      siteNavFile = path.join(NAVIGATION_FOLDER_PATH, siteNav);
    } else {
      siteNavFile = path.join(LAYOUT_FOLDER_PATH, this.frontMatter.layout, LAYOUT_NAVIGATION);
    }
    // Retrieve Markdown file contents
    const siteNavPath = path.join(this.rootPath, siteNavFile);
    if (!fs.existsSync(siteNavPath)) {
      this.hasSiteNav = false;
      return pageData;
    }
    const siteNavContent = fs.readFileSync(siteNavPath, 'utf8');
    if (siteNavContent === '') {
      this.hasSiteNav = false;
      return pageData;
    }
    this.hasSiteNav = true;
    // Set siteNav file as an includedFile
    this.includedFiles.add(siteNavPath);
    // Map variables
    const parentSite = urlUtils.getParentSiteAbsolutePath(this.sourcePath, this.rootPath, this.baseUrlMap);
    const userDefinedVariables = this.userDefinedVariablesMap[parentSite];
    const siteNavMappedData = njUtil.renderRaw(siteNavContent, userDefinedVariables);
    // Convert to HTML
    const siteNavDataSelector = cheerio.load(siteNavMappedData);
    if (siteNavDataSelector('navigation').length > 1) {
      throw new Error(`More than one <navigation> tag found in ${siteNavPath}`);
    } else if (siteNavDataSelector('navigation').length === 1) {
      const siteNavHtml
        = md.render(siteNavDataSelector('navigation')
          .html()
          .trim()
          .replace(/\n\s*\n/g, '\n'));
      // Add Bootstrap padding class to rendered unordered list
      const siteNavHtmlSelector = cheerio.load(siteNavHtml, { xmlMode: false });
      siteNavHtmlSelector('ul')
        .first()
        .addClass('px-0');
      siteNavHtmlSelector('ul ul')
        .addClass('pl-3');
      const formattedSiteNav = Page.formatSiteNav(siteNavHtmlSelector.html(), this.src);
      siteNavDataSelector('navigation')
        .replaceWith(formattedSiteNav);
    }
    // Wrap sections
    const wrappedSiteNav = `<nav id="${SITE_NAV_ID}" class="navbar navbar-light bg-transparent">\n`
      + '<div class="border-right-grey nav-inner position-sticky slim-scroll">'
      + `${siteNavDataSelector.html()}\n`
      + '</div>\n'
      + '</nav>';
    return `${wrappedSiteNav}\n`
      + `${pageData}`;
  }

  /**
   *  Generates page navigation's heading list HTML
   *
   *  A stack is used to maintain proper indentation levels for the headings at different heading levels.
   */
  generatePageNavHeadingHtml() {
    let headingHTML = '';
    const headingStack = [];
    Object.keys(this.navigableHeadings)
      .forEach((key) => {
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
      ? `<a class="navbar-brand ${PAGE_NAV_TITLE_CLASS}" href="#">`
      + `${pageNavTitle.toString()}`
      + '</a>'
      : '';
  }

  /**
   *  Builds page navigation bar with headings up to headingIndexingLevel
   */
  buildPageNav() {
    if (this.isPageNavigationSpecifierValid()) {
      const $ = cheerio.load(this.content, { xmlMode: false });
      this.navigableHeadings = {};
      this.collectNavigableHeadings($(`#${CONTENT_WRAPPER_ID}`)
        .html());
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

  collectHeadFiles(baseUrl, hostBaseUrl) {
    const { head } = this.frontMatter;
    if (head === FRONT_MATTER_NONE_ATTR) {
      this.headFileTopContent = '';
      this.headFileBottomContent = '';
      return;
    }

    let headFiles;
    const collectedTopContent = [];
    const collectedBottomContent = [];
    if (head) {
      headFiles = head.replace(/, */g, ',')
        .split(',')
        .map(headFile => path.join(HEAD_FOLDER_PATH, headFile));
    } else {
      headFiles = [path.join(LAYOUT_FOLDER_PATH, this.frontMatter.layout, LAYOUT_HEAD)];
    }
    headFiles.forEach((headFile) => {
      const headFilePath = path.join(this.rootPath, headFile);
      if (!fs.existsSync(headFilePath)) {
        return;
      }
      const headFileContent = fs.readFileSync(headFilePath, 'utf8');
      // Set head file as an includedFile
      this.includedFiles.add(headFilePath);
      // Map variables
      const parentSite = urlUtils.getParentSiteAbsolutePath(this.sourcePath, this.rootPath, this.baseUrlMap);
      const userDefinedVariables = this.userDefinedVariablesMap[parentSite];
      const headFileMappedData = njUtil.renderRaw(headFileContent, userDefinedVariables)
        .trim();
      // Split top and bottom contents
      const $ = cheerio.load(headFileMappedData, { xmlMode: false });
      if ($('head-top').length) {
        collectedTopContent.push(njUtil.renderRaw($('head-top')
          .html(), {
          baseUrl,
          hostBaseUrl,
        })
          .trim()
          .replace(/\n\s*\n/g, '\n')
          .replace(/\n/g, '\n    '));
        $('head-top')
          .remove();
      }
      collectedBottomContent.push(njUtil.renderRaw($.html(), {
        baseUrl,
        hostBaseUrl,
      })
        .trim()
        .replace(/\n\s*\n/g, '\n')
        .replace(/\n/g, '\n    '));
    });
    this.headFileTopContent = collectedTopContent.join('\n    ');
    this.headFileBottomContent = collectedBottomContent.join('\n    ');
  }

  static insertTemporaryStyles(pageData) {
    const $ = cheerio.load(pageData);
    // inject temporary navbar styles
    $('navbar')
      .addClass(TEMP_NAVBAR_CLASS);
    // inject temporary dropdown styles
    $('dropdown')
      .each((i, element) => {
        const attributes = element.attribs;
        // TODO remove attributes.text once text attribute is fully deprecated
        const placeholder = `<div>${attributes.header || attributes.text || ''}</div>`;
        $(element)
          .before(placeholder);
        $(element)
          .prev()
          .addClass(attributes.class)
          .addClass(TEMP_DROPDOWN_PLACEHOLDER_CLASS);
        $(element)
          .addClass(TEMP_DROPDOWN_CLASS);
      });
    return $.html();
  }

  collectPageSection(section) {
    const $ = cheerio.load(this.content, { xmlMode: false });
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
   * @property {Object<string, any>} userDefinedVariablesMap
   * @property {Object<string, number>} headerIdMap
   */

  generate(builtFiles) {
    this.includedFiles = new Set([this.sourcePath]);
    this.headerIdMap = {}; // Reset for live reload

    const markbinder = new MarkBind({
      errorHandler: logger.error,
    });
    /**
     * @type {FileConfig}
     */
    const fileConfig = {
      baseUrlMap: this.baseUrlMap,
      rootPath: this.rootPath,
      userDefinedVariablesMap: this.userDefinedVariablesMap,
      headerIdMap: this.headerIdMap,
    };
    return new Promise((resolve, reject) => {
      markbinder.includeFile(this.sourcePath, fileConfig)
        .then((result) => {
          this.collectFrontMatter(result);
          return Page.removeFrontMatter(result);
        })
        .then(result => this.generateExpressiveLayout(result, fileConfig))
        .then(result => Page.removePageHeaderAndFooter(result))
        .then(result => Page.addContentWrapper(result))
        .then(result => this.collectPluginSources(result))
        .then(result => this.preRender(result))
        .then(result => this.insertSiteNav((result)))
        .then(result => this.insertHeaderFile(result))
        .then(result => this.insertFooterFile(result))
        .then(result => Page.insertTemporaryStyles(result))
        .then(result => markbinder.resolveBaseUrl(result, fileConfig))
        .then(result => markbinder.render(result, this.sourcePath, fileConfig))
        .then(result => this.postRender(result))
        .then(result => this.collectPluginsAssets(result))
        .then(result => markbinder.processDynamicResources(this.sourcePath, result))
        .then(result => MarkBind.unwrapIncludeSrc(result))
        .then((result) => {
          this.content = result;

          const { relative } = urlUtils.getParentSiteAbsoluteAndRelativePaths(this.sourcePath, this.rootPath,
                                                                              this.baseUrlMap);
          const baseUrl = relative ? `${this.baseUrl}/${utils.ensurePosix(relative)}` : this.baseUrl;
          const hostBaseUrl = this.baseUrl;

          this.addLayoutFiles();
          this.collectHeadFiles(baseUrl, hostBaseUrl);

          this.content = njUtil.renderString(this.content, {
            baseUrl,
            hostBaseUrl,
          });

          this.collectAllPageSections();
          this.buildPageNav();

          const renderedTemplate = this.template.render(this.prepareTemplateData());
          const outputTemplateHTML = this.disableHtmlBeautify
            ? renderedTemplate
            : htmlBeautify(renderedTemplate, Page.htmlBeautifyOptions);

          return fs.outputFileAsync(this.resultPath, outputTemplateHTML);
        })
        .then(() => {
          const resolvingFiles = [];
          Page.unique(markbinder.getDynamicIncludeSrc())
            .forEach((source) => {
              if (!FsUtil.isUrl(source.to)) {
                resolvingFiles.push(this.resolveDependency(source, builtFiles));
              }
            });
          return Promise.all(resolvingFiles);
        })
        .then(() => {
          this.collectIncludedFiles(markbinder.getDynamicIncludeSrc());
          this.collectIncludedFiles(markbinder.getStaticIncludeSrc());
          this.collectIncludedFiles(markbinder.getBoilerplateIncludeSrc());
          this.collectIncludedFiles(markbinder.getMissingIncludeSrc());
        })
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * A plugin configuration object.
   * @typedef {Object<string, any>} PluginConfig
   * @property {number} headingIndexingLevel
   * @property {boolean} enableSearch
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
      headingIndexingLevel: this.headingIndexingLevel,
      enableSearch: this.enableSearch,
      searchable: this.searchable,
      rootPath: this.rootPath,
      sourcePath: this.sourcePath,
      includedFiles: this.includedFiles,
      resultPath: this.resultPath,
    };
  }

  /**
   * Collects file sources provided by plugins for the page for live reloading
   */
  collectPluginSources(content) {
    const self = this;

    Object.entries(self.plugins)
      .forEach(([pluginName, plugin]) => {
        if (!plugin.getSources) {
          return;
        }

        const result = plugin.getSources(content, self.pluginsContext[pluginName] || {},
                                         self.frontMatter, self.getPluginConfig());

        let pageContextSources;
        let domTagSourcesMap;

        if (_.isArray(result)) {
          pageContextSources = result;
        } else if (_.isObject(result)) {
          pageContextSources = result.sources;
          domTagSourcesMap = result.tagMap;
        } else {
          logger.warn(`${pluginName} returned unsupported type for ${self.sourcePath}`);
          return;
        }

        if (pageContextSources) {
          pageContextSources.forEach((src) => {
            if (src === undefined || src === '' || utils.isUrl(src)) {
              return;
            } else if (utils.isAbsolutePath(src)) {
              self.pluginSourceFiles.add(path.resolve(src));
              return;
            }

            // Resolve relative paths from the current page source
            const originalSrcFolder = path.dirname(self.sourcePath);
            const resolvedResourcePath = path.resolve(originalSrcFolder, src);

            self.pluginSourceFiles.add(resolvedResourcePath);
          });
        }

        if (domTagSourcesMap) {
          const $ = cheerio.load(content, { xmlMode: true });

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

                src = ensurePosix(src);
                if (src === '' || utils.isUrl(src)) {
                  return;
                } else if (utils.isAbsolutePath(src)) {
                  self.pluginSourceFiles.add(path.resolve(src));
                  return;
                }

                // Resolve relative paths from the include page source, or current page source otherwise
                const firstParent = elem.closest('div[data-included-from], span[data-included-from]');
                const originalSrc = firstParent.attr('data-included-from') || self.sourcePath;
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
    Object.entries(this.plugins)
      .forEach(([pluginName, plugin]) => {
        if (plugin.preRender) {
          preRenderedContent
            = plugin.preRender(preRenderedContent, this.pluginsContext[pluginName] || {},
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
    Object.entries(this.plugins)
      .forEach(([pluginName, plugin]) => {
        if (plugin.postRender) {
          postRenderedContent
            = plugin.postRender(
              postRenderedContent,
              this.pluginsContext[pluginName] || {}, this.frontMatter, this.getPluginConfig());
        }
      });
    return postRenderedContent;
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
    Object.entries(this.plugins)
      .forEach(([pluginName, plugin]) => {
        if (plugin.getLinks) {
          const pluginLinks
            = plugin.getLinks(content, this.pluginsContext[pluginName], this.frontMatter, linkUtils);
          links = links.concat(pluginLinks);
        }
        if (plugin.getScripts) {
          const pluginScripts
            = plugin.getScripts(content, this.pluginsContext[pluginName], this.frontMatter, scriptUtils);
          scripts = scripts.concat(pluginScripts);
        }
      });
    this.asset.pluginLinks = links;
    this.asset.pluginScripts = scripts;
    return content;
  }

  /**
   * Adds linked layout files to page assets
   */
  addLayoutFiles() {
    this.asset.layoutScript = path.join(this.layoutsAssetPath, this.frontMatter.layout, 'scripts.js');
    this.asset.layoutStyle = path.join(this.layoutsAssetPath, this.frontMatter.layout, 'styles.css');
  }

  /**
   * Pre-render an external dynamic dependency
   * Does not pre-render if file is already pre-rendered by another page during site generation
   * @param dependency a map of the external dependency and where it is included
   * @param builtFiles set of files already pre-rendered by another page
   */
  resolveDependency(dependency, builtFiles) {
    const file = dependency.asIfTo;
    return new Promise((resolve, reject) => {
      const resultDir = path.dirname(path.resolve(this.resultPath, path.relative(this.sourcePath, file)));
      const resultPath = path.join(resultDir, FsUtil.setExtension(path.basename(file), '._include_.html'));
      if (builtFiles.has(resultPath)) {
        return resolve();
      }
      builtFiles.add(resultPath);
      /*
       * We create a local instance of Markbind for an empty dynamicIncludeSrc
       * so that we only recursively rebuild the file's included content
       */
      const markbinder = new MarkBind({
        errorHandler: logger.error,
      });
      return markbinder.includeFile(dependency.to, {
        baseUrlMap: this.baseUrlMap,
        userDefinedVariablesMap: this.userDefinedVariablesMap,
        rootPath: this.rootPath,
        cwf: file,
      })
        .then(result => Page.removeFrontMatter(result))
        .then(result => this.collectPluginSources(result))
        .then(result => this.preRender(result))
        .then(result => markbinder.resolveBaseUrl(result, {
          baseUrlMap: this.baseUrlMap,
          rootPath: this.rootPath,
        }))
        .then(result => markbinder.render(result, this.sourcePath, {
          baseUrlMap: this.baseUrlMap,
          rootPath: this.rootPath,
          headerIdMap: {},
        }))
        .then(result => this.postRender(result))
        .then(result => this.collectPluginsAssets(result))
        .then(result => markbinder.processDynamicResources(file, result))
        .then(result => MarkBind.unwrapIncludeSrc(result))
        .then((result) => {
          // resolve the site base url here
          const { relative } = urlUtils.getParentSiteAbsoluteAndRelativePaths(file, this.rootPath,
                                                                              this.baseUrlMap);
          const baseUrl = relative ? `${this.baseUrl}/${utils.ensurePosix(relative)}` : this.baseUrl;
          const hostBaseUrl = this.baseUrl;
          const content = njUtil.renderString(result, {
            baseUrl,
            hostBaseUrl,
          });
          const outputContentHTML = this.disableHtmlBeautify
            ? content
            : htmlBeautify(content, Page.htmlBeautifyOptions);
          return fs.outputFileAsync(resultPath, outputContentHTML);
        })
        .then(() => {
          // Recursion call to resolve nested dependency
          const resolvingFiles = [];
          Page.unique(markbinder.getDynamicIncludeSrc())
            .forEach((src) => {
              if (!FsUtil.isUrl(src.to)) {
                resolvingFiles.push(this.resolveDependency(src, builtFiles));
              }
            });
          return Promise.all(resolvingFiles);
        })
        .then(() => {
          this.collectIncludedFiles(markbinder.getDynamicIncludeSrc());
          this.collectIncludedFiles(markbinder.getStaticIncludeSrc());
          this.collectIncludedFiles(markbinder.getBoilerplateIncludeSrc());
          this.collectIncludedFiles(markbinder.getMissingIncludeSrc());
        })
        .then(resolve)
        .catch(reject);
    });
  }

  static addContentWrapper(pageData) {
    const $ = cheerio.load(pageData);
    $(`#${CONTENT_WRAPPER_ID}`)
      .removeAttr('id');
    return `<div id="${CONTENT_WRAPPER_ID}">\n\n`
      + `${$.html()}\n`
      + '</div>';
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

  static formatSiteNav(renderedSiteNav, src) {
    const $ = cheerio.load(renderedSiteNav);
    const listItems = $.root()
      .find('ul')
      .first()
      .children();
    if (listItems.length === 0) {
      return renderedSiteNav;
    }
    // Tidy up the style of the unordered list <ul>
    listItems.parent()
      .addClass(`${SITE_NAV_LIST_CLASS}`);

    // Set class of <a> to ${SITE_NAV_ID}__a to style links
    listItems.find('a[href]')
      .addClass(`${SITE_NAV_ID}__a`);

    // Highlight current page
    const currentPageHtmlPath = src.replace(/\.(md|mbd)$/, '.html');
    listItems.find(`a[href='{{baseUrl}}/${currentPageHtmlPath}']`)
      .addClass('current');

    listItems.each(function () {
      // Tidy up the style of each list item
      $(this)
        .addClass('mt-2');
      // Do not render dropdown menu for list items with <a> tag
      if ($(this)
        .children('a').length) {
        const nestedList = $(this)
          .children('ul')
          .first();
        if (nestedList.length) {
          // Double wrap to counter replaceWith removing <li>
          nestedList.parent()
            .wrap('<li class="mt-2"></li>');
          // Recursively format nested lists without dropdown wrapper
          nestedList.parent()
            .replaceWith(Page.formatSiteNav(nestedList.parent()
              .html(), src));
        }
        // Found nested list, render dropdown menu
      } else if ($(this)
        .children('ul').length) {
        const nestedList = $(this)
          .children('ul')
          .first();
        const dropdownTitle = $(this)
          .contents()
          .not('ul');
        // Replace the title with the dropdown wrapper
        dropdownTitle.remove();
        // Check if dropdown is expanded by default or if the current page is in a dropdown
        const shouldExpandDropdown = dropdownTitle.toString()
          .includes(DROPDOWN_EXPAND_KEYWORD)
          || Boolean(nestedList.find(`a[href='{{baseUrl}}/${currentPageHtmlPath}']`)
            .text());
        if (shouldExpandDropdown) {
          const expandKeywordRegex = new RegExp(DROPDOWN_EXPAND_KEYWORD, 'g');
          const dropdownTitleWithoutKeyword = dropdownTitle.toString()
            .replace(expandKeywordRegex, '');
          const rotatedIcon = cheerio.load(DROPDOWN_BUTTON_ICON_HTML, { xmlMode: false })('i')
            .addClass('rotate-icon');
          nestedList.wrap('<div class="dropdown-container dropdown-container-open"></div>');
          $(this)
            .prepend('<button class="dropdown-btn dropdown-btn-open">'
              + `${dropdownTitleWithoutKeyword} `
              + `${rotatedIcon}\n`
              + '</button>');
        } else {
          nestedList.wrap('<div class="dropdown-container"></div>');
          $(this)
            .prepend('<button class="dropdown-btn">'
              + `${dropdownTitle} `
              + `${DROPDOWN_BUTTON_ICON_HTML}\n`
              + '</button>');
        }
        // Recursively format nested lists
        nestedList.replaceWith(Page.formatSiteNav(nestedList.parent()
          .html(), src));
      }
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
    const prevElements = $(element)
      .prevAll();
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
    if ($(element)
      .parent().length === 0) {
      return null;
    }
    return Page.getClosestHeading($, headingsSelector, $(element)
      .parent());
  }
}

module.exports = Page;
