import path from 'path';
import cheerio from 'cheerio';
import htmlparser, { DomElement } from 'htmlparser2';
import Promise from 'bluebird';
import isArray from 'lodash/isArray';
import has from 'lodash/has';

import { ATTRIB_CWF } from '../constants';
import { Context } from './Context';
import { createErrorNode } from './elements';
import { PageSources } from '../Page/PageSources';
import { isMarkdownFileExt } from '../utils/fsUtil';
import * as logger from '../utils/logger';
import VariableProcessor from '../variables/VariableProcessor';

const fm = require('fastmatter');

const _ = {
  isArray,
  has,
};

// Load our htmlparser2 patch for supporting "special" tags
require('../patches/htmlparser2');

const { PageNavProcessor, renderSiteNav, addSitePageNavPortal } = require('./siteAndPageNavProcessor');
const { processInclude, processPanelSrc, processPopoverSrc } = require('./includePanelProcessor');
const linkProcessor = require('./linkProcessor');
const { highlightCodeBlock, setCodeLineNumbers } = require('./codeblockProcessor');
const { setHeadingId, assignPanelId } = require('./headerProcessor');
const { MarkdownProcessor } = require('./MarkdownProcessor');
const { FootnoteProcessor } = require('./FootnoteProcessor');
const { MdAttributeRenderer } = require('./MdAttributeRenderer');
const { shiftSlotNodeDeeper, transformOldSlotSyntax, renameSlot } = require('./vueSlotSyntaxProcessor');
const { warnConflictingAtributesMap, warnDeprecatedAtributesMap } = require('./warnings');
const { processScriptAndStyleTag } = require('./scriptAndStyleTagProcessor');

const FRONTMATTER_FENCE = '---';

cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

export class NodeProcessor {
  frontmatter: { [key: string]: string } = {};

  headTop: string[] = [];
  headBottom: string[] = [];
  scriptBottom: string[] = [];

  markdownProcessor: any;
  footnoteProcessor = new FootnoteProcessor();
  mdAttributeRenderer: any;
  pageNavProcessor = new PageNavProcessor();

  processedModals: { [id: string]: boolean } = {};

  constructor(
    private config: {
      baseUrl: string,
      baseUrlMap: Set<string>,
      rootPath: string,
      outputPath: string,
      ignore: string[],
      addressablePagesSource: string[],
      intrasiteLinkValidation: { enabled: boolean },
      codeLineNumbers: boolean,
      plantumlCheck: boolean,
      headerIdMap: {
        [id: string]: number,
      },
    },
    private pageSources: PageSources,
    private variableProcessor: VariableProcessor,
    private pluginManager: any,
    private siteLinkManager: any,
    private userScriptsAndStyles: string[] | undefined,
    docId = '',
  ) {
    this.markdownProcessor = new MarkdownProcessor(docId);
    this.mdAttributeRenderer = new MdAttributeRenderer(this.markdownProcessor);
  }

  /*
   * Private utility functions
   */

  static _trimNodes(node: DomElement) {
    if (node.name === 'pre' || node.name === 'code') {
      return;
    }
    if (node.children) {
      for (let n = 0; n < node.children.length; n += 1) {
        const child = node.children[n];
        if (child.type === 'comment'
          || (child.type === 'text' && n === node.children.length - 1 && !/\S/.test(child.data))) {
          node.children.splice(n, 1);
          n -= 1;
        } else if (child.type === 'tag') {
          NodeProcessor._trimNodes(child);
        }
      }
    }
  }

  static _isText(node: DomElement) {
    return node.type === 'text' || node.type === 'comment';
  }

  /*
   * Frontmatter collection
   */
  _processFrontmatter(node: DomElement, context: Context) {
    let currentFrontmatter = {};
    const frontmatter = cheerio(node);
    if (!context.processingOptions.omitFrontmatter && frontmatter.text().trim()) {
      // Retrieves the frontmatter from either the first frontmatter element
      // or from a frontmatter element that includes from another file
      // The latter case will result in the data being wrapped in a div
      const frontmatterIncludeDiv = frontmatter.find('div');
      const frontmatterData = frontmatterIncludeDiv.length
        ? ((frontmatterIncludeDiv[0] as DomElement).children as DomElement[])[0].data
        : ((frontmatter[0] as DomElement).children as DomElement[])[0].data;
      const frontmatterWrapped = `${FRONTMATTER_FENCE}\n${frontmatterData}\n${FRONTMATTER_FENCE}`;

      currentFrontmatter = fm(frontmatterWrapped).attributes;
    }

    this.frontmatter = {
      ...this.frontmatter,
      ...currentFrontmatter,
    };
    cheerio(node).remove();
  }

  /*
   * Layout element collection
   */

  private static collectLayoutEl(node: DomElement): string | null {
    const $ = cheerio(node);
    const html = $.html();
    $.remove();
    return html;
  }

  /**
   * Removes the node if modal id already exists, processes node otherwise
   */
  private processModal(node: DomElement) {
    if (node.attribs) {
      if (this.processedModals[node.attribs.id]) {
        cheerio(node).remove();
      } else {
        this.processedModals[node.attribs.id] = true;

        // Transform deprecated slot names; remove when deprecating
        renameSlot(node, 'modal-header', 'header');
        renameSlot(node, 'modal-footer', 'footer');

        this.mdAttributeRenderer.processModalAttributes(node);
      }
    }
  }

  /*
   * API
   */
  processNode(node: DomElement, context: Context) {
    try {
      if (!node.name || !node.attribs) {
        return node;
      }

      transformOldSlotSyntax(node);
      shiftSlotNodeDeeper(node);

      // log warnings for deprecated and conflicting attributes
      if (_.has(warnDeprecatedAtributesMap, node.name)) { warnDeprecatedAtributesMap[node.name](node); }
      if (_.has(warnConflictingAtributesMap, node.name)) { warnConflictingAtributesMap[node.name](node); }

      switch (node.name) {
      case 'frontmatter':
        this._processFrontmatter(node, context);
        break;
      case 'body':
        // eslint-disable-next-line no-console
        console.warn(`<body> tag found in ${node.attribs[ATTRIB_CWF]}. This may cause formatting errors.`);
        break;
      case 'include':
        this.markdownProcessor.docId += 1; // used in markdown-it-footnotes
        return processInclude(node, context, this.pageSources, this.variableProcessor,
                              (text: string) => this.markdownProcessor.renderMd(text),
                              (text: string) => this.markdownProcessor.renderMdInline(text),
                              this.config);
      case 'panel':
        this.mdAttributeRenderer.processPanelAttributes(node);
        return processPanelSrc(node, context, this.pageSources, this.config);
      case 'question':
        this.mdAttributeRenderer.processQuestion(node);
        break;
      case 'q-option':
        this.mdAttributeRenderer.processQOption(node);
        break;
      case 'quiz':
        this.mdAttributeRenderer.processQuiz(node);
        break;
      case 'popover':
        this.mdAttributeRenderer.processPopoverAttributes(node);
        return processPopoverSrc(node, context, this.pageSources, this.variableProcessor,
                                 (text: string) => this.markdownProcessor.renderMd(text), this.config);
      case 'tooltip':
        this.mdAttributeRenderer.processTooltip(node);
        break;
      case 'modal':
        this.processModal(node);
        break;
      case 'tab':
      case 'tab-group':
        this.mdAttributeRenderer.processTabAttributes(node);
        break;
      case 'box':
        this.mdAttributeRenderer.processBoxAttributes(node);
        break;
      case 'dropdown':
        this.mdAttributeRenderer.processDropdownAttributes(node);
        break;
      case 'thumbnail':
        this.mdAttributeRenderer.processThumbnailAttributes(node);
        break;
      case 'page-nav':
        this.pageNavProcessor.renderPageNav(node);
        break;
      case 'site-nav':
        renderSiteNav(node);
        break;
      case 'mb-temp-footnotes':
        this.footnoteProcessor.processMbTempFootnotes(node);
        break;
      case 'script':
      case 'style':
        processScriptAndStyleTag(node, this.userScriptsAndStyles);
        break;
      case 'code':
        setCodeLineNumbers(node, this.config.codeLineNumbers);
        // fall through
      case 'annotation': // Annotations are added automatically by KaTeX when rendering math formulae.
      case 'eq': // markdown-it-texmath html tag
      case 'eqn': // markdown-it-texmath html tag
      case 'thumb': // image
        /*
         * These are not components from MarkBind Vue components.
         * We have to add 'v-pre' to let Vue know to ignore this tag and not compile it.
         *
         * Although there won't be warnings if we use production Vue, it is still good to add this.
         */
        if (!_.has(node.attribs, 'v-pre')) { node.attribs['v-pre'] = ''; }
        break;
      default:
        break;
      }
    } catch (error) {
      logger.error(error);
    }

    return context;
  }

  postProcessNode(node: DomElement) {
    try {
      switch (node.name) {
      case 'pre':
        highlightCodeBlock(node);
        break;
      case 'panel':
        assignPanelId(node);
        break;
      case 'head-top': {
        const collected = NodeProcessor.collectLayoutEl(node);
        if (collected) {
          this.headTop.push(collected);
        }
        break;
      }
      case 'head-bottom': {
        const collected = NodeProcessor.collectLayoutEl(node);
        if (collected) {
          this.headBottom.push(collected);
        }
        break;
      }
      case 'script-bottom': {
        const collected = NodeProcessor.collectLayoutEl(node);
        if (collected) {
          this.scriptBottom.push(collected);
        }
        break;
      }
      default:
        break;
      }
    } catch (error) {
      logger.error(error);
    }

    if (node.attribs) {
      delete node.attribs[ATTRIB_CWF];
    }
  }

  private traverse(node: DomElement, context: Context): DomElement {
    if (NodeProcessor._isText(node)) {
      return node;
    }
    if (node.name) {
      node.name = node.name.toLowerCase();
    }
    if (linkProcessor.hasTagLink(node)) {
      linkProcessor.convertRelativeLinks(node, context.cwf, this.config.rootPath, this.config.baseUrl);
      linkProcessor.convertMdExtToHtmlExt(node);
      if (this.config.intrasiteLinkValidation.enabled) {
        this.siteLinkManager.collectIntraLinkToValidate(node, context.cwf);
      }
      linkProcessor.collectSource(node, this.config.rootPath, this.config.baseUrl, this.pageSources);
    }

    switch (node.name) {
    case 'md':
      node.name = 'span';
      cheerio(node).html(
        this.markdownProcessor.renderMdInline(cheerio.html(node.children as unknown as cheerio.Element)),
      );
      break;
    case 'markdown':
      node.name = 'div';
      cheerio(node).html(
        this.markdownProcessor.renderMd(cheerio.html(node.children as unknown as cheerio.Element)),
      );
      break;
    default:
      break;
    }

    // eslint-disable-next-line no-param-reassign
    context = this.processNode(node, context);
    this.pluginManager.processNode(node, this.config);

    if (node.children) {
      node.children.forEach((child) => {
        this.traverse(child, context);
      });
    }

    this.postProcessNode(node);

    addSitePageNavPortal(node);

    if (node.name) {
      const isHeadingTag = (/^h[1-6]$/).test(node.name);
      if (isHeadingTag && !node.attribs?.id) {
        setHeadingId(node, this.config);
      }

      // Generate dummy spans as anchor points for header[sticky]
      if (isHeadingTag && node.attribs?.id) {
        cheerio(node).prepend(`<span id="${node.attribs.id}" class="anchor"></span>`);
      }
    }

    this.pluginManager.postProcessNode(node, this.config);

    return node;
  }

  process(
    file: string,
    content: string,
    cwf: string = file,
    extraVariables: { [variableName: string]: string } = {},
  ) {
    const context = new Context(cwf, [], extraVariables, {});

    return new Promise((resolve, reject) => {
      const handler = new htmlparser.DomHandler((error, dom) => {
        if (error) {
          reject(error);
          return;
        }
        const mainHtmlNodes = dom.map((d) => {
          let processed;
          try {
            processed = this.traverse(d, context);
          } catch (err: any) {
            err.message += `\nError while rendering '${file}'`;
            logger.error(err);
            processed = createErrorNode(d, err);
          }
          return processed;
        });
        mainHtmlNodes.forEach(d => NodeProcessor._trimNodes(d));

        const footnotesHtml = this.footnoteProcessor.combineFootnotes((node: DomElement) => this.processNode(
          node, new Context(cwf, [], extraVariables, {}),
        ));
        const mainHtml = cheerio(mainHtmlNodes).html();
        const mainHtmlWithUniqPageNavUuid = this.pageNavProcessor.finalizePageNavUuid(
          mainHtml, mainHtmlNodes, footnotesHtml);

        resolve(mainHtmlWithUniqPageNavUuid + footnotesHtml);
      });
      const parser = new htmlparser.Parser(handler);
      const fileExt = path.extname(file);
      if (isMarkdownFileExt(fileExt)) {
        const renderedContent = this.markdownProcessor.renderMd(content);
        // Wrap with <root> as $.remove() does not work on top level nodes
        parser.parseComplete(`<root>${renderedContent}</root>`);
      } else if (fileExt === '.html') {
        parser.parseComplete(`<root>${content}</root>`);
      } else {
        const error = new Error(`Unsupported File Extension: '${fileExt}'`);
        reject(error);
      }
    });
  }
}
