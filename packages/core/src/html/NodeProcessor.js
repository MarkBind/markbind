const path = require('path');

const cheerio = require('cheerio');
const htmlparser = require('htmlparser2'); require('../patches/htmlparser2');
const fm = require('fastmatter');
const Promise = require('bluebird');

const _ = {};
_.isArray = require('lodash/isArray');
_.cloneDeep = require('lodash/cloneDeep');
_.has = require('lodash/has');
_.find = require('lodash/find');

const { PageNavProcessor, renderSiteNav, addSitePageNavPortal } = require('./siteAndPageNavProcessor');
const { processInclude, processPanelSrc, processPopoverSrc } = require('./includePanelProcessor');
const { Context } = require('./Context');
const linkProcessor = require('./linkProcessor');
const { highlightCodeBlock, setCodeLineNumbers } = require('./codeblockProcessor');
const { setHeadingId, assignPanelId } = require('./headerProcessor');
const { MarkdownProcessor } = require('./MarkdownProcessor');
const { FootnoteProcessor } = require('./FootnoteProcessor');
const { MdAttributeRenderer } = require('./MdAttributeRenderer');
const { shiftSlotNodeDeeper, transformOldSlotSyntax, renameSlot } = require('./vueSlotSyntaxProcessor');
const { warnConflictingAtributesMap, warnDeprecatedAtributesMap } = require('./warnings');
const { processScriptAndStyleTag } = require('./scriptAndStyleTagProcessor');
const { createErrorNode } = require('./elements');

const fsUtil = require('../utils/fsUtil');
const logger = require('../utils/logger');

const { FRONT_MATTER_FENCE } = require('../Page/constants');

const {
  ATTRIB_CWF,
} = require('../constants');

cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

class NodeProcessor {
  constructor(config, pageSources, variableProcessor, pluginManager,
              siteLinkManager, userScriptsAndStyles, docId = '') {
    this.config = config;
    this.frontMatter = {};

    this.headTop = [];
    this.headBottom = [];
    this.scriptBottom = [];
    this.userScriptsAndStyles = userScriptsAndStyles;

    this.pageSources = pageSources;
    this.variableProcessor = variableProcessor;
    this.pluginManager = pluginManager;
    this.siteLinkManager = siteLinkManager;

    this.markdownProcessor = new MarkdownProcessor(docId);

    this.footnoteProcessor = new FootnoteProcessor();
    this.mdAttributeRenderer = new MdAttributeRenderer(this.markdownProcessor);
    this.pageNavProcessor = new PageNavProcessor();

    // this.coloursToSpanMap = new Map([
    //   ['#r#', '<span style="color: red;">'],
    //   ['#g#', '<span style="color: green;">'],
    //   ['#b#', '<span style="color: blue;">'],
    //   ['#c#', '<span style="color: cyan;">'],
    //   ['#m#', '<span style="color: magenta;">'],
    //   ['#y#', '<span style="color: yellow;">'],
    //   ['#k#', '<span style="color: black;">'],
    //   ['#w#', '<span style="color: white;">'],
    // ]);
  }

  /*
   * Private utility functions
   */

  static _trimNodes(node) {
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

  static _isText(node) {
    return node.type === 'text' || node.type === 'comment';
  }

  /*
   * FrontMatter collection
   */
  _processFrontMatter(node, context) {
    let currentFrontMatter = {};
    const frontMatter = cheerio(node);
    if (!context.processingOptions.omitFrontmatter && frontMatter.text().trim()) {
      // Retrieves the front matter from either the first frontmatter element
      // or from a frontmatter element that includes from another file
      // The latter case will result in the data being wrapped in a div
      const frontMatterData = frontMatter.find('div').length
        ? frontMatter.find('div')[0].children[0].data
        : frontMatter[0].children[0].data;
      const frontMatterWrapped = `${FRONT_MATTER_FENCE}\n${frontMatterData}\n${FRONT_MATTER_FENCE}`;

      currentFrontMatter = fm(frontMatterWrapped).attributes;
    }

    this.frontMatter = {
      ...this.frontMatter,
      ...currentFrontMatter,
    };
    cheerio(node).remove();
  }

  /*
   * Layout element collection
   */

  _collectLayoutEl(node, property) {
    const $ = cheerio(node);
    this[property].push($.html());
    $.remove();
  }

  /*
   * API
   */
  processNode(node, context) {
    try {
      transformOldSlotSyntax(node);
      shiftSlotNodeDeeper(node);

      // log warnings for deprecated and conflicting attributes
      if (_.has(warnDeprecatedAtributesMap, node.name)) { warnDeprecatedAtributesMap[node.name](node); }
      if (_.has(warnConflictingAtributesMap, node.name)) { warnConflictingAtributesMap[node.name](node); }

      switch (node.name) {
      case 'frontmatter':
        this._processFrontMatter(node, context);
        break;
      case 'body':
        console.warn(`<body> tag found in ${node.attribs[ATTRIB_CWF]}. This may cause formatting errors.`);
        break;
      case 'include':
        this.markdownProcessor.docId += 1; // used in markdown-it-footnotes
        return processInclude(node, context, this.pageSources, this.variableProcessor,
                              text => this.markdownProcessor.renderMd(text),
                              text => this.markdownProcessor.renderMdInline(text),
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
                                 text => this.markdownProcessor.renderMd(text), this.config);
      case 'tooltip':
        this.mdAttributeRenderer.processTooltip(node);
        break;
      case 'modal':
        // Transform deprecated slot names; remove when deprecating
        renameSlot(node, 'modal-header', 'header');
        renameSlot(node, 'modal-footer', 'footer');

        this.mdAttributeRenderer.processModalAttributes(node);
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

  postProcessNode(node) {
    try {
      switch (node.name) {
      case 'pre':
        highlightCodeBlock(node);
        break;
      case 'panel':
        assignPanelId(node);
        break;
      case 'head-top':
        this._collectLayoutEl(node, 'headTop');
        break;
      case 'head-bottom':
        this._collectLayoutEl(node, 'headBottom');
        break;
      case 'script-bottom':
        this._collectLayoutEl(node, 'scriptBottom');
        break;
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

  _process(node, context) {
    if (_.isArray(node)) {
      return node.map(el => this._process(el, context));
    }
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
      node.children = cheerio.parseHTML(
        this.markdownProcessor.renderMdInline(cheerio.html(node.children)), true);
      break;
    case 'markdown':
      node.name = 'div';
      node.children = cheerio.parseHTML(
        this.markdownProcessor.renderMd(cheerio.html(node.children)), true);
      break;
    default:
      break;
    }

    // eslint-disable-next-line no-param-reassign
    context = this.processNode(node, context);
    this.pluginManager.processNode(node, this.config);

    if (node.children) {
      node.children.forEach((child) => {
        this._process(child, context);
      });
    }

    this.postProcessNode(node);

    addSitePageNavPortal(node);

    const isHeadingTag = (/^h[1-6]$/).test(node.name);
    if (isHeadingTag && !node.attribs.id) {
      setHeadingId(node, this.config);
    }

    // Generate dummy spans as anchor points for header[sticky]
    if (isHeadingTag && node.attribs.id) {
      cheerio(node).prepend(`<span id="${node.attribs.id}" class="anchor"></span>`);
    }

    this.pluginManager.postProcessNode(node, this.config);

    return node;
  }

  /*
   * Syntax is (space)#char#(any text)##(space)
   * If we have #char# without ## or ## without #char# we don't replace
   * To escape start do \#char#, so it will show up as #char# (escaping also works with any front char)
   * To escape end do \##, which will show up as ##
   */
  // preprocessMarkdown(content) {
  //   const lines = content.split('\n');
  //   if (lines.length === 0) { // For when content is empty
  //     return content;
  //   }

  //   let preprocessedContent = '';
  //   const syntaxStartLength = 3; // Since current start syntax is #char#
  //   const syntaxEndLength = -2; // Since current end syntax is ##, and we are looking for it from the back
  //   for (let i = 0; i < lines.length; i += 1) {
  //     const lineArray = lines[i].split(' ');
  //     const stack = [];
  //     for (let j = 0; j < lineArray.length; j += 1) {
  //       // Check for #char#
  //       const syntaxStartChecker = lineArray[j].slice(0, syntaxStartLength);
  //       if (this.coloursToSpanMap.has(syntaxStartChecker)) {
  //         stack.push(j);
  //       }

  //       // Check for ##
  //       const syntaxEndChecker = lineArray[j].slice(syntaxEndLength);
  //       if (syntaxEndChecker === '##') {
  //         // Check if the ## found is not escaped and has a corresponding syntax start
  //         if (lineArray[j].slice(syntaxEndLength - 1) !== '\\##' && stack.length !== 0) {
  //           // Replace syntax start with the span
  //           const syntaxStartPos = stack.pop();
  //           const colour = lineArray[syntaxStartPos].slice(0, syntaxStartLength);
  //           let syntaxStartReplacementLine = this.coloursToSpanMap.get(colour);
  //           syntaxStartReplacementLine += lineArray[syntaxStartPos].slice(syntaxStartLength);
  //           lineArray[syntaxStartPos] = syntaxStartReplacementLine;

  //           // Replace syntax end with the closing span
  //           let syntaxEndReplacementLine = lineArray[j].slice(0, syntaxEndLength);
  //           syntaxEndReplacementLine += '</span>';
  //           lineArray[j] = syntaxEndReplacementLine;
  //         }
  //       }
  //     }

  //     // Recreate the line with the lineArray
  //     let replacementLine = lineArray[0];
  //     for (let j = 1; j < lineArray.length; j += 1) {
  //       replacementLine += ' ';
  //       replacementLine += lineArray[j];
  //     }

  //     // Add this replacementLine to the amended content
  //     preprocessedContent += replacementLine;
  //     preprocessedContent += '\n';
  //   }

  //   preprocessedContent = preprocessedContent.slice(0, -1);

  //   return preprocessedContent;
  // }

  process(file, content, cwf = file, extraVariables = {}) {
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
            processed = this._process(d, context);
          } catch (err) {
            err.message += `\nError while rendering '${file}'`;
            logger.error(err);
            processed = createErrorNode(d, err);
          }
          return processed;
        });
        mainHtmlNodes.forEach(d => NodeProcessor._trimNodes(d));

        const footnotesHtml = this.footnoteProcessor.combineFootnotes(node => this.processNode(node));
        const mainHtml = cheerio(mainHtmlNodes).html();
        const mainHtmlWithUniqPageNavUuid = this.pageNavProcessor.finalizePageNavUuid(
          mainHtml, mainHtmlNodes, footnotesHtml);

        resolve(mainHtmlWithUniqPageNavUuid + footnotesHtml);
      });
      const parser = new htmlparser.Parser(handler);
      const fileExt = path.extname(file);
      if (fsUtil.isMarkdownFileExt(fileExt)) {
        // const preprocessedContent = this.preprocessMarkdown(content);
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

module.exports = {
  NodeProcessor,
};
