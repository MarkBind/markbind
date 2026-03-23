import * as Vue from 'vue';
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { compileTemplate } from 'vue/compiler-sfc';
import type { SFCTemplateCompileOptions, CompilerOptions } from 'vue/compiler-sfc';

import { createRequire } from 'module';
import path from 'path';
import fs from 'fs-extra';
import vueCommonAppFactory from '@markbind/core-web/dist/js/vueCommonAppFactory.min.js';
import * as logger from '../utils/logger.js';
import type { PageConfig, PageAssets } from './PageConfig.js';
import type { Page } from './index.js';
import { PluginManager } from '../plugins/PluginManager.js';

let customElementTagsCache: Set<string> | undefined;

let bundle = { ...vueCommonAppFactory };

/**
 * Retrieves the set of tags that should be treated as custom elements by the Vue compiler.
 * These are tags defined in plugins with isCustomElement: true.
 */
function getCustomElementTags(): Set<string> {
  if (customElementTagsCache) {
    return customElementTagsCache;
  }
  customElementTagsCache = new Set(Object.entries(PluginManager.tagConfig)
    .filter(([, config]) => config.isCustomElement)
    .map(([tagName]) => tagName));
  return customElementTagsCache;
}

/**
 * Compiles a Vue page template into a JavaScript function returning render function
 * and saves it as a script file so that the browser can access to
 * generate VDOM during Vue mounting and conduct patching.
 *
 * This is to avoid the overhead of compiling the page into Vue application
 * on the client's browser (alleviates FOUC). It is also the pre-requisite to enable SSR.
 * See https://github.com/vuejs/core/blob/main/packages/compiler-core/src/options.ts for
 * compilerOptionTypes
 *
 * @param content Page content to be compiled into Vue app
 */
async function compileVuePageCreateAndReturnScript(
  content: string, pageConfig: PageConfig, pageAsset: PageAssets) {
  const customElementTags = getCustomElementTags();

  const compilerOptions: CompilerOptions = {
    runtimeModuleName: 'vue',
    runtimeGlobalName: 'Vue',
    mode: 'function',
    whitespace: 'preserve',
    isCustomElement: tag => customElementTags.has(tag),
  };

  const templateOptions: SFCTemplateCompileOptions = {
    source: content,
    filename: pageConfig.sourcePath,
    id: pageConfig.sourcePath,
    compilerOptions,
  };
  const compiled = compileTemplate(templateOptions);
  const outputContent = compiled.code;

  const scriptContent = `
    const renderFn = new Function(${JSON.stringify(outputContent)});
    var render = renderFn();
  `;

  // Get script file name
  const pageHtmlFileName = path.basename(pageConfig.resultPath, '.html');
  const scriptFileName = `${pageHtmlFileName}.page-vue-render.js`;

  /*
   * Add the script file path for this page's render function to the page's assets (to populate page.njk).
   * The script file path is the same as the page's file path.
   */
  pageAsset.pageVueRenderJs = scriptFileName;

  // Get script's absolute file path to output script file
  const dirName = path.dirname(pageConfig.resultPath);
  const filePath = path.join(dirName, scriptFileName);
  await fs.outputFile(filePath, scriptContent);
  return outputContent;
}

function requireFromString(src: string) {
  // Use createRequire since bundle is CJS. This allows require() calls within the bundle
  // to be resolved relative to this file.
  const require = createRequire(import.meta.url);
  const mod = { exports: {} as any };

  // Use Function (like eval) to load bundle in global scope for usage
  // How this works: It passes in require from createRequire, the module and exports
  // object into the `src` code as parameters. The `src` code then uses these naturally
  // and populates the mod object, while using the require() from createRequire to
  // load dependencies.
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  new Function('require', 'module', 'exports', src)(require, mod, mod.exports);

  return mod.exports.default ?? mod.exports;
}

/**
 * Renders Vue page app into html string (Vue SSR).
 * This function will install the MarkBindVue plugin and render the built Vue page content into html string.
 */
async function renderVuePage(renderFn: string): Promise<string> {
  const { MarkBindVue, appFactory } = bundle;
  const { plugin } = MarkBindVue;

  // Pass in Vue which is expected to be available globally
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const render = new Function('Vue', renderFn)(Vue);
  const app = createSSRApp({
    render,
    ...appFactory(),
  });
  app.use(plugin);
  app.config.compilerOptions.whitespace = 'preserve';
  const html = await renderToString(app);
  const wrappedHtml = `<div id="app">${html}</div>`;
  return wrappedHtml;
}

interface PageEntry {
  page: Page;
  renderFn: string;
  pageNav: string;
}

// hold the mapping of sourcePath to latest built pages (for hot-reload dev purposes)
const pageEntries: Record<string, PageEntry> = {};

function savePageRenderFnForHotReload(page: Page, pageNav: string, renderFn: string) {
  const pageEntry = {
    page,
    pageNav,
    renderFn,
  };
  pageEntries[page.pageConfig.sourcePath] = pageEntry;
}

/**
 * Retrieves the latest updated MarkBindVue bundle from webpack compiler watcher,
 * re-render all the built pages, and output the page html files.
 * This function will only be used in development mode (for MarkBindVue bundle hot-reloading purposes).
 */
async function updateMarkBindVueBundle(newBundle: string): Promise<void> {
  logger.info(`Changes detected in MarkBind Vue Source Files:
Bundle is regenerated by webpack and built pages are re-rendered with the latest bundle.`);

  // reassign the latest updated MarkBindVue bundle
  bundle = requireFromString(newBundle);

  Object.values(pageEntries).forEach(async (pageEntry) => {
    const { page, renderFn } = pageEntry;
    const renderedVuePageContent = await renderVuePage(renderFn);
    page.writeOutputFile(renderedVuePageContent);
  });
}

export const pageVueServerRenderer = {
  compileVuePageCreateAndReturnScript,
  renderVuePage,
  updateMarkBindVueBundle,
  savePageRenderFnForHotReload,
};
