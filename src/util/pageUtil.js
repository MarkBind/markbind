const pathIsInside = require('path-is-inside');
const cheerio = require('cheerio');
const path = require('path');

const {
  DROPDOWN_BUTTON_ICON_HTML,
  DROPDOWN_EXPAND_KEYWORD,
  SITE_NAV_LIST_CLASS,
  CONTENT_WRAPPER_ID,
  SITE_NAV_ID,
} = require('../constants');

module.exports = {
  addContentWrapper(pageData) {
    const $ = cheerio.load(pageData);
    $(`#${CONTENT_WRAPPER_ID}`).removeAttr('id');
    return `<div id="${CONTENT_WRAPPER_ID}">\n\n`
            + `${$.html()}\n`
            + '</div>';
  },

  calculateNewBaseUrl(filePath, root, lookUp) {
    function calculate(file, result) {
      if (file === root || !pathIsInside(file, root)) {
        return undefined;
      }
      const parent = path.dirname(file);
      if (lookUp.has(parent) && result.length === 1) {
        return path.relative(root, result[0]);
      } else if (lookUp.has(parent)) {
        return calculate(parent, [parent]);
      }
      return calculate(parent, result);
    }

    return calculate(filePath, []);
  },

  removePageHeaderAndFooter(pageData) {
    const $ = cheerio.load(pageData);
    const pageHeaderAndFooter = $('header', 'footer');
    if (pageHeaderAndFooter.length === 0) {
      return pageData;
    }
    // Remove preceding footers
    pageHeaderAndFooter.remove();
    return $.html();
  },

  formatSiteNav: function formatSiteNav(renderedSiteNav, src) {
    const $ = cheerio.load(renderedSiteNav);
    const listItems = $.root().find('ul').first().children();
    if (listItems.length === 0) {
      return renderedSiteNav;
    }
    // Tidy up the style of the unordered list <ul>
    listItems.parent().addClass(`${SITE_NAV_LIST_CLASS}`);

    // Set class of <a> to ${SITE_NAV_ID}__a to style links
    listItems.find('a[href]').addClass(`${SITE_NAV_ID}__a`);

    // Highlight current page
    const currentPageHtmlPath = src.replace(/\.(md|mbd)$/, '.html');
    listItems.find(`a[href='{{baseUrl}}/${currentPageHtmlPath}']`).addClass('current');

    listItems.each(function () {
      // Tidy up the style of each list item
      $(this).addClass('mt-2');
      // Do not render dropdown menu for list items with <a> tag
      if ($(this).children('a').length) {
        const nestedList = $(this).children('ul').first();
        if (nestedList.length) {
          // Double wrap to counter replaceWith removing <li>
          nestedList.parent().wrap('<li class="mt-2"></li>');
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
  },

  /**
         * Generates a selector for headings with level inside the headingIndexLevel
         * or with the index attribute, that do not also have the noindex attribute
         * @param headingIndexingLevel to generate
         */
  generateHeadingSelector(headingIndexingLevel) {
    let headingsSelectors = ['.always-index:header', 'h1'];
    for (let i = 2; i <= headingIndexingLevel; i += 1) {
      headingsSelectors.push(`h${i}`);
    }
    headingsSelectors = headingsSelectors.map(selector => `${selector}:not(.no-index)`);
    return headingsSelectors.join(',');
  },

  unique(array) {
    return array.filter((item, pos, self) => self.indexOf(item) === pos);
  },


  /**
         * Gets the closest heading to an element
         * @param $ a Cheerio object
         * @param headingsSelector jQuery selector for selecting headings
         * @param element to find closest heading
         */
  getClosestHeading: function getClosestHeading($, headingsSelector, element) {
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
  },
};
