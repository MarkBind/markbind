const cheerio = require('cheerio');
const fm = require('fastmatter');
const fs = require('fs-extra-promise');
const htmlBeautify = require('js-beautify').html;
const nunjucks = require('nunjucks');
const path = require('path');
const pathIsInside = require('path-is-inside');
const Promise = require('bluebird');

const FsUtil = require('./util/fsUtil');
const logger = require('./util/logger');
const MarkBind = require('./lib/markbind/src/parser');
const md = require('./lib/markbind/src/lib/markdown-it');

const FOOTERS_FOLDER_PATH = '_markbind/footers';
const HEAD_FOLDER_PATH = '_markbind/head';
const LAYOUT_DEFAULT_NAME = 'default';
const LAYOUT_FOLDER_PATH = '_markbind/layouts';
const LAYOUT_FOOTER = 'footer.md';
const LAYOUT_HEAD = 'head.md';
const LAYOUT_NAVIGATION = 'navigation.md';
const NAVIGATION_FOLDER_PATH = '_markbind/navigation';

const CONTENT_WRAPPER_ID = 'content-wrapper';
const FLEX_BODY_DIV_ID = 'flex-body';
const FLEX_DIV_HTML = '<div id="flex-div"></div>';
const FLEX_DIV_ID = 'flex-div';
const FRONT_MATTER_FENCE = '---';
const PAGE_CONTENT_ID = 'page-content';
const PAGE_NAV_CONENT_WRAPPER_ID = 'page-nav-content-wrapper';
const SITE_NAV_ID = 'site-nav';
const TITLE_PREFIX_SEPARATOR = ' - ';

const ANCHOR_HTML = '<a class="fa fa-anchor" href="#"></a>';
const DROPDOWN_BUTTON_ICON_HTML = '<i class="dropdown-btn-icon">\n'
  + '<span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span>\n'
  + '</i>';
const DROPDOWN_EXPAND_KEYWORD = ':expanded:';
const SITE_NAV_BUTTON_HTML = '<div id="site-nav-btn-wrap">\n'
  + '<div id="site-nav-btn">\n'
  + '<div class="menu-top-bar"></div>\n'
  + '<div class="menu-middle-bar"></div>\n'
  + '<div class="menu-bottom-bar"></div>\n'
  + '</div>\n'
  + '</div>';

cheerio.prototype.options.xmlMode = true; // Enable xml mode for self-closing tag
cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

function Page(pageConfig) {
  this.asset = pageConfig.asset;
  this.baseUrl = pageConfig.baseUrl;
  this.baseUrlMap = pageConfig.baseUrlMap;
  this.content = pageConfig.content || '';
  this.faviconUrl = pageConfig.faviconUrl;
  this.layout = pageConfig.layout;
  this.layoutsAssetPath = pageConfig.layoutsAssetPath;
  this.rootPath = pageConfig.rootPath;
  this.searchable = pageConfig.searchable;
  this.src = pageConfig.src;
  this.tags = pageConfig.tags;
  this.template = pageConfig.pageTemplate;
  this.title = pageConfig.title || '';
  this.titlePrefix = pageConfig.titlePrefix;
  this.userDefinedVariablesMap = pageConfig.userDefinedVariablesMap;

  // the source file for rendering this page
  this.sourcePath = pageConfig.sourcePath;
  // the temp path for writing intermediate result
  this.tempPath = pageConfig.tempPath;
  // the output path of this page
  this.resultPath = pageConfig.resultPath;

  this.frontMatter = {};
  this.headFileBottomContent = '';
  this.headFileTopContent = '';
  this.headings = {};
  this.headingIndexingLevel = pageConfig.headingIndexingLevel;
  this.includedFiles = {};
  this.keywords = {};
  this.navigableHeadings = {};
}

/**
 * Util Methods
 */

function addContentWrapper(pageData) {
  const $ = cheerio.load(pageData);
  $(`#${CONTENT_WRAPPER_ID}`).removeAttr('id');
  return `<div id="${CONTENT_WRAPPER_ID}">\n\n`
    + `${$.html()}\n`
    + '</div>';
}

function calculateNewBaseUrl(filePath, root, lookUp) {
  function calculate(file, result) {
    if (file === root || !pathIsInside(file, root)) {
      return undefined;
    }
    const parent = path.dirname(file);
    if (lookUp[parent] && result.length === 1) {
      return path.relative(root, result[0]);
    } else if (lookUp[parent]) {
      return calculate(parent, [parent]);
    }
    return calculate(parent, result);
  }

  return calculate(filePath, []);
}

function formatFooter(pageData) {
  const $ = cheerio.load(pageData);
  const footers = $('footer');
  if (footers.length === 0) {
    return pageData;
  }
  // Remove preceding footers
  footers.slice(0, -1).remove(); // footers.not(':last').remove();
  // Unwrap last footer
  const lastFooter = footers.last();
  const lastFooterParents = lastFooter.parents();
  if (lastFooterParents.length) {
    const lastFooterOutermostParent = lastFooterParents.last();
    lastFooterOutermostParent.after(lastFooter);
  }
  // Insert flex div before last footer
  if (lastFooter.prev().attr('id') !== FLEX_DIV_ID) {
    $(lastFooter).before(FLEX_DIV_HTML);
  }
  return $.html();
}

function formatSiteNav(renderedSiteNav, src) {
  const $ = cheerio.load(renderedSiteNav);
  const listItems = $.root().find('ul').first().children();
  if (listItems.length === 0) {
    return renderedSiteNav;
  }
  // Tidy up the style of the unordered list <ul>
  listItems.parent().attr('style', 'list-style-type: none; margin-left:-1em');

  // Set class of <a> to ${SITE_NAV_ID}__a to style links
  listItems.find('a[href]').addClass(`${SITE_NAV_ID}__a`);

  // Highlight current page
  const currentPageHtmlPath = src.replace(/\.(md|mbd)$/, '.html');
  listItems.find(`a[href='{{baseUrl}}/${currentPageHtmlPath}']`).addClass('current');

  listItems.each(function () {
    // Tidy up the style of each list item
    $(this).attr('style', 'margin-top: 10px');
    // Do not render dropdown menu for list items with <a> tag
    if ($(this).children('a').length) {
      const nestedList = $(this).children('ul').first();
      if (nestedList.length) {
        // Double wrap to counter replaceWith removing <li>
        nestedList.parent().wrap('<li style="margin-top:10px"></li>');
        // Recursively format nested lists without dropdown wrapper
        nestedList.parent().replaceWith(formatSiteNav(nestedList.parent().html(), src));
      }
    // Found nested list, render dropdown menu
    } else if ($(this).children('ul').length) {
      const nestedList = $(this).children('ul').first();
      const dropdownTitle = $(this).contents().not('ul');
      // Replace the title with the dropdown wrapper
      dropdownTitle.remove();
      // Check if dropdown is expanded by default or if the current page is in a dropdown
      const shouldExpandDropdown = dropdownTitle.toString().includes(DROPDOWN_EXPAND_KEYWORD)
        || Boolean(nestedList.find(`a[href='{{baseUrl}}/${currentPageHtmlPath}']`).text());
      if (shouldExpandDropdown) {
        const expandKeywordRegex = new RegExp(DROPDOWN_EXPAND_KEYWORD, 'g');
        const dropdownTitleWithoutKeyword = dropdownTitle.toString().replace(expandKeywordRegex, '');
        const rotatedIcon = cheerio.load(DROPDOWN_BUTTON_ICON_HTML, { xmlMode: false })('i')
          .addClass('rotate-icon');
        nestedList.wrap('<div class="dropdown-container dropdown-container-open"></div>');
        $(this).prepend('<button class="dropdown-btn dropdown-btn-open">'
          + `${dropdownTitleWithoutKeyword} `
          + `${rotatedIcon}\n`
          + '</button>');
      } else {
        nestedList.wrap('<div class="dropdown-container"></div>');
        $(this).prepend('<button class="dropdown-btn">'
          + `${dropdownTitle} `
          + `${DROPDOWN_BUTTON_ICON_HTML}\n`
          + '</button>');
      }
      // Recursively format nested lists
      nestedList.replaceWith(formatSiteNav(nestedList.parent().html(), src));
    }
  });
  return $.html();
}

/**
 * Generates a heading selector based on the indexing level
 * @param headingIndexingLevel to generate
 */
function generateHeadingSelector(headingIndexingLevel) {
  let headingsSelector = 'h1';
  for (let i = 2; i <= headingIndexingLevel; i += 1) {
    headingsSelector += `, h${i}`;
  }
  return headingsSelector;
}

function unique(array) {
  return array.filter((item, pos, self) => self.indexOf(item) === pos);
}

Page.prototype.prepareTemplateData = function () {
  const prefixedTitle = this.titlePrefix
    ? this.titlePrefix + (this.title ? TITLE_PREFIX_SEPARATOR + this.title : '')
    : this.title;

  return {
    asset: this.asset,
    baseUrl: this.baseUrl,
    content: this.content,
    faviconUrl: this.faviconUrl,
    headFileBottomContent: this.headFileBottomContent,
    headFileTopContent: this.headFileTopContent,
    pageNav: this.frontMatter.pageNav,
    siteNav: this.frontMatter.siteNav,
    title: prefixedTitle,
  };
};

/**
 * Gets the closest heading to an element
 * @param $ a Cheerio object
 * @param headingsSelector jQuery selector for selecting headings
 * @param element to find closest heading
 */
function getClosestHeading($, headingsSelector, element) {
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
  return getClosestHeading($, headingsSelector, $(element).parent());
}

/**
 * Checks if page.frontMatter has a valid page navigation specifier
 */
Page.prototype.isPageNavigationSpecifierValid = function () {
  const { pageNav } = this.frontMatter;
  return pageNav && (pageNav === 'default' || Number.isInteger(pageNav));
};

/**
 * Generates element selector for page navigation, depending on specifier in front matter
 */
Page.prototype.generateElementSelectorForPageNav = function (pageNav) {
  if (pageNav === 'default') {
    // Use specified navigation level or default in this.headingIndexingLevel
    return `${generateHeadingSelector(this.headingIndexingLevel)}, panel`;
  } else if (Number.isInteger(pageNav)) {
    return `${generateHeadingSelector(parseInt(pageNav, 10))}, panel`;
  }
  // Not a valid specifier
  return undefined;
};

/**
 * Collect headings outside of models and panels
 * @param content, html content of a page
 */
Page.prototype.collectNavigableHeadings = function (content) {
  const { pageNav } = this.frontMatter;
  const elementSelector = this.generateElementSelectorForPageNav(pageNav);
  if (elementSelector === undefined) {
    return;
  }
  const $ = cheerio.load(content);
  $('modal').remove();
  $(elementSelector).each((i, elem) => {
    // Check if heading or panel is already inside an unexpanded panel
    let isInsideUnexpandedPanel = false;
    $(elem).parents('panel').each((j, elemParent) => {
      if (elemParent.attribs.expanded === undefined) {
        isInsideUnexpandedPanel = true;
        return false;
      }
      return true;
    });
    if (isInsideUnexpandedPanel) {
      return;
    }
    if (elem.name === 'panel') {
      // Get heading from Panel header attribute
      if (elem.attribs.header) {
        this.collectNavigableHeadings(md.render(elem.attribs.header));
      }
    } else if ($(elem).attr('id') !== undefined) {
      // Headings already in content, with a valid ID
      this.navigableHeadings[$(elem).attr('id')] = {
        text: $(elem).text(),
        level: elem.name.replace('h', ''),
      };
    }
  });
};

/**
 * Records headings and keywords inside rendered page into this.headings and this.keywords respectively
 */
Page.prototype.collectHeadingsAndKeywords = function () {
  const $ = cheerio.load(fs.readFileSync(this.resultPath));
  // Re-initialise objects in the event of Site.regenerateAffectedPages
  this.headings = {};
  this.keywords = {};
  // Collect headings and keywords
  this.collectHeadingsAndKeywordsInContent($(`#${CONTENT_WRAPPER_ID}`).html(), null, false);
};

/**
 * Records headings and keywords inside content into this.headings and this.keywords respectively
 * @param content that contains the headings and keywords
 */
Page.prototype.collectHeadingsAndKeywordsInContent = function (content, lastHeading, excludeHeadings) {
  let $ = cheerio.load(content);
  const headingsSelector = generateHeadingSelector(this.headingIndexingLevel);
  $('modal').remove();
  $('panel').not('panel panel')
    .each((index, panel) => {
      if (panel.attribs.header) {
        this.collectHeadingsAndKeywordsInContent(md.render(panel.attribs.header),
                                                 lastHeading, excludeHeadings);
      }
    })
    .each((index, panel) => {
      const shouldExcludeHeadings = excludeHeadings || (panel.attribs.expanded === undefined);
      let closestHeading = getClosestHeading($, headingsSelector, panel);
      if (!closestHeading) {
        closestHeading = lastHeading;
      }
      if (panel.attribs.header) {
        const panelHeader = md.render(panel.attribs.header);
        if ($(panelHeader).is(headingsSelector)) {
          closestHeading = $(panelHeader);
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
        const includeRelativeToInnerDirPath = path.relative(buildInnerDir, includeAbsoluteToBuildRootDirPath);
        const includePath = path.resolve(resultInnerDir, includeRelativeToInnerDirPath);

        const includeContent = fs.readFileSync(includePath);
        if (panel.attribs.fragment) {
          $ = cheerio.load(includeContent);
          this.collectHeadingsAndKeywordsInContent($(`#${panel.attribs.fragment}`).html(),
                                                   closestHeading, shouldExcludeHeadings);
        } else {
          this.collectHeadingsAndKeywordsInContent(includeContent, closestHeading, shouldExcludeHeadings);
        }
      } else {
        this.collectHeadingsAndKeywordsInContent($(panel).html(), closestHeading, shouldExcludeHeadings);
      }
    });
  $ = cheerio.load(content);
  if (this.headingIndexingLevel > 0) {
    $('modal').remove();
    $('panel').remove();
    if (!excludeHeadings) {
      $(headingsSelector).each((i, heading) => {
        this.headings[$(heading).attr('id')] = $(heading).text();
      });
    }
    $('.keyword').each((i, keyword) => {
      let closestHeading = getClosestHeading($, headingsSelector, keyword);
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
};

/**
 * Links a keyword to a heading
 * @param $ a Cheerio object
 * @param keyword to link
 * @param heading to link
 */
Page.prototype.linkKeywordToHeading = function ($, keyword, heading) {
  const headingId = $(heading).attr('id');
  if (!(headingId in this.keywords)) {
    this.keywords[headingId] = [];
  }
  this.keywords[headingId].push($(keyword).text());
};

/**
 * Concatenates keywords in this.keywords to heading text in this.headings
 */
Page.prototype.concatenateHeadingsAndKeywords = function () {
  Object.keys(this.keywords).forEach((headingId) => {
    const keywordString = this.keywords[headingId].join(', ');
    this.headings[headingId] += ` | ${keywordString}`;
  });
};

/**
 * Filters out elements on the page based on config tags
 * @param tags to filter
 * @param content of the page
 */
Page.prototype.filterTags = function (tags, content) {
  if (tags === undefined) {
    return content;
  }
  const tagsArray = Array.isArray(tags) ? tags : [tags];
  const $ = cheerio.load(content, { xmlMode: false });
  $('[tags]').each((i, element) => {
    $(element).attr('hidden', true);
  });
  tagsArray.forEach((tag) => {
    $(`[tags~="${tag}"]`).each((i, element) => {
      $(element).removeAttr('hidden');
    });
  });
  $('[hidden]').remove();
  return $.html();
};

/**
 * Adds anchor links to headings in the page
 * @param content of the page
 */
Page.prototype.addAnchors = function (content) {
  const $ = cheerio.load(content, { xmlMode: false });
  if (this.headingIndexingLevel > 0) {
    const headingsSelector = generateHeadingSelector(this.headingIndexingLevel);
    $(headingsSelector).each((i, heading) => {
      $(heading).append(ANCHOR_HTML.replace('#', `#${$(heading).attr('id')}`));
    });
    $('panel[header]').each((i, panel) => {
      const panelHeading = cheerio.load(md.render(panel.attribs.header), { xmlMode: false });
      if (panelHeading(headingsSelector).length >= 1) {
        const headingId = $(panelHeading(headingsSelector)[0]).attr('id');
        const anchorIcon = ANCHOR_HTML.replace(/"/g, "'").replace('#', `#${headingId}`);
        $(panel).attr('header', `${$(panel).attr('header')}${anchorIcon}`);
      }
    });
  }
  return $.html();
};

/**
 * Records the dynamic or static included files into this.includedFiles
 * @param dependencies array of maps of the external dependency and where it is included
 */
Page.prototype.collectIncludedFiles = function (dependencies) {
  dependencies.forEach((dependency) => {
    this.includedFiles[dependency.to] = true;
  });
};

/**
 * Records the front matter into this.frontMatter
 * @param includedPage a page with its dependencies included
 */
Page.prototype.collectFrontMatter = function (includedPage) {
  const $ = cheerio.load(includedPage);
  const frontMatter = $('frontmatter');
  if (frontMatter.text().trim()) {
    // Retrieves the front matter from either the first frontmatter element
    // or from a frontmatter element that includes from another file
    // The latter case will result in the data being wrapped in a div
    const frontMatterData = frontMatter.find('div').length
      ? frontMatter.find('div')[0].children[0].data
      : frontMatter[0].children[0].data;
    const frontMatterWrapped = `${FRONT_MATTER_FENCE}\n${frontMatterData}\n${FRONT_MATTER_FENCE}`;
    // Parse front matter data
    const parsedData = fm(frontMatterWrapped);
    this.frontMatter = parsedData.attributes;
    this.frontMatter.src = this.src;
    // Title specified in site.json will override title specified in front matter
    this.frontMatter.title = (this.title || this.frontMatter.title || '');
    // Layout specified in site.json will override layout specified in the front matter
    this.frontMatter.layout = (this.layout || this.frontMatter.layout || LAYOUT_DEFAULT_NAME);
    // Included tags specified in site.json will override included tags specified in front matter
    this.frontMatter.tags = (this.tags || this.frontMatter.tags);
  } else {
    // Page is addressable but no front matter specified
    this.frontMatter = {
      src: this.src,
      title: this.title || '',
      layout: LAYOUT_DEFAULT_NAME,
    };
  }
  this.title = this.frontMatter.title;
};

/**
 * Removes the front matter from an included page
 * @param includedPage a page with its dependencies included
 */
Page.prototype.removeFrontMatter = function (includedPage) {
  const $ = cheerio.load(includedPage);
  const frontMatter = $('frontmatter');
  frontMatter.remove();
  return $.html();
};

/**
 * Inserts the footer specified in front matter to the end of the page
 * @param pageData a page with its front matter collected
 */
Page.prototype.insertFooter = function (pageData) {
  const { footer } = this.frontMatter;
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
  this.includedFiles[footerPath] = true;
  // Map variables
  const newBaseUrl = calculateNewBaseUrl(this.sourcePath, this.rootPath, this.baseUrlMap) || '';
  const userDefinedVariables = this.userDefinedVariablesMap[path.join(this.rootPath, newBaseUrl)];
  return `${pageData}\n${nunjucks.renderString(footerContent, userDefinedVariables)}`;
};

/**
 * Inserts a site navigation bar using the file specified in the front matter
 * @param pageData, a page with its front matter collected
 * @throws (Error) if there is more than one instance of the <navigation> tag
 */
Page.prototype.insertSiteNav = function (pageData) {
  const { siteNav } = this.frontMatter;
  let siteNavFile;
  if (siteNav) {
    siteNavFile = path.join(NAVIGATION_FOLDER_PATH, siteNav);
  } else {
    siteNavFile = path.join(LAYOUT_FOLDER_PATH, this.frontMatter.layout, LAYOUT_NAVIGATION);
  }
  // Retrieve Markdown file contents
  const siteNavPath = path.join(this.rootPath, siteNavFile);
  if (!fs.existsSync(siteNavPath)) {
    return pageData;
  }
  const siteNavContent = fs.readFileSync(siteNavPath, 'utf8');
  if (siteNavContent === '') {
    return pageData;
  }
  // Set siteNav file as an includedFile
  this.includedFiles[siteNavPath] = true;
  // Map variables
  const newBaseUrl = calculateNewBaseUrl(this.sourcePath, this.rootPath, this.baseUrlMap) || '';
  const userDefinedVariables = this.userDefinedVariablesMap[path.join(this.rootPath, newBaseUrl)];
  const siteNavMappedData = nunjucks.renderString(siteNavContent, userDefinedVariables);
  // Convert to HTML
  const siteNavDataSelector = cheerio.load(siteNavMappedData);
  if (siteNavDataSelector('navigation').length > 1) {
    throw new Error(`More than one <navigation> tag found in ${siteNavPath}`);
  } else if (siteNavDataSelector('navigation').length === 1) {
    const siteNavHtml = md.render(siteNavDataSelector('navigation').html().trim().replace(/\n\s*\n/g, '\n'));
    const formattedSiteNav = formatSiteNav(siteNavHtml, this.src);
    siteNavDataSelector('navigation').replaceWith(formattedSiteNav);
  }
  // Wrap sections
  const wrappedSiteNav = `<div id="${SITE_NAV_ID}">\n${siteNavDataSelector.html()}\n</div>`;
  const wrappedPageData = `<div id="${PAGE_CONTENT_ID}">\n${pageData}\n</div>`;

  return `<div id="${FLEX_BODY_DIV_ID}">`
    + `${wrappedSiteNav}`
    + `${SITE_NAV_BUTTON_HTML}`
    + `${wrappedPageData}`
    + '</div>';
};

/**
 *  Inserts wrapper for page nav contents CSS manipulation
 */
Page.prototype.insertPageNavWrapper = function (pageData) {
  if (this.isPageNavigationSpecifierValid()) {
    const wrappedPageData = `<div id="${PAGE_NAV_CONENT_WRAPPER_ID}">\n`
                            + `${pageData}\n`
                            + '</div>\n';
    return wrappedPageData;
  }
  return pageData;
};

/**
 *  Generates page navigation's heading list HTML
 *
 *  A stack is used to maintain proper indentation levels for the headings at different heading levels.
 */
Page.prototype.generatePageNavHeadingHtml = function () {
  let headingHTML = '';
  const headingStack = [];
  Object.keys(this.navigableHeadings).forEach((key) => {
    const currentHeadingLevel = this.navigableHeadings[key].level;
    const currentHeadingHTML = `<a class="nav-link py-1" href="#${key}">`
      + `${this.navigableHeadings[key].text}&#x200E;</a>\n`;
    const nestedHeadingHTML = '<nav class="nav nav-pills flex-column my-0"'
      + `style="margin-left: 5%; flex-wrap: nowrap;">\n${currentHeadingHTML}`;

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
};

/**
 * Generates page navigation's header if specified in this.frontMatter
 * @returns string string
 */
Page.prototype.generatePageNavTitleHtml = function () {
  const { pageNavTitle } = this.frontMatter;
  return pageNavTitle
    ? '<a class="navbar-brand" style="white-space: inherit; color: black" href="#">'
      + `${pageNavTitle.toString()}`
      + '</a>'
    : '';
};

/**
 *  Insert page navigation bar with headings up to headingIndexingLevel
 */
Page.prototype.insertPageNav = function () {
  if (this.isPageNavigationSpecifierValid()) {
    const $ = cheerio.load(this.content);
    this.navigableHeadings = {};
    this.collectNavigableHeadings($(`#${CONTENT_WRAPPER_ID}`).html());
    const pageNavHeadingHTML = this.generatePageNavHeadingHtml();
    const pageNavTitleHtml = this.generatePageNavTitleHtml();
    const pageNavHtml = '<nav id="page-nav" class="navbar navbar-light bg-transparent slim-scroll">\n'
      + `${pageNavTitleHtml}\n`
      + '  <nav class="nav nav-pills flex-column my-0 small" style="flex-wrap: nowrap;">\n'
      + `    ${pageNavHeadingHTML}\n`
      + '  </nav>\n'
      + '</nav>\n';
    this.content = htmlBeautify(`${pageNavHtml}\n${this.content}`, { indent_size: 2 });
  }
};

Page.prototype.collectHeadFiles = function (baseUrl, hostBaseUrl) {
  const { head } = this.frontMatter;
  let headFiles;
  const collectedTopContent = [];
  const collectedBottomContent = [];
  if (head) {
    headFiles = head.replace(/, */g, ',').split(',').map(headFile => path.join(HEAD_FOLDER_PATH, headFile));
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
    this.includedFiles[headFilePath] = true;
    // Map variables
    const newBaseUrl = calculateNewBaseUrl(this.sourcePath, this.rootPath, this.baseUrlMap) || '';
    const userDefinedVariables = this.userDefinedVariablesMap[path.join(this.rootPath, newBaseUrl)];
    const headFileMappedData = nunjucks.renderString(headFileContent, userDefinedVariables).trim();
    // Split top and bottom contents
    const $ = cheerio.load(headFileMappedData, { xmlMode: false });
    if ($('head-top').length) {
      collectedTopContent.push(nunjucks.renderString($('head-top').html(), { baseUrl, hostBaseUrl })
        .trim()
        .replace(/\n\s*\n/g, '\n')
        .replace(/\n/g, '\n    '));
      $('head-top').remove();
    }
    collectedBottomContent.push(nunjucks.renderString($.html(), { baseUrl, hostBaseUrl })
      .trim()
      .replace(/\n\s*\n/g, '\n')
      .replace(/\n/g, '\n    '));
  });
  this.headFileTopContent = collectedTopContent.join('\n    ');
  this.headFileBottomContent = collectedBottomContent.join('\n    ');
};

Page.prototype.generate = function (builtFiles) {
  this.includedFiles = {};
  this.includedFiles[this.sourcePath] = true;

  const markbinder = new MarkBind({
    errorHandler: logger.error,
  });
  const fileConfig = {
    baseUrlMap: this.baseUrlMap,
    rootPath: this.rootPath,
    userDefinedVariablesMap: this.userDefinedVariablesMap,
  };
  return new Promise((resolve, reject) => {
    markbinder.includeFile(this.sourcePath, fileConfig)
      .then((result) => {
        this.collectFrontMatter(result);
        return this.removeFrontMatter(result);
      })
      .then(result => addContentWrapper(result))
      .then(result => this.insertPageNavWrapper(result))
      .then(result => this.insertSiteNav((result)))
      .then(result => this.insertFooter(result)) // Footer has to be inserted last to ensure proper formatting
      .then(result => formatFooter(result))
      .then(result => markbinder.resolveBaseUrl(result, fileConfig))
      .then(result => fs.outputFileAsync(this.tempPath, result))
      .then(() => markbinder.renderFile(this.tempPath, fileConfig))
      .then(result => this.filterTags(this.frontMatter.tags, result))
      .then(result => this.addAnchors(result))
      .then((result) => {
        this.content = htmlBeautify(result, { indent_size: 2 });

        const newBaseUrl = calculateNewBaseUrl(this.sourcePath, this.rootPath, this.baseUrlMap);
        const baseUrl = newBaseUrl ? `${this.baseUrl}/${newBaseUrl}` : this.baseUrl;
        const hostBaseUrl = this.baseUrl;

        this.addLayoutFiles();
        this.collectHeadFiles(baseUrl, hostBaseUrl);
        this.content = nunjucks.renderString(this.content, { baseUrl, hostBaseUrl });
        this.insertPageNav();
        return fs.outputFileAsync(this.resultPath, this.template(this.prepareTemplateData()));
      })
      .then(() => {
        const resolvingFiles = [];
        unique(markbinder.getDynamicIncludeSrc()).forEach((source) => {
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
};

/**
 * Adds linked layout files to page assets
 */
Page.prototype.addLayoutFiles = function () {
  this.asset.layoutScript = path.join(this.layoutsAssetPath, this.frontMatter.layout, 'scripts.js');
  this.asset.layoutStyle = path.join(this.layoutsAssetPath, this.frontMatter.layout, 'styles.css');
};

/**
 * Pre-render an external dynamic dependency
 * Does not pre-render if file is already pre-rendered by another page during site generation
 * @param dependency a map of the external dependency and where it is included
 * @param builtFiles set of files already pre-rendered by another page
 */
Page.prototype.resolveDependency = function (dependency, builtFiles) {
  const source = dependency.from;
  const file = dependency.asIfTo;
  return new Promise((resolve, reject) => {
    const resultDir = path.dirname(path.resolve(this.resultPath, path.relative(this.sourcePath, file)));
    const resultPath = path.join(resultDir, FsUtil.setExtension(path.basename(file), '._include_.html'));

    if (builtFiles[resultPath]) {
      return resolve();
    }

    // eslint-disable-next-line no-param-reassign
    builtFiles[resultPath] = true;

    /*
     * We create a local instance of Markbind for an empty dynamicIncludeSrc
     * so that we only recursively rebuild the file's included content
     */
    const markbinder = new MarkBind({
      errorHandler: logger.error,
    });

    let tempPath;
    if (FsUtil.isInRoot(this.rootPath, file)) {
      tempPath = path.join(path.dirname(this.tempPath), path.relative(this.rootPath, file));
    } else {
      logger.info(`Converting dynamic external resource ${file} to ${resultPath}`);
      tempPath = path.join(path.dirname(this.tempPath), '.external', path.basename(file));
    }
    return markbinder.includeFile(dependency.to, {
      baseUrlMap: this.baseUrlMap,
      userDefinedVariablesMap: this.userDefinedVariablesMap,
      rootPath: this.rootPath,
      cwf: file,
    })
      .then(result => this.removeFrontMatter(result))
      .then(result => markbinder.resolveBaseUrl(result, {
        baseUrlMap: this.baseUrlMap,
        rootPath: this.rootPath,
        isDynamic: true,
        dynamicSource: source,
      }))
      .then(result => fs.outputFileAsync(tempPath, result))
      .then(() => markbinder.renderFile(tempPath, {
        baseUrlMap: this.baseUrlMap,
        rootPath: this.rootPath,
      }))
      .then((result) => {
        // resolve the site base url here
        const newBaseUrl = calculateNewBaseUrl(file, this.rootPath, this.baseUrlMap);
        const baseUrl = newBaseUrl ? `${this.baseUrl}/${newBaseUrl}` : this.baseUrl;
        const hostBaseUrl = this.baseUrl;

        const content = nunjucks.renderString(result, { baseUrl, hostBaseUrl });
        return fs.outputFileAsync(resultPath, htmlBeautify(content, { indent_size: 2 }));
      })
      .then(() => {
        // Recursion call to resolve nested dependency
        const resolvingFiles = [];
        unique(markbinder.getDynamicIncludeSrc()).forEach((src) => {
          if (!FsUtil.isUrl(src.to)) resolvingFiles.push(this.resolveDependency(src, builtFiles));
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
};

module.exports = Page;
