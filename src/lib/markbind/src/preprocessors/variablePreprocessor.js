const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const _ = {};
_.clone = require('lodash/clone');
_.cloneDeep = require('lodash/cloneDeep');
_.has = require('lodash/has');
_.isArray = require('lodash/isArray');
_.isEmpty = require('lodash/isEmpty');

const md = require('../lib/markdown-it');
const njUtil = require('../utils/nunjuckUtils');
const urlUtils = require('../utils/urls');
const logger = require('../../../../util/logger');

const {
  ATTRIB_CWF,
  IMPORTED_VARIABLE_PREFIX,
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

    /*
     * Page level
     */

    /**
     * Map of file paths to another object containing its variable names matched to values
     * @type {Object<string, Object<string, string>>}
     */
    this.fileVariableMap = {};

    /**
     * Map of file paths to another object containing its
     * variable aliases matched to the respective imported file
     * @type {Object<string, Object<string, string>>}
     */
    this.fileVariableAliasesMap = {};

    /**
     * Set of files that were already processed
     * @type {Set<string>}
     */
    this.processedFiles = new Set();
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
   * Renders the supplied content using only the site variables belonging to the specified site of the file.
   * @param contentFilePath of the specified content to render
   * @param content string
   */
  renderSiteVariables(contentFilePath, content) {
    const parentSite = urlUtils.getParentSiteAbsolutePath(contentFilePath, this.rootPath, this.baseUrlMap);
    return njUtil.renderRaw(content, this.userDefinedVariablesMap[parentSite]);
  }


  /*
   * --------------------------------------------------
   * Page level variable storage methods
   */


  resetVariables() {
    this.fileVariableMap = {};
    this.fileVariableAliasesMap = {};
    this.processedFiles.clear();
  }

  /**
   * Returns an object containing the <import>ed variables for the specified file.
   * For variables specified with aliases, we construct the sub object containing the
   * names and values of the variables tied to the alias.
   * @param file to get the imported variables for
   */
  getImportedVariableMap(file) {
    const innerVariables = {};
    const fileAliases = this.fileVariableAliasesMap[file];

    Object.entries(fileAliases).forEach(([alias, actualPath]) => {
      innerVariables[alias] = {};
      const variables = this.fileVariableMap[actualPath];

      Object.entries(variables).forEach(([name, value]) => {
        innerVariables[alias][name] = value;
      });
    });

    return innerVariables;
  }

  /**
   * Retrieves a semi-unique alias for the given array of variable names from an import element
   * by prepending the smallest variable name with $__MARKBIND__.
   * Uses the alias declared in the 'as' attribute if there is one.
   * @param variableNames of the import element, not referenced from the 'as' attribute
   * @param node of the import element
   * @return {string} Alias for the import element
   */
  static getAliasForImportVariables(variableNames, node) {
    if (_.has(node.attribs, 'as')) {
      return node.attribs.as;
    }
    const largestName = variableNames.sort()[0];
    return IMPORTED_VARIABLE_PREFIX + largestName;
  }

  /**
   * Extracts a pseudo imported variables for the supplied content.
   * @param $ loaded cheerio object of the content
   * @return {{}} pseudo imported variables of the content
   */
  static extractPseudoImportedVariables($) {
    const importedVariables = {};
    $('import[from]').each((index, element) => {
      const variableNames = Object.keys(element.attribs).filter(name => name !== 'from' && name !== 'as');

      // Add pseudo variables for the alias's variables
      const alias = VariablePreprocessor.getAliasForImportVariables(variableNames, element);
      importedVariables[alias] = new Proxy({}, {
        get(obj, prop) {
          return `{{${alias}.${prop}}}`;
        },
      });

      // Add pseudo variables for inline variables in the import element
      variableNames.forEach((name) => {
        importedVariables[name] = `{{${alias}.${name}}}`;
      });
    });
    return importedVariables;
  }

  /**
   * Extract page variables from a page.
   * @param fileName for error printing
   * @param data to extract variables from
   * @param includedVariables variables from parent include
   */
  extractPageVariables(fileName, data, includedVariables) {
    const fileDir = path.dirname(fileName);
    const $ = cheerio.load(data);

    const importedVariables = VariablePreprocessor.extractPseudoImportedVariables($);
    const pageVariables = {};
    const userDefinedVariables = this.getContentParentSiteVariables(fileName);

    const setPageVariableIfNotSetBefore = (variableName, rawVariableValue) => {
      if (pageVariables[variableName]) {
        return;
      }

      pageVariables[variableName] = njUtil.renderRaw(rawVariableValue, {
        ...importedVariables,
        ...pageVariables,
        ...userDefinedVariables,
        ...includedVariables,
      }, {}, false);
    };

    $('variable').each((index, node) => {
      const variableSource = $(node).attr('from');
      if (variableSource !== undefined) {
        try {
          const variableFilePath = path.resolve(fileDir, variableSource);
          const jsonData = fs.readFileSync(variableFilePath);
          const varData = JSON.parse(jsonData);
          Object.entries(varData).forEach(([varName, varValue]) => {
            setPageVariableIfNotSetBefore(varName, varValue);
          });
        } catch (err) {
          logger.warn(`Error ${err.message}`);
        }
      } else {
        const variableName = $(node).attr('name');
        if (!variableName) {
          logger.warn(`Missing 'name' for variable in ${fileName}\n`);
          return;
        }
        setPageVariableIfNotSetBefore(variableName, md.renderInline($(node).html()));
      }
    });

    this.fileVariableMap[fileName] = pageVariables;

    return { ...importedVariables, ...pageVariables };
  }

  /**
   * Extracts inner (nested) variables of the content,
   * resolving the <import>s with respect to the supplied contentFilePath.
   * @param content to extract from
   * @param contentFilePath of the content
   * @return {[]} Array of files that were imported
   */
  extractInnerVariables(content, contentFilePath) {
    let staticIncludeSrcs = [];
    const $ = cheerio.load(content, {
      xmlMode: false,
      decodeEntities: false,
    });

    const aliases = {};
    this.fileVariableAliasesMap[contentFilePath] = aliases;

    $('import[from]').each((index, node) => {
      const filePath = path.resolve(path.dirname(contentFilePath), node.attribs.from);
      staticIncludeSrcs.push({ from: contentFilePath, to: filePath });

      const variableNames = Object.keys(node.attribs).filter(name => name !== 'from' && name !== 'as');
      const alias = VariablePreprocessor.getAliasForImportVariables(variableNames, node);
      aliases[alias] = filePath;

      // Render inner file content and extract inner variables recursively
      const {
        content: renderedContent,
        childContext,
      } = this.renderIncludeFile(filePath, node, {});
      const userDefinedVariables = this.getContentParentSiteVariables(filePath);
      staticIncludeSrcs = [
        ...staticIncludeSrcs,
        ...this.extractInnerVariablesIfNotProcessed(renderedContent, childContext.cwf, filePath),
      ];

      // Re-render page variables with imported variables
      const innerVariables = this.getImportedVariableMap(filePath);
      const variables = this.fileVariableMap[filePath];
      Object.entries(variables).forEach(([variableName, value]) => {
        variables[variableName] = njUtil.renderRaw(value, {
          ...userDefinedVariables, ...innerVariables,
        });
      });
    });

    return staticIncludeSrcs;
  }

  /**
   * Extracts inner variables {@link extractInnerVariables} only if not processed before
   */
  extractInnerVariablesIfNotProcessed(content, contentFilePath, filePathToExtract) {
    if (!this.processedFiles.has(filePathToExtract)) {
      this.processedFiles.add(filePathToExtract);
      return this.extractInnerVariables(content, contentFilePath);
    }
    return [];
  }

  /**
   * Extracts variables specified as <include var-xx="..."> in include elements,
   * adding them to the supplied variables if it does not already exist.
   * @param includeElement to extract inline variables from
   * @param variables to add the extracted variables to
   */
  static extractIncludeInlineVariables(includeElement, variables) {
    Object.keys(includeElement.attribs).forEach((attribute) => {
      if (!attribute.startsWith('var-')) {
        return;
      }
      const variableName = attribute.replace(/^var-/, '');
      if (!variables[variableName]) {
        variables[variableName] = includeElement.attribs[attribute];
      }
    });
  }

  /**
   * Extracts variables specified as <variable> in include elements,
   * adding them to the supplied variables if it does not already exist.
   * @param includeElement to search child nodes for
   * @param variables to add the extracted variables to
   */
  static extractIncludeChildElementVariables(includeElement, variables) {
    if (!(includeElement.children && includeElement.children.length)) {
      return;
    }

    includeElement.children.forEach((child) => {
      if (child.name !== 'variable' && child.name !== 'span') {
        return;
      }
      const variableName = child.attribs.name || child.attribs.id;
      if (!variableName) {
        // eslint-disable-next-line no-console
        logger.warn(`Missing reference in ${includeElement.attribs[ATTRIB_CWF]}\n`
          + `Missing 'name' or 'id' in variable for ${includeElement.attribs.src} include.`);
        return;
      }
      if (!variables[variableName]) {
        variables[variableName] = cheerio.html(child.children);
      }
    });
  }


  /**
   * Extract variables from an <include> element.
   * See https://markbind.org/userGuide/reusingContents.html#specifying-variables-in-an-include for usage.
   * It is a subroutine for {@link renderIncludeFile}
   * @param includeElement include element to extract variables from
   * @param parentVariables defined by parent pages, which have greater priority
   */
  static extractIncludeVariables(includeElement, parentVariables) {
    const includedVariables = { ...parentVariables };
    VariablePreprocessor.extractIncludeInlineVariables(includeElement, includedVariables);
    VariablePreprocessor.extractIncludeChildElementVariables(includeElement, includedVariables);

    return includedVariables;
  }


  /*
   * --------------------------------------------------
   * Combined (both site and page variables) rendering methods
   */


  /**
   * Renders an include file with the supplied context, returning the rendered
   * content and new context with respect to the child content.
   * @param filePath of the included file source
   * @param node of the include element
   * @param context object containing the variables for the current context
   * @param asIfAt where the included file should be rendered from
   */
  renderIncludeFile(filePath, node, context, asIfAt = filePath) {
    // Extract included variables from the include element, merging with the parent context variables
    const includeVariables = VariablePreprocessor.extractIncludeVariables(node, context.variables);

    // Extract page variables from the **included** file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const userDefinedVariables = this.getContentParentSiteVariables(asIfAt);
    const pageVariables = this.extractPageVariables(asIfAt, fileContent, includeVariables);

    // Render the included content with all the variables
    const content = njUtil.renderRaw(fileContent, {
      ...pageVariables,
      ...includeVariables,
      ...userDefinedVariables,
    });

    const includedSrces = this.extractInnerVariablesIfNotProcessed(content, asIfAt, asIfAt);
    const renderedContent = this.renderInnerVariables(content, asIfAt, asIfAt);

    const childContext = _.cloneDeep(context);
    childContext.cwf = asIfAt;
    childContext.variables = includeVariables;

    return {
      includedSrces,
      renderedContent,
      childContext,
    };
  }


  /**
   * Extracts the content page's variables, then renders it.
   * @param content to render
   * @param contentFilePath of the content to render
   * @param additionalVariables if any
   */
  renderOuterVariables(content, contentFilePath, additionalVariables = {}) {
    const pageVariables = this.extractPageVariables(contentFilePath, content, {});
    const userDefinedVariables = this.getContentParentSiteVariables(contentFilePath);

    return njUtil.renderRaw(content, {
      ...pageVariables,
      ...userDefinedVariables,
      ...additionalVariables,
    });
  }

  /**
   * Extracts the content's page's inner variables, then renders it.
   * @param content to render
   * @param contentFilePath of the content to render
   * @param contentAsIfAtFilePath
   * @param additionalVariables if any
   */
  renderInnerVariables(content, contentFilePath, contentAsIfAtFilePath, additionalVariables = {}) {
    const userDefinedVariables = this.getContentParentSiteVariables(contentFilePath);
    const innerVariables = this.getImportedVariableMap(contentAsIfAtFilePath);

    return njUtil.renderRaw(content, {
      ...userDefinedVariables,
      ...additionalVariables,
      ...innerVariables,
    });
  }
}

module.exports = VariablePreprocessor;
