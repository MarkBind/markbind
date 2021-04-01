const cheerio = require('cheerio');
const htmlparser = require('htmlparser2'); require('../patches/htmlparser2');
const fm = require('fastmatter');
const Promise = require('bluebird');

const _ = {};
_.isArray = require('lodash/isArray');
_.cloneDeep = require('lodash/cloneDeep');
_.has = require('lodash/has');
_.find = require('lodash/find');

const { renderSiteNav } = require('./siteNavProcessor');
const { processInclude, processPanelSrc } = require('./includePanelProcessor');
const { Context } = require('./Context');
const linkProcessor = require('./linkProcessor');
const { highlightCodeBlock } = require('./codeblockProcessor');
const { setHeadingId, assignPanelId } = require('./headerProcessor');
const { MarkdownProcessor } = require('./MarkdownProcessor');
const { FootnoteProcessor } = require('./FootnoteProcessor');
const {
  transformBootstrapVuePopover,
  transformBootstrapVueTooltip,
  transformBootstrapVueModalAttributes,
} = require('./bootstrapVueProcessor');
const { MdAttributeRenderer } = require('./MdAttributeRenderer');
const { shiftSlotNodeDeeper, transformOldSlotSyntax } = require('./vueSlotSyntaxProcessor');
const { warnConflictingAtributesMap, warnDeprecatedAtributesMap } = require('./warnings');
const { processScriptTag, processStyleTag } = require('./scriptAndStyleTagProcessor');

const utils = require('../utils');
const logger = require('../utils/logger');

const { FRONT_MATTER_FENCE } = require('../Page/constants');

const {
  ATTRIB_CWF,
} = require('../constants');

cheerio.prototype.options.decodeEntities = false; // Don't escape HTML entities

class NodeProcessor {
  constructor(config, pageSources, variableProcessor, pluginManager, docId = '') {
    this.config = config;
    this.frontMatter = {};

    this.headTop = [];
    this.headBottom = [];
    this.scriptBottom = [];

    this.pageSources = pageSources;
    this.variableProcessor = variableProcessor;
    this.pluginManager = pluginManager;

    this.markdownProcessor = new MarkdownProcessor(docId);

    this.footnoteProcessor = new FootnoteProcessor();
    this.mdAttributeRenderer = new MdAttributeRenderer(this.markdownProcessor);
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
        this.mdAttributeRenderer.processPopover(node);
        transformBootstrapVuePopover(node);
        break;
      case 'tooltip':
        this.mdAttributeRenderer.processTooltip(node);
        transformBootstrapVueTooltip(node);
        break;
      case 'modal':
        this.mdAttributeRenderer.processModalAttributes(node);
        transformBootstrapVueModalAttributes(node);
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
      case 'site-nav':
        renderSiteNav(node);
        break;
      case 'mb-temp-footnotes':
        this.footnoteProcessor.processMbTempFootnotes(node);
        break;
      case 'script':
        processScriptTag(node);
        break;
      case 'style':
        processStyleTag(node);
        break;
      case 'code':
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
      linkProcessor.convertMdAndMbdExtToHtmlExt(node);
      if (this.config.intrasiteLinkValidation.enabled) {
        linkProcessor.validateIntraLink(node, context.cwf, this.config);
      }
      linkProcessor.collectSource(node, this.config.rootPath, this.config.baseUrl, this.pageSources);
    }

    const isHeadingTag = (/^h[1-6]$/).test(node.name);

    if (isHeadingTag && !node.attribs.id) {
      setHeadingId(node, this.config);
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

    if (isHeadingTag && !node.attribs.id) {
      // do this one more time, in case the first one assigned a blank id
      setHeadingId(node, this.config);
    }

    // If a fixed header is applied to the page, generate dummy spans as anchor points
    if (isHeadingTag && node.attribs.id) {
      cheerio(node).prepend(`<span id="${node.attribs.id}" class="anchor"></span>`);
    }

    return node;
  }

  process(file, content, cwf = file, extraVariables = {}) {
    const context = new Context(cwf, [], extraVariables, {});

    return new Promise((resolve, reject) => {
      const handler = new htmlparser.DomHandler((error, dom) => {
        if (error) {
          reject(error);
          return;
        }
        const nodes = dom.map((d) => {
          let processed;
          try {
            processed = this._process(d, context);
          } catch (err) {
            err.message += `\nError while rendering '${file}'`;
            logger.error(err);
            processed = utils.createErrorNode(d, err);
          }
          return processed;
        });
        nodes.forEach(d => NodeProcessor._trimNodes(d));

        resolve(cheerio(nodes).html()
        + this.footnoteProcessor.combineFootnotes(node => this.processNode(node)));
      });
      const parser = new htmlparser.Parser(handler);
      const fileExt = utils.getExt(file);
      if (utils.isMarkdownFileExt(fileExt)) {
        const renderedContent = this.markdownProcessor.renderMd(content);
        // Wrap with <root> as $.remove() does not work on top level nodes
        parser.parseComplete(`<root>${renderedContent}</root>`);
      } else if (fileExt === 'html') {
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
