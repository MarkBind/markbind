import { v4 as uuidv4 } from 'uuid';
import cheerio from 'cheerio';
import {
  MbNode, NodeOrText, parseHTML, TextElement,
} from '../utils/node';
import md from '../lib/markdown-it';

require('../patches/htmlparser2');

const SITE_NAV_ID = 'site-nav';
const SITE_NAV_EMPTY_LINE_REGEX = /\r?\n\s*\r?\n/g;

const SITE_NAV_LIST_ITEM_CLASS = 'site-nav-list-item';
const SITE_NAV_LIST_CLASS = 'site-nav-list';
const SITE_NAV_LIST_CLASS_ROOT = 'site-nav-list-root';

const SITE_NAV_DEFAULT_LIST_ITEM_CLASS = 'site-nav-default-list-item';
const SITE_NAV_CUSTOM_LIST_ITEM_CLASS = 'site-nav-custom-list-item';

const SITE_NAV_DROPDOWN_EXPAND_KEYWORD_REGEX = /:expanded:/g;
const SITE_NAV_DROPDOWN_ICON_HTML = '<div class="site-nav-dropdown-btn-container">'
  + '<i class="site-nav-dropdown-btn-icon" '
  + 'onclick="handleSiteNavClick(this.parentNode.parentNode, false); event.stopPropagation();">\n'
  + '<span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span>\n'
  + '</i></div>';
const SITE_NAV_DROPDOWN_ICON_ROTATED_HTML = '<div class="site-nav-dropdown-btn-container">'
  + '<i class="site-nav-dropdown-btn-icon site-nav-rotate-icon" '
  + 'onclick="handleSiteNavClick(this.parentNode.parentNode, false); event.stopPropagation();">\n'
  + '<span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span>\n'
  + '</i></div>';

/**
 * Replaces and stores a uuid identifier to the only page-nav element, if there is one.
 *
 * The page-nav can only be used inside a layout,
 * but can be constructed only after the page has been built.
 * Hence, this requires post insertion of the page nav.
 *
 * This uuid identifier is asserted to be unique in the html file once html processing is done,
 * otherwise it is replaced with one until it is unique.
 */
export class PageNavProcessor {
  uuidTextNode?: TextElement;

  getUuid() {
    return (this.uuidTextNode && this.uuidTextNode.data) || '';
  }

  renderPageNav(node: MbNode) {
    [this.uuidTextNode] = parseHTML(uuidv4());
    cheerio(node).replaceWith(this.uuidTextNode as cheerio.Element);
  }

  finalizePageNavUuid(mainHtml: string | null, mainHtmlNodes: NodeOrText[], footnotesHtml: string) {
    if (!this.uuidTextNode) {
      return mainHtml;
    }

    let mainHtmlString = mainHtml;
    let numMatches;
    do {
      const pageNavUuidRegex = new RegExp(this.uuidTextNode.data, 'g');
      const mainHtmlMatch = mainHtmlString ? mainHtmlString.match(pageNavUuidRegex) : [];
      const footnotesMatch = footnotesHtml.match(pageNavUuidRegex);
      numMatches = (mainHtmlMatch ? mainHtmlMatch.length : 0) + (footnotesMatch ? footnotesMatch.length : 0);

      if (numMatches > 1) {
        this.uuidTextNode.data = uuidv4();
        mainHtmlString = cheerio(mainHtmlNodes).html();
      }
    } while (numMatches > 1);

    return mainHtmlString;
  }

  static transformPrintContainer(node: MbNode) {
    node.attribs.class = 'page-nav-print d-none d-print-block';
    node.attribs['v-pre'] = '';
    node.name = 'div';
  }
}

export function renderSiteNav(node: MbNode) {
  const $original = cheerio(node);
  const siteNavText = $original.text().trim();
  if (siteNavText === '') {
    return;
  }

  // collapse into tight list
  const siteNavHtml = md.render(siteNavText.replace(SITE_NAV_EMPTY_LINE_REGEX, '\n'));
  const $ = cheerio.load(siteNavHtml);

  $('ul').each((_i1, ulElem) => {
    const nestingLevel = $(ulElem).parents('ul').length;
    $(ulElem).addClass(SITE_NAV_LIST_CLASS);
    if (nestingLevel === 0) {
      $(ulElem).attr('mb-site-nav', 'true');
      $(ulElem).addClass(SITE_NAV_LIST_CLASS_ROOT);
    }
    const listItemLevelClass = `${SITE_NAV_LIST_ITEM_CLASS}-${nestingLevel}`;
    const defaultListItemClass = `${SITE_NAV_DEFAULT_LIST_ITEM_CLASS} ${listItemLevelClass}`;
    const customListItemClasses = `${SITE_NAV_CUSTOM_LIST_ITEM_CLASS} ${listItemLevelClass}`;

    $(ulElem).children('li').each((_i2, liElem) => {
      const nestedLists = $(liElem).children('ul');
      const nestedAnchors = $(liElem).children('a');
      if (nestedLists.length === 0 && nestedAnchors.length === 0) {
        $(liElem).addClass(customListItemClasses);
        return;
      }

      const listItemContent = $(liElem).contents().not('ul');
      const listItemContentHtml = $.html(listItemContent);
      listItemContent.remove();
      $(liElem).prepend(`<div class="${defaultListItemClass}" onclick="handleSiteNavClick(this)">`
        + `${listItemContentHtml}</div>`);
      if (nestedLists.length === 0) {
        return;
      }

      // Found nested list, render dropdown menu
      const listItemParent = $(liElem).children().first();

      const hasExpandedKeyword = SITE_NAV_DROPDOWN_EXPAND_KEYWORD_REGEX.test(listItemContentHtml);
      if (hasExpandedKeyword) {
        nestedLists.addClass('site-nav-dropdown-container site-nav-dropdown-container-open');
        listItemParent.html(listItemContentHtml.replace(SITE_NAV_DROPDOWN_EXPAND_KEYWORD_REGEX, ''));
        listItemParent.append(SITE_NAV_DROPDOWN_ICON_ROTATED_HTML);
      } else {
        nestedLists.addClass('site-nav-dropdown-container');
        listItemParent.append(SITE_NAV_DROPDOWN_ICON_HTML);
      }
    });
  });

  $original.empty();
  $original.append($.root());
}

function addOverlayPortalSource(node: MbNode, to: string) {
  node.attribs['tag-name'] = node.name;
  node.attribs.to = to;
  node.name = 'overlay-source';
}

/**
 * Wrap id="site/page-nav", and the <site-nav> component with a <nav-portal> vue component.
 * This component portals said element into the mobile navbar menus as needed.
 */
export function addSitePageNavPortal(node: MbNode) {
  if (node.attribs.id === SITE_NAV_ID || node.attribs.id === 'page-nav') {
    addOverlayPortalSource(node, node.attribs.id);
  } else if (node.attribs['mb-site-nav']) {
    addOverlayPortalSource(node, 'mb-site-nav');
    delete node.attribs['mb-site-nav'];
  }
}
