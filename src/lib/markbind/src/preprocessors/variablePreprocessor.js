const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const _ = {};
_.clone = require('lodash/clone');
_.cloneDeep = require('lodash/cloneDeep');
_.has = require('lodash/has');
_.isArray = require('lodash/isArray');
_.isEmpty = require('lodash/isEmpty');

const njUtil = require('../utils/nunjuckUtils');
const urlUtils = require('../utils/urls');
const logger = require('../../../../util/logger');

const {
  ATTRIB_CWF,
} = require('../constants');


/**
 * All variable extraction and rendering is done here.
 *
 * There are four broad categories of methods here
 * 1. Site level variable extraction and storage methods
 *    These methods provide interfaces to store a particular (sub)site's variables,
 *    rendering them with the same (sub)site's previously extracted variables
 *    before doing so in {@link userDefinedVariablesMap}.
 *
 * 2. Site level variable rendering methods
 *    These methods use the processed variables in {@link userDefinedVariablesMap}
 *    to render provided string content that belongs to a provided content file path.
 *    Using the content file path, we are able to get the appropriate (sub)site's (that
 *    the content belongs to) variables and then render them with it.
 *
 * 3. Page level variable extraction and storage methods
 *    These methods are similar to (1), but extract variables from a page,
 *    declared by <variable>s or <import>s.
 *    There are also some utility methods here facilitating extraction of <variable>s
 *    the are nested within an <include> element, and inline variables ('var-xx') declared
 *    as attributes in the <include> itself.
 *
 * 4. Combined page and site variable rendering methods
 *    These methods are similar to (2), but in addition to the site variables, they
 *    render the content with the page variables extracted from (3) as well.
 */
class VariablePreprocessor {
  constructor(rootPath, baseUrlMap) {
    /**
     * Root site path
     * @type {string}
     */
    this.rootPath = rootPath;

    /**
     * Set of sites' root paths, for resolving the provided file path in
     * rendering methods to the appropriate (sub)site's root path.
     * @type {Set<string>}
     */
    this.baseUrlMap = baseUrlMap;

    /**
     * Map of sites' root paths to their variables
     * @type {Object<string, Object<string, any>>}
     */
    this.userDefinedVariablesMap = {};
  }


  /*
   * --------------------------------------------------
   * Site level variable storage methods
   */


  /**
   * Adds a variable for a site with the specified name and value.
   * @param site path of the site, as reflected by the Site instance's baseUrlMap
   * @param name of the variable to add
   * @param value of the variable
   */
  addUserDefinedVariable(site, name, value) {
    this.userDefinedVariablesMap[site] = this.userDefinedVariablesMap[site] || {};
    this.userDefinedVariablesMap[site][name] = value;
  }

  /**
   * Renders the variable in addition to adding it, unlike {@link addUserDefinedVariable}.
   * This is to allow using previously declared site variables in site variables declared later on.
   */
  renderAndAddUserDefinedVariable(site, name, value) {
    const renderedVal = njUtil.renderRaw(value, this.userDefinedVariablesMap[site], {}, false);
    this.addUserDefinedVariable(site, name, renderedVal);
  }

  /**
   * Version of {@link addUserDefinedVariable} that adds to all sites.
   */
  addUserDefinedVariableForAllSites(name, value) {
    Object.keys(this.userDefinedVariablesMap)
      .forEach(base => this.addUserDefinedVariable(base, name, value));
  }

  resetUserDefinedVariablesMap() {
    this.userDefinedVariablesMap = {};
  }

  /**
   * Retrieves the appropriate **(sub)site** variables of the supplied file path.
   * @param contentFilePath to look up.
   * @return {*} The appropriate (closest upwards) site variables map
   */
  getParentSiteVariables(contentFilePath) {
    const parentSitePath = urlUtils.getParentSiteAbsolutePath(contentFilePath, this.rootPath,
                                                              this.baseUrlMap);
    return this.userDefinedVariablesMap[parentSitePath];
  }

  /*
   * --------------------------------------------------
   * Site level variable rendering methods
   */


  /**
   * Renders content belonging to a specified file path with the appropriate site's variables,
   * with an optional set of lower and higher priority variables than the site variables to be rendered.
   * @param contentFilePath of the specified content to render
   * @param content string to render
   * @param lowerPriorityVariables than the site variables, if any
   * @param higherPriorityVariables than the site variables, if any
   */
  renderSiteVariables(contentFilePath, content, lowerPriorityVariables = {}, higherPriorityVariables = {}) {
    const userDefinedVariables = this.getParentSiteVariables(contentFilePath);

    return njUtil.renderRaw(content, {
      ...lowerPriorityVariables,
      ...userDefinedVariables,
      ...higherPriorityVariables,
    });
  }


  /*
   * --------------------------------------------------
   * Page level variable storage methods
   */

  /**
   * Subroutine for {@link extractPageVariables}.
   * Renders a variable declared via either a <variable name="..."> tag or <variable from="..."> json file
   * and then adds it to {@link pageVariables}.
   *
   * @param pageVariables object to add the extracted page variables to
   * @param elem "dom node" as parsed by htmlparser2
   * @param elemHtml as outputted by $(elem).html()
   * @param filePath that the <variable> tag is from
   * @param renderVariable callback to render the extracted variable with before storing
   */
  static addVariable(pageVariables, elem, elemHtml, filePath, renderVariable) {
    const variableSource = elem.attribs.from;
    if (variableSource) {
      const variableFilePath = path.resolve(path.dirname(filePath), variableSource);
      if (!fs.existsSync(variableFilePath)) {
        logger.error(`The file ${variableSource} specified in 'from' attribute for json variable in ${
          filePath} does not exist!\n`);
        return;
      }
      const rawData = fs.readFileSync(variableFilePath);

      try {
        const jsonData = JSON.parse(rawData);
        Object.entries(jsonData).forEach(([name, value]) => {
          pageVariables[name] = renderVariable(filePath, value);
        });
      } catch (err) {
        logger.warn(`Error in parsing json from ${variableFilePath}:\n${err.message}\n`);
      }
    } else {
      const variableName = elem.attribs.name;
      if (!variableName) {
        logger.warn(`Missing 'name' for variable in ${filePath}\n`);
        return;
      }

      pageVariables[variableName] = renderVariable(filePath, elemHtml);
    }
  }

  /**
   * Subroutine for {@link extractPageVariables}.
   * Processes an <import> element with a 'from' attribute.
   * {@link extractPageVariables} is recursively called to extract the other page's variables in doing so.
   * Then, all locally declared variables of the imported file are assigned under the alias (if any),
   * and any inline variables specified in the <import> element are also set in {@link pageImportedVariables}.
   *
   * @param pageImportedVariables object to add the extracted imported variables to
   * @param elem "dom node" of the <import> element as parsed by htmlparser2
   * @param filePath that the <variable> tag is from
   * @param renderFrom callback to render the 'from' attribute with
   */
  addImportVariables(pageImportedVariables, elem, filePath, renderFrom) {
    // render the 'from' file path for the edge case that a variable is used inside it
    const importedFilePath = renderFrom(filePath, elem.attribs.from);
    const resolvedFilePath = path.resolve(path.dirname(filePath), importedFilePath);
    if (!fs.existsSync(resolvedFilePath)) {
      logger.error(`The file ${importedFilePath} specified in 'from' attribute for import in ${
        filePath} does not exist!\n`);
      return;
    }

    // recursively extract the imported page's variables first
    const importedFileContent = fs.readFileSync(resolvedFilePath);
    const { pageVariables: importedFilePageVariables } = this.extractPageVariables(resolvedFilePath,
                                                                                   importedFileContent);

    const alias = elem.attribs.as;
    if (alias) {
      // import everything under the alias if there is one
      pageImportedVariables[alias] = importedFilePageVariables;
    }

    // additionally, import the inline variables without an alias
    Object.keys(elem.attribs).filter((attr) => {
      const isReservedAttribute = attr === 'from' || attr === 'as';
      if (isReservedAttribute) {
        return false;
      }

      const isExistingAttribute = !!importedFilePageVariables[attr];
      if (!isExistingAttribute) {
        logger.warn(`Invalid inline attribute ${attr} imported in ${filePath} from ${resolvedFilePath}\n`);
        return false;
      }

      return true;
    }).forEach((name) => {
      pageImportedVariables[name] = importedFilePageVariables[name];
    });
  }

  /**
   * Extract page variables from a page.
   * These include all locally declared <variable>s and variables <import>ed from other pages.
   * @param filePath for error printing
   * @param data to extract variables from
   * @param includeVariables from the parent include, if any, used during {@link renderIncludeFile}
   */
  extractPageVariables(filePath, data, includeVariables = {}) {
    const pageVariables = {};
    const pageImportedVariables = {};

    const $ = cheerio.load(data);

    /*
     This is used to render extracted variables before storing.
     Hence, variables can be used within other variables, subject to declaration order.
     */
    const renderVariable = (contentFilePath, content) => {
      const previousVariables = {
        ...pageImportedVariables,
        ...pageVariables,
        ...includeVariables,
      };

      return this.renderSiteVariables(contentFilePath, content, previousVariables);
    };

    // NOTE: Selecting both at once is important to respect variable/import declaration order
    $('variable, import[from]').not('include > variable').each((index, elem) => {
      if (elem.name === 'variable') {
        VariablePreprocessor.addVariable(pageVariables, elem, $(elem).html(), filePath, renderVariable);
      } else {
        /*
         NOTE: we pass renderVariable here as well but not for rendering <import>ed variables again!
         This is only for the edge case that variables are used in the 'from' attribute of
         the <import> which we must resolve first.
         */
        this.addImportVariables(pageImportedVariables, elem, filePath, renderVariable);
      }
    });

    return { pageImportedVariables, pageVariables };
  }

  /**
   * Extracts variables specified as <include var-xx="..."> in include elements.
   * @param includeElement to extract inline variables from
   */
  static extractIncludeInlineVariables(includeElement) {
    const includeInlineVariables = {};

    Object.keys(includeElement.attribs).forEach((attribute) => {
      if (!attribute.startsWith('var-')) {
        return;
      }
      const variableName = attribute.slice(4);
      includeInlineVariables[variableName] = includeElement.attribs[attribute];
    });

    return includeInlineVariables;
  }

  /**
   * Extracts variables specified as <variable> in include elements.
   * @param includeElement to search child nodes for
   */
  static extractIncludeChildElementVariables(includeElement) {
    if (!(includeElement.children && includeElement.children.length)) {
      return {};
    }
    const includeChildVariables = {};

    includeElement.children.forEach((child) => {
      if (child.name !== 'variable' && child.name !== 'span') {
        return;
      }
      const variableName = child.attribs.name || child.attribs.id;
      if (!variableName) {
        logger.warn(`Missing 'name' or 'id' in variable for ${includeElement.attribs.src}'s include in ${
          includeElement.attribs[ATTRIB_CWF]}.\n`);
        return;
      }
      if (!includeChildVariables[variableName]) {
        includeChildVariables[variableName] = cheerio.html(child.children);
      }
    });

    return includeChildVariables;
  }


  /**
   * Extract variables from an <include> element.
   * See https://markbind.org/userGuide/reusingContents.html#specifying-variables-in-an-include for usage.
   * It is a subroutine for {@link renderIncludeFile}
   * @param includeElement include element to extract variables from
   */
  static extractIncludeVariables(includeElement) {
    const includeInlineVariables = VariablePreprocessor.extractIncludeInlineVariables(includeElement);
    const includeChildVariables = VariablePreprocessor.extractIncludeChildElementVariables(includeElement);

    return {
      ...includeChildVariables,
      ...includeInlineVariables,
    };
  }


  /*
   * --------------------------------------------------
   * Combined (both site and page variables) rendering methods
   */


  /**
   * Renders an <include> file with the supplied context, returning the rendered
   * content and new context with respect to the child content.
   * @param filePath of the included file source
   * @param node of the include element
   * @param context object containing the parent <include> (if any) variables for the current context,
   *        which have greater priority than the extracted include variables of the current context.
   * @param asIfAt where the included file should be rendered from
   */
  renderIncludeFile(filePath, node, context, asIfAt) {
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Extract included variables from the include element, merging with the parent context variables
    const includeVariables = VariablePreprocessor.extractIncludeVariables(node);

    // We pass in includeVariables as well to render <include> variables used in page <variable>s
    // see "Test Page Variable and Included Variable Integrations" under test_site/index.md for an example
    const {
      pageImportedVariables,
      pageVariables,
    } = this.extractPageVariables(asIfAt, fileContent, includeVariables);

    // Render the included content with all the variables
    const renderedContent = this.renderSiteVariables(asIfAt, fileContent, {
      ...pageImportedVariables,
      ...pageVariables,
      ...includeVariables,
      ...context.variables,
    });

    const childContext = _.cloneDeep(context);
    childContext.cwf = asIfAt;
    childContext.variables = includeVariables;

    return {
      renderedContent,
      childContext,
    };
  }


  /**
   * Renders content belonging to a page with the appropriate variables.
   * In increasing order of priority (overriding),
   * 1. <import>ed variables as extracted during {@link extractPageVariables}
   * 2. locally declared <variable>s as extracted during {@link extractPageVariables}
   *    (see https://markbind.org/userGuide/reusingContents.html#specifying-variables-in-an-include)
   * 3. site variables as defined in variables.md
   * @param contentFilePath of the content to render
   * @param content to render
   * @param highestPriorityVariables to render with the highest priority if any.
   *        This is currently only used for the MAIN_CONTENT_BODY in layouts.
   */
  renderPage(contentFilePath, content, highestPriorityVariables = {}) {
    const {
      pageImportedVariables,
      pageVariables,
    } = this.extractPageVariables(contentFilePath, content);

    return this.renderSiteVariables(contentFilePath, content, {
      ...pageImportedVariables,
      ...pageVariables,
    }, highestPriorityVariables);
  }
}

module.exports = VariablePreprocessor;
