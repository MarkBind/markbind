import fs from 'fs-extra';
import path from 'path';
import { FrontMatter } from '../plugins/Plugin';

const HEADING_INDEXING_LEVEL_DEFAULT = 3;

export type SiteConfigPage = {
  glob?: string,
  layout?: string,
  src?: string[],
  title?: string,
  externalScripts?: string[],
  globExclude?: string,
  searchable?: string | boolean,
  frontmatter?: FrontMatter,
};

export type SiteConfigStyle = {
  bootstrapTheme?: string;
  codeTheme: 'dark' | 'light';
  codeLineNumbers: boolean; // Default hide display of line numbers for code blocks
};

/**
 * Represents a read only site config read from the site configuration file,
 * with default values for unspecified properties.
 */
export class SiteConfig {
  baseUrl: string;
  enableSearch: boolean;
  faviconPath?: string;
  headingIndexingLevel: number;

  style: SiteConfigStyle;

  pages: SiteConfigPage[];
  pagesExclude: string[];
  ignore: string[];

  externalScripts: string[];
  titlePrefix: string;
  titleSuffix: string;
  globalOverride: Record<string, string>; // key: frontmatter key

  timeZone: string;
  locale: string;

  plugins: string[];
  pluginsContext: {
    [pluginName: string]: Record<string, any>
  };

  deploy: {
    message?: string;
    repo?: string;
    branch?: string;
    baseDir?: string;
  };

  intrasiteLinkValidation: {
    enabled: boolean;
  };

  plantumlCheck: boolean;

  /**
   * @param siteConfigJson The raw json read from the site configuration file
   * @param cliBaseUrl As read from the --baseUrl option
   */
  constructor(siteConfigJson: Record<string, any>, cliBaseUrl?: string) {
    this.baseUrl = cliBaseUrl !== undefined
      ? cliBaseUrl
      : (siteConfigJson.baseUrl || '');
    this.enableSearch = siteConfigJson.enableSearch === undefined || siteConfigJson.enableSearch;
    this.faviconPath = siteConfigJson.faviconPath;
    this.headingIndexingLevel = siteConfigJson.headingIndexingLevel || HEADING_INDEXING_LEVEL_DEFAULT;

    this.style = siteConfigJson.style || {};
    this.style.codeTheme = this.style.codeTheme || 'dark';
    this.style.codeLineNumbers = this.style.codeLineNumbers !== undefined
      ? this.style.codeLineNumbers : false;

    this.pages = siteConfigJson.pages || [];
    this.pagesExclude = siteConfigJson.pagesExclude || [];
    this.ignore = siteConfigJson.ignore || [];
    this.externalScripts = siteConfigJson.externalScripts || [];
    this.titlePrefix = siteConfigJson.titlePrefix || '';
    this.titleSuffix = siteConfigJson.titleSuffix || '';
    this.globalOverride = siteConfigJson.globalOverride || {};

    this.timeZone = siteConfigJson.timeZone || 'UTC';
    this.locale = siteConfigJson.locale || 'en-GB';

    this.plugins = siteConfigJson.plugins || [];
    this.pluginsContext = siteConfigJson.pluginsContext || {};
    this.deploy = siteConfigJson.deploy || {};
    this.intrasiteLinkValidation = siteConfigJson.intrasiteLinkValidation || {};
    this.intrasiteLinkValidation.enabled = this.intrasiteLinkValidation.enabled !== false;

    // TODO this should probably be in pluginsContext
    this.plantumlCheck = siteConfigJson.plantumlCheck !== undefined
      ? siteConfigJson.plantumlCheck : true; // check PlantUML's prerequisite by default
  }

  /**
   * Read and returns the site config from site.json, overwrites the default base URL
   * if it's specified by the user.
   *
   * @param rootPath The absolute path to the site folder
   * @param siteConfigPath The relative path to the siteConfig
   * @param baseUrl user defined base URL (if exists)
   */
  static async readSiteConfig(rootPath: string, siteConfigPath: string, baseUrl?: string): Promise<any> {
    try {
      const absoluteSiteConfigPath = path.join(rootPath, siteConfigPath);
      const siteConfigJson = fs.readJsonSync(absoluteSiteConfigPath);
      const siteConfig = new SiteConfig(siteConfigJson, baseUrl);

      return siteConfig;
    } catch (err) {
      throw (new Error(`Failed to read the site config file '${siteConfigPath}' at`
        + `${rootPath}:\n${(err as Error).message}\nPlease ensure the file exist or is valid`));
    }
  }
}
