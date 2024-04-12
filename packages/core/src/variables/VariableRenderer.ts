import fs from 'fs-extra';
import path from 'path';
import nunjucks, { Environment } from 'nunjucks';

import { PageSources } from '../Page/PageSources';
import {
  dateFilter,
  SetExternalExtension,
} from '../lib/nunjucks-extensions';
import * as fsUtil from '../utils/fsUtil';

require('../patches/nunjucks'); // load patch

const unescapedEnv = nunjucks.configure({ autoescape: false })
  .addFilter('date', dateFilter);

const USER_VARIABLES_PATH: string = '_markbind/variables.md';
const VARIABLE_REGEX: RegExp = /<variable[^>]*>(.|[\r\n])*?<\/variable>/g;
const NUNJUCKS_COMMENT_SYNTAX: string = '{# $& #}';

/**
 * Wrapper class over a nunjucks environment configured for the respective (sub)site.
 */
export class VariableRenderer {
  private pageSources = new PageSources();
  private variablesFilePath: string;

  private nj: Environment;

  constructor(private siteRootPath: string) {
    this.nj = nunjucks.configure(siteRootPath, { autoescape: false });
    this.nj.addFilter('date', dateFilter);
    this.nj.addExtension('SetExternalExtension', new SetExternalExtension(siteRootPath, this.nj));
    this.nj.on('load', (name, source) => {
      this.pageSources.staticIncludeSrc.push({ to: source.path });
    });

    this.variablesFilePath = fsUtil.ensurePosix(path.join(siteRootPath, USER_VARIABLES_PATH));
  }

  getModifiedVariablesFileContent(): string {
    const variablesFileContent = fs.existsSync(this.variablesFilePath)
      ? fs.readFileSync(this.variablesFilePath, 'utf8') : '';

    return variablesFileContent.replace(VARIABLE_REGEX, NUNJUCKS_COMMENT_SYNTAX);
  }

  /**
   * Processes content with the instance's nunjucks environment.
   * @param content to process
   * @param variables to render the content with
   * @param pageSources to add dependencies found during nunjucks rendering to
   * @return nunjucks processed content
   */
  renderString(
    content: string,
    variables: Record<string, any>,
    pageSources: PageSources,
  ) {
    this.pageSources = pageSources;
    return this.nj.renderString(content, variables);
  }

  /**
   * Processes file content with the instance's nunjucks environment.
   * @param contentFilePath to process
   * @param variables to render the content with
   * @param pageSources to add dependencies found during nunjucks rendering to
   * @return nunjucks processed content
   */
  renderFile(
    contentFilePath: string,
    variables: Record<string, any>,
    pageSources: PageSources,
  ) {
    this.pageSources = pageSources;
    const templateName = fsUtil.ensurePosix(path.relative(this.siteRootPath, contentFilePath));

    const content = this.getModifiedVariablesFileContent() + fs.readFileSync(templateName, 'utf8');

    return this.nj.renderString(content, variables);
  }

  /**
   Invalidate the internal nunjucks template cache
   */
  invalidateCache() {
    // Custom method from our patch
    // @ts-ignore
    this.nj.invalidateCache();
  }

  /**
   * Compiles a template specified at src independent of the template directory.
   * This is used for the page template file (page.njk), where none of nunjucks' features
   * involving path resolving are used.
   * @param templatePath of the template to compile
   */
  static compile(templatePath: string) {
    return nunjucks.compile(templatePath, unescapedEnv);
  }
}
