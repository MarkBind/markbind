import type { Template } from 'nunjucks';
import type { SiteLinkManager } from '../html/SiteLinkManager';
import type { PluginManager } from '../plugins/PluginManager';

import { VariableProcessor } from '../variables/VariableProcessor';

export interface PageAssets {
  bootstrap: string;
  externalScripts: string[];
  fontAwesome: string;
  glyphicons: string;
  octicons: string;
  materialIcons: string;
  highlight: string;
  markBindCss: string;
  markBindJs: string;
  pageNavCss: string;
  siteNavCss: string;
  bootstrapUtilityJs: string;
  polyfillJs: string;
  vue: string;
  pageVueRenderJs?: string;
  layoutUserScriptsAndStyles: string[];
  pluginScripts?: string[],
  pluginLinks?: string[],
}

/**
 * A page configuration object used to construct a {@link Page}.
 * Its properties will never be modified by {@link Page} itself.
 */
export class PageConfig {
  /**
   * Object of asset names as keys to their corresponding destination file paths / links.
   */
  asset: PageAssets;

  /**
   * Set of urls of the root site and subsites' root directories.
   */
  baseUrlMap: Set<string>;

  dev: boolean;
  faviconUrl?: string;
  frontmatterOverride: { [frontmatterName: string]: string };
  layout?: string;
  layoutsAssetPath: string;
  pluginManager: PluginManager;
  /**
   * The output path of this page
   */
  resultPath: string;
  rootPath: string;
  searchable: boolean;
  siteLinkManager: SiteLinkManager;
  siteOutputPath: string;
  /**
   * The source file's (.md) file path for rendering this page
   */
  sourcePath: string;
  /**
   * The source file's (.md) posix relative file path for rendering this page
   */
  src: string;
  title?: string;
  template: Template;
  variableProcessor: VariableProcessor;
  addressablePagesSource: string[];
  layoutManager: any;

  constructor(args: {
    asset: PageAssets;
    baseUrlMap: Set<string>;
    dev: boolean;
    faviconUrl?: string;
    frontmatterOverride?: { [frontmatterName: string]: string },
    layout?: string,
    layoutsAssetPath: string;
    pluginManager: PluginManager,
    resultPath: string;
    rootPath: string;
    searchable: boolean;
    siteLinkManager: SiteLinkManager;
    siteOutputPath: string;
    sourcePath: string;
    src: string;
    title?: string;
    template: Template;
    variableProcessor: VariableProcessor;
    addressablePagesSource: string[];
    layoutManager: any;
  }) {
    this.asset = args.asset;
    this.baseUrlMap = args.baseUrlMap;
    this.dev = args.dev;
    this.faviconUrl = args.faviconUrl;
    this.frontmatterOverride = args.frontmatterOverride || {};
    this.layout = args.layout;
    this.layoutsAssetPath = args.layoutsAssetPath;
    this.pluginManager = args.pluginManager;
    this.resultPath = args.resultPath;
    this.rootPath = args.rootPath;
    this.searchable = args.searchable;
    this.siteLinkManager = args.siteLinkManager;
    this.siteOutputPath = args.siteOutputPath;
    this.sourcePath = args.sourcePath;
    this.src = args.src;
    this.title = args.title;
    this.template = args.template;
    this.variableProcessor = args.variableProcessor;
    this.addressablePagesSource = args.addressablePagesSource;
    this.layoutManager = args.layoutManager;
  }
}
