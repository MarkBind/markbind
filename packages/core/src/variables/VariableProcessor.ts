import cheerio from 'cheerio';

import { ATTRIB_CWF } from '../constants';
import { PageSources } from '../Page/PageSources';
import { VariableRenderer } from './VariableRenderer';
import * as logger from '../utils/logger';
import * as urlUtil from '../utils/urlUtil';
import type { Context } from '../html/Context';
import { MbNode } from '../utils/node';

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
export class VariableProcessor {
  /**
   * Map of sites' root paths to their variables
   */
  userDefinedVariablesMap: {
    [rootPath: string]: Record<string, any>,
  } = {};

  /**
   * Map of sites' root paths to the respective VariableRenderer instances
   */
  variableRendererMap: {
    [rootPath: string]: VariableRenderer
  } = {};

  constructor(
    private rootPath: string,
    /**
     * Set of sites' root paths, for resolving the provided file path in
     * rendering methods to the appropriate (sub)site's root path.
     */
    private baseUrlMap: Set<string>,
  ) {
    // Set up userDefinedVariablesMap and variableRendererMap
    this.baseUrlMap.forEach((siteRootPath) => {
      this.userDefinedVariablesMap[siteRootPath] = {};
      this.variableRendererMap[siteRootPath] = new VariableRenderer(siteRootPath);
    });
  }

  /*
   * --------------------------------------------------
   * Utility methods
   */

  invalidateCache() {
    Object.values(this.variableRendererMap).forEach(variableRenderer => variableRenderer.invalidateCache());
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
  addUserDefinedVariable(site: string, name: string, value: any) {
    this.userDefinedVariablesMap[site][name] = value;
  }

  /**
   * Renders the variable in addition to adding it, unlike {@link addUserDefinedVariable}.
   * This is to allow using previously declared site variables in site variables declared later on.
   */
  renderAndAddUserDefinedVariable(site: string, name: string | undefined, value: any) {
    if (name === undefined) {
      logger.warn(
        `Variable with no name detected! It will be ignored. Value: ${value}. Site: ${site}.`,
      );
      logger.warn('Check _markbind/variables.md for variable declarations.');
      return;
    }

    const renderedVal = this.variableRendererMap[site].renderString(value, this.userDefinedVariablesMap[site],
                                                                    new PageSources());
    this.addUserDefinedVariable(site, name, renderedVal);
  }

  /**
   * Version of {@link addUserDefinedVariable} that adds to all sites.
   */
  addUserDefinedVariableForAllSites(name: string, value: any) {
    Object.keys(this.userDefinedVariablesMap)
      .forEach(base => this.addUserDefinedVariable(base, name, value));
  }

  resetUserDefinedVariablesMap() {
    this.userDefinedVariablesMap = {};
    this.baseUrlMap.forEach((siteRootPath) => {
      this.userDefinedVariablesMap[siteRootPath] = {};
    });
  }

  /**
   * Retrieves the appropriate **(sub)site** variables of the supplied file path.
   * @param contentFilePath to look up.
   * @return {*} The appropriate (closest upwards) site variables map
   */
  private getParentSiteVariables(contentFilePath: string) {
    const parentSitePath = urlUtil.getParentSiteAbsolutePath(contentFilePath, this.rootPath,
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
   * @param {PageSources} pageSources to add dependencies found during nunjucks rendering to
   * @param lowerPriorityVariables than the site variables, if any
   */
  renderWithSiteVariables(
    contentFilePath: string,
    pageSources: PageSources,
    lowerPriorityVariables: Record<string, any> = {},
  ) {
    const userDefinedVariables = this.getParentSiteVariables(contentFilePath);
    const parentSitePath = urlUtil.getParentSiteAbsolutePath(contentFilePath, this.rootPath,
                                                             this.baseUrlMap);

    return this.variableRendererMap[parentSitePath].renderFile(contentFilePath, {
      ...lowerPriorityVariables,
      ...userDefinedVariables,
    }, pageSources);
  }

  /*
   * --------------------------------------------------
   * Page level variable storage methods
   */

  /**
   * Extracts variables specified as <include var-xx="..."> in include elements.
   * @param includeElement to extract inline variables from
   */
  private static extractIncludeInlineVariables(includeElement: MbNode) {
    const includeInlineVariables: Record<string, any> = {};

    Object.entries(includeElement.attribs || {}).forEach(([attribute, val]) => {
      if (!attribute.startsWith('var-')) {
        return;
      }
      const variableName = attribute.slice(4);
      includeInlineVariables[variableName] = val;
    });

    return includeInlineVariables;
  }

  /**
   * Extracts variables specified as <variable> in include elements.
   * @param includeElement to search child nodes for
   */
  private static extractIncludeChildElementVariables(includeElement: MbNode) {
    if (!(includeElement.children && includeElement.children.length)) {
      return {};
    }
    const includeChildVariables: Record<string, string> = {};

    includeElement.children.forEach((child) => {
      if (child.name !== 'variable' && child.name !== 'span') {
        return;
      }
      const variableName = child.attribs?.name || child.attribs?.id;
      if (!variableName) {
        logger.warn(`Missing 'name' or 'id' in variable for ${includeElement.attribs.src}'s include in ${
          includeElement.attribs[ATTRIB_CWF]}.\n`);
        return;
      }
      if (!includeChildVariables[variableName]) {
        includeChildVariables[variableName] = cheerio(child).html() || '';
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
  private static extractIncludeVariables(includeElement: MbNode) {
    const includeInlineVariables = VariableProcessor.extractIncludeInlineVariables(includeElement);
    const includeChildVariables = VariableProcessor.extractIncludeChildElementVariables(includeElement);

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
   * @param pageSources to add dependencies found during nunjucks rendering to
   * @param node of the include element
   * @param context object containing the parent <include> (if any) variables for the current
   *        context, which has greater priority than the extracted include variables of the current context.
   * @param asIfAt where the included file should be rendered from
   * @return object containing the nunjucks-processed content, and a new {@link Context} object
   */
  renderIncludeFile(
    filePath: string,
    pageSources: PageSources,
    node: MbNode,
    context: Context,
    asIfAt: string,
  ) {
    // Extract included variables from the include element, merging with the parent context variables
    const includeVariables = VariableProcessor.extractIncludeVariables(node);

    const variables = {
      ...includeVariables,
      ...context.variables,
    };

    // Render the included content with the current <include>'s <variable>s and any parent <include>'s
    const renderedContent = this.renderWithSiteVariables(filePath, pageSources, variables);

    const childContext = context.clone();
    childContext.cwf = asIfAt;
    childContext.variables = variables;

    return {
      nunjucksProcessed: renderedContent,
      childContext,
    };
  }
}
